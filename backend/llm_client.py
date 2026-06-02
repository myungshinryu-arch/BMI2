import os
import logging
import json
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig, Tool, grounding

# Configure logging
logger = logging.getLogger("llm_client")
logging.basicConfig(level=logging.INFO)

# Configuration Constants
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "hk-hackathon-01")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

# Primary initialization flag
is_initialized = True  # We perform dynamic initialization inside call_gemini now


def call_gemini(
    prompt: str, 
    json_mode: bool = False, 
    enable_grounding: bool = False,
    return_dict: bool = False
):
    """
    Calls the Gemini model on GCP Vertex AI using Application Default Credentials (ADC).
    Strictly uses the primary hackathon project (hk-hackathon-01) and 'global' location.
    
    If enable_grounding is True and ENABLE_GOOGLE_SEARCH_GROUNDING env var is 'true',
    it will activate the Google Search Grounding tool and extract references.
    
    If return_dict is True, returns a dict with 'text', 'grounding_used', and 'sources'.
    Otherwise, returns only the response text string.
    """
    primary_project = os.environ.get("GOOGLE_CLOUD_PROJECT", "hk-hackathon-01")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    
    config = None
    if json_mode:
        config = GenerationConfig(
            response_mime_type="application/json"
        )

    tools = []
    enable_search_env = os.environ.get("ENABLE_GOOGLE_SEARCH_GROUNDING", "true").lower() == "true"
    if enable_grounding and enable_search_env:
        try:
            logger.info("Enabling Google Search Grounding tool for current Gemini model call...")
            tools.append(Tool.from_dict({"google_search": {}}))
        except Exception as tool_err:
            logger.error(f"Failed to load Google Search Grounding tool: {tool_err}", exc_info=True)

    try:
        logger.info(f"Initializing Vertex AI with Project ID: '{primary_project}', Location: '{location}'")
        vertexai.init(project=primary_project, location=location)
        logger.info(f"Calling Gemini model '{model_name}' on project '{primary_project}' with {len(tools)} tools...")
        
        model = GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=config,
            tools=tools if tools else None
        )
        
        response_text = ""
        sources = []
        grounding_used = False
        
        if response and response.text:
            response_text = response.text
            logger.info(f"Successfully received response from Gemini model '{model_name}' on project '{primary_project}'")
            
            # Grounding metadata extraction
            try:
                if hasattr(response, "candidates") and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, "grounding_metadata") and candidate.grounding_metadata:
                        g_meta = candidate.grounding_metadata
                        # Check if any web search was executed
                        if hasattr(g_meta, "web_search_queries") and g_meta.web_search_queries:
                            grounding_used = True
                        
                        # Gather grounding reference chunks
                        if hasattr(g_meta, "grounding_chunks") and g_meta.grounding_chunks:
                            for chunk in g_meta.grounding_chunks:
                                if hasattr(chunk, "web") and chunk.web:
                                    title = chunk.web.title or ""
                                    url = chunk.web.uri or ""
                                    if url and {"title": title, "url": url} not in sources:
                                        sources.append({"title": title, "url": url})
            except Exception as meta_err:
                logger.warning(f"Error extracting grounding metadata from response: {meta_err}", exc_info=True)
            
            if return_dict:
                return {
                    "text": response_text,
                    "grounding_used": grounding_used,
                    "sources": sources
                }
            return response_text
            
        raise ValueError("Empty or invalid response from Gemini model.")
        
    except Exception as err:
        logger.error(
            f"[VERTEX_AI_ERROR] Gemini model call failed!\n"
            f"  - Model: {model_name}\n"
            f"  - Project: {primary_project}\n"
            f"  - Location: {location}\n"
            f"  - Error Details: {str(err)}",
            exc_info=True
        )
        # Direct print to console for guaranteed terminal visibility
        print(f"\n[VERTEX_AI_ERROR] Failed model call: model={model_name}, project={primary_project}, location={location}, error={str(err)}")
        raise err
