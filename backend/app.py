import os
import pickle
import json
from pathlib import Path
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
        
    with open(cols_path, 'r') as f:
        feature_cols = json.load(f)
        
    with open(stats_path, 'r') as f:
        material_stats = json.load(f)
        
    # Load oil content constraint database
    if oil_path.exists():
        with open(oil_path, 'r') as f:
            oil_content = json.load(f)
    else:
        oil_content = {}
        
    # Build default base recipe (Try custom base_recipe.json first, fallback to mean PHR)
    base_recipe_path = MODEL_DIR / 'base_recipe.json'
    if base_recipe_path.exists():
        with open(base_recipe_path, 'r') as f:
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
        return {"report": report_markdown, "optimized_recipe": optimized_recipe}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Advisor processing error: {str(e)}")


# Serve frontend static assets if available (checks directory existence to avoid startup crash)
frontend_dir = BASE_DIR.parent / 'Compd_BM'
if not frontend_dir.exists():
    frontend_dir = BASE_DIR.parent / 'AI_Simulator'

if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")
else:
    print(f"Warning: Static frontend directory not found. Static file serving skipped.")
