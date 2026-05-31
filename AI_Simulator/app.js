(function() {
    // Global App State for AI Simulator (Scoped inside IIFE)
    let baseRecipe = {};
    let currentRecipe = {};
    let baseCurve = [];
    let simulatedCurve = [];
    let baseTg = 0.0;
    let simulatedTg = 0.0;
    let materials = [];
    let chart = null;
    let radarChart = null;
    let oilContent = {};

    // Reference Compound Selection State
    let selectedReferenceId = null;
    let selectedReferenceData = null;
    let selectedMaker = null;
    let selectedPattern = null;

    // Computed Performance Scores State for AI Advisor
    let currentWearSim = 0;
    let currentWearRef = 0;
    let currentWetSim = 0;
    let currentWetRef = 0;
    let currentRRSim = 0;
    let currentRRRef = 0;

    // Select HTML Elements
    let slidersContainer = null;
    let btnReset = null;
    let tabButtons = null;

    // API Base URLs - Automatically route ports if running from local environment to fastapi port 8000, else to Render
    let API_BASE =
        window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")
            ? "http://localhost:8000"
            : "https://bmi2-api.onrender.com"; // Render 배포 후 이 URL을 실제 Render 배포 URL로 변경해 주세요 (예: https://bmi2-api.onrender.com)
    let API_SPEC = `${API_BASE}/api/data-spec`;
    let API_PREDICT = `${API_BASE}/api/predict`;
    let API_ADVISOR = `${API_BASE}/api/ai-advisor`;

    const FALLBACK_API_BASE = "https://bmi2-api.onrender.com";

    // Global toast notifier helper
    window.showToast = function(message) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // Initialize App on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', async () => {
        // Cache DOM elements (safely scoped)
        slidersContainer = document.getElementById('sliders-container');
        btnReset = document.getElementById('btn-reset-recipe');
        tabButtons = document.querySelectorAll('.category-tabs .tab-btn');

        // Check for local file execution warning Close trigger
        const toastCloseBtn = document.getElementById('toast-close-btn');
        const corsBanner = document.getElementById('cors-warning-banner');
        if (toastCloseBtn && corsBanner) {
            toastCloseBtn.addEventListener('click', () => {
                corsBanner.style.opacity = '0';
                setTimeout(() => { corsBanner.style.display = 'none'; }, 300);
            });
        }
        if (window.location.protocol === 'file:') {
            if (corsBanner) corsBanner.style.display = 'flex';
        }

        try {
            await initDashboard();
        } catch (error) {
            console.error("Dashboard initialization failed:", error);
            if (slidersContainer) {
                slidersContainer.innerHTML = `<div class="loading-spinner" style="color: #ff5252;"><i class="fa-solid fa-triangle-exclamation"></i> 서버 연결 실패: 시뮬레이션 예측 API에 연결할 수 없습니다. (Python 백엔드 서버 기동 여부 확인 필요)</div>`;
            }
        }
    });

    // Fetch Init Spec and Setup
    async function initDashboard() {
        let response;
        try {
            response = await fetch(API_SPEC);
            if (!response.ok) throw new Error("Could not fetch data spec");
        } catch (localError) {
            // If local connection fails, fallback to production Render backend dynamically
            if (API_BASE !== FALLBACK_API_BASE) {
                console.warn(`Local FastAPI backend (${API_BASE}) is not running. Automatically falling back to production Render backend (${FALLBACK_API_BASE})...`);
                API_BASE = FALLBACK_API_BASE;
                API_SPEC = `${API_BASE}/api/data-spec`;
                API_PREDICT = `${API_BASE}/api/predict`;
                API_ADVISOR = `${API_BASE}/api/ai-advisor`;
                
                response = await fetch(API_SPEC);
                if (!response.ok) throw new Error("Could not fetch data spec from production fallback server");
                
                // Show a helpful toast notifying that the system is running using fallback backend
                setTimeout(() => {
                    if (window.showToast) {
                        window.showToast("로컬 백엔드가 감지되지 않아 실서버(Render)로 자동 연동되었습니다.");
                    }
                }, 1000);
            } else {
                throw localError;
            }
        }
        
        const spec = await response.json();
        materials = spec.materials;
        oilContent = spec.oil_content || {};
        baseRecipe = { ...spec.base_recipe };
        currentRecipe = { ...spec.base_recipe };
        baseCurve = spec.base_curve;
        simulatedCurve = [...spec.base_curve];
        baseTg = spec.base_tg;
        simulatedTg = spec.base_tg;
        
        // 1. Setup Slider Filters (Tab Clicking)
        setupTabFilters();
        
        // 2. Render dynamic sliders
        renderSliders('ALL');
        
        // 3. Initialize beautiful Chart.js
        initChart();
        initRadarChart();
        
        // 4. Initialize Reference Selector Panel
        setupReferenceSelector();
        
        // 5. Compute dynamic IQR-filtered distribution bounds for 0-100 scoring
        updateDistributionBounds();
        
        // 6. Update KPI metrics and analytical insight cards
        updateInsights(getActiveBaseCurve(), baseCurve, getActiveBaseTg(), baseTg); // initial is same as base
        updatePolymerConstraintStatus();
        
        // 7. Reset button handler
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                currentRecipe = { ...baseRecipe };
                // Reset slider values on UI
                materials.forEach(m => {
                    const input = document.getElementById(`slider-${m.CODE}`);
                    const valBox = document.getElementById(`val-${m.CODE}`);
                    const group = document.getElementById(`group-${m.CODE}`);
                    const targetVal = baseRecipe[m.CODE] !== undefined ? baseRecipe[m.CODE] : m.mean_phr;
                    if (input) {
                        input.value = parseFloat(targetVal);
                    }
                    if (valBox) {
                        valBox.textContent = parseFloat(targetVal).toFixed(2);
                    }
                    if (group) {
                        group.classList.remove('changed');
                    }
                });
                updatePolymerConstraintStatus();
                triggerSimulation();
                window.showToast("기본 화학 배합 레시피가 복원되었습니다.");
            });
        }

        // 8. Setup AI Advisor Panel Handler
        setupAIAdvisor();
    }

    // Setup tab filters
    function setupTabFilters() {
        if (!tabButtons) return;
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const category = e.currentTarget.getAttribute('data-category');
                renderSliders(category);
            });
        });
    }

    // Map material types to simple UI categories
    function getSimpleCategory(type) {
        if (type.startsWith('POLYMER')) return 'POLYMER';
        if (type.startsWith('FILLER')) return 'FILLER';
        if (type.startsWith('COUPLING')) return 'COUPLING';
        if (type.startsWith('ADDITIVE')) return 'ADDITIVE';
        if (type.startsWith('CURING')) return 'CURING';
        return 'OTHER';
    }

    // Subcategory mapping
    function getSubCategory(type, code) {
        if (type === 'POLYMER_NR' || type === 'POLYMER_RECYCLED_RUBBER') return 'NR';
        if (type === 'POLYMER_SBR') return 'SBR';
        if (type === 'POLYMER_BR' || type === 'POLYMER_LIQUID_BR' || type === 'POLYMER_RECYCLED_BUTYL') return 'BR';
        
        if (type === 'FILLER_SILICA') return '실리카';
        if (type === 'FILLER_CARBON_BLACK' || type === 'FILLER_RECYCLED') return '카본블랙';
        
        if (type === 'COUPLING_SILANE') return '실란';
        
        if (type === 'CURING_ACCELERATOR') return '촉진제';
        if (type === 'CURING_SULFUR') return '황';
        if (type === 'CURING_RETARDER') return '지연제';
        
        if (type === 'ADDITIVE_RESIN') return '레진';
        if (type === 'ADDITIVE_OIL') return '오일';
        if (type === 'ADDITIVE_ANTI_DEGRADANT') return '노방제';
        if (type === 'ADDITIVE_PROCESS_AID' || type === 'ADDITIVE_ACTIVATOR' || type === 'ADDITIVE_ADHESIVE') return '가공조제';
        
        return '기타';
    }

    // Order configuration for groups & subcategories
    const CATEGORY_ORDER = ['POLYMER', 'FILLER', 'COUPLING', 'ADDITIVE', 'CURING', 'OTHER'];
    const SUBCATEGORY_ORDER = {
        'POLYMER': ['NR', 'SBR', 'BR', '기타'],
        'FILLER': ['실리카', '카본블랙', '기타'],
        'COUPLING': ['실란', '기타'],
        'ADDITIVE': ['레진', '오일', '노방제', '가공조제', '기타'],
        'CURING': ['촉진제', '황', '지연제', '기타'],
        'OTHER': ['기타']
    };

    const CATEGORY_NAMES = {
        'POLYMER': 'Polymers (고무 고분자)',
        'FILLER': 'Fillers (보강제/충전제)',
        'COUPLING': 'Couplings (커플링제)',
        'ADDITIVE': 'Additives (가공 조제 및 첨가제)',
        'CURING': 'Curings (가류제 및 촉진제)',
        'OTHER': 'Others (기타 성분)'
    };

    // Render dynamic sliders with hierarchy groupings
    function renderSliders(categoryFilter) {
        if (!slidersContainer) return;
        slidersContainer.innerHTML = '';
        
        // 1. Group materials by Category and Subcategory
        const grouped = {};
        materials.forEach(m => {
            const cat = getSimpleCategory(m.type);
            const subcat = getSubCategory(m.type, m.CODE);
            
            if (!grouped[cat]) grouped[cat] = {};
            if (!grouped[cat][subcat]) grouped[cat][subcat] = [];
            grouped[cat][subcat].push(m);
        });
        
        // 2. Decide which categories to render
        const categoriesToRender = categoryFilter === 'ALL' 
            ? CATEGORY_ORDER 
            : [categoryFilter];
            
        let totalRendered = 0;
        
        categoriesToRender.forEach(cat => {
            if (!grouped[cat]) return;
            
            const subcatMap = grouped[cat];
            const hasMaterials = Object.values(subcatMap).some(list => list.length > 0);
            if (!hasMaterials) return;
            
            // Render Category Header (only when viewing ALL)
            if (categoryFilter === 'ALL') {
                const catHeader = document.createElement('div');
                catHeader.className = 'category-group-header';
                catHeader.style.cssText = "margin: 24px 12px 10px; font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 800; color: var(--text-dark); letter-spacing: 0.5px; border-left: 3px solid var(--primary); padding-left: 8px; text-transform: uppercase;";
                catHeader.textContent = CATEGORY_NAMES[cat] || cat;
                slidersContainer.appendChild(catHeader);
            }
            
            // Render Subcategories in specified order
            const subcatsToRender = SUBCATEGORY_ORDER[cat] || Object.keys(subcatMap);
            
            subcatsToRender.forEach(subcat => {
                const list = subcatMap[subcat];
                if (!list || list.length === 0) return;
                
                // Render Subcategory Subheading Header
                const subcatHeader = document.createElement('div');
                subcatHeader.className = 'subcategory-header';
                subcatHeader.style.cssText = "margin: 14px 12px 8px; font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: var(--primary); letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1px solid rgba(249, 115, 22, 0.08); padding-bottom: 4px; display: flex; align-items: center; gap: 4px;";
                subcatHeader.innerHTML = `<span class="subcat-dot" style="width: 4px; height: 4px; background: var(--primary); border-radius: 50%;"></span>${subcat}`;
                slidersContainer.appendChild(subcatHeader);
                
                // Render sliders in subcategory
                list.forEach(m => {
                    totalRendered++;
                    const simpleCat = getSimpleCategory(m.type);
                    const badgeClass = `badge-${simpleCat.toLowerCase()}`;
                    
                    const maxLimit = Math.max(parseFloat(m.max_phr), 50.0);
                    const currentValue = parseFloat(currentRecipe[m.CODE] !== undefined ? currentRecipe[m.CODE] : m.mean_phr);
                    const baseValue = parseFloat(baseRecipe[m.CODE] !== undefined ? baseRecipe[m.CODE] : m.mean_phr);
                    
                    const isChanged = Math.abs(currentValue - baseValue) > 0.01;
                    
                    const sliderGroup = document.createElement('div');
                    sliderGroup.className = `slider-group ${isChanged ? 'changed' : ''}`;
                    sliderGroup.id = `group-${m.CODE}`;
                    
                    sliderGroup.innerHTML = `
                        <div class="slider-info">
                            <div class="slider-label">
                                <span class="slider-name">${m.name || m.CODE}</span>
                                <span class="slider-code">${m.CODE}</span>
                                <span class="slider-type-badge ${badgeClass}">${m.type}</span>
                            </div>
                            <div class="slider-value-box">
                                <span class="slider-value" id="val-${m.CODE}">${currentValue.toFixed(2)}</span>
                                <span class="unit">phr</span>
                            </div>
                        </div>
                        <div class="range-container">
                            <span class="range-limit">0</span>
                            <input type="range" 
                                   id="slider-${m.CODE}" 
                                   min="0" 
                                   max="${maxLimit.toFixed(1)}" 
                                   step="0.1" 
                                   value="${currentValue}" />
                            <span class="range-limit">${Math.round(maxLimit)}</span>
                        </div>
                    `;
                    
                    slidersContainer.appendChild(sliderGroup);
                    
                    // Add event listener for real-time tracking
                    const input = sliderGroup.querySelector('input[type="range"]');
                    input.addEventListener('input', (e) => {
                        const val = parseFloat(e.target.value);
                        const isPolymer = getSimpleCategory(m.type) === 'POLYMER';
                        
                        if (isPolymer) {
                            redistributePolymers(m.CODE, val);
                        } else {
                            currentRecipe[m.CODE] = val;
                            
                            const valSpan = document.getElementById(`val-${m.CODE}`);
                            if (valSpan) valSpan.textContent = val.toFixed(2);
                            
                            const baseVal = parseFloat(baseRecipe[m.CODE] !== undefined ? baseRecipe[m.CODE] : m.mean_phr);
                            if (Math.abs(val - baseVal) > 0.01) {
                                sliderGroup.classList.add('changed');
                            } else {
                                sliderGroup.classList.remove('changed');
                            }
                        }
                        
                        updatePolymerConstraintStatus();
                        debounce(triggerSimulation, 150)();
                    });
                });
            });
        });
        
        if (totalRendered === 0) {
            slidersContainer.innerHTML = `<div class="loading-spinner">해당 원료 그룹에 속하는 데이터가 존재하지 않습니다.</div>`;
        }
    }

    // Debounce helper to prevent heavy API flood
    let debounceTimer;
    function debounce(func, delay) {
        return function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // Call API and predict
    async function triggerSimulation() {
        let response;
        try {
            response = await fetch(API_PREDICT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe: currentRecipe })
            });
            if (!response.ok) throw new Error("Prediction API failed");
        } catch (e) {
            // If local connection fails, fallback to production Render backend dynamically
            if (API_BASE !== FALLBACK_API_BASE) {
                console.warn(`Local Prediction API call failed. Retrying with fallback production server...`);
                API_BASE = FALLBACK_API_BASE;
                API_SPEC = `${API_BASE}/api/data-spec`;
                API_PREDICT = `${API_BASE}/api/predict`;
                API_ADVISOR = `${API_BASE}/api/ai-advisor`;

                try {
                    response = await fetch(API_PREDICT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ recipe: currentRecipe })
                    });
                    if (!response.ok) throw new Error("Prediction API failed on fallback production server");
                } catch (retryErr) {
                    console.error("Simulation error on fallback production server:", retryErr);
                    return;
                }
            } else {
                console.error("Simulation error:", e);
                return;
            }
        }

        try {
            const res = await response.json();
            simulatedCurve = res.curve;
            simulatedTg = res.tg;
            
            // Update Chart
            updateChartData();
            
            // Update lower insights (compares with chosen reference)
            updateInsights(getActiveBaseCurve(), simulatedCurve, getActiveBaseTg(), simulatedTg);
        } catch (parseErr) {
            console.error("Failed to parse prediction response:", parseErr);
        }
    }

    // Get specific point values for analysis
    function getValAtTemp(curve, temp) {
        const found = curve.find(p => p.temp === temp);
        return found ? found.tan_delta : 0.0;
    }

    // Global variable for distribution bounds (default bounds as fallback)
    let distributionBounds = {
        wear: { min: -70, max: 0 },
        wet: { min: 0.1, max: 0.8 },
        rr: { min: 0.05, max: 0.3 }
    };

    // Calculate IQR bounds for a given metric to remove outliers
    function calculateIQRBoundsForMetric(values) {
        if (!values || values.length === 0) return null;
        
        const sorted = [...values].sort((a, b) => a - b);
        
        const getPercentile = (arr, p) => {
            const index = (arr.length - 1) * p;
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            return arr[lower] * (1 - weight) + arr[upper] * weight;
        };

        const q1 = getPercentile(sorted, 0.25);
        const q3 = getPercentile(sorted, 0.75);
        const iqr = q3 - q1;
        
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const filtered = sorted.filter(v => v >= lowerBound && v <= upperBound);
        
        if (filtered.length === 0) {
            return { min: sorted[0], max: sorted[sorted.length - 1] };
        }
        
        return {
            min: filtered[0],
            max: filtered[filtered.length - 1]
        };
    }

    // Refresh dynamic distribution bounds for current dataset
    function updateDistributionBounds() {
        const refs = getReferences();
        
        const tgValues = refs.map(r => r.avgData.tg).filter(v => v !== null && !isNaN(v));
        const wetValues = refs.map(r => r.avgData.tand0).filter(v => v !== null && !isNaN(v));
        const rrValues = refs.map(r => r.avgData.tand60).filter(v => v !== null && !isNaN(v));

        const tgBounds = calculateIQRBoundsForMetric(tgValues);
        if (tgBounds && tgBounds.max > tgBounds.min) {
            distributionBounds.wear = tgBounds;
        }
        
        const wetBounds = calculateIQRBoundsForMetric(wetValues);
        if (wetBounds && wetBounds.max > wetBounds.min) {
            distributionBounds.wet = wetBounds;
        }

        const rrBounds = calculateIQRBoundsForMetric(rrValues);
        if (rrBounds && rrBounds.max > rrBounds.min) {
            distributionBounds.rr = rrBounds;
        }
    }

    // Convert raw metric to 0-100 score
    function getScore(value, bounds, lowerIsBetter) {
        if (value === null || value === undefined || isNaN(value)) return 0;
        const { min, max } = bounds;
        if (max === min) return 50;

        let score;
        if (lowerIsBetter) {
            score = ((max - value) / (max - min)) * 100;
        } else {
            score = ((value - min) / (max - min)) * 100;
        }
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Update Bottom Insight Cards with dynamic scores & comparative bars
    function updateInsights(base, sim, baseT, simT) {
        const scoreWearRef = getScore(baseT, distributionBounds.wear, true);
        const scoreWearSim = getScore(simT, distributionBounds.wear, true);
        
        const baseWet = getValAtTemp(base, 0);
        const simWet = getValAtTemp(sim, 0);
        const scoreWetRef = getScore(baseWet, distributionBounds.wet, false);
        const scoreWetSim = getScore(simWet, distributionBounds.wet, false);

        const baseRR = getValAtTemp(base, 60);
        const simRR = getValAtTemp(sim, 60);
        const scoreRRRef = getScore(baseRR, distributionBounds.rr, true);
        const scoreRRSim = getScore(simRR, distributionBounds.rr, true);

        // 4. Update Triangle Radar Chart
        if (radarChart) {
            radarChart.data.datasets[0].data = [scoreWearRef, scoreWetRef, scoreRRRef];
            radarChart.data.datasets[1].data = [scoreWearSim, scoreWetSim, scoreRRSim];
            
            if (selectedReferenceId) {
                radarChart.data.datasets[0].hidden = false;
                if (selectedReferenceData) {
                    radarChart.data.datasets[0].label = `${selectedReferenceData.pattern} (${selectedReferenceData.maker})`;
                }
                radarChart.data.labels = [
                    ['내마모', `Sim: ${scoreWearSim} / Ref: ${scoreWearRef}`],
                    ['Wet 제동', `Sim: ${scoreWetSim} / Ref: ${scoreWetRef}`],
                    ['연비', `Sim: ${scoreRRSim} / Ref: ${scoreRRRef}`]
                ];
            } else {
                radarChart.data.datasets[0].hidden = true;
                radarChart.data.datasets[0].label = 'Base Compound';
                radarChart.data.labels = [
                    ['내마모', `${scoreWearSim}점`],
                    ['Wet 제동', `${scoreWetSim}점`],
                    ['연비', `${scoreRRSim}점`]
                ];
            }
            radarChart.update();
        }

        // 5. Update Right Side Comparison Cards Dynamically
        const compWetSimEl = document.getElementById('comp-wet-sim');
        const compWetRefEl = document.getElementById('comp-wet-ref');
        const compWetRefLabelEl = document.getElementById('comp-wet-ref-label');
        const diffWetEl = document.getElementById('diff-wet');
        const statusWetEl = document.getElementById('status-wet');

        const compHandlingSimEl = document.getElementById('comp-handling-sim');
        const compHandlingRefEl = document.getElementById('comp-handling-ref');
        const compHandlingRefLabelEl = document.getElementById('comp-handling-ref-label');
        const diffHandlingEl = document.getElementById('diff-handling');
        const statusHandlingEl = document.getElementById('status-handling');

        const compWearSimEl = document.getElementById('comp-wear-sim');
        const compWearRefEl = document.getElementById('comp-wear-ref');
        const compWearRefLabelEl = document.getElementById('comp-wear-ref-label');
        const diffWearEl = document.getElementById('diff-wear');
        const statusWearEl = document.getElementById('status-wear');

        const refLegendNameEl = document.getElementById('ref-legend-name');
        const comparisonLegendEl = document.querySelector('.comparison-legend');
        const insightTextEl = document.getElementById('comparison-insight-text');

        let refMaker = 'BASE';
        let refPattern = 'Base Compound';
        let activeRef = false;

        if (selectedReferenceId && selectedReferenceData) {
            refMaker = selectedReferenceData.maker || 'MICHELIN';
            refPattern = selectedReferenceData.pattern || 'DEFENDER 2';
            activeRef = true;
            if (refLegendNameEl) {
                refLegendNameEl.textContent = `${refPattern} (${refMaker})`;
            }
            if (comparisonLegendEl) {
                comparisonLegendEl.style.display = 'flex';
            }
        } else {
            refMaker = 'BASE';
            refPattern = 'Base Compound';
            if (refLegendNameEl) {
                refLegendNameEl.textContent = 'Base Compound';
            }
            if (comparisonLegendEl) {
                comparisonLegendEl.style.display = 'none';
            }
        }

        // Wet Card update
        const wetRefVal = activeRef ? scoreWetRef : scoreWetRef;
        if (compWetSimEl) compWetSimEl.textContent = scoreWetSim;
        if (compWetRefEl) compWetRefEl.textContent = wetRefVal;
        if (compWetRefLabelEl) compWetRefLabelEl.textContent = refMaker;
        
        const wetDiff = scoreWetSim - wetRefVal;
        if (diffWetEl) {
            const sign = wetDiff >= 0 ? '+' : '';
            diffWetEl.textContent = `${sign}${wetDiff}`;
            diffWetEl.className = `value-diff ${wetDiff >= 0 ? 'diff-pos' : 'diff-neg'}`;
        }
        if (statusWetEl) {
            if (wetDiff > 10) {
                statusWetEl.textContent = 'HK 우세';
                statusWetEl.className = 'card-status status-win';
            } else if (wetDiff >= 0) {
                statusWetEl.textContent = 'HK 근소 우세';
                statusWetEl.className = 'card-status status-narrow-win';
            } else {
                statusWetEl.textContent = 'HK 열세';
                statusWetEl.className = 'card-status status-lose';
            }
        }

        // Handling (RR) Card update
        const handlingRefVal = activeRef ? scoreRRRef : scoreRRRef;
        if (compHandlingSimEl) compHandlingSimEl.textContent = scoreRRSim;
        if (compHandlingRefEl) compHandlingRefEl.textContent = handlingRefVal;
        if (compHandlingRefLabelEl) compHandlingRefLabelEl.textContent = refMaker;
        
        const handlingDiff = scoreRRSim - handlingRefVal;
        if (diffHandlingEl) {
            const sign = handlingDiff >= 0 ? '+' : '';
            diffHandlingEl.textContent = `${sign}${handlingDiff}`;
            diffHandlingEl.className = `value-diff ${handlingDiff >= 0 ? 'diff-pos' : 'diff-neg'}`;
        }
        if (statusHandlingEl) {
            if (handlingDiff > 10) {
                statusHandlingEl.textContent = 'HK 우세';
                statusHandlingEl.className = 'card-status status-win';
            } else if (handlingDiff >= 0) {
                statusHandlingEl.textContent = 'HK 근소 우세';
                statusHandlingEl.className = 'card-status status-narrow-win';
            } else {
                statusHandlingEl.textContent = 'HK 열세';
                statusHandlingEl.className = 'card-status status-lose';
            }
        }

        // Wear Card update
        const wearRefVal = activeRef ? scoreWearRef : scoreWearRef;
        if (compWearSimEl) compWearSimEl.textContent = scoreWearSim;
        if (compWearRefEl) compWearRefEl.textContent = wearRefVal;
        if (compWearRefLabelEl) compWearRefLabelEl.textContent = refMaker;
        
        const wearDiff = scoreWearSim - wearRefVal;
        if (diffWearEl) {
            const sign = wearDiff >= 0 ? '+' : '';
            diffWearEl.textContent = `${sign}${wearDiff}`;
            diffWearEl.className = `value-diff ${wearDiff >= 0 ? 'diff-pos' : 'diff-neg'}`;
        }
        if (statusWearEl) {
            if (wearDiff > 10) {
                statusWearEl.textContent = 'HK 우세';
                statusWearEl.className = 'card-status status-win';
            } else if (wearDiff >= 0) {
                statusWearEl.textContent = 'HK 근소 우세';
                statusWearEl.className = 'card-status status-narrow-win';
            } else {
                statusWearEl.textContent = 'HK 열세';
                statusWearEl.className = 'card-status status-lose';
            }
        }

        // Update visibility of reference elements
        const dividers = document.querySelectorAll('.value-divider');
        const refVals = document.querySelectorAll('.ref-val');
        const diffs = document.querySelectorAll('.value-diff');
        const statuses = document.querySelectorAll('.card-status');
        const insightBox = document.querySelector('.comparison-insight-box');

        if (activeRef) {
            dividers.forEach(el => el.style.display = 'block');
            refVals.forEach(el => el.style.display = 'flex');
            diffs.forEach(el => el.style.display = 'block');
            statuses.forEach(el => el.style.display = 'block');
            if (insightBox) {
                insightBox.style.display = 'flex';
                if (insightTextEl) {
                    const betterCount = [wetDiff >= 0, handlingDiff >= 0, wearDiff >= 0].filter(Boolean).length;
                    if (betterCount === 3) {
                        insightTextEl.textContent = `설계안이 선택된 벤치마크 타이어 대비 3대 주요 물성(마모, 제동, 연비) 모두 우세한 압도적 성능 밸런스를 발휘합니다.`;
                    } else if (betterCount === 0) {
                        insightTextEl.textContent = `설계안이 선택된 벤치마크 대비 3대 성능 지표 모두 열세에 있습니다. 하단의 AI formulation Advisor 기능을 통해 AI 배합 최적화 처방을 진단해 보십시오.`;
                    } else {
                        const winList = [];
                        if (wetDiff >= 0) winList.push('Wet 제동');
                        if (handlingDiff >= 0) winList.push('회전저항(연비)');
                        if (wearDiff >= 0) winList.push('내마모 수명');
                        const loseList = [];
                        if (wetDiff < 0) loseList.push('Wet 제동');
                        if (handlingDiff < 0) loseList.push('회전저항(연비)');
                        if (wearDiff < 0) loseList.push('내마모 수명');
                        insightTextEl.textContent = `설계안이 ${winList.join(', ')} 측면에서 비교 타겟 대비 우수하나, ${loseList.join(', ')} 성능의 보완 조율이 필요합니다.`;
                    }
                }
            }
        } else {
            dividers.forEach(el => el.style.display = 'none');
            refVals.forEach(el => el.style.display = 'none');
            diffs.forEach(el => el.style.display = 'none');
            statuses.forEach(el => el.style.display = 'none');
            if (insightBox) {
                insightBox.style.display = 'flex';
                if (insightTextEl) {
                    insightTextEl.textContent = `왼쪽 벤치마크 목록에서 대조할 타사 타이어를 선택해 주시면 가상 시뮬레이터 배합에 따른 상대 성능 편차 인사이트가 실시간 연산됩니다.`;
                }
            }
        }

        // Save computed scores to module-level state for AI Advisor
        currentWearSim = scoreWearSim;
        currentWearRef = activeRef ? scoreWearRef : 0;
        currentWetSim = scoreWetSim;
        currentWetRef = activeRef ? scoreWetRef : 0;
        currentRRSim = scoreRRSim;
        currentRRRef = activeRef ? scoreRRRef : 0;
    }

    // Initialize Chart.js
    function initChart() {
        const canvas = document.getElementById('aresChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const temps = baseCurve.map(p => p.temp);
        const baseVals = baseCurve.map(p => p.tan_delta);
        const simVals = simulatedCurve.map(p => p.tan_delta);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: temps,
                datasets: [
                    {
                        label: 'Base Compound',
                        data: baseVals,
                        borderColor: '#64748b', // Competitor line color in BM_FINAL
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        tension: 0.35,
                        order: 2
                    },
                    {
                        label: 'VIRTUAL (HK)',
                        data: simVals,
                        borderColor: '#f97316', // Vibrant Cyber Orange
                        borderWidth: 3,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#f97316',
                        pointBorderWidth: 2,
                        tension: 0.35,
                        order: 1
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
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleFont: { family: 'Outfit', size: 12, weight: '700' },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(249, 115, 22, 0.15)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            title: (context) => `온도: ${context[0].label} ℃`,
                            label: (context) => `tanδ : ${context.raw.toFixed(4)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(249, 115, 22, 0.04)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: 'Outfit', weight: '600', size: 11 },
                            callback: function(value, index, ticks) {
                                return this.getLabelForValue(value) + '℃';
                            }
                        },
                        title: { display: true, text: 'Temperature (℃)', color: '#64748b', font: { family: 'Outfit', weight: '700', size: 12 } }
                    },
                    y: {
                        grid: { color: 'rgba(249, 115, 22, 0.04)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: 'Outfit', weight: '600', size: 11 }
                        },
                        title: { display: true, text: 'tanδ (Loss Factor)', color: '#64748b', font: { family: 'Outfit', weight: '700', size: 12 } }
                    }
                }
            }
        });
    }

    // Initialize Triangle Radar Chart
    function initRadarChart() {
        const canvas = document.getElementById('vcdRadarChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['내마모', 'Wet 제동', '연비'],
                datasets: [
                    {
                        label: 'COMPETITOR',
                        data: [0, 0, 0],
                        borderColor: '#64748b',
                        backgroundColor: 'rgba(100, 116, 139, 0.12)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#64748b',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1,
                        fill: true,
                        hidden: true
                    },
                    {
                        label: 'VIRTUAL (HK)',
                        data: [0, 0, 0],
                        borderColor: '#f97316', // Glowing Orange
                        backgroundColor: 'rgba(249, 115, 22, 0.12)',
                        borderWidth: 3.5,
                        pointRadius: 4.5,
                        pointBackgroundColor: '#f97316',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1.5,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 15
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleFont: { family: 'Outfit', size: 12, weight: '700' },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(249, 115, 22, 0.15)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.raw}점`
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            display: false,
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(249, 115, 22, 0.04)'
                        },
                        angleLines: {
                            color: 'rgba(249, 115, 22, 0.04)'
                        },
                        pointLabels: {
                            color: '#1e293b',
                            font: {
                                family: 'Outfit',
                                weight: '800',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Update line values in chart dynamically
    function updateChartData() {
        if (!chart) return;
        chart.data.datasets[1].data = simulatedCurve.map(p => p.tan_delta);
        chart.update('none');
    }

    // Function to redistribute polymers to maintain exact sum of 100 net PHR
    function redistributePolymers(changedCode, newValue) {
        const polymerCodes = materials
            .filter(m => getSimpleCategory(m.type) === 'POLYMER')
            .map(m => m.CODE);
            
        if (!polymerCodes.includes(changedCode)) return;
        
        const oilPctChanged = oilContent[changedCode] || 0.0;
        const factorChanged = 100.0 / (100.0 + oilPctChanged);
        const netChanged = newValue * factorChanged;
        
        if (polymerCodes.length <= 1) {
            currentRecipe[changedCode] = newValue;
            return;
        }
        
        const otherCodes = polymerCodes.filter(c => c !== changedCode);
        let otherNetSum = 0.0;
        const otherNets = {};
        const otherFactors = {};
        
        otherCodes.forEach(code => {
            const oilPct = oilContent[code] || 0.0;
            const factor = 100.0 / (100.0 + oilPct);
            otherFactors[code] = factor;
            const currentVal = parseFloat(currentRecipe[code] || 0.0);
            const net = currentVal * factor;
            otherNets[code] = net;
            otherNetSum += net;
        });
        
        const targetOtherNetSum = Math.max(0.0, 100.0 - netChanged);
        
        if (netChanged > 100.0) {
            const maxVal = 100.0 / factorChanged;
            currentRecipe[changedCode] = maxVal;
            otherCodes.forEach(code => {
                currentRecipe[code] = 0.0;
            });
            syncRedistributedSliders(polymerCodes);
            return;
        }
        
        currentRecipe[changedCode] = newValue;
        
        if (otherNetSum > 0.0) {
            otherCodes.forEach(code => {
                const ratio = otherNets[code] / otherNetSum;
                const newNet = targetOtherNetSum * ratio;
                currentRecipe[code] = newNet / otherFactors[code];
            });
        } else {
            let baseSum = 0.0;
            const baseNets = {};
            otherCodes.forEach(code => {
                const m = materials.find(mat => mat.CODE === code);
                const baseVal = m ? parseFloat(m.mean_phr) : 1.0;
                const net = baseVal * otherFactors[code];
                baseNets[code] = net;
                baseSum += net;
            });
            
            if (baseSum > 0.0) {
                otherCodes.forEach(code => {
                    const ratio = baseNets[code] / baseSum;
                    const newNet = targetOtherNetSum * ratio;
                    currentRecipe[code] = newNet / otherFactors[code];
                });
            } else {
                otherCodes.forEach(code => {
                    const newNet = targetOtherNetSum / otherCodes.length;
                    currentRecipe[code] = newNet / otherFactors[code];
                });
            }
        }
        
        syncRedistributedSliders(polymerCodes);
    }

    // Update slider elements and values after redistribution
    function syncRedistributedSliders(polymerCodes) {
        polymerCodes.forEach(code => {
            const input = document.getElementById(`slider-${code}`);
            const valBox = document.getElementById(`val-${code}`);
            const group = document.getElementById(`group-${code}`);
            const currentVal = parseFloat(currentRecipe[code] || 0.0);
            
            if (input) {
                input.value = currentVal.toFixed(1);
            }
            if (valBox) {
                valBox.textContent = currentVal.toFixed(2);
            }
            
            const m = materials.find(mat => mat.CODE === code);
            if (m) {
                const baseVal = parseFloat(baseRecipe[code] !== undefined ? baseRecipe[code] : m.mean_phr);
                if (Math.abs(currentVal - baseVal) > 0.01) {
                    if (group) group.classList.add('changed');
                } else {
                    if (group) group.classList.remove('changed');
                }
            }
        });
    }

    // Calculate and update Polymer Constraint Status Bar & Value
    function updatePolymerConstraintStatus() {
        const sumEl = document.getElementById('polymer-sum-val');
        const noticeEl = document.getElementById('polymer-constraint-notice');
        
        if (!sumEl) return;
        
        const polymerCodes = materials
            .filter(m => getSimpleCategory(m.type) === 'POLYMER')
            .map(m => m.CODE);
            
        let netSum = 0.0;
        polymerCodes.forEach(code => {
            const oilPct = oilContent[code] || 0.0;
            const factor = 100.0 / (100.0 + oilPct);
            const val = parseFloat(currentRecipe[code] || 0.0);
            netSum += val * factor;
        });
        
        sumEl.textContent = netSum.toFixed(2);
    }

    // Get active base curve depending on selection
    function getActiveBaseCurve() {
        if (selectedReferenceData) {
            const temps = [-60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
            return temps.map(t => ({
                temp: t,
                tan_delta: selectedReferenceData.avgData.temps[t] !== null && selectedReferenceData.avgData.temps[t] !== undefined ? selectedReferenceData.avgData.temps[t] : 0.0
            }));
        }
        return baseCurve;
    }

    // Get active base Tg depending on selection
    function getActiveBaseTg() {
        if (selectedReferenceData && selectedReferenceData.avgData.tg !== null && selectedReferenceData.avgData.tg !== undefined) {
            return selectedReferenceData.avgData.tg;
        }
        return baseTg;
    }

    // Setup Reference Selector controls
    function setupReferenceSelector() {
        const searchInput = document.getElementById('vcd-ref-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.addEventListener('input', (e) => {
                selectedPattern = null;
                renderReferenceList(e.target.value);
            });
            searchInput.addEventListener('focus', () => {
                selectedPattern = null;
                renderReferenceList(searchInput.value);
            });
            searchInput.addEventListener('click', () => {
                selectedPattern = null;
                renderReferenceList(searchInput.value);
            });
        }

        renderReferenceList();
    }

    // Fetch and aggregate individual references that have ARES Sweep data dynamically
    function getReferences() {
        // BM_FINAL 에서 tread_data.js가 포함되면 window.TREAD_DATA 로 데이터를 가져옵니다.
        const sourceData = window.TREAD_DATA || [];
        const temperatures = [-60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
        const list = [];

        // Helper to query props dynamically from dataset
        const getPropValue = (item, keys) => {
            for (const key of keys) {
                if (item[key] !== undefined && item[key] !== null) return item[key];
            }
            return null;
        };

        sourceData.forEach((item, index) => {
            const maker = (getPropValue(item, ['Maker', 'MakerPatternRaw']) || '').toString().trim();
            const pattern = (getPropValue(item, ['Pattern']) || '').toString().trim();
            if (!maker || !pattern || maker === 'N/A' || pattern === 'N/A') return;

            // Extract temperatures to check if this product has ARES Sweep data
            const tempsAvg = {};
            let hasAresData = false;
            temperatures.forEach(temp => {
                let val = null;
                if (temp === 0) {
                    val = parseFloat(getPropValue(item, ['tan δ @ 0℃', '0℃ tanδ', '0C tanδ', 'tanδ @ 0℃'])) || null;
                } else if (temp === 60) {
                    val = parseFloat(getPropValue(item, ['tanδ @ 60℃', 'tanδ @ 60C', 'tan δ @ 60℃', 'tan @ 60', 'DMTS @ 60℃', 'tanδ @ 60℃ (@ 0.5%)', '60'])) || null;
                } else {
                    const rawVal = item[temp.toString()];
                    val = rawVal !== undefined && rawVal !== null ? parseFloat(rawVal) : null;
                    if (val === null && temp > 0) {
                        const rawValPlus = item['+' + temp.toString()];
                        val = rawValPlus !== undefined && rawValPlus !== null ? parseFloat(rawValPlus) : null;
                    }
                }
                if (val !== null && !isNaN(val)) {
                    tempsAvg[temp] = val;
                    hasAresData = true;
                } else {
                    tempsAvg[temp] = null;
                }
            });

            // Skip products that don't have any valid ARES Sweep data
            if (!hasAresData) return;

            const tg = parseFloat(getPropValue(item, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"])) || null;
            const wet = tempsAvg[0];
            const rr = tempsAvg[60];

            const size = (getPropValue(item, ['Size', '규격']) || '').toString().trim();
            const season = (getPropValue(item, ['Season']) || '').toString().trim();
            const part = (getPropValue(item, ['부위']) || '').toString().trim();
            const year = (getPropValue(item, ['분석년도', '분석년도 ']) || '').toString().trim();

            const id = `${maker}||${pattern}||${size}||${season}||${part}||${year}||${index}`;

            list.push({
                id: id,
                maker: maker,
                pattern: pattern,
                size: size,
                season: season,
                part: part,
                year: year,
                avgData: {
                    temps: tempsAvg,
                    tg: tg,
                    tand0: wet,
                    tand60: rr
                }
            });
        });

        // 정렬 메이커 우선 정렬 체계 정의 (Hankook 및 글로벌 주요 8대 메이커)
        const priorityMakers = [
            'HANKOOK', 'MICHELIN', 'CONTINENTAL', 'BRIDGESTONE', 
            'GOODYEAR', 'PIRELLI', 'KUMHO', 'NEXEN'
        ];

        return list.sort((a, b) => {
            const makerA = a.maker.toUpperCase();
            const makerB = b.maker.toUpperCase();
            const idxA = priorityMakers.indexOf(makerA);
            const idxB = priorityMakers.indexOf(makerB);

            // 둘 다 우선순위 메이커인 경우, 우선순위 배열 인덱스 기준으로 정렬
            if (idxA !== -1 && idxB !== -1) {
                if (idxA !== idxB) return idxA - idxB;
            } 
            // a만 우선순위인 경우 b보다 앞에 위치
            else if (idxA !== -1) {
                return -1;
            } 
            // b만 우선순위인 경우 a보다 앞에 위치
            else if (idxB !== -1) {
                return 1;
            } 
            // 둘 다 일반 메이커인 경우 제조사 알파벳 순으로 정렬
            else {
                if (makerA !== makerB) {
                    return makerA.localeCompare(makerB);
                }
            }

            // 제조사가 동일하거나 우선순위가 같을 경우, 분석년도 최신순(내림차순) 정렬
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }

            // 분석년도까지 동일하면 패턴명 알파벳 오름차순 정렬
            return a.pattern.localeCompare(b.pattern);
        });
    }

    // Render list of Reference Compounds
    function renderReferenceList(filterText = '') {
        const listContainer = document.getElementById('vcd-ref-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        const refs = getReferences();
        const query = filterText.toLowerCase().trim();

        // Clean manufacturer name from pattern display
        function getCleanDisplayPattern(pattern, maker) {
            if (!pattern) return '';
            let cleaned = pattern.trim();
            if (maker) {
                const escapedMaker = maker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regexParens = new RegExp(`\\s*[\\(\\[]\\s*${escapedMaker}\\s*[\\)\\]]`, 'gi');
                cleaned = cleaned.replace(regexParens, '');
                
                const regexMuted = new RegExp(`\\s*-\\s*${escapedMaker}`, 'gi');
                cleaned = cleaned.replace(regexMuted, '');
            }
            cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, (match) => {
                const inside = match.replace(/[\(\)]/g, '').trim().toLowerCase();
                if (maker && (inside === maker.toLowerCase() || inside.includes(maker.toLowerCase()) || inside === '제조사')) {
                    return '';
                }
                return match;
            });
            return cleaned.trim();
        }

        // Case 0: A specific Pattern's Sizes list is active
        if (selectedPattern !== null) {
            const backBtn = document.createElement('div');
            backBtn.className = 'vcd-ref-back';
            backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 뒤로 가기`;
            backBtn.addEventListener('click', () => {
                selectedPattern = null;
                renderReferenceList(filterText);
            });
            listContainer.appendChild(backBtn);

            const [pMaker, pPattern] = selectedPattern.split('||');
            const patternItems = refs.filter(ref => ref.maker === pMaker && ref.pattern === pPattern);

            if (patternItems.length === 0) {
                selectedPattern = null;
                renderReferenceList(filterText);
                return;
            }

            const titleEl = document.createElement('div');
            titleEl.className = 'vcd-ref-size-title';
            titleEl.style.cssText = "font-family: 'Outfit', sans-serif; font-size: 0.8rem; font-weight: 800; color: var(--primary); padding: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; width: 140px; flex-shrink: 0; text-align: center;";
            titleEl.textContent = `${getCleanDisplayPattern(pPattern, pMaker)} 규격`;
            listContainer.appendChild(titleEl);

            patternItems.forEach(ref => {
                const subItem = document.createElement('div');
                const isSubActive = selectedReferenceId === ref.id;
                subItem.className = `vcd-ref-card ${isSubActive ? 'active' : ''}`;
                subItem.style.cssText = "min-width: 200px; padding: 10px 14px; border-radius: 10px; cursor: pointer;";
                subItem.setAttribute('data-id', ref.id);

                const scoreWear = getScore(ref.avgData.tg, distributionBounds.wear, true);
                const scoreWet = getScore(ref.avgData.tand0, distributionBounds.wet, false);
                const scoreRR = getScore(ref.avgData.tand60, distributionBounds.rr, true);

                const specExtra = [ref.season, ref.year ? ref.year + '년' : ''].filter(Boolean).join(' | ');

                subItem.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
                        <span style="font-weight: 800; font-size: 0.82rem; color: var(--text-dark);">${ref.size}</span>
                        <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">${specExtra}</span>
                        <div style="display: flex; justify-content: space-between; font-family: 'Outfit', sans-serif; font-size: 0.7rem; color: var(--text-muted); border-top: 1px dashed rgba(249,115,22,0.12); padding-top: 4px; margin-top: 2px;">
                            <span>마모: <strong style="color: var(--primary);">${scoreWear}</strong></span>
                            <span>제동: <strong style="color: var(--primary);">${scoreWet}</strong></span>
                            <span>연비: <strong style="color: var(--primary);">${scoreRR}</strong></span>
                        </div>
                    </div>
                `;

                subItem.addEventListener('click', () => {
                    handleSelection(ref);
                });

                listContainer.appendChild(subItem);
            });
            return;
        }

        // Case 1: No query and no maker selected -> Render Manufacturer list
        if (!query && selectedMaker === null) {
            const makerCounts = {};
            refs.forEach(ref => {
                if (ref.maker) {
                    makerCounts[ref.maker] = (makerCounts[ref.maker] || 0) + 1;
                }
            });

            // 정렬 메이커 우선 정렬 체계 정의 (Hankook 및 글로벌 주요 8대 메이커)
            const priorityMakers = [
                'HANKOOK', 'MICHELIN', 'CONTINENTAL', 'BRIDGESTONE', 
                'GOODYEAR', 'PIRELLI', 'KUMHO', 'NEXEN'
            ];

            let makers = Object.keys(makerCounts).sort((a, b) => {
                const makerA = a.toUpperCase();
                const makerB = b.toUpperCase();
                const idxA = priorityMakers.indexOf(makerA);
                const idxB = priorityMakers.indexOf(makerB);

                if (idxA !== -1 && idxB !== -1) {
                    return idxA - idxB;
                } else if (idxA !== -1) {
                    return -1;
                } else if (idxB !== -1) {
                    return 1;
                } else {
                    return makerA.localeCompare(makerB);
                }
            });

            if (makers.length === 0) {
                listContainer.innerHTML = `<div class="loading-spinner">사용 가능한 데이터가 없습니다.</div>`;
                return;
            }

            makers.forEach(maker => {
                const item = document.createElement('div');
                item.className = 'vcd-ref-card';
                item.style.cssText = "min-width: 140px; text-align: center; justify-content: center; align-items: center; display: flex; flex-direction: column; gap: 4px; padding: 16px;";
                item.innerHTML = `
                    <span style="font-size: 0.95rem; font-weight: 900; color: var(--text-dark); font-family: 'Outfit', sans-serif;">${maker}</span>
                    <span style="font-size: 10px; color: var(--primary); font-weight: 700;">${makerCounts[maker]}개 제품</span>
                `;
                item.addEventListener('click', () => {
                    selectedMaker = maker;
                    const searchInput = document.getElementById('vcd-ref-search');
                    if (searchInput) searchInput.value = '';
                    renderReferenceList();
                });
                listContainer.appendChild(item);
            });
            return;
        }

        // Case 2 & 3: Render Product lists
        let filtered = [];
        if (selectedMaker !== null) {
            const backBtn = document.createElement('div');
            backBtn.className = 'vcd-ref-back';
            backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 뒤로 가기 (${selectedMaker})`;
            backBtn.addEventListener('click', () => {
                selectedMaker = null;
                selectedPattern = null;
                const searchInput = document.getElementById('vcd-ref-search');
                if (searchInput) searchInput.value = '';
                renderReferenceList();
            });
            listContainer.appendChild(backBtn);

            filtered = refs.filter(ref => ref.maker === selectedMaker);
            if (query) {
                filtered = filtered.filter(ref => {
                    return ref.pattern.toLowerCase().includes(query) || 
                           ref.size.toLowerCase().includes(query);
                });
            }
        } else {
            filtered = refs.filter(ref => {
                return ref.maker.toLowerCase().includes(query) || 
                       ref.pattern.toLowerCase().includes(query) || 
                       ref.size.toLowerCase().includes(query);
            });
        }

        if (filtered.length === 0) {
            listContainer.innerHTML += `<div class="loading-spinner"><i class="fa-solid fa-circle-exclamation"></i> 검색 결과가 없습니다.</div>`;
            return;
        }

        // Selection Handler
        function handleSelection(ref) {
            if (selectedReferenceId === ref.id) {
                selectedReferenceId = null;
                selectedReferenceData = null;
                window.showToast("비교 기준 컴파운드 지정이 해제되었습니다.");
            } else {
                selectedReferenceId = ref.id;
                selectedReferenceData = ref;
                window.showToast(`기준 컴파운드로 지정되었습니다: ${ref.maker} ${ref.pattern}`);
            }

            document.querySelectorAll('#vcd-ref-list .vcd-ref-card').forEach(card => {
                card.classList.remove('active');
            });

            if (selectedReferenceId) {
                const activeCard = document.querySelector(`#vcd-ref-list .vcd-ref-card[data-id="${selectedReferenceId}"]`);
                if (activeCard) activeCard.classList.add('active');
            }

            // Sync chart
            if (chart) {
                const activeBaseCurve = getActiveBaseCurve();
                chart.data.datasets[0].data = activeBaseCurve.map(p => p.tan_delta);
                
                if (selectedReferenceId) {
                    chart.data.datasets[0].label = `${ref.pattern} (${ref.maker})`;
                    
                    const legendBaseName = document.getElementById('chart-legend-ref-name');
                    const legendBase = document.getElementById('chart-legend-ref');
                    if (legendBaseName && legendBase) {
                        legendBaseName.textContent = `${ref.pattern} (${ref.maker})`;
                        legendBase.style.display = 'inline-flex';
                    }
                } else {
                    chart.data.datasets[0].label = 'Base Compound';
                    const legendBase = document.getElementById('chart-legend-ref');
                    if (legendBase) legendBase.style.display = 'none';
                }
                chart.update();
            }

            updateInsights(getActiveBaseCurve(), simulatedCurve, getActiveBaseTg(), simulatedTg);
        }

        // Group filtered references by Pattern
        const groups = {};
        filtered.forEach(ref => {
            const key = `${ref.maker}||${ref.pattern}`;
            if (!groups[key]) {
                groups[key] = {
                    maker: ref.maker,
                    pattern: ref.pattern,
                    items: []
                };
            }
            groups[key].items.push(ref);
        });

        // Render grouped patterns
        Object.values(groups).forEach(group => {
            const item = document.createElement('div');
            const hasActiveItem = group.items.some(ref => selectedReferenceId === ref.id);
            item.className = `vcd-ref-card ${hasActiveItem ? 'active' : ''}`;
            if (hasActiveItem) {
                item.setAttribute('data-id', selectedReferenceId);
            }

            item.innerHTML = `
                <div style="display: flex; flex-direction: column; width: 100%;">
                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">${group.maker}</span>
                    <span class="ref-pattern" style="margin-top: 2px;">${getCleanDisplayPattern(group.pattern, group.maker)}</span>
                    <span style="font-size: 10px; color: var(--text-muted); font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-layer-group"></i> ${group.items.length}개 규격 보유
                    </span>
                </div>
            `;

            item.addEventListener('click', () => {
                selectedPattern = `${group.maker}||${group.pattern}`;
                renderReferenceList(filterText);
            });

            listContainer.appendChild(item);
        });
    }

    // Setup AI Advisor Panel Click Handler
    function setupAIAdvisor() {
        const btnRun = document.getElementById('btn-run-ai-advisor');
        const btnApply = document.getElementById('btn-apply-ai-recipe');
        const contentEl = document.getElementById('ai-advisor-content');
        if (!btnRun || !contentEl) return;

        let pendingOptimizedRecipe = null;

        btnRun.addEventListener('click', async () => {
            if (!selectedReferenceId || !selectedReferenceData) {
                window.showToast("Benchmark(Reference) 컴파운드를 목록에서 먼저 선택해 주세요.");
                return;
            }

            if (btnApply) {
                btnApply.style.display = 'none';
            }

            contentEl.className = 'ai-advisor-content';
            contentEl.innerHTML = `
                <div class="loading-spinner">
                    <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem;"></i>
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; margin-top: 10px;">
                        <strong style="color: var(--text-dark); font-size: 1rem;">AI formulation Advisor 분석 진행 중...</strong>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">현재 설계된 가상 처방 배합량(PHR)과 벤치마크 대상 간의 점탄성 격차 및 화학 최적화 솔루션을 탐색하고 있습니다.</span>
                    </div>
                </div>
            `;
            btnRun.disabled = true;

            try {
                let response;
                const payload = {
                    recipe: currentRecipe,
                    simulated_scores: {
                        wear: currentWearSim,
                        wet: currentWetSim,
                        rr: currentRRSim
                    },
                    reference_scores: {
                        wear: currentWearRef,
                        wet: currentWetRef,
                        rr: currentRRRef
                    },
                    simulated_tg: simulatedTg,
                    reference_tg: getActiveBaseTg(),
                    reference_name: `${selectedReferenceData.pattern} (${selectedReferenceData.maker})`,
                    distribution_bounds: distributionBounds
                };

                try {
                    response = await fetch(API_ADVISOR, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) throw new Error("AI Advisor request failed");
                } catch (advisorError) {
                    // If local connection fails, fallback to production Render backend dynamically
                    if (API_BASE !== FALLBACK_API_BASE) {
                        console.warn(`Local AI Advisor API call failed. Retrying with fallback production server...`);
                        API_BASE = FALLBACK_API_BASE;
                        API_SPEC = `${API_BASE}/api/data-spec`;
                        API_PREDICT = `${API_BASE}/api/predict`;
                        API_ADVISOR = `${API_BASE}/api/ai-advisor`;

                        response = await fetch(API_ADVISOR, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        if (!response.ok) throw new Error("AI Advisor request failed on fallback production server");

                        setTimeout(() => {
                            if (window.showToast) {
                                window.showToast("로컬 백엔드 응답 장애로 실서버(Render) 최적화 엔진으로 우회 연결되었습니다.");
                            }
                        }, 1000);
                    } else {
                        throw advisorError;
                    }
                }

                const res = await response.json();
                
                contentEl.className = 'ai-advisor-content';
                contentEl.innerHTML = `<div class="ai-report-render" style="line-height: 1.6; color: var(--text-primary); font-size: 0.85rem;">${parseMarkdownToHTML(res.report)}</div>`;
                
                pendingOptimizedRecipe = res.optimized_recipe;
                if (btnApply && pendingOptimizedRecipe && Object.keys(pendingOptimizedRecipe).length > 0) {
                    btnApply.style.display = 'flex';
                }

                window.showToast("AI 최적화 분석 설계 리포트가 도출되었습니다.");
            } catch (error) {
                console.error("AI Advisor error:", error);
                contentEl.className = 'ai-advisor-content empty';
                contentEl.innerHTML = `
                    <div class="ai-placeholder-view" style="color: var(--danger);">
                        <i class="fa-solid fa-circle-exclamation placeholder-icon" style="color: var(--danger);"></i>
                        <p class="placeholder-text">AI 가이드 엔진 진단에 실패했습니다. 파이썬 FastAPI 백엔드 포트(8000) 통신 상태를 점검해 주십시오.</p>
                    </div>
                `;
                window.showToast("AI 최적화 처방 도출 중 서버 통신 에러가 발생했습니다.");
            } finally {
                btnRun.disabled = false;
            }
        });

        if (btnApply) {
            if (!document.getElementById('ai-candidates-style')) {
                const style = document.createElement('style');
                style.id = 'ai-candidates-style';
                style.textContent = `
                    .ai-candidate-card:hover {
                        transform: translateY(-6px);
                        border-color: var(--cand-color) !important;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 0 20px var(--cand-glow) !important;
                        background: #ffffff !important;
                    }
                    .candidate-select-btn:hover {
                        transform: translateY(-2px) scale(1.02);
                        filter: brightness(1.15);
                    }
                    .candidate-select-btn:active {
                        transform: translateY(0) scale(0.98);
                    }
                `;
                document.head.appendChild(style);
            }

            const closeModal = () => {
                const modal = document.getElementById('ai-candidates-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            };

            const btnCloseModal = document.getElementById('btn-close-ai-modal');
            const btnCancelModal = document.getElementById('btn-cancel-ai-modal');
            if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
            if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

            btnApply.addEventListener('click', () => {
                if (!pendingOptimizedRecipe || Object.keys(pendingOptimizedRecipe).length === 0) {
                    window.showToast("적용할 AI 레시피 시나리오 데이터가 부재합니다.");
                    return;
                }

                const modal = document.getElementById('ai-candidates-modal');
                const listContainer = document.getElementById('ai-candidates-list');
                
                if (!modal || !listContainer) {
                    console.error("AI Candidates Modal components not found in HTML.");
                    return;
                }

                listContainer.innerHTML = '';
                
                for (const optionKey in pendingOptimizedRecipe) {
                    if (pendingOptimizedRecipe.hasOwnProperty(optionKey)) {
                        const cand = pendingOptimizedRecipe[optionKey];
                        
                        if (cand.expected_metrics) {
                            cand.expected_scores = {
                                wear: getScore(cand.expected_metrics.tg, distributionBounds.wear, true),
                                wet: getScore(cand.expected_metrics.tand0, distributionBounds.wet, false),
                                rr: getScore(cand.expected_metrics.tand60, distributionBounds.rr, true)
                            };
                        }
                        
                        const wearScoreVal = cand.expected_scores ? cand.expected_scores.wear : (cand.prediction ? cand.prediction.wearScore : 50);
                        const wetScoreVal = cand.expected_scores ? cand.expected_scores.wet : (cand.prediction ? cand.prediction.wetScore : 50);
                        const rrScoreVal = cand.expected_scores ? cand.expected_scores.rr : (cand.prediction ? cand.prediction.rrScore : 50);

                        const wearDiff = wearScoreVal - currentWearSim;
                        const wetDiff = wetScoreVal - currentWetSim;
                        const rrDiff = rrScoreVal - currentRRSim;

                        let colorGradient = "linear-gradient(145deg, #ffffff 0%, #fbfcfe 100%)";
                        let colorAccent = "#a855f7"; // purple
                        let colorGlow = "rgba(168, 85, 247, 0.12)";
                        let badgeLabel = "Low-Risk 안정";
                        
                        if (optionKey === 'B') {
                            colorAccent = "#3b82f6"; // blue
                            colorGlow = "rgba(59, 130, 246, 0.12)";
                            badgeLabel = "Balanced 밸런스";
                        } else if (optionKey === 'C') {
                            colorAccent = "#10b981"; // green
                            colorGlow = "rgba(16, 185, 129, 0.12)";
                            badgeLabel = "Aggressive 고성능";
                        }

                        const getTrendLabel = (diff) => {
                            if (diff >= 8) return "대폭 개선";
                            if (diff >= 3) return "개선";
                            if (diff >= 0) return "소폭 조율";
                            return "성능 상쇄";
                        };

                        const getTrendColor = (diff) => {
                            if (diff >= 8) return "#059669";
                            if (diff >= 3) return "#2563eb";
                            if (diff >= 0) return "#475569";
                            return "#dc2626";
                        };

                        const getTrendBg = (diff) => {
                            if (diff >= 8) return "rgba(16, 185, 129, 0.08)";
                            if (diff >= 3) return "rgba(59, 130, 246, 0.08)";
                            if (diff >= 0) return "rgba(100, 116, 139, 0.05)";
                            return "rgba(239, 68, 68, 0.08)";
                        };

                        const recipeChangesList = cand.recipeChanges || [];
                        const rawMaterialsInvolved = recipeChangesList.map(c => {
                            const type = c.materialType || '';
                            if (type.includes('SBR')) return 'SBR';
                            if (type.includes('BR')) return 'BR';
                            if (type.includes('NR')) return 'NR';
                            if (type.includes('SILICA')) return 'Silica';
                            if (type.includes('CARBON_BLACK') || type.includes('FILLER_RECYCLED')) return 'Carbon Black';
                            if (type.includes('SILANE')) return 'Silane';
                            if (type.includes('OIL')) return 'Oil';
                            if (type.includes('RESIN')) return 'Resin';
                            if (type.includes('SULFUR')) return 'Sulfur';
                            if (type.includes('ACCELERATOR')) return 'Accelerator';
                            return '기타';
                        });
                        const uniqueMaterialsInvolved = Array.from(new Set(rawMaterialsInvolved)).filter(x => x).join(', ') || '없음';

                        const riskItems = cand.risks || [];
                        const risksHtml = riskItems.map(r => `
                            <li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px; font-size: 11px; line-height: 1.4; color: #475569;">
                                <i class="fa-solid fa-triangle-exclamation" style="color: var(--primary); margin-top: 3px; flex-shrink: 0;"></i>
                                <span>${r}</span>
                            </li>
                        `).join('') || `
                            <li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px; font-size: 11px; line-height: 1.4; color: #475569;">
                                <i class="fa-solid fa-circle-check" style="color: var(--accent-green); margin-top: 3px; flex-shrink: 0;"></i>
                                <span>특이 리스크가 식별되지 않은 안정 영역 처방입니다.</span>
                            </li>
                        `;

                        let tuningGuideHtml = '';
                        if (recipeChangesList.length > 0) {
                            tuningGuideHtml = recipeChangesList.map(c => {
                                const sign = c.deltaPhr >= 0 ? '+' : '';
                                const color = c.deltaPhr >= 0 ? '#10b981' : '#ef4444';
                                return `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.04); border-radius: 4px; margin-bottom: 4px; font-size: 0.75rem;">
                                        <span style="color: #1e293b; font-weight: 500;">
                                            ${c.materialName} 
                                        </span>
                                        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; color: ${color};">
                                            ${sign}${c.deltaPhr.toFixed(2)} phr
                                        </span>
                                    </div>
                                `;
                            }).join('');
                        } else {
                            tuningGuideHtml = '<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 6px;">변경 배합 없음</div>';
                        }

                        const card = document.createElement('div');
                        card.className = 'ai-candidate-card';
                        card.style = `background: #ffffff; border: 1px solid rgba(249, 115, 22, 0.08); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden; --cand-color: ${colorAccent}; --cand-glow: ${colorGlow}; box-shadow: 0 4px 15px rgba(0,0,0,0.02);`;
                        
                        card.innerHTML = `
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: ${colorAccent};"></div>
                            <div style="display: flex; flex-direction: column; gap: 12px; justify-content: space-between; height: 100%;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${colorAccent}; background: ${colorGlow}; padding: 2px 6px; border-radius: 12px;">${badgeLabel}</span>
                                        <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">시나리오 ${optionKey}</span>
                                    </div>
                                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0; font-family: 'Outfit', sans-serif; line-height: 1.3;">${cand.title}</h4>
                                    <p style="font-size: 11px; color: var(--text-muted); line-height: 1.45; margin: 0;">${cand.description}</p>
                                </div>

                                <div style="background: rgba(0, 0, 0, 0.02); border-left: 3px solid ${colorAccent}; padding: 6px 10px; border-radius: 0 4px 4px 0;">
                                    <div style="font-size: 10px; font-weight: 700; color: ${colorAccent}; text-transform: uppercase; margin-bottom: 2px;">배합 조율 방향</div>
                                    <div style="font-size: 11.5px; color: #334155; line-height: 1.4;">${cand.rationale || '성능 지표 보정을 설계합니다.'}</div>
                                </div>

                                <div style="background: rgba(0,0,0,0.01); border-radius: 6px; padding: 8px; border: 1px solid rgba(0,0,0,0.03);">
                                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">핵심 원료계</div>
                                    <div style="font-size: 11px; color: var(--text-dark); font-weight: 600;">${uniqueMaterialsInvolved}</div>
                                </div>

                                <div style="background: rgba(0,0,0,0.01); border-radius: 6px; padding: 8px; border: 1px solid rgba(0,0,0,0.03);">
                                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">상세 PHR 가이드</div>
                                    <div style="max-height: 80px; overflow-y: auto;">
                                        ${tuningGuideHtml}
                                    </div>
                                </div>

                                <div style="background: rgba(0,0,0,0.02); border-radius: 8px; padding: 10px; border: 1px solid rgba(0,0,0,0.03);">
                                    <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 2px;">예상 물성 피드백</div>
                                    
                                    <!-- Wear -->
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11.5px;">
                                        <span style="color: var(--text-dark); font-weight: 500;">내마모</span>
                                        <div style="display: flex; align-items: center; gap: 4px;">
                                            <span style="font-weight: 700; font-family: 'Outfit';">${wearScoreVal}</span>
                                            <span style="font-size: 9.5px; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: ${getTrendBg(wearDiff)}; color: ${getTrendColor(wearDiff)};">
                                                ${wearDiff >= 0 ? '+' : ''}${wearDiff}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- Wet -->
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11.5px;">
                                        <span style="color: var(--text-dark); font-weight: 500;">Wet 제동</span>
                                        <div style="display: flex; align-items: center; gap: 4px;">
                                            <span style="font-weight: 700; font-family: 'Outfit';">${wetScoreVal}</span>
                                            <span style="font-size: 9.5px; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: ${getTrendBg(wetDiff)}; color: ${getTrendColor(wetDiff)};">
                                                ${wetDiff >= 0 ? '+' : ''}${wetDiff}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- RR -->
                                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;">
                                        <span style="color: var(--text-dark); font-weight: 500;">회전저항 (연비)</span>
                                        <div style="display: flex; align-items: center; gap: 4px;">
                                            <span style="font-weight: 700; font-family: 'Outfit';">${rrScoreVal}</span>
                                            <span style="font-size: 9.5px; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: ${getTrendBg(rrDiff)}; color: ${getTrendColor(rrDiff)};">
                                                ${rrDiff >= 0 ? '+' : ''}${rrDiff}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style="background: rgba(249,115,22,0.03); border: 1px solid rgba(249,115,22,0.08); border-radius: 6px; padding: 8px;">
                                    <div style="font-size: 10px; font-weight: 700; color: var(--primary); margin-bottom: 4px;">검토 고려사항</div>
                                    <ul style="margin: 0; padding: 0; list-style: none;">
                                        ${risksHtml}
                                    </ul>
                                </div>

                                <button class="candidate-select-btn" data-candidate="${optionKey}" style="width: 100%; border: none; padding: 8px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; background: ${colorAccent}; color: #ffffff; transition: all 0.2s;">
                                    <i class="fa-solid fa-circle-check"></i> 이 최적 배합 처방 적용
                                </button>
                            </div>
                        `;

                        const selectBtn = card.querySelector('.candidate-select-btn');
                        selectBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            
                            const chosenKey = selectBtn.getAttribute('data-candidate');
                            const chosenCandidate = pendingOptimizedRecipe[chosenKey];
                            const chosenRecipe = chosenCandidate.recipe;

                            currentRecipe = { ...chosenRecipe };

                            materials.forEach(m => {
                                const input = document.getElementById(`slider-${m.CODE}`);
                                const valBox = document.getElementById(`val-${m.CODE}`);
                                const group = document.getElementById(`group-${m.CODE}`);
                                const targetVal = currentRecipe[m.CODE] !== undefined ? currentRecipe[m.CODE] : m.mean_phr;
                                
                                if (input) {
                                    input.value = parseFloat(targetVal);
                                }
                                if (valBox) {
                                    valBox.textContent = parseFloat(targetVal).toFixed(2);
                                }
                                
                                const baseVal = baseRecipe[m.CODE] !== undefined ? baseRecipe[m.CODE] : m.mean_phr;
                                if (Math.abs(parseFloat(targetVal) - baseVal) > 0.01) {
                                    if (group) group.classList.add('changed');
                                } else {
                                    if (group) group.classList.remove('changed');
                                }
                            });

                            updatePolymerConstraintStatus();
                            triggerSimulation();

                            window.showToast(`${chosenCandidate.title} 처방안이 가상 배합 시뮬레이터에 정상 연동되었습니다.`);
                            closeModal();

                            const recipePanel = document.querySelector('.recipe-panel');
                            if (recipePanel) {
                                recipePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        });

                        card.addEventListener('click', () => {
                            selectBtn.click();
                        });

                        listContainer.appendChild(card);
                    }
                }

                modal.style.display = 'flex';
            });
        }
    }

    // Lightweight markdown parser helper
    function parseMarkdownToHTML(md) {
        if (!md) return "";
        let html = md;
        
        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html = html.replace(/^\s*&gt;\s*💡\s*(.*?)$/gm, '<blockquote style="border-left: 3px solid var(--primary); padding-left: 10px; color: var(--text-primary); margin: 8px 0; background: rgba(249,115,22,0.04); padding: 8px 12px; border-radius: 4px;">💡 $1</blockquote>');
        html = html.replace(/^\s*&gt;\s*(.*?)$/gm, '<blockquote style="border-left: 3px solid var(--primary); padding-left: 10px; color: var(--text-primary); margin: 8px 0; background: rgba(249,115,22,0.04); padding: 8px 12px; border-radius: 4px;">$1</blockquote>');

        html = html.replace(/^# (.*?)$/gm, '<h1 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 16px 0 8px;">$1</h1>');
        html = html.replace(/^## (.*?)$/gm, '<h2 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--text-dark); margin: 14px 0 6px; border-bottom: 1px solid rgba(249,115,22,0.08); padding-bottom: 4px;">$1</h2>');
        html = html.replace(/^### (.*?)$/gm, '<h3 style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin: 12px 0 4px;">$1</h3>');

        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-dark); font-weight: 700;">$1</strong>');

        html = html.replace(/^\s*[\-\*]\s*(.*?)$/gm, '<li style="margin-left: 16px; margin-bottom: 4px; list-style-type: disc;">$1</li>');
        
        let lines = html.split('\n');
        let inList = false;
        for (let i = 0; i < lines.length; i++) {
            let trimLine = lines[i].trim();
            if (trimLine.startsWith('<li') || trimLine.endsWith('</li>')) {
                if (!inList) {
                    lines[i] = '<ul style="margin: 8px 0; padding-left: 12px;">' + lines[i];
                    inList = true;
                }
            } else {
                if (inList) {
                    lines[i - 1] = lines[i - 1] + '</ul>';
                    inList = false;
                }
            }
        }
        if (inList) {
            lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
        }
        html = lines.join('\n');

        html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 1px dashed rgba(249,115,22,0.12); margin: 14px 0;">');

        lines = html.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line && 
                !line.startsWith('<h') && 
                !line.startsWith('<ul') && 
                !line.startsWith('<li') && 
                !line.startsWith('</li') && 
                !line.startsWith('</ul') && 
                !line.startsWith('<block') && 
                !line.startsWith('</block') && 
                !line.startsWith('<hr') &&
                !line.startsWith('<div') &&
                !line.startsWith('</div')) {
                lines[i] = `<p style="margin-bottom: 8px; line-height: 1.5; color: var(--text-primary);">${line}</p>`;
            }
        }
        html = lines.join('\n');

        return html;
    }
})();
