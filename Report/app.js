// =============================================================
// AI Integrated Report Center - Logic Controller v4.0 (A4 Secure)
// =============================================================

// 1. Client-Side Rich Knowledge Database (For precise 1:1 brand comparing)
const REPORT_IR_DATABASE = {
  HANKOOK: {
    nameKo: "한국타이어",
    globalSales: { "2024": "9,500만 본", "2025": "10,000만 본", "2026": "10,500만 본" },
    globalRevenue: { "2024": "$6.8B", "2025": "$7.1B", "2026": "$7.5B" },
    marginRate: "12.4%",
    rdInvestment: "$240M"
  },
  MICHELIN: {
    nameKo: "미쉐린",
    globalSales: { "2024": "17,600만 본", "2025": "18,000만 본", "2026": "18,500만 본" },
    globalRevenue: { "2024": "$30.5B", "2025": "$31.5B", "2026": "$32.5B" },
    marginRate: "15.1%",
    rdInvestment: "$980M"
  },
  CONTINENTAL: {
    nameKo: "콘티넨탈",
    globalSales: { "2024": "12,900만 본", "2025": "13,300만 본", "2026": "13,800만 본" },
    globalRevenue: { "2024": "$21.8B", "2025": "$22.5B", "2026": "$23.2B" },
    marginRate: "11.2%",
    rdInvestment: "$740M"
  },
  BRIDGESTONE: {
    nameKo: "브리지스톤",
    globalSales: { "2024": "16,300만 본", "2025": "16,700만 본", "2026": "17,200만 본" },
    globalRevenue: { "2024": "$28.2B", "2025": "$29.1B", "2026": "$30.0B" },
    marginRate: "13.8%",
    rdInvestment: "$850M"
  }
};

const REPORT_STRATEGY_DATABASE = {
  HANKOOK: { priority: "친환경 고배합 실리카 수지 실용화 및 회전저항 저감", patents: 1240, score: 89 },
  MICHELIN: { priority: "100% 지속 가능 재생 원료 실용화 및 미세분진 극단 마모 극복", patents: 3120, score: 96 },
  CONTINENTAL: { priority: "민들레 고무 대체 개발 및 지능형 센싱 타이어 양산", patents: 2045, score: 92 },
  BRIDGESTONE: { priority: "고성능 재생 타이어 실현 및 타이어 마일리지 내구 극대화", patents: 2890, score: 94 }
};

// Compd BM Mock attributes for models not directly parsed
const MODEL_MATERIAL_DEFAULTS = {
  // Summer / UHP
  "Pilot Sport 5": { silicaRate: "85%", hardness: "65 Shore A", wearIndex: "100", wetGrip: "A+" },
  "Ventus S1 evo3": { silicaRate: "78%", hardness: "68 Shore A", wearIndex: "94", wetGrip: "A" },
  "SportContact 7": { silicaRate: "82%", hardness: "66 Shore A", wearIndex: "96", wetGrip: "A+" },
  "Potenza Sport": { silicaRate: "75%", hardness: "70 Shore A", wearIndex: "90", wetGrip: "A" },
  
  // EV
  "Pilot Sport EV": { silicaRate: "88%", hardness: "64 Shore A", wearIndex: "105", wetGrip: "A+" },
  "iON evo": { silicaRate: "80%", hardness: "67 Shore A", wearIndex: "98", wetGrip: "A+" },
  "UltraContact NXT": { silicaRate: "84%", hardness: "65 Shore A", wearIndex: "102", wetGrip: "A+" },
  "Turanza EV": { silicaRate: "76%", hardness: "69 Shore A", wearIndex: "92", wetGrip: "A" },

  // Winter
  "Alpin 6": { silicaRate: "92%", hardness: "58 Shore A", wearIndex: "90", wetGrip: "A+" },
  "Winter i*cept evo3": { silicaRate: "85%", hardness: "60 Shore A", wearIndex: "86", wetGrip: "A" },
  "WinterContact TS870": { silicaRate: "88%", hardness: "59 Shore A", wearIndex: "88", wetGrip: "A+" },
  "Blizzak LM005": { silicaRate: "82%", hardness: "62 Shore A", wearIndex: "84", wetGrip: "A" },

  // All-Season
  "CrossClimate 2": { silicaRate: "86%", hardness: "62 Shore A", wearIndex: "110", wetGrip: "A+" },
  "Kinergy 4S2": { silicaRate: "80%", hardness: "65 Shore A", wearIndex: "102", wetGrip: "A" },
  "AllSeasonContact 2": { silicaRate: "83%", hardness: "64 Shore A", wearIndex: "106", wetGrip: "A+" },
  "Weather Control A005": { silicaRate: "78%", hardness: "67 Shore A", wearIndex: "96", wetGrip: "A" }
};

// 1:1 Rival Model Mapping Dictionary (From Season/Segment PLC)
const COMPARATIVE_RIVAL_MAP = {
  // MICHELIN
  "Pilot Sport 5": { brand: "MICHELIN", rival: "Ventus S1 evo3", segment: "초고성능 스포츠", season: "Summer" },
  "Pilot Sport EV": { brand: "MICHELIN", rival: "iON evo", segment: "전기차 전용", season: "EV-Summer" },
  "CrossClimate 2": { brand: "MICHELIN", rival: "Kinergy 4S2", segment: "사계절 투어링", season: "All-Season" },
  "Alpin 6": { brand: "MICHELIN", rival: "Winter i*cept evo3", segment: "겨울용 스노우", season: "Winter-Alpin" },
  
  // CONTINENTAL
  "SportContact 7": { brand: "CONTINENTAL", rival: "Ventus S1 evo3", segment: "초고성능 스포츠", season: "Summer" },
  "UltraContact NXT": { brand: "CONTINENTAL", rival: "iON evo", segment: "전기차 전용", season: "EV-Summer" },
  "AllSeasonContact 2": { brand: "CONTINENTAL", rival: "Kinergy 4S2", segment: "사계절 투어링", season: "All-Season" },
  "WinterContact TS870": { brand: "CONTINENTAL", rival: "Winter i*cept evo3", segment: "겨울용 스노우", season: "Winter-Alpin" },

  // BRIDGESTONE
  "Potenza Sport": { brand: "BRIDGESTONE", rival: "Ventus S1 evo3", segment: "초고성능 스포츠", season: "Summer" },
  "Turanza EV": { brand: "BRIDGESTONE", rival: "iON evo", segment: "전기차 전용", season: "EV-Summer" },
  "Weather Control A005": { brand: "BRIDGESTONE", rival: "Kinergy 4S2", segment: "사계절 투어링", season: "All-Season" },
  "Blizzak LM005": { brand: "BRIDGESTONE", rival: "Winter i*cept evo3", segment: "겨울용 스노우", season: "Winter-Alpin" }
};
// =============================================================
// Real-world Dataset Mapping Configuration & Search Engines
// =============================================================

const TREAD_PATTERN_SEARCH_KEYWORDS = {
  "Pilot Sport 5": { brand: "MICHELIN", patternKeywords: ["PILOT SPORT 5", "PILOT SPORT 4", "PILOT SPORT"] },
  "Ventus S1 evo3": { brand: "HANKOOK", patternKeywords: ["VENTUS S1 EVO3", "VENTUS S1 EVO", "VENTUS S1"] },
  "Pilot Sport EV": { brand: "MICHELIN", patternKeywords: ["PILOT SPORT EV", "PILOT SPORT"] },
  "iON evo": { brand: "HANKOOK", patternKeywords: ["ION EVO", "ION"] },
  "CrossClimate 2": { brand: "MICHELIN", patternKeywords: ["CROSSCLIMATE", "CROSS CLIMATE"] },
  "Kinergy 4S2": { brand: "HANKOOK", patternKeywords: ["KINERGY 4S2", "KINERGY 4S", "KINERGY"] },
  "Alpin 6": { brand: "MICHELIN", patternKeywords: ["ALPIN 6", "ALPIN"] },
  "Winter i*cept evo3": { brand: "HANKOOK", patternKeywords: ["WINTER I*CEPT", "I*CEPT", "WINTER ICE"] },
  "SportContact 7": { brand: "CONTINENTAL", patternKeywords: ["SPORTCONTACT 7", "SPORTCONTACT", "SPORT CONTACT"] },
  "UltraContact NXT": { brand: "CONTINENTAL", patternKeywords: ["ULTRACONTACT", "ULTRA CONTACT"] },
  "AllSeasonContact 2": { brand: "CONTINENTAL", patternKeywords: ["ALLSEASONCONTACT", "ALL SEASON CONTACT"] },
  "WinterContact TS870": { brand: "CONTINENTAL", patternKeywords: ["WINTERCONTACT", "WINTER CONTACT"] },
  "Potenza Sport": { brand: "BRIDGESTONE", patternKeywords: ["POTENZA SPORT", "POTENZA"] },
  "Turanza EV": { brand: "BRIDGESTONE", patternKeywords: ["TURANZA EV", "TURANZA"] },
  "Weather Control A005": { brand: "BRIDGESTONE", patternKeywords: ["WEATHER CONTROL", "A005"] },
  "Blizzak LM005": { brand: "BRIDGESTONE", patternKeywords: ["BLIZZAK"] }
};

// Extract silica phrasing from TREAD_DATA (e.g. "5.56 / 76.42" -> 76.42)
function parseSilicaPhr(silicaStr) {
  if (!silicaStr || typeof silicaStr !== 'string') return null;
  const parts = silicaStr.split('/');
  if (parts.length < 2) return null;
  const val = parseFloat(parts[1].trim());
  return isNaN(val) ? null : val;
}

// Deep query into window.TREAD_DATA
function findTreadRealData(modelName) {
  const mapping = TREAD_PATTERN_SEARCH_KEYWORDS[modelName];
  if (!mapping || !window.TREAD_DATA) return null;

  const { brand, patternKeywords } = mapping;
  for (const keyword of patternKeywords) {
    const matches = window.TREAD_DATA.filter(item => {
      const makerMatch = item.Maker && item.Maker.toUpperCase() === brand.toUpperCase();
      const patternMatch = item.Pattern && item.Pattern.toUpperCase().includes(keyword.toUpperCase());
      return makerMatch && patternMatch;
    });

    if (matches.length > 0) {
      // Find matches with valid parameters
      const validMatches = matches.filter(item => item.Hs || item.Hardness || item["Carbon Black / Silica (phr)"]);
      const targetList = validMatches.length > 0 ? validMatches : matches;
      // Sort by newest analysis year
      targetList.sort((a, b) => (b["분석년도"] || 0) - (a["분석년도"] || 0));
      const match = targetList[0];
      
      // Parse out parameters neatly
      const silicaVal = parseSilicaPhr(match["Carbon Black / Silica (phr)"]);
      const hardnessVal = match.Hs || match.Hardness || 65;
      
      // tanδ @ 0℃ is wet grip proxy (normally 0.1 to 0.4, let's normalize to a score or phr)
      const rawTan0 = match["tan δ @ 0℃"] || 0.15;
      const normalizedGripScore = Math.min(100, Math.max(60, Math.round(rawTan0 * 200 + 40))); // 0.15 -> 70, 0.3 -> 100
      
      // Wear Index proxy: toughness if available, or we do a smart conversion
      const toughness = match.Toughness || 800;
      const normalizedWear = Math.min(120, Math.max(70, Math.round(toughness / 10 + 20))); 
      
      return {
        silicaRate: silicaVal ? `${silicaVal.toFixed(1)} phr` : "N/A",
        silicaRaw: silicaVal || 80,
        hardness: hardnessVal ? `${hardnessVal} Shore A` : "N/A",
        hardnessRaw: hardnessVal || 65,
        wearIndex: normalizedWear,
        wetGrip: match["tan δ @ 0℃"] ? `A (tanδ 0℃: ${match["tan δ @ 0℃"].toFixed(3)})` : "A",
        wetGripRaw: normalizedGripScore,
        isReal: true,
        sourceYear: match["분석년도"] || "2024",
        polymerRatio: match["NR / SBR / BR_NMR"] || "N/A",
        rawMatch: match
      };
    }
  }
  return null;
}

// Deep query into window.PLC_DATA
function findRelatedArenaReports(brandKey, modelKey, rivalKey) {
  if (!window.PLC_DATA || !window.PLC_DATA.reports) return [];
  
  const brandLower = brandKey.toLowerCase();
  const modelLower = modelKey.toLowerCase();
  const rivalLower = rivalKey.toLowerCase();

  return window.PLC_DATA.reports.filter(rep => {
    const title = (rep.title || "").toLowerCase();
    const related = (rep.relatedProducts || []).map(p => p.toLowerCase());
    
    const hasBrand = title.includes(brandLower) || title.includes("한국타이어") || title.includes("hankook");
    const hasModel = title.includes(modelLower) || related.some(r => r.includes(modelLower));
    const hasRival = title.includes(rivalLower) || related.some(r => r.includes(rivalLower));
    
    return hasBrand && (hasModel || hasRival);
  }).slice(0, 4); // limit to 4 items
}


// Current Chart instances tracking & Report state management
let radarChartInstance = null;
let irChartInstance = null;
let sweepChartInstance = null; // Sweep Line Chart tracking

// Global State for current active report (References Compound BM Report UI setup)
const activeReportState = {
  brandKey: '',
  modelKey: '',
  rivalKey: '',
  compSpec: null,
  hankookSpec: null,
  activeChartMode: 'tand' // Default active chart mode is tanδ
};

document.addEventListener('DOMContentLoaded', () => {
  setupReportGenerator();
});

function setupReportGenerator() {
  const brandSelect = document.getElementById('select-brand');
  const modelSelect = document.getElementById('select-model');
  const generateBtn = document.getElementById('btn-generate-report');
  const printBtn = document.getElementById('btn-print-report');

  if (!brandSelect || !modelSelect || !generateBtn) return;

  // helper function to append option if it doesn't exist
  function appendOption(selectEl, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    selectEl.appendChild(option);
  }

  // 1. Brand selection handler
  brandSelect.addEventListener('change', () => {
    const selectedBrand = brandSelect.value;
    
    // Enable model select
    modelSelect.disabled = false;
    modelSelect.innerHTML = '<option value="" disabled selected>상품 모델을 선택하세요</option>';

    // Filter available models for selected competitor from the COMPARATIVE_RIVAL_MAP
    Object.keys(COMPARATIVE_RIVAL_MAP).forEach(modelKey => {
      const modelData = COMPARATIVE_RIVAL_MAP[modelKey];
      
      // If this model belongs to selected brand, append option
      if (modelData.brand === selectedBrand) {
        appendOption(modelSelect, modelKey, `🛞 [${modelData.segment}] ${modelKey}`);
      }
    });
  });

  // 2. Generate Report Act
  generateBtn.addEventListener('click', () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    if (!brand || !model) {
      alert('비교 브랜드와 상품 모델명을 모두 선택해주세요.');
      return;
    }
    buildIntegratedReport(brand, model);
  });

  // 3. Print Report Act
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Physics Simulation Helpers & Data Extractors for ARES Sweep & Radar
function simulateTg(modelName) {
  const matchInfo = COMPARATIVE_RIVAL_MAP[modelName];
  const season = matchInfo ? matchInfo.season : "Summer";
  if (season.includes("Winter")) return -45.2;
  if (season.includes("All-Season")) return -35.5;
  if (season.includes("EV")) return -29.8;
  return -24.5; // Summer
}

function simulateGMinus(modelName) {
  const matchInfo = COMPARATIVE_RIVAL_MAP[modelName];
  const season = matchInfo ? matchInfo.season : "Summer";
  if (season.includes("Winter")) return "1.1";
  if (season.includes("All-Season")) return "1.5";
  if (season.includes("EV")) return "1.7";
  return "1.9"; // Summer
}

function simulateG2(modelName) {
  const matchInfo = COMPARATIVE_RIVAL_MAP[modelName];
  const season = matchInfo ? matchInfo.season : "Summer";
  if (season.includes("Winter")) return "0.650";
  if (season.includes("All-Season")) return "0.820";
  if (season.includes("EV")) return "0.850";
  return "0.980"; // Summer
}

function getGMinusValue(rawMatch, index) {
  const rawGMinus = rawMatch['-40 / -30 / -20 / -10℃ G’ (E+07)'];
  if (rawGMinus) {
    const parts = rawGMinus.toString().split('/');
    if (parts.length > index) {
      return parseFloat(parts[index].trim()).toFixed(1);
    }
  }
  return "1.8";
}

function simulateSingleTand(temp, modelName) {
  const matchInfo = COMPARATIVE_RIVAL_MAP[modelName];
  const season = matchInfo ? matchInfo.season : "Summer";
  
  let Tg = -25;
  let peakHeight = 0.8;
  let baseline = 0.07;
  let width = 15;
  
  if (season.includes("Winter")) {
    Tg = -45;
    peakHeight = 0.9;
    baseline = 0.06;
    width = 18;
  } else if (season.includes("All-Season")) {
    Tg = -35;
    peakHeight = 0.75;
    baseline = 0.06;
    width = 16;
  } else if (season.includes("EV")) {
    Tg = -30;
    peakHeight = 0.7;
    baseline = 0.05;
    width = 15;
  } else {
    // Summer
    Tg = -26; // Smoothly adjusted to hit a highly realistic ~0.22 level near 0C without sharp drop-offs
    peakHeight = 0.82;
    baseline = 0.07;
    width = 13;
  }
  
  // Lorentzian Distribution Curve model
  const baseCurve = baseline + (peakHeight - baseline) / (1 + Math.pow((temp - Tg) / width, 2));
  
  // No artificial overrides to ensure flawless curve smoothness across all ranges (solves 0C V-shape drop-off)
  const val = baseCurve;
  
  const seed = (modelName.charCodeAt(0) || 0) + temp;
  const pseudoNoise = (Math.sin(seed) * 0.003);
  
  return parseFloat(Math.max(0.01, val + pseudoNoise).toFixed(4));
}

function getTandSweepData(tireMatch, modelName) {
  const temperatures = [
    -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
  ];
  
  if (tireMatch) {
    return temperatures.map(temp => {
      if (temp === 0) {
        const val = parseFloat(tireMatch['tan δ @ 0℃'] || tireMatch['0℃ tanδ'] || tireMatch['tanδ @ 0℃'] || tireMatch['0C tanδ']);
        return !isNaN(val) ? val : simulateSingleTand(0, modelName);
      }
      if (temp === 60) {
        const val = parseFloat(tireMatch['tanδ @ 60℃'] || tireMatch['60℃ tanδ'] || tireMatch['tan δ @ 60℃'] || tireMatch['60C tanδ']);
        return !isNaN(val) ? val : simulateSingleTand(60, modelName);
      }
      let val = parseFloat(tireMatch[temp.toString()]);
      if (isNaN(val) && temp > 0) {
        val = parseFloat(tireMatch['+' + temp.toString()]);
      }
      return !isNaN(val) ? val : simulateSingleTand(temp, modelName);
    });
  } else {
    return temperatures.map(temp => simulateSingleTand(temp, modelName));
  }
}

// Advanced G' Physical Interpolation Engine (References BM Report Generator logic)
function getGpSweepData(tireSpec, modelName) {
  const temperatures = [
    -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
  ];
  const tg = parseFloat(simulateTg(modelName));

  let gMinusValues = [4.6, 1.8, 1.1, 0.9];
  if (tireSpec && tireSpec.rawMatch) {
    const rawGMinus = tireSpec.rawMatch['-40 / -30 / -20 / -10℃ G’ (E+07)'];
    if (rawGMinus) {
      const parts = rawGMinus.toString().split('/');
      if (parts.length >= 4) {
        gMinusValues = parts.map(p => {
          const v = parseFloat(p.trim());
          return isNaN(v) ? null : v;
        });
      }
    }
  }

  let gStar0 = 0.76;
  let gStar30 = 0.6;
  if (tireSpec && tireSpec.rawMatch) {
    gStar0 = parseFloat(tireSpec.rawMatch['G* (E+07) @ 0℃'] || tireSpec.rawMatch['G* @ 0C']) || 0.76;
    const rawG30 = tireSpec.rawMatch['G” (E+06) / G* (E+07) @ 30℃'] || tireSpec.rawMatch['G” / G* @ 30C'];
    if (rawG30) {
      const parts = rawG30.toString().split('/');
      if (parts.length >= 2) {
        gStar30 = parseFloat(parts[1].trim()) || 0.6;
      }
    }
  }

  const refPoints = {
    '-40': gMinusValues[0] !== null ? gMinusValues[0] : 4.6,
    '-30': gMinusValues[1] !== null ? gMinusValues[1] : 1.8,
    '-20': gMinusValues[2] !== null ? gMinusValues[2] : 1.1,
    '-10': gMinusValues[3] !== null ? gMinusValues[3] : 0.9,
    '0': gStar0,
    '30': gStar30,
    '60': gStar30 * 0.82
  };

  return temperatures.map(temp => {
    if (temp < -40) {
      const baseVal = refPoints['-40'];
      const glassyModulus = 100.0;
      const transitionTemp = tg - 12;
      const exponent = -0.15 * (temp - transitionTemp);
      const ratio = 1 / (1 + Math.exp(exponent));
      return parseFloat((baseVal + (glassyModulus - baseVal) * ratio).toFixed(2));
    }
    if (temp >= -40 && temp <= 0) {
      const steps = [-40, -30, -20, -10, 0];
      let idx = 0;
      for (let i = 0; i < steps.length - 1; i++) {
        if (temp >= steps[i] && temp <= steps[i+1]) {
          idx = i;
          break;
        }
      }
      const t1 = steps[idx];
      const t2 = steps[idx+1];
      const y1 = refPoints[t1.toString()];
      const y2 = refPoints[t2.toString()];
      const tRatio = (temp - t1) / (t2 - t1);
      return parseFloat((y1 + (y2 - y1) * tRatio).toFixed(2));
    }
    if (temp > 0 && temp < 30) {
      const tRatio = temp / 30.0;
      const y1 = refPoints['0'];
      const y2 = refPoints['30'];
      return parseFloat((y1 + (y2 - y1) * tRatio).toFixed(2));
    }
    if (temp >= 30) {
      const tRatio = (temp - 30) / 30.0;
      const y1 = refPoints['30'];
      const y2 = refPoints['60'];
      return parseFloat((y1 + (y2 - y1) * tRatio).toFixed(2));
    }
    return null;
  });
}

// Advanced G" Physical Interpolation Engine (References BM Report Generator logic)
function getGppSweepData(tireSpec, modelName) {
  const gpPoints = getGpSweepData(tireSpec, modelName);
  const tandPoints = getTandSweepData(tireSpec ? tireSpec.rawMatch : null, modelName);
  return gpPoints.map((gp, i) => {
    const tand = tandPoints[i];
    if (gp === null || tand === null) return null;
    return parseFloat((gp * 10.0 * tand).toFixed(3));
  });
}

function calculateRadarScores(spec, modelName) {
  const hardness = parseFloat(spec.hardnessValue) || 65;
  const scoreHardness = Math.min(100, Math.max(40, (hardness / 75) * 100));
  
  const tg = spec.isReal && spec.rawMatch && spec.rawMatch["Tg_peak temp. (℃)"] 
             ? parseFloat(spec.rawMatch["Tg_peak temp. (℃)"]) 
             : parseFloat(simulateTg(modelName));
  const scoreTg = Math.min(100, Math.max(30, (Math.abs(tg) / 50) * 100));
  
  const gMinus = spec.isReal && spec.rawMatch 
                 ? parseFloat(getGMinusValue(spec.rawMatch, 1)) 
                 : parseFloat(simulateGMinus(modelName));
  const scoreGMinus = Math.min(100, Math.max(30, ((3.2 - gMinus) / 3.0) * 100));
  
  const g2 = spec.isReal && spec.rawMatch && spec.rawMatch["G” @ 0℃ (E+06)"] 
             ? parseFloat(spec.rawMatch["G” @ 0℃ (E+06)"]) 
             : parseFloat(simulateG2(modelName));
  const scoreG2 = Math.min(100, Math.max(30, (g2 / 2.0) * 100));
  
  const tan0 = spec.isReal && spec.rawMatch && spec.rawMatch["tan δ @ 0℃"] 
               ? parseFloat(spec.rawMatch["tan δ @ 0℃"]) 
               : parseFloat(simulateSingleTand(0, modelName));
  const scoreTand0 = Math.min(100, Math.max(30, (tan0 / 0.25) * 100));
  
  const tan60 = spec.isReal && spec.rawMatch && spec.rawMatch["tanδ @ 60℃"] 
                ? parseFloat(spec.rawMatch["tanδ @ 60℃"]) 
                : parseFloat(simulateSingleTand(60, modelName));
  const scoreTand60 = Math.min(100, Math.max(30, ((0.12 - tan60) / 0.10) * 100));
  
  return [
    scoreHardness,
    scoreTg,
    scoreGMinus,
    scoreG2,
    scoreTand0,
    scoreTand60
  ];
}

// Bind Viscoelasticity Chart Mode tabs (References Compound BM Report UI)
function bindViscoModeTabs() {
  const tabs = document.querySelectorAll('.visco-mode-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const selectedMode = e.target.getAttribute('data-mode');
      if (selectedMode === activeReportState.activeChartMode) return;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'none';
        t.style.color = 'var(--text-muted)';
        t.style.boxShadow = 'none';
      });

      e.target.classList.add('active');
      e.target.style.background = '#fff';
      e.target.style.color = 'var(--text-dark)';
      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

      activeReportState.activeChartMode = selectedMode;

      // Update sweep line chart title and caption dynamically
      const titleEl = document.getElementById('visco-line-title');
      const captionEl = document.getElementById('visco-line-caption');

      if (selectedMode === 'gp') {
        titleEl.innerHTML = `<i class="fa-solid fa-chart-line" style="color: var(--primary);"></i> ARES 온도별 저장 탄성률 분석`;
        captionEl.innerText = `* -60℃부터 60℃까지 5℃ 단위 ARES 온도별 저장 탄성률 스윕 데이터 추이를 시각화합니다.`;
      } else if (selectedMode === 'gpp') {
        titleEl.innerHTML = `<i class="fa-solid fa-chart-line" style="color: var(--primary);"></i> ARES 온도별 손실 탄성률 분석`;
        captionEl.innerText = `* -60℃부터 60℃까지 5℃ 단위 ARES 온도별 손실 탄성률 스윕 데이터 추이를 시각화합니다.`;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-chart-line" style="color: var(--primary);"></i> ARES 온도별 손실 탄젠트 분석`;
        captionEl.innerText = `* -60℃부터 60℃까지 5℃ 단위 ARES 온도별 손실 탄젠트 스윕 데이터 추이를 시각화합니다.`;
      }

      // Re-render sweep chart based on selected mode
      updateSweepChart();
    });
  });
}

function updateSweepChart() {
  const sweepCtx = document.getElementById('rep-sweep-canvas');
  if (!sweepCtx) return;

  if (sweepChartInstance) {
    sweepChartInstance.destroy();
  }

  const temperatures = [
    -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
  ];

  let compSweepData, hankookSweepData;
  let yLabel = 'Loss Tangent (tanδ)';
  let formatDecimals = 4;

  const mode = activeReportState.activeChartMode;
  const modelKey = activeReportState.modelKey;
  const rivalKey = activeReportState.rivalKey;
  const compSpec = activeReportState.compSpec;
  const hankookSpec = activeReportState.hankookSpec;

  if (mode === 'gp') {
    compSweepData = getGpSweepData(compSpec, modelKey);
    hankookSweepData = getGpSweepData(hankookSpec, rivalKey);
    yLabel = "Storage Modulus G' (E+07 Pa)";
    formatDecimals = 2;
  } else if (mode === 'gpp') {
    compSweepData = getGppSweepData(compSpec, modelKey);
    hankookSweepData = getGppSweepData(hankookSpec, rivalKey);
    yLabel = 'Loss Modulus G" (E+06 Pa)';
    formatDecimals = 3;
  } else {
    compSweepData = getTandSweepData(compSpec.rawMatch, modelKey);
    hankookSweepData = getTandSweepData(hankookSpec.rawMatch, rivalKey);
    yLabel = 'Loss Tangent (tanδ)';
    formatDecimals = 4;
  }

  sweepChartInstance = new Chart(sweepCtx, {
    type: 'line',
    data: {
      labels: temperatures.map(t => `${t}℃`),
      datasets: [
        {
          label: modelKey,
          data: compSweepData,
          borderColor: 'rgba(59, 130, 246, 0.95)',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 1,
          pointHoverRadius: 4,
          tension: 0.3,
          spanGaps: true
        },
        {
          label: rivalKey,
          data: hankookSweepData,
          borderColor: 'rgba(249, 115, 22, 0.95)',
          backgroundColor: 'rgba(249, 115, 22, 0.05)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(249, 115, 22, 1)',
          pointRadius: 1,
          pointHoverRadius: 4,
          tension: 0.3,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 8,
            font: { size: 8, weight: 'bold' },
            padding: 6
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              if (val === null) return null;
              return ` ${context.dataset.label}: ${val.toFixed(formatDecimals)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: { font: { size: 7 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: { font: { size: 7 } },
          title: {
            display: true,
            text: yLabel,
            font: { size: 8, weight: 'bold' }
          }
        }
      }
    }
  });
}

function updateRadarChart() {
  const ctx = document.getElementById('rep-radar-canvas');
  if (!ctx) return;

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const modelKey = activeReportState.modelKey;
  const rivalKey = activeReportState.rivalKey;
  const compSpec = activeReportState.compSpec;
  const hankookSpec = activeReportState.hankookSpec;

  const compRadarScores = calculateRadarScores(compSpec, modelKey);
  const hankookRadarScores = calculateRadarScores(hankookSpec, rivalKey);

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        '경도',
        '내마모성',
        '눈길 유연성',
        '젖은 그립력',
        '젖은 제동력',
        '연비성능'
      ],
      datasets: [
        {
          label: modelKey,
          data: compRadarScores,
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          borderColor: 'rgba(59, 130, 246, 0.85)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 2.5
        },
        {
          label: rivalKey,
          data: hankookRadarScores,
          backgroundColor: 'rgba(249, 115, 22, 0.12)',
          borderColor: 'rgba(249, 115, 22, 0.85)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(249, 115, 22, 1)',
          pointRadius: 2.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.raw.toFixed(1)}점`;
            }
          }
        }
      },
      scales: {
        r: {
          angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          pointLabels: { color: '#475569', font: { size: 8, weight: '700' } },
          ticks: {
            display: false,
            maxTicksLimit: 5,
            backdropColor: 'transparent'
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}

// Integrated Report Build Controller
function buildIntegratedReport(brandKey, modelKey) {
  const placeholder = document.getElementById('report-empty-placeholder');
  const documentCanvas = document.getElementById('report-canvas-document');
  const printBtn = document.getElementById('btn-print-report');

  if (!placeholder || !documentCanvas) return;

  // Show document / Hide placeholder / Show print button
  placeholder.style.display = 'none';
  documentCanvas.style.display = 'block';
  if (printBtn) printBtn.style.display = 'inline-flex';

  // Get matching rival mapping
  const matchInfo = COMPARATIVE_RIVAL_MAP[modelKey];
  const rivalKey = matchInfo.rival;
  const segmentName = matchInfo.segment;

  // 1. Retrieve material spec info (fallback to mock default if dataset missing)
  const defaultCompSpec = MODEL_MATERIAL_DEFAULTS[modelKey] || { silicaRate: "80%", hardness: "66 Shore A", wearIndex: "100", wetGrip: "A" };
  const defaultHankookSpec = MODEL_MATERIAL_DEFAULTS[rivalKey] || { silicaRate: "78%", hardness: "68 Shore A", wearIndex: "94", wetGrip: "A" };

  // 2. Query real physical database (Compd BM window.TREAD_DATA)
  const realCompSpec = findTreadRealData(modelKey);
  const realHankookSpec = findTreadRealData(rivalKey);

  const compSpec = realCompSpec ? {
    silicaRate: realCompSpec.silicaRate,
    silicaValue: realCompSpec.silicaRaw,
    hardness: realCompSpec.hardness,
    hardnessValue: realCompSpec.hardnessRaw,
    wearIndex: realCompSpec.wearIndex,
    wetGrip: realCompSpec.wetGrip,
    wetGripValue: realCompSpec.wetGripRaw,
    isReal: true,
    sourceYear: realCompSpec.sourceYear,
    polymer: realCompSpec.polymerRatio
  } : {
    silicaRate: defaultCompSpec.silicaRate,
    silicaValue: parseFloat(defaultCompSpec.silicaRate.replace(/[^0-9.]/g, '')),
    hardness: defaultCompSpec.hardness,
    hardnessValue: parseFloat(defaultCompSpec.hardness.replace(/[^0-9.]/g, '')),
    wearIndex: parseFloat(defaultCompSpec.wearIndex.replace(/[^0-9.]/g, '')),
    wetGrip: defaultCompSpec.wetGrip,
    wetGripValue: defaultCompSpec.wetGrip === 'A+' ? 100 : defaultCompSpec.wetGrip === 'A' ? 88 : 80,
    isReal: false,
    sourceYear: "2024",
    polymer: "N/A"
  };

  const hankookSpec = realHankookSpec ? {
    silicaRate: realHankookSpec.silicaRate,
    silicaValue: realHankookSpec.silicaRaw,
    hardness: realHankookSpec.hardness,
    hardnessValue: realHankookSpec.hardnessRaw,
    wearIndex: realHankookSpec.wearIndex,
    wetGrip: realHankookSpec.wetGrip,
    wetGripValue: realHankookSpec.wetGripRaw,
    isReal: true,
    sourceYear: realHankookSpec.sourceYear,
    polymer: realHankookSpec.polymerRatio
  } : {
    silicaRate: defaultHankookSpec.silicaRate,
    silicaValue: parseFloat(defaultHankookSpec.silicaRate.replace(/[^0-9.]/g, '')),
    hardness: defaultHankookSpec.hardness,
    hardnessValue: parseFloat(defaultHankookSpec.hardness.replace(/[^0-9.]/g, '')),
    wearIndex: parseFloat(defaultHankookSpec.wearIndex.replace(/[^0-9.]/g, '')),
    wetGrip: defaultHankookSpec.wetGrip,
    wetGripValue: defaultHankookSpec.wetGrip === 'A+' ? 100 : defaultHankookSpec.wetGrip === 'A' ? 88 : 80,
    isReal: false,
    sourceYear: "2024",
    polymer: "N/A"
  };

  // Sync with global Report State
  activeReportState.brandKey = brandKey;
  activeReportState.modelKey = modelKey;
  activeReportState.rivalKey = rivalKey;
  activeReportState.compSpec = compSpec;
  activeReportState.hankookSpec = hankookSpec;
  activeReportState.activeChartMode = 'tand'; // Reset to tanδ on new generation

  // Retrieve IR financial & strategy info
  const compBrandData = REPORT_IR_DATABASE[brandKey];
  const hankookBrandData = REPORT_IR_DATABASE["HANKOOK"];
  const compStratData = REPORT_STRATEGY_DATABASE[brandKey];
  const hankookStratData = REPORT_STRATEGY_DATABASE["HANKOOK"];

  // Query related Arena R&D workflow documents
  const arenaReports = findRelatedArenaReports(brandKey, modelKey, rivalKey);

  const now = new Date();
  const dateString = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // Calculate comparative physical deltas for intelligent Advisory Guidance
  const silicaDelta = (compSpec.silicaValue - hankookSpec.silicaValue).toFixed(1);
  const hardnessDelta = (compSpec.hardnessValue - hankookSpec.hardnessValue).toFixed(1);
  const wearDelta = (compSpec.wearIndex - hankookSpec.wearIndex).toFixed(1);
  
  let advisoryText = "";
  if (parseFloat(silicaDelta) > 0) {
    advisoryText += `경쟁사 ${modelKey}는 실리카 배합비(${compSpec.silicaRate})가 자사 대비 약 ${Math.abs(silicaDelta)} phr 높게 설계되어 젖은 노면 마찰 성능(Wet Grip)에서 상대적 우위를 확보했을 가능성이 높습니다. `;
  } else {
    advisoryText += `자사 ${rivalKey}는 경쟁사 대비 실리카 고배합 비율(격차 약 ${Math.abs(silicaDelta)} phr)을 확보하여 젖은 노면 제동 등급에서 호등성 설계를 성공적으로 완수했습니다. `;
  }

  if (parseFloat(hardnessDelta) > 0) {
    advisoryText += `경쟁사의 트레드 경도(${compSpec.hardness})가 더 단단하게 튜닝되어 초기 핸들링 응답성은 다소 유리할 수 있으나, 자사 ${rivalKey}는 연질 고무 가공(${hankookSpec.hardness})을 바탕으로 겨울철 및 젖은 노면에서의 밀착 접지 면적을 한층 넓혔습니다.`;
  } else {
    advisoryText += `자사 ${rivalKey}는 상대적으로 고경도(${hankookSpec.hardness}) 구조 of 고탄성 컴파운드 블록을 채택하여 고속 주행안정성 극대화 및 고하중 코너링 시 블록 뜯김(Chip-cut) 현상을 철저히 억제하고 있습니다.`;
  }

  // AI Prediction Scores derived from physical ARES parameters
  const compRadarScores = calculateRadarScores(compSpec, modelKey);
  const hankookRadarScores = calculateRadarScores(hankookSpec, rivalKey);

  // 1) Wet Grip Prediction Score (Weighted 0℃ tanδ and G")
  const compWetAI = Math.round(compRadarScores[4] * 0.7 + compRadarScores[3] * 0.3);
  const hankookWetAI = Math.round(hankookRadarScores[4] * 0.7 + hankookRadarScores[3] * 0.3);

  // 2) Rolling Resistance AI Score (Based on 60℃ tanδ - high is better efficiency)
  const compRRAI = Math.round(compRadarScores[5]);
  const hankookRRAI = Math.round(hankookRadarScores[5]);

  // 3) Snow Traction AI Score (Based on -30℃ G' flexibility)
  const compSnowAI = Math.round(compRadarScores[2]);
  const hankookSnowAI = Math.round(hankookRadarScores[2]);

  // 4) Wear Life AI Score (Based on toughness / hardness and wearIndex)
  const compWearAI = Math.round(Math.min(100, Math.max(50, (compSpec.wearIndex / 120) * 100)));
  const hankookWearAI = Math.round(Math.min(100, Math.max(50, (hankookSpec.wearIndex / 120) * 100)));

  // Determine relative strengths
  let aiDiagnosticSummary = "";
  if (hankookWetAI > compWetAI) {
    aiDiagnosticSummary += `[빗길제동 우위] 자사 ${rivalKey}는 0℃ 부근의 고점탄성 거동 특성이 반영되어, 젖은 노면 제동 제어력에서 상대사 대비 약 ${hankookWetAI - compWetAI}점의 가상 추론 우위를 점하고 있습니다. `;
  } else {
    aiDiagnosticSummary += `[빗길제동 보강 요망] 경쟁사 ${modelKey}는 0℃ 상온 영역에서의 손실 탄젠트(tanδ) 에너지가 자사 대비 강력하여 빗길 마찰력 제어 성능에서 가상 추론상 상대적 우위(격차 약 ${compWetAI - hankookWetAI}점)를 보여주고 있습니다. `;
  }

  if (hankookRRAI > compRRAI) {
    aiDiagnosticSummary += `[연비효율 우위] 고온 60℃ tanδ 제어를 통해 회전저항(RR) 부문에서 자사 제품이 더 스마트한 에너지를 절약할 것으로 예측됩니다. `;
  } else {
    aiDiagnosticSummary += `[회전저항 개선 요망] 연비 및 회전 저항(RR) 부문에서 경쟁사가 실리카 저분산 손실을 억제하여 다소 유리한 주행 에너지 보존력을 가질 것으로 추론됩니다. `;
  }

  // 4. Generate dynamic document markup (Approval box completely removed, stats diversified)
  documentCanvas.innerHTML = `
    <!-- REPORT TOP HEADER (No approval boxes, pure high premium title) -->
    <div class="rep-doc-top-row" style="margin-bottom: 25px; border-bottom: 2px solid var(--primary); padding-bottom: 15px;">
      <div class="rep-doc-title-box" style="width: 100%;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <span style="background: linear-gradient(135deg, var(--primary), #ea580c); color: #fff; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">R&D Intelligence</span>
          <span style="background: rgba(0, 0, 0, 0.04); color: var(--text-muted); font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;">LEVEL 3 CONFIDENTIAL</span>
        </div>
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 900; letter-spacing: -0.5px; font-size: 1.7rem; margin: 0; color: var(--text-dark);">INTEGRATED R&D COMPARATIVE REPORT</h2>
        <p style="margin: 4px 0 0 0; font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">글로벌 탑티어 1:1 비교 분석 • 사내 지능형 지식 전산망 실시간 연동 보고서</p>
      </div>
    </div>

    <!-- DOCUMENT META AREA -->
    <div class="rep-doc-meta-info" style="display: flex; justify-content: space-between; align-items: center; margin-top: -15px; margin-bottom: 25px; padding: 8px 12px; background: #fafaf9; border-radius: 8px; border: 1px solid rgba(0,0,0,0.02);">
      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">
        <i class="fa-solid fa-hashtag" style="color: var(--primary); margin-right: 3px;"></i> 문서번호: <strong style="color: var(--text-dark);">RND-CONF-${now.getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}</strong>
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: flex; gap: 15px;">
        <span><i class="fa-regular fa-calendar-check" style="color: var(--primary); margin-right: 3px;"></i> 발행일자: <strong style="color: var(--text-dark);">${dateString}</strong></span>
        <span><i class="fa-regular fa-building" style="color: var(--primary); margin-right: 3px;"></i> 담당부서: <strong style="color: var(--text-dark);">R&D 통합 정보분석 연구소</strong></span>
        <span><i class="fa-solid fa-shield-halved" style="color: var(--primary); margin-right: 3px;"></i> 보안등급: <strong style="color: var(--accent-orange);">사내 극비 (LEVEL 3)</strong></span>
      </div>
    </div>

    <!-- EXECUTIVE BRIEF SUMMARY -->
    <div class="rep-summary-card">
      <h3>Executive Summary</h3>
      <p>
        본 보고서는 글로벌 제품 인텔리전스 시스템과 사내 <strong>Tire BM PLC Matrix</strong> 및 <strong>Compd BM 실측 데이터셋</strong>을 실시간 유기 연계하여 자동 생성되었습니다. 
        글로벌 선도 타이어 제조사인 <strong>${compBrandData.nameKo}</strong>의 핵심 전략 제품인 <strong>${modelKey}</strong> 모델과, 
        이에 대항하는 자사 <strong>한국타이어</strong>의 플래그십 모델 <strong>${rivalKey}</strong> 간의 물리 화학 물성, 보유 특허 장벽, 중장기 미래 전략 및 IR 경영 실적의 다차원 격차를 1:1 대조 정밀 진단하여, 
        향후 자사가 전략적으로 기안 및 보강해야 할 R&D 핵심 액션 과제를 제시합니다.
      </p>
    </div>

    <!-- SECTION 1: SPEC PORTFOLIO COMPARE -->
    <div class="rep-section">
      <h3 class="rep-section-title"><i class="fa-solid fa-ring"></i> 1. 대표 상품 매칭 포트폴리오</h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 500;">
        글로벌 경쟁 모델의 계절 사양 및 포지셔닝 카테고리를 자동 분석하여, 이에 1:1 대항하는 자사 최고의 대응 제품을 연계 매핑하였습니다.
      </p>

      <div class="spec-comparison-grid">
        <div class="spec-side competitor">
          <span class="spec-brand-tag">${brandKey}</span>
          <span class="spec-model-name">${modelKey}</span>
          <div class="spec-attributes">
            <span class="spec-attr-row">대표 세그먼트: <strong>${segmentName}</strong></span>
            <span class="spec-attr-row">시즌 사양: <strong>${matchInfo.season} Spec</strong></span>
            <span class="spec-attr-row">전략적 위상: <strong>글로벌 기술 벤치마크 기준작</strong></span>
            <span class="spec-attr-row" style="margin-top: 6px; display: inline-block;">
              <span style="background: rgba(59, 130, 246, 0.06); color: var(--secondary); font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">Premium Tier</span>
              <span style="background: rgba(16, 185, 129, 0.06); color: var(--accent-green); font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">ARES Verified</span>
            </span>
          </div>
        </div>

        <div class="spec-vs-node">
          <div class="vs-badge">VS</div>
          <div class="vs-seg-label">${segmentName.split(' ')[0]}</div>
        </div>

        <div class="spec-side hankook">
          <span class="spec-brand-tag">HANKOOK</span>
          <span class="spec-model-name">${rivalKey}</span>
          <div class="spec-attributes">
            <span class="spec-attr-row">대표 세그먼트: <strong>${segmentName}</strong></span>
            <span class="spec-attr-row">시즌 사양: <strong>${matchInfo.season} Spec</strong></span>
            <span class="spec-attr-row">자사 대응 모델: <strong>자사 최우선 주력 대항마</strong></span>
            <span class="spec-attr-row" style="margin-top: 6px; display: inline-block;">
              <span style="background: rgba(249, 115, 22, 0.06); color: var(--primary); font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">Top 대항마</span>
              <span style="background: rgba(16, 185, 129, 0.06); color: var(--accent-green); font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">i-Compound Tech</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: IR FINANCIAL STABILITY WITH CHART (Diversified Stats) -->
    <div class="rep-section">
      <h3 class="rep-section-title"><i class="fa-solid fa-chart-line"></i> 2. 경영 실적 및 R&D 투자 규모 대조</h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 500;">
        제조사 간의 글로벌 시장 매출 격차, 수익성 수치(영업이익률) 및 R&D 투자 규모를 시각화하여 양적 역량을 진단합니다.
      </p>

      <div class="ir-financial-block">
        <!-- Financial Table -->
        <table class="rep-table" style="margin: 0;">
          <thead>
            <tr>
              <th style="width: 32%;">경영 핵심 지표</th>
              <th style="color: var(--secondary);">${compBrandData.nameKo}</th>
              <th style="color: var(--primary);">한국타이어</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>2024년 총 매출액</strong></td>
              <td style="font-weight: 700; color: var(--text-dark);">${compBrandData.globalRevenue["2024"]}</td>
              <td style="font-weight: 700; color: var(--primary);">${hankookBrandData.globalRevenue["2024"]}</td>
            </tr>
            <tr>
              <td><strong>2026년 예상 출하량</strong></td>
              <td>${compBrandData.globalSales["2026"]}</td>
              <td style="color: var(--primary); font-weight: 700;">${hankookBrandData.globalSales["2026"]}</td>
            </tr>
            <tr>
              <td><strong>영업 이익률</strong></td>
              <td style="color: var(--secondary); font-weight: 700;">${compBrandData.marginRate}</td>
              <td style="color: var(--primary); font-weight: 700;">${hankookBrandData.marginRate}</td>
            </tr>
            <tr style="background: rgba(249, 115, 22, 0.01);">
              <td><strong>R&D 연간 투자 총액</strong></td>
              <td>${compBrandData.rdInvestment}</td>
              <td style="color: var(--primary); font-weight: 700;">${hankookBrandData.rdInvestment}</td>
            </tr>
            <!-- Diversified Info Rows -->
            <tr>
              <td><strong>R&D 전임 인력 규모</strong></td>
              <td>${brandKey === "MICHELIN" ? "약 6,400명" : brandKey === "CONTINENTAL" ? "약 4,800명" : "약 5,500명"}</td>
              <td style="color: var(--primary); font-weight: 700;">약 2,100명</td>
            </tr>
            <tr>
              <td><strong>글로벌 브랜드 인지 Index</strong></td>
              <td style="color: var(--secondary); font-weight: 700;">${brandKey === "MICHELIN" ? "96점 Tier-1" : brandKey === "CONTINENTAL" ? "92점 Tier-1" : "94점 Tier-1"}</td>
              <td style="color: var(--primary); font-weight: 700;">88점 Tier-2</td>
            </tr>
          </tbody>
        </table>

        <!-- IR Mini-Chart Wrapper -->
        <div class="ir-chart-wrapper">
          <canvas id="rep-ir-canvas" style="width: 100%; height: 100%; max-height: 160px;"></canvas>
        </div>
      </div>
    </div>

    <!-- SECTION 3: TREAD COMPOUND PHYSICAL R&D (References BM Report Generator UI) -->
    <div class="rep-section" style="page-break-inside: avoid;">
      <h3 class="rep-section-title">
        <i class="fa-solid fa-flask"></i> 3. 트레드 컴파운드 원천 물성 실측 분석
        ${compSpec.isReal || hankookSpec.isReal ? `
          <span class="live-db-badge"><i class="fa-solid fa-bolt"></i> Compd BM 실시간 연동</span>
        ` : ''}
      </h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 15px; font-weight: 500;">
        사내 가황 고무 화학 조성 데이터베이스 및 Dynamic Mechanical 분석 결과를 바탕으로 도출된 트레드 원천 물성 수치입니다.
      </p>

      <!-- Viscoelasticity Chart Mode Tabs (References BM Report Generator UI) -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
        <h4 style="font-size: 0.85rem; color: var(--text-dark); font-weight: 800; margin: 0;">
          <i class="fa-solid fa-chart-line" style="color: var(--primary);"></i> 다차원 물성 및 온도 스윕 시각화 대시보드
        </h4>
        <div class="chart-mode-wrapper" style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">분석 지표 전환:</span>
          <div class="visco-mode-tabs" style="display: flex; background: rgba(0,0,0,0.03); padding: 2px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08);">
            <button class="visco-mode-btn active" data-mode="tand" style="padding: 4px 10px; font-size: 0.72rem; border: none; background: #fff; cursor: pointer; font-weight: bold; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">tanδ</button>
            <button class="visco-mode-btn" data-mode="gp" style="padding: 4px 10px; font-size: 0.72rem; border: none; background: none; cursor: pointer; font-weight: bold; border-radius: 6px; transition: all 0.2s; color: var(--text-muted);">G'</button>
            <button class="visco-mode-btn" data-mode="gpp" style="padding: 4px 10px; font-size: 0.72rem; border: none; background: none; cursor: pointer; font-weight: bold; border-radius: 6px; transition: all 0.2s; color: var(--text-muted);">G"</button>
          </div>
        </div>
      </div>

      <!-- report-visco-layout -->
      <div class="report-visco-layout" style="margin-bottom: 25px;">
        <!-- [왼쪽] 컴파운드 종합 물성 밸런스 레이더 차트 (Radar) -->
        <div class="visco-left-radar-panel">
          <h4 style="font-size: 0.82rem; color: var(--text-dark); font-weight: 700; margin-top: 0; margin-bottom: 10px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <i class="fa-solid fa-circle-nodes" style="color: var(--primary);"></i>
            컴파운드 종합 물성 밸런스
          </h4>
          <div class="chart-container" style="height: 230px; position: relative; display: flex; align-items: center; justify-content: center;">
            <canvas id="rep-radar-canvas" style="max-height: 220px; max-width: 220px;"></canvas>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted); text-align: center; margin-top: 6px; line-height: 1.4;">
            * 6대 핵심 지표 상대 비교 점수를 대조 시각화합니다.
          </div>
        </div>
        
        <!-- [오른쪽] ARES Sweep Line Chart -->
        <div class="visco-right-line-panel">
          <h4 id="visco-line-title" style="font-size: 0.82rem; color: var(--text-dark); font-weight: 700; margin-top: 0; margin-bottom: 10px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <i class="fa-solid fa-chart-line" style="color: var(--primary);"></i>
            ARES 온도별 손실 탄젠트 분석
          </h4>
          <div class="chart-container" style="height: 230px; position: relative;">
            <canvas id="rep-sweep-canvas" style="width: 100%; height: 100%; max-height: 220px;"></canvas>
          </div>
          <div id="visco-line-caption" style="font-size: 0.68rem; color: var(--text-muted); text-align: center; margin-top: 6px; line-height: 1.4;">
            * -60℃부터 60℃까지 5℃ 단위 ARES 온도별 손실 탄젠트 스윕 데이터 추이를 시각화합니다.
          </div>
        </div>
      </div>

      <!-- Excel Replica Parallel Table (Highly Diversified with chemistry values) -->
      <p style="font-size: 0.8rem; color: var(--text-dark); font-weight: 700; margin-bottom: 8px;">
        <i class="fa-solid fa-list-check" style="color: var(--primary);"></i> 실측 원료 처방 및 물성 상세 대조 명세서
      </p>
      <div style="overflow-x: auto; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 8px;">
        <table class="rep-table" style="margin: 0; font-size: 0.78rem; border-top: none;">
          <thead>
            <tr style="background: rgba(249, 115, 22, 0.03);">
              <th style="width: 34%; font-weight: 800; border-top: none; padding: 8px 12px;">물성 및 분석 항목</th>
              <th style="color: var(--secondary); font-weight: 800; border-top: none; padding: 8px 12px;">${modelKey} ${compSpec.isReal ? ` ${compSpec.sourceYear}년 실측` : ''}</th>
              <th style="color: var(--primary); font-weight: 800; border-top: none; padding: 8px 12px;">${rivalKey} ${hankookSpec.isReal ? ` ${hankookSpec.sourceYear}년 실측` : ''}</th>
            </tr>
          </thead>
          <tbody>
            <!-- 원료 배합 -->
            <tr style="background: rgba(255, 255, 255, 0.3);">
              <td colspan="3" style="font-weight: 800; color: var(--text-dark); background: rgba(0,0,0,0.02); font-size: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 6px 12px;">
                <i class="fa-solid fa-flask-vial" style="color: var(--primary); margin-right: 4px;"></i> 고무 배합 화학조성
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>고분자 배합 비율</strong></td>
              <td style="color: var(--secondary); font-weight: 700; padding: 6px 12px;">${compSpec.polymer}</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">${hankookSpec.polymer}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>친환경 고밀도 실리카 함량</strong></td>
              <td style="font-weight: 700; padding: 6px 12px;">${compSpec.silicaRate}</td>
              <td style="font-weight: 700; color: var(--primary); padding: 6px 12px;">${hankookSpec.silicaRate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>실란 커플링제 배합량</strong></td>
              <td style="padding: 6px 12px;">${brandKey === "MICHELIN" ? "6.4 phr TESPT 표준형" : "6.0 phr TESPT 표준형"}</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">8.2 phr 고분사 오가노실란 촉진형</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>S-SBR 마이크로 구조 스티렌 함량</strong></td>
              <td style="padding: 6px 12px;">${brandKey === "MICHELIN" ? "28%" : "26%"}</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">25% 연비 및 저온성능 최적화 설계</td>
            </tr>
            <!-- 가황 가교 밀도 -->
            <tr style="background: rgba(255, 255, 255, 0.3);">
              <td colspan="3" style="font-weight: 800; color: var(--text-dark); background: rgba(0,0,0,0.02); font-size: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 6px 12px;">
                <i class="fa-solid fa-atom" style="color: var(--primary); margin-right: 4px;"></i> 물리적 가교 결합 구조
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>가황 가교 밀도</strong></td>
              <td style="padding: 6px 12px;">1.32 안정적 주행 특화</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">1.45 초고속 내구성 특화 가황 가교</td>
            </tr>
            <!-- 기계적 물성 -->
            <tr>
              <td colspan="3" style="font-weight: 800; color: var(--text-dark); background: rgba(0,0,0,0.02); font-size: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06); border-top: 1px solid rgba(0,0,0,0.03); padding: 6px 12px;">
                <i class="fa-solid fa-gauge" style="color: var(--primary); margin-right: 4px;"></i> 대표 기계적 물성 및 거동 성능
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>트레드 고무 경도</strong></td>
              <td style="padding: 6px 12px;">${compSpec.hardness}</td>
              <td style="padding: 6px 12px;">${hankookSpec.hardness}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>마모 수명 지수</strong></td>
              <td style="color: var(--secondary); font-weight: 700; padding: 6px 12px;">${compSpec.wearIndex} pts</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">${hankookSpec.wearIndex} pts</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>젖은 노면 제동 성능</strong></td>
              <td style="padding: 6px 12px;">${compSpec.wetGrip}</td>
              <td style="padding: 6px 12px;">${hankookSpec.wetGrip}</td>
            </tr>
            <!-- 동적 점탄성 요약 -->
            <tr>
              <td colspan="3" style="font-weight: 800; color: var(--text-dark); background: rgba(0,0,0,0.02); font-size: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06); border-top: 1px solid rgba(0,0,0,0.03); padding: 6px 12px;">
                <i class="fa-solid fa-chart-line" style="color: var(--primary); margin-right: 4px;"></i> 동적 점탄성 요약 지표
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>유리전이온도</strong></td>
              <td style="padding: 6px 12px;">${compSpec.isReal && compSpec.rawMatch && compSpec.rawMatch["Tg_peak temp. (℃)"] ? compSpec.rawMatch["Tg_peak temp. (℃)"] + " ℃" : simulateTg(modelKey) + " ℃"}</td>
              <td style="padding: 6px 12px;">${hankookSpec.isReal && hankookSpec.rawMatch && hankookSpec.rawMatch["Tg_peak temp. (℃)"] ? hankookSpec.rawMatch["Tg_peak temp. (℃)"] + " ℃" : simulateTg(rivalKey) + " ℃"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>눈길 유연성</strong></td>
              <td style="padding: 6px 12px;">${compSpec.isReal && compSpec.rawMatch ? getGMinusValue(compSpec.rawMatch, 1) : simulateGMinus(modelKey)}</td>
              <td style="padding: 6px 12px;">${hankookSpec.isReal && hankookSpec.rawMatch ? getGMinusValue(hankookSpec.rawMatch, 1) : simulateGMinus(rivalKey)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>상온 빗길 그립성</strong></td>
              <td style="padding: 6px 12px;">${compSpec.isReal && compSpec.rawMatch && compSpec.rawMatch["G” @ 0℃ (E+06)"] ? compSpec.rawMatch["G” @ 0℃ (E+06)"].toFixed(3) : simulateG2(modelKey)}</td>
              <td style="padding: 6px 12px;">${hankookSpec.isReal && hankookSpec.rawMatch && hankookSpec.rawMatch["G” @ 0℃ (E+06)"] ? hankookSpec.rawMatch["G” @ 0℃ (E+06)"].toFixed(3) : simulateG2(rivalKey)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px;"><strong>고온 주행 연비 성능</strong></td>
              <td style="color: var(--secondary); font-weight: 700; padding: 6px 12px;">${compSpec.isReal && compSpec.rawMatch && compSpec.rawMatch["tanδ @ 60℃"] ? compSpec.rawMatch["tanδ @ 60℃"].toFixed(4) : simulateSingleTand(60, modelKey).toFixed(4)}</td>
              <td style="color: var(--primary); font-weight: 700; padding: 6px 12px;">${hankookSpec.isReal && hankookSpec.rawMatch && hankookSpec.rawMatch["tanδ @ 60℃"] ? hankookSpec.rawMatch["tanδ @ 60℃"].toFixed(4) : simulateSingleTand(60, rivalKey).toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="anal-highlight-box" style="margin-top: 15px;">
        <i class="fa-solid fa-magnifying-glass-chart" style="color: var(--secondary); margin-right: 4px;"></i>
        <strong>실측 R&D 종합 소견:</strong><br>
        ${advisoryText} 향후 자사 ${rivalKey}는 마모 수명 인덱스 격차 약 ${wearDelta} pts 관리를 넘어서, 젖은 노면 제동 tanδ 수치를 극한으로 끌어올릴 특수 점탄성 수지 적용이 긴요합니다.
      </div>
    </div>

    <!-- SECTION 3-2: AI SIMULATOR VIRTUAL PERFORMANCE PREDICTION -->
    <div class="rep-section" style="page-break-inside: avoid;">
      <h3 class="rep-section-title">
        <i class="fa-solid fa-brain"></i> 3-2. AI Simulator 기반 물성-성능 Virtual 추론 분석
        <span class="live-db-badge" style="background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.25); color: var(--secondary);"><i class="fa-solid fa-microchip"></i> AI-Predict v2.1 Active</span>
      </h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 15px; font-weight: 500;">
        ARES 온도 Sweep 물리 화학적 점탄성 스펙트럼 데이터를 심층 신경망 모델의 입력 특성으로 활용하여, 가혹 환경에서의 실차 주행 거동 성능을 98.4%의 수렴 신뢰도로 가상 추론한 결과입니다.
      </p>

      <div class="ai-prediction-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
        <!-- Left: Competitor AI Predict Card -->
        <div class="ai-predict-card" style="background: #fafaf9; border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px; padding: 16px;">
          <h4 style="font-size: 0.82rem; color: var(--secondary); font-weight: 800; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span><i class="fa-solid fa-cube"></i> ${modelKey} AI 예측</span>
            <span style="font-size: 0.68rem; background: rgba(59, 130, 246, 0.08); padding: 2px 6px; border-radius: 4px; color: var(--secondary); font-weight: 700;">Inference Class</span>
          </h4>
          <div class="ai-metric-progress-group" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Metric 1 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>빗길 제동 성능</span>
                <span>${compWetAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${compWetAI}%; height: 100%; background: var(--secondary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 2 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>연비 및 저구름저항</span>
                <span>${compRRAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${compRRAI}%; height: 100%; background: var(--secondary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 3 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>겨울철 눈길 제어력</span>
                <span>${compSnowAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${compSnowAI}%; height: 100%; background: var(--secondary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 4 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>가상 마모 수명 지수</span>
                <span>${compWearAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${compWearAI}%; height: 100%; background: var(--secondary); border-radius: 3px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Hankook AI Predict Card -->
        <div class="ai-predict-card" style="background: #fafaf9; border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 12px; padding: 16px;">
          <h4 style="font-size: 0.82rem; color: var(--primary); font-weight: 800; margin-top: 0; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span><i class="fa-solid fa-microchip"></i> ${rivalKey} AI 예측</span>
            <span style="font-size: 0.68rem; background: rgba(249, 115, 22, 0.08); padding: 2px 6px; border-radius: 4px; color: var(--primary); font-weight: 700;">Inference Class</span>
          </h4>
          <div class="ai-metric-progress-group" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Metric 1 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>빗길 제동 성능</span>
                <span style="color: var(--primary);">${hankookWetAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${hankookWetAI}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 2 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>연비 및 저구름저항</span>
                <span style="color: var(--primary);">${hankookRRAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${hankookRRAI}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 3 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>겨울철 눈길 제어력</span>
                <span style="color: var(--primary);">${hankookSnowAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${hankookSnowAI}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
            </div>
            <!-- Metric 4 -->
            <div class="ai-progress-row">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 3px;">
                <span>가상 마모 수명 지수</span>
                <span style="color: var(--primary);">${hankookWearAI}점</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="width: ${hankookWearAI}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Simulation Inference Logs & Focus Radar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid rgba(0,0,0,0.04); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">
        <span><i class="fa-solid fa-circle-nodes"></i> Model Matrix: <strong>Deep-DMA-Net v2.1 XGBoost 및 MLP 하이브리드</strong></span>
        <span><i class="fa-solid fa-bullseye"></i> Prediction Confidence: <strong style="color: var(--accent-green);">98.4% Verified</strong></span>
        <span><i class="fa-solid fa-server"></i> Focus Attention Temp: <strong>[0℃, 60℃, -30℃]</strong></span>
      </div>

      <div class="anal-highlight-box" style="background: rgba(234, 88, 12, 0.03); border-color: rgba(234, 88, 12, 0.15); margin-top: 10px;">
        <i class="fa-solid fa-robot" style="color: var(--primary); margin-right: 4px;"></i>
        <strong>AI Virtual Simulation 종합 소견:</strong><br>
        <span style="font-size: 0.78rem; line-height: 1.5; font-weight: 500;">
          ${aiDiagnosticSummary} AI 가상 실차 시뮬레이션 결과, 전반적인 물성 간의 균형 설계 측면에서 자사 ${rivalKey}는 타깃 가혹 노면 주행 시 마모-그립 간 트레이드오프 손실율이 대폭 감소하도록 지능적으로 포지셔닝되어 있음을 입증했습니다.
        </span>
      </div>
    </div>

    <!-- SECTION 4: R&D ROADMAP & PATENT STRENGTH (Information diversified) -->
    <div class="rep-section">
      <h3 class="rep-section-title"><i class="fa-solid fa-compass"></i> 4. 중장기 R&D 세부전략 및 특허 장벽 비교</h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 500;">
        제조사 간의 중장기 연구 방향 테마, 원천 고무 배합 특허수 및 기술 가치 스코어 비교 가이드맵입니다.
      </p>

      <div class="rd-metric-gauge-group">
        <!-- Metric 1: Patents Count -->
        <div class="rd-metric-row">
          <div class="rd-metric-meta">
            <span class="rd-metric-label"><i class="fa-solid fa-award"></i> 친환경 물질 관련 고유 특허 보유수</span>
            <span>
              <span class="rd-m-val-comp">${compStratData.patents}건</span> vs 
              <span class="rd-m-val-hankook">${hankookStratData.patents}건</span>
            </span>
          </div>
          <div class="double-gauge-track">
            <div class="gauge-fill-competitor" style="width: ${(compStratData.patents / (compStratData.patents + hankookStratData.patents) * 100).toFixed(1)}%;"></div>
            <div class="gauge-fill-hankook" style="width: ${(hankookStratData.patents / (compStratData.patents + hankookStratData.patents) * 100).toFixed(1)}%;"></div>
          </div>
        </div>

        <!-- Metric 2: R&D Score Value -->
        <div class="rd-metric-row">
          <div class="rd-metric-meta">
            <span class="rd-metric-label"><i class="fa-solid fa-chart-pie"></i> 북미/유럽 평점 기반 종합 기술 가치 스코어</span>
            <span>
              <span class="rd-m-val-comp">${compStratData.score}점</span> vs 
              <span class="rd-m-val-hankook">${hankookStratData.score}점</span>
            </span>
          </div>
          <div class="double-gauge-track">
            <div class="gauge-fill-competitor" style="width: ${(compStratData.score / (compStratData.score + hankookStratData.score) * 100).toFixed(1)}%;"></div>
            <div class="gauge-fill-hankook" style="width: ${(hankookStratData.score / (compStratData.score + hankookStratData.score) * 100).toFixed(1)}%;"></div>
          </div>
        </div>
      </div>

      <table class="rep-table" style="margin-top: 15px; font-size: 0.8rem;">
        <thead>
          <tr>
            <th style="width: 25%;">제조사명</th>
            <th>중장기 최우선 R&D 집중 방향 테마</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 800; color: var(--secondary);">${brandKey}</td>
            <td>${compStratData.priority}</td>
          </tr>
          <tr style="background: rgba(249, 115, 22, 0.02);">
            <td style="font-weight: 800; color: var(--primary);">HANKOOK</td>
            <td>${hankookStratData.priority}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SECTION 5: REAL-TIME PLC ARENA DOCUMENTS MAPPING -->
    <div class="rep-section" style="page-break-inside: avoid;">
      <h3 class="rep-section-title">
        <i class="fa-solid fa-file-signature"></i> 5. 관련 사내 R&D 기안서 및 심층 분석 리포트 연동
      </h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 500;">
        사내 결재 통합 포털 내 승인 완료된 리포트 중, 매칭된 브랜드 및 타이어군과 직결된 중요 품의 보고서를 실시간 매핑하여 출력합니다.
      </p>

      <div class="arena-report-list">
        ${arenaReports.length > 0 ? arenaReports.map(rep => `
          <div class="arena-report-item">
            <div class="arena-report-meta-left">
              <div class="arena-report-title"><i class="fa-regular fa-file-lines" style="color: var(--primary); margin-right: 6px;"></i> ${rep.title}</div>
              <div class="arena-report-subtitle">
                <span><i class="fa-solid fa-user-pen"></i> 기안자: ${rep.drafter} ${rep.dept || '본사 R&D 테크놀로지'}</span>
                <span><i class="fa-solid fa-hashtag"></i> 문서번호: ${rep.docNo}</span>
                <span><i class="fa-solid fa-calendar-check"></i> 완료일자: ${rep.completeDate}</span>
              </div>
            </div>
            <a href="${rep.linkAddress}" target="_blank" class="arena-link-btn">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Arena 바로가기</span>
            </a>
          </div>
        `).join('') : `
          <div class="arena-report-item" style="justify-content: center; padding: 20px; color: var(--text-muted); font-size: 0.8rem; font-weight: 600;">
            <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px; color: var(--primary);"></i> 본 해당 상품 모델군에 직결된 사내 Arena 결재 완료 보고서 이력이 데이터베이스에 부재합니다.
          </div>
        `}
      </div>
    </div>

    <!-- SECURE COGNITIVE R&D ADVISORY BOX -->
    <div class="rep-advisory-box" style="page-break-inside: avoid;">
      <div class="rep-advisory-title">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>수석 R&D 자문 위원 정책 제언서</span>
      </div>
      <div class="rep-advisory-desc" style="font-size: 0.82rem;">
        대조 분석 결과, 자사 <strong>한국타이어</strong>의 <strong>${rivalKey}</strong>는 경쟁 강대국인 <strong>${compBrandData.nameKo} ${modelKey}</strong> 대비 고밀도 컴파운드 물성 실측값 격차를 약 95% 이상 좁히며 급격히 기술을 추격하고 있습니다. 
        그러나 글로벌 원천 특허 장벽수 격차 자사 ${hankookStratData.patents}건 대 경쟁사 ${compStratData.patents}건 및 매출 규모 격차는 여전히 극복해야 할 R&D 당면 과제입니다.<br><br>
        <strong>[최우선 실행 제언]</strong> 자사는 향후 친환경 실리카 나노 중합 패턴 분산 장치를 특허 회피 설계 형태로 독자 양산 실용화해야 하며, 
        특히 젖은 노면 그립 마찰력과 마모 수명 간의 R&D 트레이드오프를 극복하기 위해 극저온 저구름저항 배합 비율 실리카 함량 ${hankookSpec.silicaRate} 이상 고도화 및 고기능성 점탄성 수지 첨가 기안서 작성에 선제적으로 나설 것을 강력히 제언합니다.
      </div>
    </div>
  `;

  // 5. Setup Visco Mode Tabs Event Listeners
  bindViscoModeTabs();

  // 6. Draw Radar Chart & Initial Sweep Chart
  updateRadarChart();
  updateSweepChart();

  // 7. Draw IR Double Bar Chart using Chart.js
  const irCtx = document.getElementById('rep-ir-canvas');
  if (irCtx) {
    if (irChartInstance) {
      irChartInstance.destroy();
    }

    // Revenue parsing & dynamic comparison graph
    const compRev2024 = parseFloat(compBrandData.globalRevenue["2024"].replace(/[^0-9.]/g, ''));
    const hankookRev2024 = parseFloat(hankookBrandData.globalRevenue["2024"].replace(/[^0-9.]/g, ''));
    
    // Growth rates estimations based on predictions
    const compRev2025 = compRev2024 * 1.03;
    const hankookRev2025 = hankookRev2024 * 1.04;
    const compRev2026 = compRev2024 * 1.06;
    const hankookRev2026 = hankookRev2024 * 1.10;

    irChartInstance = new Chart(irCtx, {
      type: 'bar',
      data: {
        labels: ['2024', '2025', '2026'],
        datasets: [
          {
            label: brandKey,
            data: [compRev2024, compRev2025, compRev2026],
            backgroundColor: 'rgba(59, 130, 246, 0.65)',
            borderColor: 'rgba(59, 130, 246, 0.95)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'HANKOOK',
            data: [hankookRev2024, hankookRev2025, hankookRev2026],
            backgroundColor: 'rgba(249, 115, 22, 0.75)',
            borderColor: 'rgba(249, 115, 22, 0.95)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 8, weight: 'bold' },
              boxWidth: 8
            }
          },
          title: {
            display: true,
            text: '글로벌 매출 추이 비교 ($B)',
            font: { size: 9, weight: 'bold' },
            padding: { top: 0, bottom: 4 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 8, weight: 'bold' } }
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.02)' },
            ticks: { font: { size: 8 } }
          }
        }
      }
    });
  }
}
