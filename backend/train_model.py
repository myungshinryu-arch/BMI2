import pandas as pd
import numpy as np
import os
import json

# Define material classification rule
def classify_material(code):
    if not isinstance(code, str) or len(code) < 3:
        return 'OTHER'
    
    # 1. First letter 'C' -> COMPOUND
    if code[0] == 'C':
        return 'COMPOUND'
    
    # 2. 3rd+4th token (index 2:4)
    if len(code) >= 4:
        token_3_4 = code[2:4]
        if token_3_4 == 'D1':
            return 'COUPLING_SILANE'
        elif token_3_4 == 'Z1':
            return 'POLYMER_RECYCLED_RUBBER'
        elif token_3_4 == 'Z2':
            return 'POLYMER_RECYCLED_BUTYL'
        elif token_3_4 == 'Z3':
            return 'FILLER_RECYCLED'
            
    # 3. 3rd character (index 2)
    char_3 = code[2]
    mapping = {
        'R': 'POLYMER_NR',
        'E': 'POLYMER_SBR',
        'Q': 'POLYMER_BR',
        'U': 'POLYMER_LIQUID_BR',
        'C': 'FILLER_CARBON_BLACK',
        'D': 'FILLER_SILICA',
        'X': 'CURING_ACCELERATOR',
        'S': 'CURING_SULFUR',
        'H': 'CURING_RETARDER',
        'Y': 'ADDITIVE_ACTIVATOR',
        'A': 'ADDITIVE_ANTI_DEGRADANT',
        'K': 'ADDITIVE_PROCESS_AID',
        'P': 'ADDITIVE_OIL',
        'T': 'ADDITIVE_RESIN',
        'F': 'ADDITIVE_ADHESIVE',
        'N': 'ADDITIVE_FOAMING_AGENT',
        'B': 'ADDITIVE_COLORANT',
        'W': 'COMPOUND_WET_MASTERBATCH'
    }
    return mapping.get(char_3, 'OTHER')


def normalize_recipe_polymer(pivot_df: pd.DataFrame, oil_content_dict: dict) -> pd.DataFrame:
    # Do not mutate the original pivot_df
    df = pivot_df.copy()
    
    # Identify polymer columns
    polymer_cols = [col for col in df.columns if classify_material(col).startswith('POLYMER_')]
    
    if not polymer_cols:
        return df
        
    # Get Net Polymer Weight factor for each polymer column
    # Net Polymer factor = 100 / (100 + oil_content)
    weight_factors = {}
    for col in polymer_cols:
        oil_pct = oil_content_dict.get(col, 0.0)
        weight_factors[col] = 100.0 / (100.0 + oil_pct)
        
    # Calculate sum of net polymer for each row
    net_poly_sum = pd.Series(0.0, index=df.index)
    for col in polymer_cols:
        net_poly_sum += df[col] * weight_factors[col]
        
    # Apply normalization factor: scale = 100.0 / net_poly_sum
    # Avoid division by zero
    scale = 100.0 / net_poly_sum
    scale = scale.replace([np.inf, -np.inf], np.nan).fillna(1.0)
    scale[net_poly_sum == 0.0] = 1.0
    
    # Scale all polymer columns
    for col in polymer_cols:
        df[col] = df[col] * scale
        
    return df


def build_recipe_derived_features(recipe_df: pd.DataFrame) -> pd.DataFrame:
    # Do not mutate the original recipe_df
    # Select columns to exclude
    exclude_cols = ['REQ_NO', 'BATCH_NO', 'SPEC_NO', 'HINT_REQ_OBJ_ID', 'HINT_RESULT_OBJ_ID', 'HINT_ITEM_OBJ_ID', 'CREATED_DATE', 'BASE_COMP', 'BASE_COMPOUND_CODE', 'BASE_COMPOUND_NAME', 'SPEC_TYPE', 'DESCRIPTION']
    
    material_cols = []
    for col in recipe_df.columns:
        if col in exclude_cols:
            continue
        if col.startswith('actual_tand_') or col.startswith('pred_tand_') or col.startswith('mape_tand_'):
            continue
        if col.startswith('CODE_') or col.startswith('PHR_'):
            continue
        material_cols.append(col)
        
    # Group columns by classification
    classified = {
        'COMPOUND': [], 'COUPLING_SILANE': [], 'POLYMER_RECYCLED_RUBBER': [], 'POLYMER_RECYCLED_BUTYL': [], 'FILLER_RECYCLED': [],
        'POLYMER_NR': [], 'POLYMER_SBR': [], 'POLYMER_BR': [], 'POLYMER_LIQUID_BR': [], 'FILLER_CARBON_BLACK': [], 'FILLER_SILICA': [],
        'CURING_ACCELERATOR': [], 'CURING_SULFUR': [], 'CURING_RETARDER': [], 'ADDITIVE_ACTIVATOR': [], 'ADDITIVE_ANTI_DEGRADANT': [],
        'ADDITIVE_PROCESS_AID': [], 'ADDITIVE_OIL': [], 'ADDITIVE_RESIN': [], 'ADDITIVE_ADHESIVE': [], 'ADDITIVE_FOAMING_AGENT': [],
        'ADDITIVE_COLORANT': [], 'COMPOUND_WET_MASTERBATCH': [], 'OTHER': []
    }
    
    for col in material_cols:
        cls = classify_material(col)
        if cls in classified:
            classified[cls].append(col)
        else:
            classified['OTHER'].append(col)
            
    # Calculate sum for each classified material group
    sums = {}
    for cls, cols in classified.items():
        if len(cols) > 0:
            sums[cls] = recipe_df[cols].sum(axis=1).fillna(0.0)
        else:
            sums[cls] = pd.Series(0.0, index=recipe_df.index)
            
    # q_total = recipe 원료 PHR 전체 합
    if len(material_cols) > 0:
        q_total = recipe_df[material_cols].sum(axis=1).fillna(0.0)
    else:
        q_total = pd.Series(0.0, index=recipe_df.index)
        
    # Build derived features dataframe
    derived = pd.DataFrame(index=recipe_df.index)
    
    # CURING_TOTAL_PHR = CURING_ACCELERATOR + CURING_SULFUR + CURING_RETARDER
    derived['CURING_TOTAL_PHR'] = sums['CURING_ACCELERATOR'] + sums['CURING_SULFUR'] + sums['CURING_RETARDER']
    
    # A_TOTAL_PHR = q_total - CURING_TOTAL_PHR
    derived['A_TOTAL_PHR'] = q_total - derived['CURING_TOTAL_PHR']
    
    # TOTAL_FILLER_PHR = FILLER_CARBON_BLACK + FILLER_SILICA + FILLER_RECYCLED
    derived['TOTAL_FILLER_PHR'] = sums['FILLER_CARBON_BLACK'] + sums['FILLER_SILICA'] + sums['FILLER_RECYCLED']
    
    # TOTAL_COUPLING_PHR = COUPLING_SILANE
    derived['TOTAL_COUPLING_PHR'] = sums['COUPLING_SILANE']
    
    # TOTAL_ADDITIVE_PHR = ACTIVATOR + ANTI_DEGRADANT + PROCESS_AID + OIL + RESIN + ADHESIVE + FOAMING_AGENT + COLORANT
    derived['TOTAL_ADDITIVE_PHR'] = (
        sums['ADDITIVE_ACTIVATOR'] + sums['ADDITIVE_ANTI_DEGRADANT'] + 
        sums['ADDITIVE_PROCESS_AID'] + sums['ADDITIVE_OIL'] + 
        sums['ADDITIVE_RESIN'] + sums['ADDITIVE_ADHESIVE'] + 
        sums['ADDITIVE_FOAMING_AGENT'] + sums['ADDITIVE_COLORANT']
    )
    
    # TOTAL_PLASTICIZER_PHR = ADDITIVE_OIL + ADDITIVE_RESIN + AAU422A + AAU412A if exists
    plasticizer = sums['ADDITIVE_OIL'] + sums['ADDITIVE_RESIN']
    if 'AAU422A' in recipe_df.columns:
        plasticizer += recipe_df['AAU422A'].fillna(0.0)
    if 'AAU412A' in recipe_df.columns:
        plasticizer += recipe_df['AAU412A'].fillna(0.0)
    derived['TOTAL_PLASTICIZER_PHR'] = plasticizer
    
    # FILLER_CB_PHR = FILLER_CARBON_BLACK
    derived['FILLER_CB_PHR'] = sums['FILLER_CARBON_BLACK']
    
    # FILLER_SILICA_PHR = FILLER_SILICA
    derived['FILLER_SILICA_PHR'] = sums['FILLER_SILICA']
    
    # POLYMER_R_NR_PHR = POLYMER_NR
    derived['POLYMER_R_NR_PHR'] = sums['POLYMER_NR']
    
    # POLYMER_E_SBR_PHR = POLYMER_SBR
    derived['POLYMER_E_SBR_PHR'] = sums['POLYMER_SBR']
    
    # POLYMER_Q_BR_PHR = POLYMER_BR
    derived['POLYMER_Q_BR_PHR'] = sums['POLYMER_BR']
    
    # Ratio calculation helper
    def safe_ratio(num, den):
        res = num / den
        res = res.replace([np.inf, -np.inf], np.nan).fillna(0.0)
        return res.astype(float)
        
    # CURING_TO_A_RATIO = CURING_TOTAL_PHR / A_TOTAL_PHR
    derived['CURING_TO_A_RATIO'] = safe_ratio(derived['CURING_TOTAL_PHR'], derived['A_TOTAL_PHR'])
    
    # SILICA_SHARE_IN_FILLER = FILLER_SILICA_PHR / TOTAL_FILLER_PHR
    derived['SILICA_SHARE_IN_FILLER'] = safe_ratio(derived['FILLER_SILICA_PHR'], derived['TOTAL_FILLER_PHR'])
    
    # CB_SHARE_IN_FILLER = FILLER_CB_PHR / TOTAL_FILLER_PHR
    derived['CB_SHARE_IN_FILLER'] = safe_ratio(derived['FILLER_CB_PHR'], derived['TOTAL_FILLER_PHR'])
    
    # D1_TO_SILICA_RATIO = TOTAL_COUPLING_PHR / FILLER_SILICA_PHR
    derived['D1_TO_SILICA_RATIO'] = safe_ratio(derived['TOTAL_COUPLING_PHR'], derived['FILLER_SILICA_PHR'])
    
    # Clean up and force floats
    for col in derived.columns:
        derived[col] = derived[col].replace([np.inf, -np.inf], np.nan).fillna(0.0).astype(float)
        
    return derived
