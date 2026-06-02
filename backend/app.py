import sys
import os
import pickle
import json
from pathlib import Path

# Force UTF-8 stdout/stderr encoding on Windows to prevent Unicode/cp949 print crashes
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='backslashreplace')

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
from scipy.interpolate import CubicSpline

# Import classification and derived feature builder from train_model
from train_model import build_recipe_derived_features, classify_material

app = FastAPI(title="Tire Compound ARES Curve Prediction API")

# Enable CORS for frontend integration (Stateless prediction API, open to all origins to prevent blocking)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust paths definition using pathlib
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model_assets"
DATA_DIR = BASE_DIR / "data" / "supplementary"

# Global variables for loaded model assets
model = None
feature_cols = []
material_stats = []
base_recipe = {}
base_curve = []
oil_content = {}
benchmark_summary = []
benchmark_details = {}


def normalize_recipe_polymer_dict(recipe_dict: Dict[str, float], oil_content_dict: dict) -> Dict[str, float]:
    """Polymers scale adjustment to meet exact 100 PHR (excluding extended oil) constraint."""
    normalized = recipe_dict.copy()
    
    # Identify polymer keys
    polymer_keys = [code for code in normalized.keys() if classify_material(code).startswith('POLYMER_')]
    
    if not polymer_keys:
        return normalized
        
    # Calculate net polymer sum
    net_poly_sum = 0.0
    weight_factors = {}
    for code in polymer_keys:
        oil_pct = oil_content_dict.get(code, 0.0)
        wf = 100.0 / (100.0 + oil_pct)
        weight_factors[code] = wf
        net_poly_sum += float(normalized.get(code, 0.0)) * wf
        
    if net_poly_sum > 0:
        scale = 100.0 / net_poly_sum
        for code in polymer_keys:
            normalized[code] = float(normalized[code]) * scale
            
    return normalized


def calculate_tg(curve):
    """
    curve: list of dicts, e.g. [{'temp': -60, 'tan_delta': 0.12}, ...]
    returns the temperature (float) where the interpolated tan_delta peaks.
    """
    temps = np.array([p['temp'] for p in curve])
    tan_deltas = np.array([p['tan_delta'] for p in curve])
    
    # Sort to ensure order
    sort_idx = np.argsort(temps)
    temps = temps[sort_idx]
    tan_deltas = tan_deltas[sort_idx]
    
    # Interpolate at 0.1 degree intervals
    fine_temps = np.linspace(temps.min(), temps.max(), 1201)
    cs = CubicSpline(temps, tan_deltas)
    fine_tan_deltas = cs(fine_temps)
    
    peak_idx = np.argmax(fine_tan_deltas)
    return float(fine_temps[peak_idx])


def load_assets():
    global model, feature_cols, material_stats, base_recipe, base_curve, oil_content
    
    model_path = MODEL_DIR / 'model.pkl'
    cols_path = MODEL_DIR / 'feature_cols.json'
    stats_path = MODEL_DIR / 'material_stats.json'
    oil_path = DATA_DIR / 'oil_content.json'
    
    if not (model_path.exists() and cols_path.exists() and stats_path.exists()):
        raise RuntimeError(f"Model assets not found under {MODEL_DIR}!")
        
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    if hasattr(model, 'n_jobs'):
        model.n_jobs = 1
        
    with open(cols_path, 'r', encoding='utf-8') as f:
        feature_cols = json.load(f)
        
    with open(stats_path, 'r', encoding='utf-8') as f:
        material_stats = json.load(f)
        
    # Load oil content constraint database
    if oil_path.exists():
        with open(oil_path, 'r', encoding='utf-8') as f:
            oil_content = json.load(f)
    else:
        oil_content = {}
        
    # Build default base recipe (Try custom base_recipe.json first, fallback to mean PHR)
    base_recipe_path = MODEL_DIR / 'base_recipe.json'
    if base_recipe_path.exists():
        with open(base_recipe_path, 'r', encoding='utf-8') as f:
            base_recipe = json.load(f)
        # Ensure all materials in material_stats have a value in base_recipe, default to 0.0 if missing
        for m in material_stats:
            if m['CODE'] not in base_recipe:
                base_recipe[m['CODE']] = 0.0
    else:
        base_recipe = {m['CODE']: m['mean_phr'] for m in material_stats}
    
    # Normalize base recipe first before running base curve
    base_recipe = normalize_recipe_polymer_dict(base_recipe, oil_content)
    
    # Calculate base line curve
    base_curve = run_inference(base_recipe)


def run_inference(recipe_dict: Dict[str, float]):
    """Helper to convert recipe dict to feature dataframe, calculate derived features, and run prediction."""
    # Enforce polymer 100 PHR constraint on input recipe
    recipe_dict = normalize_recipe_polymer_dict(recipe_dict, oil_content)
    
    # Create empty dataframe with exact feature columns
    # We first initialize columns that belong to materials (excluding derived features)
    # The derived features will be automatically appended by build_recipe_derived_features
    # We select all material columns from feature_cols (derived features are not in the raw material pivot)
    derived_names = [
        'CURING_TOTAL_PHR', 'A_TOTAL_PHR', 'TOTAL_FILLER_PHR', 'TOTAL_COUPLING_PHR',
        'TOTAL_ADDITIVE_PHR', 'TOTAL_PLASTICIZER_PHR', 'FILLER_CB_PHR', 'FILLER_SILICA_PHR',
        'POLYMER_R_NR_PHR', 'POLYMER_E_SBR_PHR', 'POLYMER_Q_BR_PHR', 'CURING_TO_A_RATIO',
        'SILICA_SHARE_IN_FILLER', 'CB_SHARE_IN_FILLER', 'D1_TO_SILICA_RATIO'
    ]
    raw_material_cols = [c for c in feature_cols if c not in derived_names]
    
    # Construct input dataframe
    row_data = {c: 0.0 for c in raw_material_cols}
    # Update with custom recipe
    for code, phr in recipe_dict.items():
        if code in row_data:
            row_data[code] = float(phr)
            
    input_df = pd.DataFrame([row_data])
    
    # Calculate derived features
    derived_df = build_recipe_derived_features(input_df)
    
    # Concatenate to match feature cols exactly
    full_input_df = input_df.join(derived_df, how='inner')
    
    # Reorder columns to match feature_cols exactly
    full_input_df = full_input_df[feature_cols]
    
    # Predict
    pred = model.predict(full_input_df)[0]
    
    # Map predictions back to temperature keys (-60 to 60)
    target_buckets = list(range(-60, 61, 5))
    curve = [{'temp': int(t), 'tan_delta': float(val)} for t, val in zip(target_buckets, pred)]
    return curve


def load_benchmarks():
    global benchmark_summary, benchmark_details
    import time
    start_time = time.time()
    
    summary_path = DATA_DIR / "benchmark_summary.json"
    details_path = DATA_DIR / "benchmark_details.json"
    
    if summary_path.exists() and details_path.exists():
        try:
            with open(summary_path, "r", encoding="utf-8") as f:
                benchmark_summary = json.load(f)
            with open(details_path, "r", encoding="utf-8") as f:
                benchmark_details = json.load(f)
            elapsed = time.time() - start_time
            print(f"Loaded {len(benchmark_summary)} precomputed benchmarks from cache files in {elapsed:.3f} seconds.")
            return
        except Exception as e:
            print(f"Warning: Failed to load benchmark cache: {e}. Recomputing...")
            
    # Recompute
    tread_data_path = BASE_DIR.parent / "Compd BM" / "data" / "tread_data.json"
    if not tread_data_path.exists():
        tread_data_path = BASE_DIR.parent / "Compd_BM" / "data" / "tread_data.json"
        
    if not tread_data_path.exists():
        print("Warning: tread_data.json not found. Benchmark endpoints will return empty data.")
        benchmark_summary = []
        benchmark_details = {}
        return
        
    try:
        with open(tread_data_path, "r", encoding="utf-8") as f:
            source_data = json.load(f)
            
        temperatures = [-60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
        priority_makers = [
            'HANKOOK', 'MICHELIN', 'CONTINENTAL', 'BRIDGESTONE', 
            'GOODYEAR', 'PIRELLI', 'KUMHO', 'NEXEN'
        ]
        
        def get_prop_value(item, keys):
            for key in keys:
                if key in item and item[key] is not None:
                    return item[key]
            return None

        computed_summary = []
        computed_details = {}
        
        for index, item in enumerate(source_data):
            maker_val = get_prop_value(item, ['Maker', 'MakerPatternRaw'])
            maker = str(maker_val).strip() if maker_val is not None else ""
            
            pattern_val = get_prop_value(item, ['Pattern'])
            pattern = str(pattern_val).strip() if pattern_val is not None else ""
            
            if not maker or not pattern or maker == 'N/A' or pattern == 'N/A':
                continue
                
            temps_avg = {}
            has_ares_data = False
            
            for temp in temperatures:
                val = None
                if temp == 0:
                    val_raw = get_prop_value(item, ['tan δ @ 0℃', '0℃ tanδ', '0C tanδ', 'tanδ @ 0℃'])
                elif temp == 60:
                    val_raw = get_prop_value(item, ['tanδ @ 60℃', 'tanδ @ 60C', 'tan δ @ 60℃', 'tan @ 60', 'DMTS @ 60℃', 'tanδ @ 60℃ (@ 0.5%)', '60'])
                else:
                    val_raw = item.get(str(temp))
                    if val_raw is None and temp > 0:
                        val_raw = item.get('+' + str(temp))
                
                if val_raw is not None:
                    try:
                        val = float(val_raw)
                    except ValueError:
                        val = None
                        
                if val is not None:
                    temps_avg[str(temp)] = val
                    has_ares_data = True
                else:
                    temps_avg[str(temp)] = None
                    
            if not has_ares_data:
                continue
                
            tg_raw = get_prop_value(item, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"])
            tg = None
            if tg_raw is not None:
                try:
                    tg = float(tg_raw)
                except ValueError:
                    tg = None
                    
            wet = temps_avg.get('0')
            rr = temps_avg.get('60')
            
            size_raw = get_prop_value(item, ['Size', '규격'])
            size = str(size_raw).strip() if size_raw is not None else ""
            
            season_raw = get_prop_value(item, ['Season'])
            season = str(season_raw).strip() if season_raw is not None else ""
            
            part_raw = get_prop_value(item, ['부위'])
            part = str(part_raw).strip() if part_raw is not None else ""
            
            year_raw = get_prop_value(item, ['분석년도', '분석년도 '])
            year = str(year_raw).strip() if year_raw is not None else ""
            
            id_str = f"{maker}||{pattern}||{size}||{season}||{part}||{year}||{index}"
            
            computed_summary.append({
                "id": id_str,
                "maker": maker,
                "pattern": pattern,
                "size": size,
                "season": season,
                "part": part,
                "year": year,
                "avgData": {
                    "tg": tg,
                    "tand0": wet,
                    "tand60": rr
                }
            })
            
            computed_details[id_str] = temps_avg

        # Sorting
        def sort_key(item):
            maker_upper = item["maker"].upper()
            try:
                p_idx = priority_makers.index(maker_upper)
            except ValueError:
                p_idx = 999999
            try:
                year_val = int(item["year"])
            except ValueError:
                year_val = 0
            pattern_val = item["pattern"].lower()
            return (p_idx, maker_upper, -year_val, pattern_val)
            
        computed_summary.sort(key=sort_key)
        
        benchmark_summary = computed_summary
        benchmark_details = computed_details
        
        # Save cache
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        try:
            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump(benchmark_summary, f, ensure_ascii=False, indent=2)
            with open(details_path, "w", encoding="utf-8") as f:
                json.dump(benchmark_details, f, ensure_ascii=False)
            elapsed = time.time() - start_time
            print(f"Precomputed and saved {len(benchmark_summary)} benchmarks successfully in {elapsed:.3f} seconds.")
        except Exception as write_err:
            print(f"Warning: Failed to write benchmark cache: {write_err}")
            
    except Exception as parse_err:
        print(f"Error precomputing benchmarks: {parse_err}")
        benchmark_summary = []
        benchmark_details = {}


class RecipeRequest(BaseModel):
    recipe: Dict[str, float]


@app.on_event("startup")
async def startup_event():
    # Attempt to load model assets. If they aren't generated yet, 
    # we log it but don't crash startup (in case training is running in background)
    try:
        load_assets()
        print("Model assets loaded successfully on startup.")
    except Exception as e:
        print(f"Warning: Startup asset load skipped: {e}")
        
    try:
        load_benchmarks()
    except Exception as e:
        print(f"Warning: Startup benchmarks load skipped: {e}")


@app.get("/api/benchmark/summary")
async def get_benchmark_summary():
    import time
    start_time = time.time()
    res = benchmark_summary
    elapsed = time.time() - start_time
    print(f"[/api/benchmark/summary] response prepared in {elapsed*1000:.2f} ms")
    return res


@app.get("/api/benchmark/detail")
async def get_benchmark_detail(id: str):
    import time
    start_time = time.time()
    detail = benchmark_details.get(id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Benchmark ID not found")
    elapsed = time.time() - start_time
    print(f"[/api/benchmark/detail] detail fetched in {elapsed*1000:.2f} ms for ID: {id}")
    return detail


@app.get("/api/data-spec")
async def get_data_spec():
    if not material_stats:
        try:
            load_assets()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Model assets are not ready: {e}")
            
    # Calculate current derived metrics for the baseline recipe
    derived_df = build_recipe_derived_features(pd.DataFrame([base_recipe]))
    derived_metrics = derived_df.iloc[0].to_dict()
    
    # Calculate Base Tg
    base_tg = calculate_tg(base_curve)
    
    return {
        "materials": material_stats,
        "base_recipe": base_recipe,
        "base_curve": base_curve,
        "base_tg": base_tg,
        "derived_metrics": derived_metrics,
        "oil_content": oil_content
    }


@app.post("/api/predict")
async def predict_curve(req: RecipeRequest):
    if model is None:
        try:
            load_assets()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Model assets are not ready: {e}")
            
    try:
        # Predict curve (run_inference internaly applies polymer normalization)
        simulated_curve = run_inference(req.recipe)
        
        # Calculate Simulated Tg
        sim_tg = calculate_tg(simulated_curve)
        
        # Apply normalization to the recipe before calculating derived features for display consistency
        normalized_recipe = normalize_recipe_polymer_dict(req.recipe, oil_content)
        derived_df = build_recipe_derived_features(pd.DataFrame([normalized_recipe]))
        derived_metrics = derived_df.iloc[0].to_dict()
        
        return {
            "curve": simulated_curve,
            "tg": sim_tg,
            "derived_metrics": derived_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


class AdvisorRequest(BaseModel):
    recipe: Dict[str, float]
    simulated_scores: Dict[str, int]
    reference_scores: Dict[str, int]
    simulated_tg: float
    reference_tg: float
    reference_name: str
    distribution_bounds: Dict[str, Dict[str, float]] = None


@app.post("/api/ai-advisor")
async def run_ai_advisor(req: AdvisorRequest):
    try:
        from ai_advisor import get_ai_advisor_report, calculate_optimized_recipe
        report_markdown = get_ai_advisor_report(
            recipe=req.recipe,
            sim_scores=req.simulated_scores,
            ref_scores=req.reference_scores,
            sim_tg=req.simulated_tg,
            ref_tg=req.reference_tg,
            ref_name=req.reference_name,
            material_stats=material_stats,
            distribution_bounds=req.distribution_bounds,
            run_inference_fn=run_inference,
            calculate_tg_fn=calculate_tg
        )
        optimized_recipe = calculate_optimized_recipe(
            recipe=req.recipe,
            sim_scores=req.simulated_scores,
            ref_scores=req.reference_scores,
            sim_tg=req.simulated_tg,
            ref_tg=req.reference_tg,
            material_stats=material_stats,
            run_inference_fn=run_inference,
            calculate_tg_fn=calculate_tg,
            distribution_bounds=req.distribution_bounds
        )
        return {
            "success": True,
            "report": report_markdown,
            "optimized_recipe": optimized_recipe
        }
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        # Return both the requested debug error structure and a rich markdown report for display
        return {
            "success": False,
            "error": str(e),
            "traceback": tb,
            "report": f"### ❌ AI Advisor Error (Debug Mode)\n\n**Error Message:** `{str(e)}`\n\n**Traceback:**\n```python\n{tb}\n```",
            "optimized_recipe": {}
        }


# ==========================================
# Google Vertex AI Gemini LLM Integration API
# ==========================================

class LLMTestRequest(BaseModel):
    prompt: str

class ChatRequest(BaseModel):
    query: str
    context: dict = None

class ReportRequest(BaseModel):
    brand: str
    model: str
    context_data: dict

@app.get("/api/llm/health")
async def get_llm_health():
    try:
        from llm_client import is_initialized, MODEL_NAME, PROJECT_ID, LOCATION
        return {
            "ok": True,
            "initialized": is_initialized,
            "model": MODEL_NAME,
            "project": PROJECT_ID,
            "location": LOCATION
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Client Module Import Error: {str(e)}")

@app.post("/api/llm/test")
async def post_llm_test(req: LLMTestRequest):
    from llm_client import call_gemini, is_initialized
    if not is_initialized:
        raise HTTPException(status_code=503, detail="Vertex AI is not initialized on the server.")
    try:
        response_text = call_gemini(req.prompt)
        return {"ok": True, "text": response_text}
    except Exception as e:
        import logging
        logger = logging.getLogger("app")
        logger.error(f"Error in /api/llm/test: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Gemini model call failed.")

@app.post("/api/llm/chat")
async def post_llm_chat(req: ChatRequest):
    import logging
    import json
    logger = logging.getLogger("app")
    
    # Direct stdout print to guarantee terminal visibility
    print(f"\n[FastAPI API_CHAT] ===============================================")
    print(f"[FastAPI API_CHAT] Received user query: '{req.query}'")
    print(f"[FastAPI API_CHAT] ===============================================")
    
    logger.info(f"[LLM CHAT] === Received user query: '{req.query}' ===")
    
    from llm_client import call_gemini, is_initialized
    if not is_initialized:
        logger.error("[LLM CHAT] Vertex AI is not initialized on the server.")
        print("[FastAPI API_CHAT] Error: Vertex AI is not initialized on the server.")
        raise HTTPException(status_code=503, detail="Vertex AI is not initialized on the server.")
        
    try:
        query_lower = req.query.lower()
        
        # A. Internal-only keywords (force local RAG)
        internal_keywords = [
            "시뮬레이터", "simulator", "wet 제동", "제동 성능", "ares", "곡선", "curve", 
            "물성", "score", "점수", "조견표", "실험", "레시피", "recipe", "처방"
        ]
        
        # B. External-only keywords (activate google search grounding)
        external_keywords = [
            "최신", "최근", "출시", "예상", "동향", "뉴스", "로드맵", "언제", "전망", "특허", 
            "투자", "공장", "파트너십", "차세대", "2025", "2026", "2027", "2028", "시장", "트렌드",
            "뉴스레터", "업계 소식", "경쟁사 동향", "출시년도", "출시일", "예상 출시", "차세대 상품",
            "후속 모델", "경쟁사 신제품", "제품 로드맵", "공식 발표", "보도자료", "기사 기반",
            "후속", "uhp", "라인업", "기술 전략", "전략 차이", "신제품", "비교", "차이", "매출액", "매출",
            "defender", "michelin", "미쉐린", "한국타이어", "hankook"
        ]
        
        is_internal_only = any(kw in query_lower for kw in internal_keywords)
        is_external_query = any(kw in query_lower for kw in external_keywords) or not is_internal_only
        
        logger.info(f"[LLM CHAT] Query Routing Result: is_external_query={is_external_query}")
        
        bi_news_context = ""
        news_list = req.context.get("news_data", []) if req.context else []
        has_internal_data = False
        
        if news_list and is_external_query:
            matched_news = []
            news_keywords = ["미쉐린", "michelin", "한국", "hankook", "친환경", "소재", "ev", "전기차", "실리카", "silica", "출시", "기술", "공장", "동향", "트렌드", "전략", "uhp", "라인업"]
            matched_kw = [kw for kw in news_keywords if kw in query_lower]
            
            for news in news_list:
                news_content = ""
                if isinstance(news, dict):
                    news_content = f"{news.get('title', '')} {news.get('content', '')} {news.get('summary', '')} {news.get('excerpt', '')}"
                elif isinstance(news, str):
                    news_content = news
                
                if any(kw in news_content.lower() for kw in matched_kw):
                    matched_news.append(news)
                    if len(matched_news) >= 5:
                        break
                        
            if matched_news:
                bi_news_context = "이하의 사내 수집 최신 BI News 데이터입니다. 질문과 연관성이 높은 내부 뉴스이므로, 외부 정보보다 이 사내 뉴스의 팩트를 최우선 참고하십시오:\n" + json.dumps(matched_news, ensure_ascii=False, indent=2) + "\n\n"
                has_internal_data = True

        context_str = ""
        if req.context:
            filtered_context = {k: v for k, v in req.context.items() if k != "news_data"}
            if any(v for v in filtered_context.values() if v):
                has_internal_data = True
            context_str = f"이하의 지식 베이스(참고 데이터)를 기반으로 답변해 주세요:\n{json.dumps(filtered_context, ensure_ascii=False, indent=2)}\n\n"
        
        prompt = (
            "당신은 사내 BM-Intelligence 데이터와 외부 Web Grounding을 유기적으로 모두 활용하는 최고 지능의 Hybrid 타이어 벤치마킹 AI 분석 에이전트(Gemini 2.5)입니다.\n\n"
            "**[하이브리드 분석 원칙]**\n"
            "1. 너는 내부 BM-Intelligence 데이터와 외부 Web Grounding을 모두 활용하는 Hybrid 타이어 벤치마킹 AI다.\n"
            "2. 내부 데이터에 없는 질문도 즉시 포기하지 말고, 최신성/외부 정보가 필요한 경우 Web Grounding을 사용한다.\n"
            "3. 내부 데이터, 일반 지식, Web Grounding 결과를 구분해서 사용한다.\n"
            "4. 제공된 사내 내부 컨텍스트 데이터(RAG 및 매칭된 BI News)에 해당 정보가 존재한다면 최우선 팩트로 삼아 활용하십시오.\n"
            "5. 절대 내부 데이터에 매칭되는 제품 정보가 없다고 해서 '내부 데이터 기준 확인되지 않습니다'로 끝내거나 성의 없이 답변을 즉시 종료하거나 포기하지 마십시오. 먼저 Gemini 일반 추론 + Web Grounding을 시도하십시오.\n"
            "6. 공식 확인 정보와 추정 정보를 명확히 구분한다. 사용자가 예상을 물으면 공식 정보가 없는 경우에도 세대교체 주기 등 근거 기반 추정 범위를 제시하되, 추정임을 명확히 표시한다. 단, 근거 없는 숫자나 출시일을 단정하지 않는다.\n\n"
            "**[엄격한 톤앤매너 및 문체 규칙]**\n"
            "1. 절대 어떠한 인사말(예: 안녕하세요), 자기소개(예: 'BM-Intelligence Portal의 최고 AI 에이전트입니다' 등)도 포함하지 마십시오.\n"
            "2. '고객님', '문의해 주세요'와 같은 대고객 상담사 말투는 절대 금지합니다. 철저히 사내 임원 보고 및 전문 연구원 보고용 비즈니스 분석 문서 톤(입니다, 확인됩니다 등)을 사용하십시오.\n"
            "3. 한 문장을 지나치게 길게 쓰지 말고, 단문 위주로 작성하십시오.\n"
            "4. 답변 전체의 길이는 불필요한 서술 없이 핵심만 압축하여 기본 8~12줄 이내로 매우 간결하게 제안하십시오.\n"
            "5. 내부 데이터와 Web Grounding 검색 결과가 충돌하는 경우, 공식 출처 또는 최신 날짜의 자료를 우선하여 답변하되, 자료 작성 기준이나 시점에 따라 차이가 있을 수 있음을 주석 등으로 간결히 명시하십시오.\n\n"
            "**[질문 유형별 답변 형식 양식]**\n"
            "사용자의 질문 유형을 판단하여 반드시 아래 4가지 양식 중 하나를 선택해 완벽히 일치하도록 답변을 출력하십시오.\n\n"
            "--- [형식 1. 단순 수치 질문] ---\n"
            "(예: 특정 매출액, 점수, 성능, PHR 수치 질문)\n"
            "- 결론: 질문에 대해 수치와 핵심 사실을 포함한 단 1줄의 문장\n"
            "- 핵심 수치 표:\n"
            "  | 구분 | 수치 | 비고 |\n"
            "  |---|---|---|\n"
            "  (마크다운 테이블 형태로 핵심 수치를 정리)\n"
            "- 출처: 1줄 기술 (예: '참고 출처: 내부 데이터 (dashboard_data)' 또는 '참고 출처: Web Grounding (Google Search)')\n\n"
            "--- [형식 2. 비교 질문] ---\n"
            "(예: 두 브랜드, 모델, 기술의 차이, 장단점 비교 대조 질문)\n"
            "- 결론: 두 대상의 핵심 차이점과 강점을 명확히 요약한 1~2문장의 결론\n"
            "- 비교 요약 표:\n"
            "  | 구분 | 대상 A | 대상 B |\n"
            "  |---|---|---|\n"
            "  (마크다운 테이블 형태로 작성)\n"
            "- 시사점: 당사에 주는 비즈니스/기술적 제언 1~2문장\n\n"
            "--- [형식 3. 최신 뉴스/R&D 동향 질문] ---\n"
            "(예: 최신 트렌드, 시장 동향, 업계 주요 전략 뉴스 질문)\n"
            "- 결론: 동향 전체를 통찰력 있게 요약한 단 1문장\n"
            "- 핵심 동향 (딱 3개의 Bullet 포인트로 정리, 각 Bullet은 단 1문장으로 작성):\n"
            "  * [소재/기술 동향] 내용 1줄\n"
            "  * [경쟁사 동향] 내용 1줄\n"
            "  * [시장 트렌드] 내용 1줄\n"
            "- 당사 시사점: 향후 R&D나 상품 기획 관점의 당사 대응 방안 1~2문장\n"
            "- 참고 출처: 간략히 표시\n\n"
            "--- [형식 4. 내부 데이터 및 확실한 근거에 없는 질문] ---\n"
            "(예: 미출시 제품의 예상 출시일, 미기록 스펙 등 정보가 없거나 불확실할 때)\n"
            "- 결론: 공식 출시일이 확인되는지 선제적으로 명시하십시오. 공식 출시일이 불확실하다면 단정하지 않되, 기존 세대 모델들의 구체적인 출시 이력 및 라인업 세대교체 주기 흐름을 기반으로 논리적으로 산출된 예상 가능 범위를 합리적으로 기술하십시오.\n"
            "- 관련 확인된 정보: Web Grounding이나 일반 지식을 통해 확인된 기존 모델의 출시 년도나 최신 동향 1~2개 서술\n"
            "- 추가 확인이 필요한 데이터: 의사결정이나 팩트 확인을 위해 향후 관찰이 필요한 데이터 유형 명시\n"
            "- 참고 출처: 구글 검색 등의 참고 문헌 표시\n\n"
            f"{bi_news_context}"
            f"{context_str}"
            f"사용자 질문: {req.query}"
        )
        
        logger.info(f"[LLM CHAT] Forwarding query to Gemini model via llm_client...")
        print("[FastAPI API_CHAT] Forwarding query to Gemini via llm_client...")
        
        res_dict = None
        try:
            if is_external_query:
                logger.info(f"[LLM CHAT] Attempting chat call with Google Search Grounding enabled...")
                res_dict = call_gemini(prompt, enable_grounding=True, return_dict=True)
            else:
                logger.info(f"[LLM CHAT] Attempting chat call with internal RAG context only...")
                res_dict = call_gemini(prompt, enable_grounding=False, return_dict=True)
        except Exception as grounding_err:
            if is_external_query:
                logger.warning(f"[LLM CHAT] Google Search Grounding failed: {grounding_err}. Bypassing search and falling back to internal context...")
                print(f"[FastAPI API_CHAT] Search Grounding FAILED. Bypassing search and trying internal fallback...")
                res_dict = call_gemini(prompt, enable_grounding=False, return_dict=True)
            else:
                raise grounding_err
                
        response_text = res_dict["text"]
        logger.info(f"[LLM CHAT] Gemini call successful for query: '{req.query}'")
        print(f"[FastAPI API_CHAT] Gemini call successful!")
        print(f"[FastAPI API_CHAT] Response preview: {response_text[:120]}...")
        print(f"[FastAPI API_CHAT] Grounding used: {res_dict['grounding_used']}, Sources count: {len(res_dict['sources'])}")
        print(f"[FastAPI API_CHAT] ===============================================\n")
        
        badge = "internal"
        if res_dict.get("grounding_used"):
            if has_internal_data:
                badge = "hybrid"
            else:
                badge = "web"
        else:
            badge = "internal"

        return {
            "status": "success", 
            "response": response_text,
            "grounding_used": res_dict["grounding_used"],
            "sources": res_dict["sources"],
            "badge": badge
        }
    except Exception as e:
        logger.error(f"[LLM CHAT] Gemini call failed for query '{req.query}': {e}", exc_info=True)
        print(f"[FastAPI API_CHAT] Gemini call FAILED: {str(e)}")
        print(f"[FastAPI API_CHAT] ===============================================\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/llm/report")
async def post_llm_report(req: ReportRequest):
    from llm_client import call_gemini, is_initialized
    if not is_initialized:
        raise HTTPException(status_code=503, detail="Vertex AI is not initialized on the server.")
    try:
        prompt = (
            "당신은 타이어 R&D 및 R&D 마케팅 전략을 통합 분석하는 최고의 AI 전략 컨설턴트입니다.\n"
            f"대상 브랜드: {req.brand}\n"
            f"대상 모델: {req.model}\n"
            "제공된 대시보드 데이터(Tire BM, Comp'd BM, BI News, AI Simulator의 컨텍스트)를 기반으로 임원 보고용 통합 분석 리포트를 정밀하게 작성해 주세요.\n"
            "절대로 임의의 거짓 정보(hallucination)를 만들어내지 마시고, 반드시 제공된 실제 화면 데이터 기준으로만 작성해야 합니다.\n"
            "데이터가 부족하거나 없는 영역은 '해당 세그먼트 데이터 부족으로 표기를 생략함' 등 솔직하게 명시하고 억지로 거짓 지표를 창작하지 마십시오.\n\n"
            f"제공된 데이터 컨텍스트:\n{json.dumps(req.context_data, ensure_ascii=False, indent=2)}\n\n"
            "출력은 반드시 완벽한 JSON 포맷이어야 합니다. Markdown 블록(```json ... ```)을 사용하지 않고 오직 순수한 JSON 문자열만 반환해야 합니다. "
            "응답의 구조는 정확히 아래와 같은 JSON 형태여야 하며, 각 필드의 내용을 성실히 한국어로 작성해 주세요.\n"
            "{\n"
            '  "title": "통합 벤치마킹 분석 리포트",\n'
            '  "executive_summary": "현재 대시보드 데이터를 요약한 임원 보고용 핵심 요약 문단 (3~4줄 내외)",\n'
            '  "key_findings": ["주요 핵심 분석 결과 1", "주요 핵심 분석 결과 2", "주요 핵심 분석 결과 3"],\n'
            '  "market_insights": ["시장 경쟁 구도 및 브랜드 위치 관련 통찰 1", "시장 경쟁 구도 관련 통찰 2"],\n'
            '  "technical_insights": ["컴파운드 물성 또는 시뮬레이터 관련 기술적 분석 1", "물성/성능 밸런스 관련 기술적 분석 2"],\n'
            '  "recommended_actions": ["한국타이어가 경쟁 우위를 확보하기 위해 실행해야 할 구체적인 전략 제언 1", "실행 제언 2"],\n'
            '  "risk_notes": ["시장 진입 장벽 또는 기술적 한계, 리스크 요인 1", "리스크 요인 2"]\n'
            "}"
        )
        
        response_text = call_gemini(prompt, json_mode=True)
        
        try:
            report_json = json.loads(response_text)
            return report_json
        except json.JSONDecodeError:
            import re
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```"):
                cleaned_text = re.sub(r"^```(?:json)?\n?", "", cleaned_text)
                cleaned_text = re.sub(r"\n?```$", "", cleaned_text)
            cleaned_text = cleaned_text.strip()
            report_json = json.loads(cleaned_text)
            return report_json
            
    except Exception as e:
        import logging
        logger = logging.getLogger("app")
        logger.error(f"Error in /api/llm/report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Serve frontend static assets if available (checks directory existence to avoid startup crash)
frontend_dir = BASE_DIR.parent / 'Compd_BM'
if not frontend_dir.exists():
    frontend_dir = BASE_DIR.parent / 'AI_Simulator'

if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")
else:
    print(f"Warning: Static frontend directory not found. Static file serving skipped.")
