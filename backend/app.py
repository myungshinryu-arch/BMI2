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


# Serve frontend static assets if available (checks directory existence to avoid startup crash)
frontend_dir = BASE_DIR.parent / 'Compd_BM'
if not frontend_dir.exists():
    frontend_dir = BASE_DIR.parent / 'AI_Simulator'

if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")
else:
    print(f"Warning: Static frontend directory not found. Static file serving skipped.")
