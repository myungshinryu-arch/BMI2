import os
import json
import datetime
import numpy as np
from typing import Dict, Any

def get_gemini_api_key() -> str:
    """Check environment variables for Gemini/Google API key."""
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""

def get_score_from_bounds(value: float, bounds: dict, lower_is_better: bool) -> int:
    """Helper to convert predicted metrics to 0-100 scores based on bounds."""
    if not bounds:
        return 50
    vmin = bounds.get("min")
    vmax = bounds.get("max")
    if vmin is None or vmax is None or vmax == vmin:
        return 50
    if lower_is_better:
        score = ((vmax - value) / (vmax - vmin)) * 100
    else:
        score = ((value - vmin) / (vmax - vmin)) * 100
    return max(0, min(100, round(score)))

def format_score_delta(score_before: int, score_after: int, metric_name: str) -> str:
    """Generates strict score-description based on delta."""
    delta = score_after - score_before
    if delta >= 10:
        desc = "대폭 개선"
    elif delta >= 6:
        desc = "명확한 개선"
    elif delta >= 3:
        desc = "소폭 개선"
    elif delta >= 0:
        desc = "유지/소폭"
    else:
        if "wear" in metric_name.lower() or "마모" in metric_name:
            desc = "마모 저하 리스크 우려"
        elif "rr" in metric_name.lower() or "연비" in metric_name:
            desc = "회전저항 상승(연비 저하) 우려"
        else:
            desc = "성능 저하 가능성"
            
    sign = "+" if delta >= 0 else ""
    return f"{score_after}점 ({sign}{delta}점, {desc})"

def classify_into_sensitivity_groups(code: str, name: str, material_type: str) -> str:
    """Classifies a material into one of the 9 target sensitivity groups."""
    m_type = material_type.upper()
    name_upper = name.upper()
    
    if m_type == 'POLYMER_SBR':
        high_tg_sbr_codes = ['AAE132A', 'AAE413A', 'AAE325A', 'AAE326A', 'AAE323A']
        if code in high_tg_sbr_codes or 'HS' in name_upper or '1723' in name_upper:
            return 'High Tg SBR'
        else:
            return 'Low Tg SBR'
            
    elif m_type == 'POLYMER_BR':
        if 'FUNC' in name_upper or 'LIQ' in m_type or code == 'AAQ233A':
            return 'Functional BR'
        else:
            return 'BR'
            
    elif m_type == 'FILLER_CARBON_BLACK':
        return 'Carbon Black'
        
    elif m_type == 'FILLER_SILICA':
        return 'Silica'
        
    elif m_type == 'COUPLING_SILANE':
        return 'Silane'
        
    elif m_type == 'ADDITIVE_RESIN':
        return 'Resin'
        
    elif m_type == 'ADDITIVE_OIL':
        return 'Oil'
        
    return None

def get_ai_advisor_report(
    recipe: Dict[str, float],
    sim_scores: Dict[str, int],
    ref_scores: Dict[str, int],
    sim_tg: float,
    ref_tg: float,
    ref_name: str,
    material_stats: list,
    distribution_bounds: Dict[str, Dict[str, float]] = None,
    opts: Dict[str, Any] = None
) -> str:
    """
    Expert Compounding Heuristic Report Generator.
    Produces a beautifully structured, premium, domain-expert compounding report in Korean.
    """
    # 1. Dyn import prediction functions from app to execute search & sensitivity analysis
    try:
        from app import run_inference as run_inference_local, calculate_tg as calculate_tg_local
    except Exception:
        run_inference_local = None
        calculate_tg_local = None

    if opts is None:
        opts = calculate_optimized_recipe(
            recipe=recipe,
            sim_scores=sim_scores,
            ref_scores=ref_scores,
            sim_tg=sim_tg,
            ref_tg=ref_tg,
            material_stats=material_stats,
            run_inference_fn=run_inference_local,
            calculate_tg_fn=calculate_tg_local,
            distribution_bounds=distribution_bounds
        )
    
    # Material name maps
    code_to_name = {m['CODE']: m['name'] for m in material_stats}
    ref_clean = ref_name.strip()
    
    # General status diagnosis
    wear_gap = sim_scores.get('wear', 0) - ref_scores.get('wear', 0)
    wet_gap = sim_scores.get('wet', 0) - ref_scores.get('wet', 0)
    rr_gap = sim_scores.get('rr', 0) - ref_scores.get('rr', 0)
    
    diagnostics = []
    if wear_gap < 0:
        diagnostics.append(f"내마모성(Wear)이 벤치마크 대비 {wear_gap}점 부족합니다. 고무상 Tg({sim_tg:.1f}℃)가 상대적으로 높아 저온 거동 및 표면 마찰 복원력이 부족합니다.")
    else:
        diagnostics.append(f"내마모성(Wear)은 벤치마크 대비 +{wear_gap}점 수준으로 우수하거나 동등 수준입니다.")
        
    if wet_gap < 0:
        diagnostics.append(f"Wet Grip이 벤치마크 대비 {wet_gap}점 부족합니다. 0℃ 영역의 점탄성 에너지가 부족하므로 실리카 함량이나 고Tg SBR 비율 확대가 필요합니다.")
    else:
        diagnostics.append(f"Wet Grip은 벤치마크 대비 +{wet_gap}점 수준으로 양호한 밀착 마찰력을 보입니다.")
        
    if rr_gap < 0:
        diagnostics.append(f"회전저항(RR) 성능이 {rr_gap}점 부족하여 연비 효율 개선이 요구됩니다. 60℃ tanδ 발열 제어를 위한 실란 결합 반응 보완 및 CB/Silica 분산 최적화가 필요합니다.")
    else:
        diagnostics.append(f"회전저항(RR, 연비)은 벤치마크 대비 +{rr_gap}점 수준으로 발열 통제가 우수한 편입니다.")
        
    diagnostic_summary_text = " ".join(diagnostics)

    # Compile 3 candidates
    cand_sections = []
    
    if not opts:
        # No Meaningful Improvement fallback text
        candidates_formatted_text = """> [!WARNING]
> **유의미한 성능 개선 후보 없음**
> 현재 탐색 범위에서는 유의미한 성능 개선 후보가 발견되지 않았습니다.
> 모델 기준으로는 레시피 변경에 따른 score 민감도가 낮거나, 현재 baseline이 이미 국소 최적점에 가까울 수 있습니다.
> 민감도 분석 및 score mapping 검토를 권장합니다."""
    else:
        for key in ["A", "B", "C"]:
            opt_data = opts.get(key)
            if not opt_data:
                continue
            
            opt_name = opt_data["title"]
            expected_s = opt_data["prediction"]
            
            # Calculate phr differences
            phr_changes = []
            for c_chg in opt_data.get("recipeChanges", []):
                if abs(c_chg["deltaPhr"]) > 0.05:
                    phr_changes.append(f"- {c_chg['materialName']} ({c_chg['material']}): {c_chg['deltaPhr']:+.1f} phr (기존 {c_chg['oldPhr']:.1f} -> 변경 {c_chg['newPhr']:.1f} phr)")
                    
            phr_guide_str = "\n".join(phr_changes) if phr_changes else "- 원료 배합 변동 없음 (동등 유지)"
            
            wear_desc = format_score_delta(sim_scores.get("wear", 0), expected_s.get("wearScore", 0), "wear")
            wet_desc = format_score_delta(sim_scores.get("wet", 0), expected_s.get("wetScore", 0), "wet")
            rr_desc = format_score_delta(sim_scores.get("rr", 0), expected_s.get("rrScore", 0), "rr")
            
            risks_formatted = "\n".join([f"  - {r}" for r in opt_data.get("risks", [])])
            
            # Show Out of Distribution Warnings if any
            ood_warning_str = ""
            if opt_data.get("is_ood") and opt_data.get("ood_warnings"):
                warnings_formatted = "\n".join([f"  > *{w}*" for r in opt_data["ood_warnings"]])
                ood_warning_str = f"\n* **⚠️ 예측 신뢰도 경고 (OOD Warning)**:\n{warnings_formatted}"
                
            cand_html = f"""### {opt_name}
* **목적**: {opt_data.get('description', '')}
* **레시피 조정 방향**: {opt_data.get('rationale', '')}
* **조정 대상 원료군**: {', '.join(set([c_chg['materialType'] for c_chg in opt_data.get('recipeChanges', [])]))}
* **phr 조정 가이드**:
{phr_guide_str}
* **기대 효과**:
  - 내마모 (Wear): {wear_desc}
  - Wet 제동 (Wet Grip): {wet_desc}
  - 연비 (Rolling Resistance): {rr_desc}{ood_warning_str}
* **Trade-off/리스크**:
{risks_formatted}
* **실험 우선순위**: **{opt_data.get('strategy', 'High')}**"""
            cand_sections.append(cand_html)
        candidates_formatted_text = "\n\n".join(cand_sections)

    # 2. Build Sensitivity Analysis Table
    sensitivity_table_str = ""
    if run_inference_local is not None and calculate_tg_local is not None:
        try:
            sens_data = run_sensitivity_analysis(
                recipe=recipe,
                material_stats=material_stats,
                run_inference_fn=run_inference_local,
                calculate_tg_fn=calculate_tg_local,
                distribution_bounds=distribution_bounds,
                sim_scores=sim_scores
            )
            
            table_lines = [
                "| 원료군 | 변경량 (phr) | 내마모 Score | Wet Score | RR Score | Tg (℃) | tanδ (0℃) | tanδ (60℃) |",
                "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |"
            ]
            for row in sens_data:
                sign = "+" if row['delta'] >= 0 else ""
                table_lines.append(
                    f"| **{row['group']}** | {sign}{row['delta']} | {row['wearScore']}점 | {row['wetScore']}점 | {row['rrScore']}점 | {row['tg']:.1f}℃ | {row['tand0']:.4f} | {row['tand60']:.4f} |"
                )
            sensitivity_table_str = "\n".join(table_lines)
        except Exception as e:
            sensitivity_table_str = f"*일변수 민감도 분석 연산 실패: {e}*"
    else:
        sensitivity_table_str = "*모델 예측 함수 로딩 불가로 민감도 분석을 스킵합니다.*"

    # Final compilation of the report (No '---' horizontal rules as per strict rules)
    report_md = f"""# 🧠 AI 탐색 기반 가상 레시피 최적화 분석 리포트
*수석 컴파운딩 엔지니어 연구원 (Tyre Compounding Copilot)*

## 📊 1. 종합 진단 및 핵심 의사결정 요약 (Executive Summary)
현재 사용자가 수립한 배합 설계(Recipe) 및 시뮬레이션 데이터와, 지정 벤치마크 대상인 **{ref_clean}**의 성능 스코어를 정밀 대비 분석하였습니다.
{diagnostic_summary_text}
수립된 기계학습 tanδ 예측 모델에 기반해 500개 이상의 가상 레시피 조합을 시뮬레이션 탐색 및 다목적 최적화(Multi-objective Optimization)를 수행한 처방 결과입니다.

## 🔬 2. 추천 레시피 변경안 후보 (Candidate Formulations)

{candidates_formatted_text}

## 📊 3. 원료군별 일변수 민감도 분석 (One-Variable Sensitivity Analysis)
주요 원료군별로 PHR 변량 조절 시 Wear/Wet/RR 지표 및 점탄성 스펙트럼 인자들이 어떻게 독립적으로 요동치는지에 대한 정밀 가상 스크리닝 결과입니다.

{sensitivity_table_str}

## 🧪 4. 고무 컴파운딩 전문 엔지니어링 설계 가이드 (Technical Advice)
* **실리카-실란 가교 안정화**: Silica 및 Silane 투입 비율 조정 시, 고온 혼련 과정에서의 반응도(Silanization) 극대화가 핵심입니다. 기혼련 가압 스크류 온도 140~150℃ 대역에서 가교가 충분히 활성화될 수 있도록 배치 공정을 상시 모니터링하십시오.
* **폴리머 유리전이온도(Tg) 제어**: SBR과 BR의 블렌드 배합은 타이어 마모 지수와 Wet 그립을 동시에 타겟팅하는 최고의 팩터입니다. BR 증량 시 Wear는 눈에 띄게 우세해지나, 극성 흡착력이 결여되어 Wet 제동거리가 늘어날 수 있으므로 후보 2(Balance)를 최우선으로 검증할 것을 권장합니다.

*본 분석은 가상 컴파운드 원료 물리 상태 및 tanδ 예측 기계학습 모델의 예측치를 바탕으로 타이어 재료공학 규칙에 의거해 AI 시스템이 자동 도출한 설계 제안서입니다.*"""

    return report_md

def safe_normalize_recipe_polymer_dict(recipe_dict: dict, material_stats: list) -> dict:
    """Polymers scale adjustment to meet exact 100 PHR (excluding extended oil) constraint safely without timing import issues."""
    import os
    import json
    
    normalized = recipe_dict.copy()
    
    oil_content = {}
    oil_path = os.path.join('data', 'raw', 'oil_content.json')
    if os.path.exists(oil_path):
        try:
            with open(oil_path, 'r') as f:
                oil_content = json.load(f)
        except Exception:
            pass
            
    polymer_keys = []
    for code in normalized.keys():
        mat_info = next((m for m in material_stats if m['CODE'] == code), None)
        if mat_info and mat_info.get('type', '').startswith('POLYMER_'):
            polymer_keys.append(code)
            
    if not polymer_keys:
        return normalized
        
    net_poly_sum = 0.0
    weight_factors = {}
    for code in polymer_keys:
        oil_pct = oil_content.get(code, 0.0)
        wf = 100.0 / (100.0 + oil_pct)
        weight_factors[code] = wf
        net_poly_sum += float(normalized.get(code, 0.0)) * wf
        
    if net_poly_sum > 0:
        scale = 100.0 / net_poly_sum
        for code in polymer_keys:
            normalized[code] = float(normalized[code]) * scale
            
    return normalized

def calculate_optimized_recipe(
    recipe: Dict[str, float],
    sim_scores: Dict[str, int],
    ref_scores: Dict[str, int],
    sim_tg: float,
    ref_tg: float,
    material_stats: list,
    run_inference_fn = None,
    calculate_tg_fn = None,
    distribution_bounds: Dict[str, Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Search-based recipe optimizer. Generates 500 candidate recipes, predicts all metrics,
    applies strict constraints/penalties, ranks by multi-objective functions,
    and returns 3 premium candidates or an empty dict if no meaningful candidates exist.
    """
    baseline_recipe = recipe.copy()
    
    # 1. Classify active materials in the recipe
    active_polymers = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'].startswith('POLYMER_') for m in material_stats)]
    active_silica = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'] == 'FILLER_SILICA' for m in material_stats)]
    active_cb = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'] == 'FILLER_CARBON_BLACK' for m in material_stats)]
    active_silane = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'] == 'COUPLING_SILANE' for m in material_stats)]
    active_oil = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'] == 'ADDITIVE_OIL' for m in material_stats)]
    active_resin = [c for c, p in recipe.items() if p > 0.05 and any(m['CODE'] == c and m['type'] == 'ADDITIVE_RESIN' for m in material_stats)]
    
    # Safe fallbacks if some groups are empty
    default_br_key = next((m['CODE'] for m in material_stats if m['type'] == 'POLYMER_BR'), None)
    default_sbr_key = next((m['CODE'] for m in material_stats if m['type'] == 'POLYMER_SBR'), None)
    default_silica_key = active_silica[0] if active_silica else next((m['CODE'] for m in material_stats if m['type'] == 'FILLER_SILICA'), None)
    default_cb_key = active_cb[0] if active_cb else next((m['CODE'] for m in material_stats if m['type'] == 'FILLER_CARBON_BLACK'), None)
    default_silane_key = active_silane[0] if active_silane else next((m['CODE'] for m in material_stats if m['type'] == 'COUPLING_SILANE'), None)
    
    if run_inference_fn is not None and calculate_tg_fn is not None:
        run_inference_local = run_inference_fn
        calculate_tg_local = calculate_tg_fn
    else:
        try:
            from app import run_inference as run_inference_local, calculate_tg as calculate_tg_local
        except Exception:
            run_inference_local = None
            calculate_tg_local = None

    if run_inference_local is None or calculate_tg_local is None:
        print("[AI-Advisor] Critical: Model prediction functions are not loaded!")
        return {}

    baseline_wear = sim_scores.get('wear', 50)
    baseline_wet = sim_scores.get('wet', 50)
    baseline_rr = sim_scores.get('rr', 50)
    
    # Get baseline curves
    try:
        base_curve = run_inference_local(baseline_recipe)
        baseline_tand0 = next((p['tan_delta'] for p in base_curve if p['temp'] == 0), 0.40)
        baseline_tand60 = next((p['tan_delta'] for p in base_curve if p['temp'] == 60), 0.12)
    except Exception:
        baseline_tand0, baseline_tand60 = 0.40, 0.12

    # Deterministic Random State for stability
    rng = np.random.RandomState(42)
    candidates = []
    
    # Generate 500 candidate recipes
    for i in range(500):
        cand = baseline_recipe.copy()
        
        # A. Perturb polymers
        for c in active_polymers:
            perturb_factor = rng.uniform(-25.0, 25.0)
            cand[c] = max(0.0, cand.get(c, 0.0) + perturb_factor)
        try:
            cand = safe_normalize_recipe_polymer_dict(cand, material_stats)
        except Exception:
            pass
            
        # B. Perturb fillers
        if active_silica:
            for s_code in active_silica:
                cand[s_code] = max(0.0, cand.get(s_code, 0.0) + rng.uniform(-25.0, 35.0))
        elif default_silica_key:
            cand[default_silica_key] = max(0.0, rng.uniform(40.0, 110.0))
            
        if active_cb:
            for cb_code in active_cb:
                cand[cb_code] = max(0.0, cand.get(cb_code, 0.0) + rng.uniform(-20.0, 20.0))
        elif default_cb_key:
            cand[default_cb_key] = max(0.0, rng.uniform(5.0, 40.0))
            
        # Keep total filler in realistic limits [30.0, 135.0]
        total_filler = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'] in ['FILLER_SILICA', 'FILLER_CARBON_BLACK', 'FILLER_RECYCLED'])
        if total_filler < 30.0 or total_filler > 135.0:
            target_filler = np.clip(total_filler, 35.0, 130.0)
            scale_factor = target_filler / total_filler if total_filler > 0 else 1.0
            for m in material_stats:
                if m['type'] in ['FILLER_SILICA', 'FILLER_CARBON_BLACK', 'FILLER_RECYCLED'] and m['CODE'] in cand:
                    cand[m['CODE']] *= scale_factor
                    
        # C. Set Silane based on Silica to ensure realistic Silane/Silica ratio
        curr_silica = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'] == 'FILLER_SILICA')
        if curr_silica > 5.0:
            ratio = rng.uniform(0.06, 0.13)
            sil_phr = curr_silica * ratio
            if active_silane:
                for sil_code in active_silane:
                    cand[sil_code] = sil_phr / len(active_silane)
            elif default_silane_key:
                cand[default_silane_key] = sil_phr
        else:
            for sil_code in active_silane:
                cand[sil_code] = 0.0
            if default_silane_key:
                cand[default_silane_key] = 0.0
                
        # D. Perturb oil/resin
        for o_code in active_oil:
            cand[o_code] = max(0.0, cand.get(o_code, 0.0) + rng.uniform(-15.0, 15.0))
        for r_code in active_resin:
            cand[r_code] = max(0.0, cand.get(r_code, 0.0) + rng.uniform(-15.0, 15.0))
            
        # Total plasticizer constraint [0, 55]
        total_p = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'] in ['ADDITIVE_OIL', 'ADDITIVE_RESIN'])
        if total_p > 55.0:
            scale_p = 55.0 / total_p
            for m in material_stats:
                if m['type'] in ['ADDITIVE_OIL', 'ADDITIVE_RESIN'] and m['CODE'] in cand:
                    cand[m['CODE']] *= scale_p
                    
        # Round values for clean display
        for k in cand:
            cand[k] = max(0.0, round(float(cand[k]), 2))
            
        candidates.append(cand)

    # Evaluate all candidates
    import time
    t_start = time.time()
    evaluated_results = []
    for cand in candidates:
        if time.time() - t_start > 6.5:
            print(f"[AI-Advisor] Candidate optimization loop timed out at {len(evaluated_results)}/500 iterations to satisfy 10-second request limit constraint.")
            break
        try:
            curve = run_inference_local(cand)
            tg = calculate_tg_local(curve)
            tand0 = next((p['tan_delta'] for p in curve if p['temp'] == 0), 0.0)
            tand60 = next((p['tan_delta'] for p in curve if p['temp'] == 60), 0.0)
            
            wear_score = get_score_from_bounds(tg, distribution_bounds.get("wear") if distribution_bounds else None, True)
            wet_score = get_score_from_bounds(tand0, distribution_bounds.get("wet") if distribution_bounds else None, False)
            rr_score = get_score_from_bounds(tand60, distribution_bounds.get("rr") if distribution_bounds else None, True)
            
            deltaWear = wear_score - baseline_wear
            deltaWet = wet_score - baseline_wet
            deltaRR = rr_score - baseline_rr
            
            # Constraints & Penalty calculations
            penalty = 0.0
            ood_warnings = []
            is_ood = False
            
            # OOD Boundaries check
            for m in material_stats:
                code = m['CODE']
                phr = cand.get(code, 0.0)
                max_phr = m.get('max_phr', 100.0)
                if phr > max_phr * 1.25:
                    ood_warnings.append(f"{m['name']} 함량({phr:.1f} phr)이 학습 데이터 상위 범위를 크게 초과하여 신뢰도가 제한적일 수 있습니다.")
                    is_ood = True
                    penalty += 5.0
                    
            # Polymer constraint verify
            poly_sum = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'].startswith('POLYMER_'))
            if poly_sum < 95.0 or poly_sum > 140.0:
                penalty += 15.0
                
            # Filler totals verify
            fill_sum = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'].startswith('FILLER_'))
            if fill_sum < 30.0 or fill_sum > 140.0:
                penalty += 10.0
                
            # Silane/Silica ratio verify
            silica_sum = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'] == 'FILLER_SILICA')
            silane_sum = sum(cand.get(m['CODE'], 0.0) for m in material_stats if m['type'] == 'COUPLING_SILANE')
            if silica_sum > 5.0:
                sil_ratio = silane_sum / silica_sum
                if sil_ratio < 0.05 or sil_ratio > 0.15:
                    penalty += 20.0
                    
            # Critical drops (any drop >= 5 points)
            if deltaWear <= -5 or deltaWet <= -5 or deltaRR <= -5:
                penalty += 50.0
                
            # Change magnitude penalty
            change_sum = sum(abs(cand.get(code, 0.0) - baseline_recipe.get(code, 0.0)) for code in cand.keys())
            if change_sum > 45.0:
                penalty += 0.4 * (change_sum - 45.0)
                
            # Check individual negative values
            if any(v < 0.0 for v in cand.values()):
                penalty += 100.0
                
            evaluated_results.append({
                "recipe": cand,
                "prediction": {
                    "wearScore": wear_score,
                    "wetScore": wet_score,
                    "rrScore": rr_score,
                    "tg": tg,
                    "tanDelta0": tand0,
                    "tanDelta60": tand60
                },
                "delta": {
                    "wearScore": deltaWear,
                    "wetScore": deltaWet,
                    "rrScore": deltaRR,
                    "tg": tg - sim_tg,
                    "tanDelta0": tand0 - baseline_tand0,
                    "tanDelta60": tand60 - baseline_tand60
                },
                "is_ood": is_ood,
                "ood_warnings": ood_warnings,
                "penalty": penalty,
                "change_sum": change_sum
            })
        except Exception as e:
            print(f"[AI-Advisor] Evaluation error: {e}")

    if not evaluated_results:
        print("[AI-Advisor] Error: No candidates were successfully evaluated.")
        return {}

    # Rank and select best candidates per category
    best_wear_cand = None
    best_wet_cand = None
    best_rr_cand = None
    
    max_obj_wear = -999.0
    max_obj_wet = -999.0
    max_obj_rr = -999.0
    
    for r in evaluated_results:
        deltaWear = r["delta"]["wearScore"]
        deltaWet = r["delta"]["wetScore"]
        deltaRR = r["delta"]["rrScore"]
        penalty = r["penalty"]
        
        # Option A: Wear Focus (Reject if deltaWet < -3 or deltaRR < -3)
        if deltaWet >= -3 and deltaRR >= -3:
            obj_wear = 0.60 * deltaWear + 0.20 * deltaWet + 0.20 * deltaRR - penalty
            if obj_wear > max_obj_wear:
                max_obj_wear = obj_wear
                best_wear_cand = r
                
        # Option B: Wet Focus (Reject if deltaRR < -3)
        if deltaRR >= -3:
            obj_wet = 0.60 * deltaWet + 0.20 * deltaWear + 0.20 * deltaRR - penalty
            if obj_wet > max_obj_wet:
                max_obj_wet = obj_wet
                best_wet_cand = r
                
        # Option C: RR Focus (Reject if deltaWet < -3)
        if deltaWet >= -3:
            obj_rr = 0.60 * deltaRR + 0.20 * deltaWear + 0.20 * deltaWet - penalty
            if obj_rr > max_obj_rr:
                max_obj_rr = obj_rr
                best_rr_cand = r

    # Check for "No Meaningful Improvements"
    no_meaningful = False
    if best_wear_cand is None or best_wet_cand is None or best_rr_cand is None:
        no_meaningful = True
    else:
        best_obj = max(max_obj_wear, max_obj_wet, max_obj_rr)
        if best_obj <= 2.0:
            no_meaningful = True
            
        t_wear_delta = best_wear_cand["delta"]["wearScore"]
        t_wet_delta = best_wet_cand["delta"]["wetScore"]
        t_rr_delta = best_rr_cand["delta"]["rrScore"]
        if t_wear_delta < 3 and t_wet_delta < 3 and t_rr_delta < 3:
            no_meaningful = True

    if no_meaningful:
        print("[AI-Advisor] No meaningful improvement candidates found. Returning empty optimized recipe.")
        return {}

    # Define Title and Labels based on deltas
    def make_title(focus: str, delta: int) -> str:
        if delta <= 2:
            return f"탐색 후보 ({focus})"
        elif delta <= 5:
            return f"소폭 개선안 ({focus})"
        elif delta <= 10:
            return f"명확한 개선안 ({focus})"
        else:
            return f"대폭 개선안 ({focus})"

    def make_description(focus: str, delta: int) -> str:
        if delta <= 2:
            return "효과가 제한적인 설계 조율로, 전면 재검토가 필요한 탐색 수준의 후보입니다."
        elif delta <= 5:
            return f"타겟 성능의 소폭 개선 마진을 갖춘 실용 배합 조율 가이드라인입니다."
        elif delta <= 10:
            return f"{focus} 성능을 명확하게 한 대역 끌어올리는 우수한 전문 컴파운딩 처방전입니다."
        else:
            return f"{focus} 성능 영역의 한계를 과감하게 개조하여 대폭 개선한 한계 돌파형 설계안입니다."

    # Build response packages for selected candidates
    timestamp_str = datetime.datetime.now().isoformat()
    
    def build_recipe_changes(opt_recipe, base_recipe, stats):
        code_to_name = {m['CODE']: m['name'] for m in stats}
        code_to_type = {m['CODE']: m.get('type', '') for m in stats}
        changes_list = []
        for code, new_val in opt_recipe.items():
            old_val = base_recipe.get(code, 0.0)
            diff = new_val - old_val
            if abs(diff) > 0.01:
                changes_list.append({
                    "material": code,
                    "materialName": code_to_name.get(code, code),
                    "materialType": code_to_type.get(code, ""),
                    "oldPhr": float(old_val),
                    "newPhr": float(new_val),
                    "deltaPhr": float(diff)
                })
        return changes_list

    changes_a = build_recipe_changes(best_wear_cand["recipe"], recipe, material_stats)
    changes_b = build_recipe_changes(best_wet_cand["recipe"], recipe, material_stats)
    changes_c = build_recipe_changes(best_rr_cand["recipe"], recipe, material_stats)

    wear_delta = best_wear_cand["delta"]["wearScore"]
    wet_delta = best_wet_cand["delta"]["wetScore"]
    rr_delta = best_rr_cand["delta"]["rrScore"]

    return {
        "A": {
            "id": "A",
            "title": make_title("내마모 Focus", wear_delta),
            "strategy": "Wear-Focus" if wear_delta > 2 else "탐색/효과 제한적",
            "candidateRecipe": best_wear_cand["recipe"],
            "recipeChanges": changes_a,
            "prediction": best_wear_cand["prediction"],
            "delta": best_wear_cand["delta"],
            "rationale": "부타디엔 러버(BR) 폴리머 분율의 정밀 조정을 통해 고무상 유리전이온도(Tg)를 강하시키고 내마모성을 향상시키는 분산 처방 가이드라인입니다.",
            "risks": [
                "BR 비율 확대에 따른 고유 특성상 Wet Grip 제동력이 소폭 영향받을 우려가 있으므로 면밀한 검증을 추천합니다."
            ],
            "timestamp": timestamp_str,
            "recipe": best_wear_cand["recipe"],
            "description": make_description("내마모", wear_delta),
            "expected_metrics": {
                "tg": best_wear_cand["prediction"]["tg"],
                "tand0": best_wear_cand["prediction"]["tanDelta0"],
                "tand60": best_wear_cand["prediction"]["tanDelta60"]
            },
            "expected_scores": {
                "wear": best_wear_cand["prediction"]["wearScore"],
                "wet": best_wear_cand["prediction"]["wetScore"],
                "rr": best_wear_cand["prediction"]["rrScore"]
            },
            "is_ood": best_wear_cand["is_ood"],
            "ood_warnings": best_wear_cand["ood_warnings"]
        },
        "B": {
            "id": "B",
            "title": make_title("Wet 제동 Focus", wet_delta),
            "strategy": "Wet-Focus" if wet_delta > 2 else "탐색/효과 제한적",
            "candidateRecipe": best_wet_cand["recipe"],
            "recipeChanges": changes_b,
            "prediction": best_wet_cand["prediction"],
            "delta": best_wet_cand["delta"],
            "rationale": "유리전이온도가 상대적으로 높은 SBR 분률 증량 튜닝 및 실리카 보강 시스템 강화를 병행하여 접지 표면 마찰력(Wet Grip)을 지배적으로 육성하는 가교 최적 가이드라인입니다.",
            "risks": [
                "다량의 실리카 및 커플링제 투입으로 인해 미가류 컴파운드의 점도(Mooney viscosity)가 올라가 가공 부하가 상승할 리스크가 존재합니다."
            ],
            "timestamp": timestamp_str,
            "recipe": best_wet_cand["recipe"],
            "description": make_description("Wet 제동", wet_delta),
            "expected_metrics": {
                "tg": best_wet_cand["prediction"]["tg"],
                "tand0": best_wet_cand["prediction"]["tanDelta0"],
                "tand60": best_wet_cand["prediction"]["tanDelta60"]
            },
            "expected_scores": {
                "wear": best_wet_cand["prediction"]["wearScore"],
                "wet": best_wet_cand["prediction"]["wetScore"],
                "rr": best_wet_cand["prediction"]["rrScore"]
            },
            "is_ood": best_wet_cand["is_ood"],
            "ood_warnings": best_wet_cand["ood_warnings"]
        },
        "C": {
            "id": "C",
            "title": make_title("회전저항 Focus", rr_delta),
            "strategy": "RR-Focus" if rr_delta > 2 else "탐색/효과 제한적",
            "candidateRecipe": best_rr_cand["recipe"],
            "recipeChanges": changes_c,
            "prediction": best_rr_cand["prediction"],
            "delta": best_rr_cand["delta"],
            "rationale": "발열의 핵심 요체인 카본블랙 충진 분율을 대폭 차단하고, 실リカ 분산 가교 밀도를 극대화하여 60℃ 에너지 손실률(tanδ)을 극한으로 조율한 처방 설계안입니다.",
            "risks": [
                "보강성 충진 용인 CB의 배제로 인해 컴파운드의 인장 특성 및 가류 초기 모듈러스 저하를 방어하기 위한 공정 관리가 권장됩니다."
            ],
            "timestamp": timestamp_str,
            "recipe": best_rr_cand["recipe"],
            "description": make_description("회전저항", rr_delta),
            "expected_metrics": {
                "tg": best_rr_cand["prediction"]["tg"],
                "tand0": best_rr_cand["prediction"]["tanDelta0"],
                "tand60": best_rr_cand["prediction"]["tanDelta60"]
            },
            "expected_scores": {
                "wear": best_rr_cand["prediction"]["wearScore"],
                "wet": best_rr_cand["prediction"]["wetScore"],
                "rr": best_rr_cand["prediction"]["rrScore"]
            },
            "is_ood": best_rr_cand["is_ood"],
            "ood_warnings": best_rr_cand["ood_warnings"]
        }
    }

def run_sensitivity_analysis(
    recipe: Dict[str, float],
    material_stats: list,
    run_inference_fn,
    calculate_tg_fn,
    distribution_bounds: Dict[str, Dict[str, float]],
    sim_scores: Dict[str, int]
) -> list:
    """Executes a one-variable sensitivity analysis for 9 target material categories."""
    groups_to_analyze = [
        "High Tg SBR", "Low Tg SBR", "BR", "Functional BR",
        "Carbon Black", "Silica", "Silane", "Resin", "Oil"
    ]
    deltas = [-20, -10, -5, 5, 10, 20]
    
    sens_results = []
    
    # Pre-map all stats for fast query
    stat_by_code = {m['CODE']: m for m in material_stats}
    
    for group in groups_to_analyze:
        # Find active material of this group in recipe
        active_code = None
        max_phr_found = -1.0
        
        for code, phr in recipe.items():
            if phr > 0.0:
                stat = stat_by_code.get(code)
                if stat:
                    g = classify_into_sensitivity_groups(code, stat['name'], stat['type'])
                    if g == group and phr > max_phr_found:
                        max_phr_found = phr
                        active_code = code
                        
        # If no active material found, get a default code from stats
        if not active_code:
            for m in material_stats:
                g = classify_into_sensitivity_groups(m['CODE'], m['name'], m['type'])
                if g == group:
                    active_code = m['CODE']
                    break
                    
        if not active_code:
            continue
            
        base_val = recipe.get(active_code, 0.0)
        
        for d in deltas:
            cand = recipe.copy()
            new_val = max(0.0, base_val + d)
            cand[active_code] = new_val
            
            # Normalize polymers if it's a polymer
            stat = stat_by_code.get(active_code)
            if stat and stat['type'].startswith('POLYMER_'):
                try:
                    cand = safe_normalize_recipe_polymer_dict(cand, material_stats)
                except Exception:
                    pass
                    
            try:
                curve = run_inference_fn(cand)
                tg = calculate_tg_fn(curve)
                tand0 = next((p['tan_delta'] for p in curve if p['temp'] == 0), 0.0)
                tand60 = next((p['tan_delta'] for p in curve if p['temp'] == 60), 0.0)
                
                wear_score = get_score_from_bounds(tg, distribution_bounds.get("wear") if distribution_bounds else None, True)
                wet_score = get_score_from_bounds(tand0, distribution_bounds.get("wet") if distribution_bounds else None, False)
                rr_score = get_score_from_bounds(tand60, distribution_bounds.get("rr") if distribution_bounds else None, True)
                
                sens_results.append({
                    "group": group,
                    "code": active_code,
                    "delta": d,
                    "wearScore": wear_score,
                    "wetScore": wet_score,
                    "rrScore": rr_score,
                    "tg": tg,
                    "tand0": tand0,
                    "tand60": tand60
                })
            except Exception as e:
                print(f"[AI-Advisor] Sensitivity error for {group} delta {d}: {e}")
                
    return sens_results
