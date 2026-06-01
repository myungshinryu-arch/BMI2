/**
 * Compound BM Report - 패턴별 평균 비교기 모듈 (AverageCompare)
 * 
 * 기능:
 * 1. 동일 제조사(Maker)와 패턴(Pattern)을 가진 원본들의 다차원 평균 연산
 * 2. 비교 대상 다중 패턴(최대 4개) 선택 및 검색 핸들링
 * 3. 기준 모델(Base Line) 지정에 따른 실시간 배합/물성 편차 및 변동률 계산
 * 4. Chart.js를 연동한 Radar 차트, Blend 스택 바 차트, Filler 및 가류제 분석 차트 드로잉
 * 5. 마모, 저온/눈길, 젖은 노면 성능에 대한 물리 화학적 진단 배지 및 엔지니어 처방 출력
 */

window.AverageCompare = (function() {
  // 요약 12대 점탄성 물성 정의 스펙
  const viscoKeys = [
    { label: "Tg_peak temp. (유리전이온도, ℃)", keys: ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg", "ARES Tg_peak temp. (℃)", "Dynamic Tg"], id: "tg", isTg: true, decimals: 1, reverseColor: true },
    { label: "-40 / -30 / -20 / -10℃ G’ (E+07)", keys: ["-40 / -30 / -20 / -10℃ G’ (E+07)", "-40 / -30 / -20 / -10C G'", "ARES"], id: "g_minus_sub", decimals: 1 },
    { label: "G’ Avg. / G* @ -15℃ (E+07)", keys: ["G’ Avg. / G* @ -15℃ (E+07)", "G' Avg. / G* @ -15C"], id: "g_avg_minus15", decimals: 1 },
    { label: "-10℃ Loss Tangent (-10℃ tanδ)", keys: ["-10℃ tanδ", "-10C tanδ"], id: "tand_minus10", decimals: 4 },
    { label: "0℃ Loss Modulus (G” @ 0℃, E+06)", keys: ["G” @ 0℃ (E+06)", "G” @ 0C", "G” @ 0℃", "G'' @ 0℃", "Wet"], id: "g2_0", decimals: 2 },
    { label: "Def. Index (G”÷G*0.8 @ 0℃)", keys: ["Def. Index (G”÷G*0.8 @ 0℃)", "Def. Index", "Def. Index (G\"÷G*0.8 @ 0℃)", "Def. Index (G”÷G*1 @ 0℃)"], id: "def_index", decimals: 3 },
    { label: "tanδ @ 0℃ ÷ tanδ @ 20℃ (그립 밸런스비)", keys: ["tanδ @ 0℃ ÷ tanδ @ 20℃", "tanδ @ 0C ÷ tanδ @ 20C"], id: "grip_balance", decimals: 3 },
    { label: "0℃ Loss Tangent (0℃ tanδ)", keys: ["tan δ @ 0℃", "0℃ tanδ", "0C tanδ", "tanδ @ 0℃"], id: "tand0", decimals: 4 },
    { label: "G” (E+06) / G* (E+07) @ 30℃", keys: ["G” (E+06) / G* (E+07) @ 30℃", "G” / G* @ 30C", "G\" (E+06) / G* (E+07) @ 30℃", "Dry"], id: "g2_gstar_30", decimals: 2 },
    { label: "0℃ Dynamic Stiffness (G* @ 0℃, E+07)", keys: ["G* (E+07) @ 0℃", "G* @ 0C", "G* @ 0℃"], id: "gstar_0", decimals: 2 },
    { label: "tanδ @ 25℃ / 30℃ (상온 점탄성)", keys: ["tanδ @ 25℃ / 30℃", "tanδ @ 25C / 30C"], id: "tand_25_30", decimals: 4 },
    { label: "60℃ Loss Tangent (60℃ tanδ)", keys: ["tanδ @ 60℃", "tanδ @ 60C", "tan δ @ 60℃", "60", "RR"], id: "tand60", decimals: 4, reverseColor: true }
  ];

  // 모듈 내부 상태 관리
  const state = {
    selectedPatterns: [], // { maker, pattern, avgData, id }
    basePatternId: null,  // 기준 모델의 고유 ID (maker + '||' + pattern)
    uniquePatterns: [],   // 현재 데이터 소스 기준 중복 제거된 제조사-패턴 리스트
    activeCompareChartMode: 'tand', // 기본 활성 탭
    charts: {
      polymer: null,
      radar: null,
      fillers: null,
      aresCurve: null     // ARES Full Curve 차트 추가
    }
  };

  // 1. 초기화 메서드
  function init() {
    loadUniquePatterns();
    populateMakerDropdown();
    bindEvents();
    bindCompareViscoModeTabs();
    renderPatternList();
    updateUI();
  }

  // 2. 이벤트 리스너 바인딩
  function bindEvents() {
    const searchInput = document.getElementById('compare-pattern-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderPatternList();
      });
    }

    const makerSelect = document.getElementById('compare-maker-select');
    if (makerSelect) {
      makerSelect.addEventListener('change', () => {
        renderPatternList();
      });
    }
  }

  // Maker 비교 ARES Full Curve 탭 바인딩 신설
  function bindCompareViscoModeTabs() {
    const tabs = document.querySelectorAll('.compare-visco-mode-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const selectedMode = e.target.getAttribute('data-mode');
        if (selectedMode === state.activeCompareChartMode) return;

        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        state.activeCompareChartMode = selectedMode;

        // Re-render ARES full curve chart
        updateCompareAresChart();
      });
    });
  }

  // 제조사 선택 드롭다운 채우기 (Michelin, Continental, Goodyear, Hankook 상단 고정 방식)
  function populateMakerDropdown() {
    const select = document.getElementById('compare-maker-select');
    if (!select) return;

    select.innerHTML = '<option value="">전체 제조사 (All Makers)</option>';

    // uniquePatterns에서 제조사들 중복 제거하여 추출
    const makers = Array.from(new Set(state.uniquePatterns.map(p => p.maker)));
    
    // 글로벌 커스텀 정렬 적용
    const sortedMakers = typeof window.sortMakersCustom === 'function' 
      ? window.sortMakersCustom(makers) 
      : makers.sort();

    sortedMakers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
  }

  // 3. 데이터 소스 변경 시 호출되는 핸들러 (app.js 연동)
  function onSourceChange() {
    state.selectedPatterns = [];
    state.basePatternId = null;
    destroyCharts();
    loadUniquePatterns();
    populateMakerDropdown();
    
    const searchInput = document.getElementById('compare-pattern-search');
    if (searchInput) searchInput.value = '';

    const makerSelect = document.getElementById('compare-maker-select');
    if (makerSelect) makerSelect.value = '';
    
    renderPatternList();
    updateUI();
  }

  // 4. 중복 제거된 제조사-패턴 목록 추출 및 평균 데이터 연산
  function loadUniquePatterns() {
    const sourceData = window.appState.allData[window.appState.currentSource] || [];
    const groups = {};

    sourceData.forEach(item => {
      const maker = (window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || '').toString().trim();
      const pattern = (window.appState.getProp(item, ['Pattern']) || '').toString().trim();
      
      if (!maker || !pattern || maker === 'N/A' || pattern === 'N/A') return;

      const key = `${maker}||${pattern}`;
      if (!groups[key]) {
        groups[key] = {
          maker: maker,
          pattern: pattern,
          items: []
        };
      }
      groups[key].items.push(item);
    });

    // 각 그룹별 산술 평균 정밀 계산
    state.uniquePatterns = Object.keys(groups).map(key => {
      const group = groups[key];
      const avg = computeAverage(group.items);
      return {
        id: key,
        maker: group.maker,
        pattern: group.pattern,
        count: group.items.length,
        avgData: avg
      };
    }).sort((a, b) => {
      // 제조사순 커스텀 정렬 적용 후 패턴순 정렬
      if (a.maker !== b.maker) {
        const sorted = window.sortMakersCustom([a.maker, b.maker]);
        return sorted[0] === a.maker ? -1 : 1;
      }
      return a.pattern.localeCompare(b.pattern, 'ko', { sensitivity: 'base' });
    });
  }

  // 슬래시(/) 구분 함량 텍스트 파싱 헬퍼
  function parseBlend(valStr, expectedCount) {
    if (!valStr || valStr === '-') return Array(expectedCount).fill(0);
    const parts = valStr.toString().split('/').map(p => {
      const num = parseFloat(p.trim());
      return isNaN(num) ? 0 : num;
    });
    while (parts.length < expectedCount) parts.push(0);
    return parts.slice(0, expectedCount);
  }

  // 복합 슬래시(/) 수치를 개별 숫자로 파싱하여 배열로 생성하는 헬퍼
  function parseSlashValueToNumbers(val) {
    if (val === undefined || val === null || val === "" || val === "-") return [];
    return val.toString().split('/').map(p => {
      const num = parseFloat(p.trim());
      return isNaN(num) ? null : num;
    });
  }

  // 데이터의 출력 형태를 포맷팅하는 헬퍼 (배열도 자동 대응)
  function formatValue(val, decimals = 2) {
    if (val === null || val === undefined) return '-';
    if (Array.isArray(val)) {
      return val.map(v => v !== null && v !== undefined ? v.toFixed(decimals) : '-').join(' / ');
    }
    const num = parseFloat(val);
    return isNaN(num) ? val : num.toFixed(decimals);
  }

  // 단일 물성 파싱 및 누적 헬퍼
  function addNumericProp(sumObj, countObj, item, propKeys, stateKey) {
    const raw = window.appState.getProp(item, propKeys);
    if (raw !== undefined && raw !== null) {
      const val = parseFloat(raw);
      if (!isNaN(val)) {
        sumObj[stateKey] = (sumObj[stateKey] || 0) + val;
        countObj[stateKey] = (countObj[stateKey] || 0) + 1;
      }
    }
  }

  // 소그룹 내 품목들의 평균 물성 산출
  function computeAverage(items) {
    const sums = {};
    const counts = {};
    
    // 블렌딩 비율 및 필터 함량을 위한 누적 변수
    let polymerSums = [0, 0, 0]; // NR, SBR, BR
    let polymerCounts = [0, 0, 0];
    let fillerSums = [0, 0]; // CB, Silica
    let fillerCounts = [0, 0];

    // ARES Sweep 온도 세트 정의 (-60℃ ~ 60℃, 5도 간격)
    const temperatures = [
      -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
    ];
    const tempSums = {};
    const tempCounts = {};
    temperatures.forEach(t => {
      tempSums[t] = 0;
      tempCounts[t] = 0;
    });

    // 12대 점탄성 지표 누적을 위한 구조 초기화
    const viscoAccumulators = {};
    viscoKeys.forEach(vKey => {
      viscoAccumulators[vKey.id] = {
        sums: [],
        counts: []
      };
    });

    items.forEach(item => {
      // 1) 고무 블렌드 파싱 (GC 우선, 없으면 NMR)
      const rawPolyStr = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR', 'NR/SBR/BR']);
      if (rawPolyStr && rawPolyStr !== '-') {
        const polyVals = parseBlend(rawPolyStr, 3);
        polyVals.forEach((val, i) => {
          polymerSums[i] += val;
          polymerCounts[i]++;
        });
      }

      // 2) CB/Silica 보강제 함량 파싱
      const rawFillerStr = window.appState.getProp(item, ['Carbon Black / Silica (phr)', 'Carbon Black / Silica']);
      if (rawFillerStr && rawFillerStr !== '-') {
        const fillerVals = parseBlend(rawFillerStr, 2);
        fillerVals.forEach((val, i) => {
          fillerSums[i] += val;
          fillerCounts[i]++;
        });
      }

      // 3) 단일 수치형 물성 파싱
      addNumericProp(sums, counts, item, ['Hardness', 'Hardness '], 'hardness');
      addNumericProp(sums, counts, item, ['Modulus 100% (MPa)', 'M100', 'Modulus 100%'], 'm100');
      addNumericProp(sums, counts, item, ['Modulus 300% (MPa)', 'M300', 'Modulus 300%'], 'm300');
      addNumericProp(sums, counts, item, ['Tensile Strength (인장강도, MPa)', 'Tensile Strength', 'TS'], 'ts');
      addNumericProp(sums, counts, item, ['Elongation (신율, %)', 'Elongation'], 'elongation');
      
      addNumericProp(sums, counts, item, ['ZnO', 'ZnO (phr)'], 'zno');
      addNumericProp(sums, counts, item, ['Sulfur', 'Sulfur (phr)'], 'sulfur');

      // 4) 12대 점탄성 지표 누적 계산
      viscoKeys.forEach(vKey => {
        const rawVal = window.appState.getProp(item, vKey.keys);
        const nums = parseSlashValueToNumbers(rawVal);
        if (nums.length > 0) {
          const acc = viscoAccumulators[vKey.id];
          nums.forEach((num, i) => {
            if (num !== null && !isNaN(num)) {
              acc.sums[i] = (acc.sums[i] || 0) + num;
              acc.counts[i] = (acc.counts[i] || 0) + 1;
            }
          });
        }
      });

      // 5) ARES Sweep 온도별 tanδ 파싱 및 누적
      temperatures.forEach(temp => {
        let val = null;

        if (temp === 0) {
          val = parseFloat(window.appState.getProp(item, ['tan δ @ 0℃', '0℃ tanδ', '0C tanδ', 'tanδ @ 0℃'])) || null;
        } else {
          const rawVal = item[temp.toString()];
          val = rawVal !== undefined && rawVal !== null ? parseFloat(rawVal) : null;
          // Fallback + 부호 검색
          if (val === null && temp > 0) {
            const rawValPlus = item['+' + temp.toString()];
            val = rawValPlus !== undefined && rawValPlus !== null ? parseFloat(rawValPlus) : null;
          }
        }

        if (val !== null && !isNaN(val)) {
          tempSums[temp] += val;
          tempCounts[temp]++;
        }
      });
    });

    // 최종 산술 평균값 빌드
    const tempsAvg = {};
    temperatures.forEach(temp => {
      tempsAvg[temp] = tempCounts[temp] > 0 ? tempSums[temp] / tempCounts[temp] : null;
    });

    // 12대 점탄성 지표 평균 배열 빌드
    const viscoAvgs = {};
    viscoKeys.forEach(vKey => {
      const acc = viscoAccumulators[vKey.id];
      if (acc.sums.length === 0) {
        viscoAvgs[vKey.id] = null;
      } else {
        const avgs = acc.sums.map((sum, i) => {
          const count = acc.counts[i] || 0;
          return count > 0 ? sum / count : null;
        });
        if (avgs.every(v => v === null)) {
          viscoAvgs[vKey.id] = null;
        } else {
          viscoAvgs[vKey.id] = avgs;
        }
      }
    });

    const getSingleVal = (arr) => (Array.isArray(arr) && arr.length > 0) ? arr[0] : null;

    return {
      nr: polymerCounts[0] > 0 ? polymerSums[0] / polymerCounts[0] : 0,
      sbr: polymerCounts[1] > 0 ? polymerSums[1] / polymerCounts[1] : 0,
      br: polymerCounts[2] > 0 ? polymerSums[2] / polymerCounts[2] : 0,
      cb: fillerCounts[0] > 0 ? fillerSums[0] / fillerCounts[0] : 0,
      silica: fillerCounts[1] > 0 ? fillerSums[1] / fillerCounts[1] : 0,
      
      hardness: counts.hardness > 0 ? sums.hardness / counts.hardness : null,
      m100: counts.m100 > 0 ? sums.m100 / counts.m100 : null,
      m300: counts.m300 > 0 ? sums.m300 / counts.m300 : null,
      ts: counts.ts > 0 ? sums.ts / counts.ts : null,
      elongation: counts.elongation > 0 ? sums.elongation / counts.elongation : null,
      
      zno: counts.zno > 0 ? sums.zno / counts.zno : null,
      sulfur: counts.sulfur > 0 ? sums.sulfur / counts.sulfur : null,

      temps: tempsAvg,

      visco: viscoAvgs,

      // 기존 차트/진단 호환성 유지용 단일 프로퍼티 추출
      tg: getSingleVal(viscoAvgs.tg),
      g2_0: getSingleVal(viscoAvgs.g2_0),
      tand0: getSingleVal(viscoAvgs.tand0),
      tand60: getSingleVal(viscoAvgs.tand60)
    };
  }

  // 5. 왼쪽 패턴 선택 목록 렌더링
  function renderPatternList() {
    const listContainer = document.getElementById('compare-pattern-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    const searchInput = document.getElementById('compare-pattern-search');
    const makerSelect = document.getElementById('compare-maker-select');

    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedMaker = makerSelect ? makerSelect.value.trim() : '';

    const filtered = state.uniquePatterns.filter(p => {
      // 제조사 필터가 지정된 경우 대조
      if (selectedMaker && p.maker !== selectedMaker) {
        return false;
      }
      // 검색어가 입력된 경우 대소문자 무관하게 제조사명 또는 패턴명 포함 체크
      if (searchQuery) {
        return p.maker.toLowerCase().includes(searchQuery) || p.pattern.toLowerCase().includes(searchQuery);
      }
      return true;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">검색 결과가 없습니다.</div>`;
      return;
    }

    filtered.forEach(p => {
      const isSelected = state.selectedPatterns.some(sel => sel.id === p.id);
      
      const card = document.createElement('div');
      card.className = `compare-pattern-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-id', p.id);
      
      card.innerHTML = `
        <input type="checkbox" class="compare-pattern-checkbox" ${isSelected ? 'checked' : ''} style="pointer-events: none;">
        <div class="compare-card-info">
          <span class="compare-card-maker">${p.maker}</span>
          <span class="compare-card-pattern" title="${p.pattern}">${p.pattern}</span>
          <span class="compare-card-count"><i class="fa-solid fa-database"></i> 시료 ${p.count}개 평균</span>
        </div>
      `;

      card.addEventListener('click', () => handlePatternSelect(p));
      listContainer.appendChild(card);
    });
  }

  // 6. 패턴 클릭 및 다중 선택 상태 변경 처리
  function handlePatternSelect(patternObj) {
    const idx = state.selectedPatterns.findIndex(p => p.id === patternObj.id);
    
    if (idx > -1) {
      // 이미 선택되어 있으면 제거
      state.selectedPatterns.splice(idx, 1);
      // 제거된 패턴이 하필 기준 모델이었다면 기준 모델 상태 리셋
      if (state.basePatternId === patternObj.id) {
        state.basePatternId = state.selectedPatterns.length > 0 ? state.selectedPatterns[0].id : null;
      }
    } else {
      // 신규 선택
      if (state.selectedPatterns.length >= 4) {
        window.showToast("⚠️ 패턴 비교는 가시성과 완성도를 위해 최대 4개까지만 동시 선택 가능합니다.");
        return;
      }
      state.selectedPatterns.push(patternObj);
      // 최초 선택된 것이라면 기준으로 자동 설정
      if (!state.basePatternId) {
        state.basePatternId = patternObj.id;
      }
    }

    // 선택 개수 동적 갱신
    const countLabel = document.getElementById('compare-selected-count');
    if (countLabel) {
      countLabel.textContent = `선택됨: ${state.selectedPatterns.length} / 4 개`;
    }

    // 목록 UI 동적 갱신
    const cards = document.querySelectorAll('#compare-pattern-list .compare-pattern-card');
    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      const isSel = state.selectedPatterns.some(p => p.id === id);
      const chk = card.querySelector('.compare-pattern-checkbox');
      
      if (isSel) {
        card.classList.add('selected');
        if (chk) chk.checked = true;
      } else {
        card.classList.remove('selected');
        if (chk) chk.checked = false;
      }
    });

    updateUI();
  }

  // 7. 메인 대시보드 및 리포트 테이블 렌더링 총괄
  function updateUI() {
    const emptyState = document.getElementById('compare-empty-state');
    const activeState = document.getElementById('compare-active-state');
    
    if (state.selectedPatterns.length < 2) {
      if (emptyState) emptyState.style.display = 'flex';
      if (activeState) activeState.style.display = 'none';
      destroyCharts();
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (activeState) activeState.style.display = 'flex';

    // 기준 모델이 없거나 현재 선택군 바깥에 존재할 경우 첫 번째 항목으로 강제 고정
    const exists = state.selectedPatterns.some(p => p.id === state.basePatternId);
    if (!exists) {
      state.basePatternId = state.selectedPatterns[0].id;
    }

    renderBaseSelector();
    renderRecipeTable();
    renderPhysicalTable();
    renderSmartDiagnosis();
    
    // 차트 생성/업데이트
    setTimeout(() => {
      renderCharts();
    }, 100);
  }

  // 8. 기준 모델 라디오 셀렉터 렌더링
  function renderBaseSelector() {
    const container = document.getElementById('compare-base-options');
    if (!container) return;

    container.innerHTML = '';
    state.selectedPatterns.forEach(p => {
      const isBase = p.id === state.basePatternId;
      
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <input type="radio" name="compare-base" id="base-opt-${p.id}" class="base-radio-input" ${isBase ? 'checked' : ''}>
        <label for="base-opt-${p.id}" class="base-radio-label">
          <i class="fa-solid ${isBase ? 'fa-circle-dot' : 'fa-circle'}" style="${isBase ? 'color: var(--primary);' : ''}"></i>
          <span>[${p.maker}] ${p.pattern}</span>
        </label>
      `;

      wrapper.querySelector('input').addEventListener('change', () => {
        state.basePatternId = p.id;
        // 라디오 클릭 즉시 리포저 및 편차 그리드 갱신
        updateUI();
        window.showToast(`🎯 기준 모델이 [${p.maker} ${p.pattern}]으로 변경되었습니다.`);
      });

      container.appendChild(wrapper.firstElementChild);
      container.appendChild(wrapper.lastElementChild);
    });
  }

  // 편차 포맷팅 헬퍼 (배합제는 phr 편차 절대값, 물성은 % 비율 편차)
  function formatDiffPhr(val, baseVal) {
    if (val === null || baseVal === null) return '-';
    const diff = val - baseVal;
    if (Math.abs(diff) < 0.01) return `<span class="diff-equal">-</span>`;
    const sign = diff > 0 ? '+' : '';
    const className = diff > 0 ? 'diff-up' : 'diff-down';
    const arrow = diff > 0 ? '▲' : '▼';
    return `<span class="${className}">${sign}${diff.toFixed(1)} phr ${arrow}</span>`;
  }

  // 편차 포맷팅 헬퍼 (수치 절대 차이 대조 - 복합 배열 대응)
  function formatDiffAbsolute(val, baseVal, decimals = 2, reverseColor = false) {
    if (Array.isArray(val) && Array.isArray(baseVal)) {
      const results = [];
      const maxLength = Math.max(val.length, baseVal.length);
      for (let i = 0; i < maxLength; i++) {
        const v = val[i];
        const bv = baseVal[i];
        results.push(formatDiffAbsoluteSingle(v, bv, decimals, reverseColor));
      }
      return results.join(' <span style="color: var(--text-muted); font-size:0.75rem;">/</span> ');
    }
    return formatDiffAbsoluteSingle(val, baseVal, decimals, reverseColor);
  }

  function formatDiffAbsoluteSingle(val, baseVal, decimals = 2, reverseColor = false) {
    if (val === null || baseVal === null || val === undefined || baseVal === undefined) return '-';
    const diff = val - baseVal;
    if (Math.abs(diff) < 0.00001) return `<span class="diff-equal">-</span>`;
    
    const sign = diff > 0 ? '+' : '';
    let isBetter = diff > 0;
    if (reverseColor) {
      isBetter = diff < 0;
    }

    const className = isBetter ? 'diff-better' : 'diff-worse';
    const arrow = diff > 0 ? '▲' : '▼';
    return `<span class="${className}">${sign}${diff.toFixed(decimals)} ${arrow}</span>`;
  }

  // 9. 배합제 평균 함량 대조 테이블 렌더링
  function renderRecipeTable() {
    const table = document.getElementById('compare-recipe-table');
    if (!table) return;

    const basePattern = state.selectedPatterns.find(p => p.id === state.basePatternId);
    if (!basePattern) return;

    const cols = state.selectedPatterns;
    
    let html = `
      <thead>
        <tr>
          <th rowspan="2" class="cell-meta-key" style="vertical-align: middle;">배합 성분 분석 지표 (phr / %)</th>
          <th class="cell-part-title">[BASE] ${basePattern.maker}</th>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <th colspan="2" class="cell-part-title">${p.maker}<br><span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">${p.pattern}</span></th>
          `).join('')}
        </tr>
        <tr>
          <th>평균 함량 (Base)</th>
          ${cols.filter(p => p.id !== state.basePatternId).map(() => `
            <th>평균 함량</th>
            <th>기준 대비 편차 (phr)</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <!-- 고무 블렌드 세션 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-circle-nodes" style="margin-right: 8px;"></i> 고무 블렌드 비율 (Polymer Blend, %)
          </td>
        </tr>
        <tr>
          <td class="cell-meta-key">NR (천연고무, %)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.nr.toFixed(1)} %</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.nr.toFixed(1)} %</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.nr, basePattern.avgData.nr).replace('phr', '%')}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">SBR (합성고무, %)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.sbr.toFixed(1)} %</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.sbr.toFixed(1)} %</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.sbr, basePattern.avgData.sbr).replace('phr', '%')}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">BR (부타디엔, %)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.br.toFixed(1)} %</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.br.toFixed(1)} %</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.br, basePattern.avgData.br).replace('phr', '%')}</td>
          `).join('')}
        </tr>

        <!-- 보강제 세션 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-dumbbell" style="margin-right: 8px;"></i> 보강 충전제 배합량 (Filler, phr)
          </td>
        </tr>
        <tr>
          <td class="cell-meta-key">Silica (실리카) 함량</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.silica.toFixed(1)} phr</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.silica.toFixed(1)} phr</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.silica, basePattern.avgData.silica)}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">Carbon Black (카본블랙) 함량</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.cb.toFixed(1)} phr</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.cb.toFixed(1)} phr</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.cb, basePattern.avgData.cb)}</td>
          `).join('')}
        </tr>

        <!-- 가류제 세션 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-vial" style="margin-right: 8px;"></i> 가류 시스템 촉진제 (Cure System, phr)
          </td>
        </tr>
        <tr>
          <td class="cell-meta-key">ZnO (산화아연) 함량</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.zno !== null ? basePattern.avgData.zno.toFixed(2) + ' phr' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.zno !== null ? p.avgData.zno.toFixed(2) + ' phr' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.zno, basePattern.avgData.zno)}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">Sulfur (황) 함량</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.sulfur !== null ? basePattern.avgData.sulfur.toFixed(2) + ' phr' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.sulfur !== null ? p.avgData.sulfur.toFixed(2) + ' phr' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffPhr(p.avgData.sulfur, basePattern.avgData.sulfur)}</td>
          `).join('')}
        </tr>
      </tbody>
    `;

    table.innerHTML = html;
  }

  // 10. 기계 물성 편차 대조 그리드 렌더링
  function renderPhysicalTable() {
    const table = document.getElementById('compare-physical-table');
    if (!table) return;

    const basePattern = state.selectedPatterns.find(p => p.id === state.basePatternId);
    if (!basePattern) return;

    const cols = state.selectedPatterns;
    
    let html = `
      <thead>
        <tr>
          <th rowspan="2" class="cell-meta-key" style="vertical-align: middle;">가류 고무 기계물성 및 점탄성 지표</th>
          <th class="cell-part-title">[BASE] ${basePattern.maker}</th>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <th colspan="2" class="cell-part-title">${p.maker}<br><span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">${p.pattern}</span></th>
          `).join('')}
        </tr>
        <tr>
          <th>평균 물성치 (Base)</th>
          ${cols.filter(p => p.id !== state.basePatternId).map(() => `
            <th>평균 물성치</th>
            <th>기준 대비 차이 (Diff)</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <!-- 일반 물리 특성 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-gauge" style="margin-right: 8px;"></i> 고무 가류 정적 특성 (Static physical properties)
          </td>
        </tr>
        <tr>
          <td class="cell-meta-key">Hardness (경도, Shore A)</td>
          <td style="font-weight: 600; text-align: center; color: var(--accent-green);">${basePattern.avgData.hardness !== null ? basePattern.avgData.hardness.toFixed(1) : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.hardness !== null ? p.avgData.hardness.toFixed(1) : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffAbsolute(p.avgData.hardness, basePattern.avgData.hardness, 1, true)}</td>
          `).join('')}
        </tr>

        <!-- 가류 인장 특성 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-arrows-left-right" style="margin-right: 8px;"></i> 인장강도 및 응력 거동 (Tensile properties)
          </td>
        </tr>
        <tr>
          <td class="cell-meta-key">Modulus 100% (M100, MPa)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.m100 !== null ? basePattern.avgData.m100.toFixed(2) + ' MPa' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.m100 !== null ? p.avgData.m100.toFixed(2) + ' MPa' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffAbsolute(p.avgData.m100, basePattern.avgData.m100, 2, false)}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">Modulus 300% (M300, MPa)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.m300 !== null ? basePattern.avgData.m300.toFixed(2) + ' MPa' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.m300 !== null ? p.avgData.m300.toFixed(2) + ' MPa' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffAbsolute(p.avgData.m300, basePattern.avgData.m300, 2, false)}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">Tensile Strength (인장강도, MPa)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.ts !== null ? basePattern.avgData.ts.toFixed(1) + ' MPa' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.ts !== null ? p.avgData.ts.toFixed(1) + ' MPa' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffAbsolute(p.avgData.ts, basePattern.avgData.ts, 1, false)}</td>
          `).join('')}
        </tr>
        <tr>
          <td class="cell-meta-key">Elongation (신율, %)</td>
          <td style="font-weight: 600; text-align: center;">${basePattern.avgData.elongation !== null ? basePattern.avgData.elongation.toFixed(0) + ' %' : 'N/A'}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => `
            <td style="text-align: center;">${p.avgData.elongation !== null ? p.avgData.elongation.toFixed(0) + ' %' : 'N/A'}</td>
            <td style="text-align: center;">${formatDiffAbsolute(p.avgData.elongation, basePattern.avgData.elongation, 0, false)}</td>
          `).join('')}
        </tr>

        <!-- dynamic 점탄성 ARES 데이터 세션 -->
        <tr>
          <td colspan="${1 + cols.length + (cols.length - 1)}" class="excel-section-header">
            <i class="fa-solid fa-wave-square" style="margin-right: 8px;"></i> 점탄성 동적 특성 (ARES Sweep - 요약 12대 물성 대조)
          </td>
        </tr>
    `;

    viscoKeys.forEach(vKey => {
      const baseVal = basePattern.avgData.visco ? basePattern.avgData.visco[vKey.id] : null;
      
      let cellStyle = "";
      if (vKey.isTg) {
        cellStyle = "color: var(--primary);";
      } else if (vKey.id === 'tand0') {
        cellStyle = "color: var(--accent-green);";
      } else if (vKey.id === 'tand60') {
        cellStyle = "color: var(--accent-orange);";
      }

      html += `
        <tr>
          <td class="cell-meta-key" style="font-weight: 500;">${vKey.label}</td>
          <td style="font-weight: 600; text-align: center; ${cellStyle}">${formatValue(baseVal, vKey.decimals)}</td>
          ${cols.filter(p => p.id !== state.basePatternId).map(p => {
            const currentVal = p.avgData.visco ? p.avgData.visco[vKey.id] : null;
            return `
              <td style="text-align: center;">${formatValue(currentVal, vKey.decimals)}</td>
              <td style="text-align: center;">${formatDiffAbsolute(currentVal, baseVal, vKey.decimals, vKey.reverseColor)}</td>
            `;
          }).join('')}
        </tr>
      `;
    });

    html += `
      </tbody>
    `;

    table.innerHTML = html;
  }

  function renderSmartDiagnosis() {
    const container = document.getElementById('compare-smart-diagnosis');
    if (!container) return;

    const basePattern = state.selectedPatterns.find(p => p.id === state.basePatternId);
    if (!basePattern) return;

    const others = state.selectedPatterns.filter(p => p.id !== state.basePatternId);
    
    let html = `
      <div class="diagnosis-container">
        <div class="diagnosis-header">
          <i class="fa-solid fa-microchip" style="color: var(--primary); font-size: 1.4rem;"></i>
          <h3 style="font-size: 1.15rem; color: #fff; margin: 0;">스마트 AI 엔지니어 특성 예측 진단서</h3>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">* 기준 모델 [${basePattern.maker}] 대비 타이어 물리 거동 분석</span>
        </div>
        <div class="diagnosis-grid">
    `;

    // 1) 마모 성능 (Wear) 진단
    // 기준 대비 내마모 우수 지표: Tg가 낮을수록(▽), BR 함량이 높을수록(▲) 우수
    html += `
      <div class="diagnosis-item">
        <div class="diagnosis-perf-header">
          <span class="diagnosis-badge wear">내마모 성능 (Wear)</span>
        </div>
        <div class="diagnosis-text">
    `;
    others.forEach(p => {
      const tgDiff = (p.avgData.tg || 0) - (basePattern.avgData.tg || 0);
      const brDiff = p.avgData.br - basePattern.avgData.br;
      
      let statusClass = 'status-neutral';
      let statusText = '유사 거동';

      if (tgDiff < -2 || brDiff > 5) {
        statusClass = 'status-excellent';
        statusText = '개선 우수';
      } else if (tgDiff > 2 || brDiff < -5) {
        statusClass = 'status-warning';
        statusText = '타협 우려';
      }

      const factText = `기준 모델 대비 유리전이온도(Tg)가 <strong>${tgDiff > 0 ? '+' : ''}${tgDiff.toFixed(1)}℃</strong> 변동하였고, BR 배합 비율이 <strong>${brDiff > 0 ? '+' : ''}${brDiff.toFixed(1)}%</strong> 차이를 보입니다.`;
      const inferenceText = tgDiff < -2 || brDiff > 5 
        ? `유리전이온도(Tg) 하강으로 저온 유연성이 확보되고 고마모성 BR 중합체 배합이 증대되어, 가혹 마찰 시 컴파운드 탈락이 억제되고 <strong>내마모 내구 성능이 크게 향상</strong>될 것으로 AI가 예측합니다.` 
        : (tgDiff > 2 || brDiff < -5 
          ? `유리전이온도의 국부적 상승 또는 BR 함량 감축으로 인해, 가동 시 기계 피로 균열 진전 속도가 가속화되어 <strong>마모 수명이 소폭 하락(Wear 마진 저하)</strong>할 소지가 있다고 AI가 판단합니다.` 
          : `고무 중합체 블렌드 비율 및 유리전이 영역 온도가 대등하여, 통상적인 실주행 노면 접지 마찰 상황에서 기준 모델과 <strong>동등한 수준의 마모 수명 유지 패턴</strong>이 거동 예측됩니다.`);

      html += `
        <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.04); padding-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.8rem;">👉 ${p.maker} ${p.pattern}</strong>
            <span class="diagnosis-status-tag ${statusClass}">${statusText}</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            <div style="background: rgba(0, 242, 254, 0.02); border-left: 2px solid var(--primary); padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: var(--primary); display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-clipboard-list"></i> [Fact 기반 설명]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-main); line-height: 1.35;">${factText}</p>
            </div>
            <div style="background: rgba(156, 39, 176, 0.02); border-left: 2px solid #9c27b0; padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-brain"></i> [AI 거동 추측]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted); line-height: 1.35;">${inferenceText}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;

    // 2) 저온/눈길 성능 (Snow) 진단
    // 기준 대비 눈길 우수 지표: Tg가 낮을수록(▽), 경도가 낮을수록(▽) 유연하여 우수
    html += `
      <div class="diagnosis-item">
        <div class="diagnosis-perf-header">
          <span class="diagnosis-badge snow">눈길 및 저온성능 (Snow)</span>
        </div>
        <div class="diagnosis-text">
    `;
    others.forEach(p => {
      const tgDiff = (p.avgData.tg || 0) - (basePattern.avgData.tg || 0);
      const hardDiff = (p.avgData.hardness || 0) - (basePattern.avgData.hardness || 0);
      
      let statusClass = 'status-neutral';
      let statusText = '유사 거동';

      if (tgDiff < -2.5 && hardDiff <= 1) {
        statusClass = 'status-excellent';
        statusText = '극지 우수';
      } else if (tgDiff > 2.5) {
        statusClass = 'status-warning';
        statusText = '빙판 주의';
      }

      const factText = `기준 모델 대비 유리전이온도(Tg)가 <strong>${tgDiff > 0 ? '+' : ''}${tgDiff.toFixed(1)}℃</strong> 변동하였고, 경도가 <strong>${hardDiff > 0 ? '+' : ''}${hardDiff.toFixed(1)} Shore A</strong> 차이를 보입니다.`;
      const inferenceText = (tgDiff < -2.5 && hardDiff <= 1)
        ? `Tg가 낮아져 극저온 영하 노면 환경에서도 트레드 고무가 유연성을 잃지 않고 노면 밀착도가 극대화됨으로써, <strong>스노우 및 아이스 제동력이 비약적으로 개선</strong>될 것으로 AI가 거동 예측합니다.`
        : (tgDiff > 2.5 
          ? `저온 Tg 수치 상승에 기인하여 영하 노면 주행 시 고무 경화(Glass State 전이)가 빠르게 진행되며, 이로 인한 블록 강성 급증과 접지 유연성 결여로 <strong>눈길 슬립 및 미끄러짐 위험성이 증가</strong>할 것으로 판단됩니다.`
          : `저온 물성의 지배 인자인 Tg 및 상온 경도 차이가 동등 제어 범위에 있으므로, 극한 저온 영역에서도 기준 모델과 <strong>대등한 노면 순응성 및 눈길 제동 성능</strong>을 가질 것으로 추측됩니다.`);

      html += `
        <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.04); padding-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.8rem;">👉 ${p.maker} ${p.pattern}</strong>
            <span class="diagnosis-status-tag ${statusClass}">${statusText}</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            <div style="background: rgba(0, 242, 254, 0.02); border-left: 2px solid var(--primary); padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: var(--primary); display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-clipboard-list"></i> [Fact 기반 설명]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-main); line-height: 1.35;">${factText}</p>
            </div>
            <div style="background: rgba(156, 39, 176, 0.02); border-left: 2px solid #9c27b0; padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-brain"></i> [AI 거동 추측]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted); line-height: 1.35;">${inferenceText}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;

    // 3) 젖은 노면 그립 성능 (Wet) 진단
    // 기준 대비 젖은 노면 그립 우수 지표: tanδ @ 0℃가 높을수록(▲), G'' @ 0℃가 높을수록(▲), Silica 함량이 높을수록(▲) 우수
    html += `
      <div class="diagnosis-item">
        <div class="diagnosis-perf-header">
          <span class="diagnosis-badge wet">젖은 제동 및 그립 (Wet Grip)</span>
        </div>
        <div class="diagnosis-text">
    `;
    others.forEach(p => {
      const tand0Diff = (p.avgData.tand0 || 0) - (basePattern.avgData.tand0 || 0);
      const silicaDiff = p.avgData.silica - basePattern.avgData.silica;
      
      let statusClass = 'status-neutral';
      let statusText = '유사 거동';

      if (tand0Diff > 0.02 || silicaDiff > 8) {
        statusClass = 'status-excellent';
        statusText = '그립 특화';
      } else if (tand0Diff < -0.02 || silicaDiff < -8) {
        statusClass = 'status-warning';
        statusText = '젖은 제동 타협';
      }

      const factText = `기준 모델 대비 0℃ 손실탄젠트(tanδ)가 <strong>${tand0Diff > 0 ? '+' : ''}${tand0Diff.toFixed(4)}</strong> 차이를 보이고, 실리카 함량이 <strong>${silicaDiff > 0 ? '+' : ''}${silicaDiff.toFixed(1)} phr</strong> 변동하였습니다.`;
      const inferenceText = (tand0Diff > 0.02 || silicaDiff > 8)
        ? `친수성 실리카 충전제 대량 증량 및 0℃ 에너지 손실탄젠트의 대폭 향상에 따라, 빗길 고속 질주 시 노이즈 성분이 소실 저항 마찰력으로 작용하여 <strong>빗길 및 젖은 배수 제동 마진이 비약적으로 향상</strong>될 것으로 강력 예측됩니다.`
        : (tand0Diff < -0.02 || silicaDiff < -8
          ? `0℃ 점성 히스테리시스 저항 성분의 결여 및 보강 보강제(실리카) 함량 축소로 인해 수막 상태에서의 고밀도 마찰 유도가 제한되며, 수막 현상 방어 및 <strong>빗길 제동력 저하 우려</strong>가 관찰됩니다.`
          : `점탄성 손실률과 실리카 배합 수준이 동등 범주 내에 있어, 젖은 배수 제동 성능 및 수막 노면에서의 노이즈 점성 소실량이 기준 모델과 <strong>대등한 상태로 억제 및 관리</strong>될 것으로 AI가 추측합니다.`);

      html += `
        <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.04); padding-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.8rem;">👉 ${p.maker} ${p.pattern}</strong>
            <span class="diagnosis-status-tag ${statusClass}">${statusText}</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            <div style="background: rgba(0, 242, 254, 0.02); border-left: 2px solid var(--primary); padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: var(--primary); display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-clipboard-list"></i> [Fact 기반 설명]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-main); line-height: 1.35;">${factText}</p>
            </div>
            <div style="background: rgba(156, 39, 176, 0.02); border-left: 2px solid #9c27b0; padding: 4px 8px; border-radius: 0 4px 4px 0;">
              <span style="font-size: 0.72rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 2px;">
                <i class="fa-solid fa-brain"></i> [AI 거동 추측]
              </span>
              <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted); line-height: 1.35;">${inferenceText}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // 물리 공식 및 시그모이드 전이 보간을 통한 G', G" 복원 시뮬레이션 (패턴 평균용)
  function calculateCompareViscoDataPoints(pattern, mode, temperatures) {
    if (mode === 'tand') {
      return temperatures.map(temp => {
        const val = pattern.avgData.temps[temp];
        return val !== undefined && val !== null ? parseFloat(val.toFixed(4)) : null;
      });
    }

    const tg = pattern.avgData.tg !== null ? pattern.avgData.tg : -25;
    
    // G' @ -40, -30, -20, -10℃ (E+07) 수치 추출
    const gMinusValues = pattern.avgData.visco && pattern.avgData.visco.g_minus_sub 
      ? pattern.avgData.visco.g_minus_sub 
      : [4.6, 1.8, 1.1, 0.9];

    // G* @ 0℃ 수치 추출
    const gStar0 = pattern.avgData.visco && pattern.avgData.visco.gstar_0 && pattern.avgData.visco.gstar_0[0] !== null
      ? pattern.avgData.visco.gstar_0[0]
      : 0.76;
    
    // G* @ 30℃ 수치 추출 (g2_gstar_30의 두번째 원소)
    const g30Array = pattern.avgData.visco && pattern.avgData.visco.g2_gstar_30 ? pattern.avgData.visco.g2_gstar_30 : [];
    let gStar30 = 0.6;
    if (g30Array.length >= 2 && g30Array[1] !== null) {
      gStar30 = g30Array[1];
    }

    const refPoints = {
      '-40': gMinusValues[0] !== undefined && gMinusValues[0] !== null ? gMinusValues[0] : 4.6,
      '-30': gMinusValues[1] !== undefined && gMinusValues[1] !== null ? gMinusValues[1] : 1.8,
      '-20': gMinusValues[2] !== undefined && gMinusValues[2] !== null ? gMinusValues[2] : 1.1,
      '-10': gMinusValues[3] !== undefined && gMinusValues[3] !== null ? gMinusValues[3] : 0.9,
      '0': gStar0,
      '30': gStar30,
      '60': gStar30 * 0.82
    };

    const gpPoints = temperatures.map(temp => {
      if (temp < -40) {
        const baseVal = refPoints['-40'];
        const glassyModulus = 100.0;
        const transitionTemp = tg - 12;
        const exponent = -0.15 * (temp - transitionTemp);
        const ratio = 1 / (1 + Math.exp(exponent));
        return baseVal + (glassyModulus - baseVal) * ratio;
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
        return y1 + (y2 - y1) * tRatio;
      }

      if (temp > 0 && temp < 30) {
        const tRatio = temp / 30.0;
        const y1 = refPoints['0'];
        const y2 = refPoints['30'];
        return y1 + (y2 - y1) * tRatio;
      }

      if (temp >= 30) {
        const tRatio = (temp - 30) / 30.0;
        const y1 = refPoints['30'];
        const y2 = refPoints['60'];
        return y1 + (y2 - y1) * tRatio;
      }

      return null;
    });

    if (mode === 'gp') {
      return gpPoints;
    }

    // G" (Loss Modulus) Simulation: G" = G' * 10.0 * tanδ
    const tandPoints = calculateCompareViscoDataPoints(pattern, 'tand', temperatures);
    return gpPoints.map((gp, i) => {
      const tand = tandPoints[i];
      if (gp === null || tand === null) return null;
      return gp * 10.0 * tand;
    });
  }

  // ARES Full Curve (CHART 5) 개별 드로잉 및 동적 업데이트 함수
  function updateCompareAresChart() {
    const ctxAresCurve = document.getElementById('chart-compare-ares-curve');
    if (!ctxAresCurve) return;

    if (state.charts.aresCurve) {
      state.charts.aresCurve.destroy();
      state.charts.aresCurve = null;
    }

    if (state.selectedPatterns.length === 0) return;

    const temperatures = [
      -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
    ];
    const tempLabels = temperatures.map(t => `${t}℃`);

    const colors = [
      { border: '#00f2fe', bg: 'rgba(0, 242, 254, 0.15)', solid: 'rgba(0, 242, 254, 0.7)' }, // Cyan
      { border: '#00e676', bg: 'rgba(0, 230, 118, 0.15)', solid: 'rgba(0, 230, 118, 0.7)' }, // Green
      { border: '#ff9100', bg: 'rgba(255, 145, 0, 0.15)', solid: 'rgba(255, 145, 0, 0.7)' }, // Orange
      { border: '#9c27b0', bg: 'rgba(156, 39, 176, 0.15)', solid: 'rgba(156, 39, 176, 0.7)' }  // Purple
    ];

    const datasets = state.selectedPatterns.map((p, index) => {
      const c = colors[index % colors.length];
      const curveData = calculateCompareViscoDataPoints(p, state.activeCompareChartMode, temperatures);

      return {
        label: `${p.maker} (${p.pattern})`,
        data: curveData,
        borderColor: c.border,
        backgroundColor: c.bg,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.3,
        spanGaps: true,
        fill: false
      };
    });

    let yTitle = 'Loss Tangent (tanδ)';
    let valSuffix = '';
    let captionText = '* -60℃부터 60℃까지 5℃ 단위 온도별 손실 탄젠트 (tanδ) 평균 수윕 데이터 추이를 비교 분석합니다.';
    let titleText = '3. 선택 컴파운드 ARES Full Curve - tanδ';

    if (state.activeCompareChartMode === 'gp') {
      yTitle = 'Storage Modulus G\' (E+07 Pa)';
      valSuffix = ' E+07 Pa';
      captionText = '* 극저온 범위에서의 유리 거동 한계점과 핵심 실측점들을 정교한 시그모이드 전이 보간 수식으로 물리적 모델링한 G\' 평균 연속 추이 곡선입니다.';
      titleText = '3. 선택 컴파운드 ARES Full Curve - G\'';
    } else if (state.activeCompareChartMode === 'gpp') {
      yTitle = 'Loss Modulus G" (E+06 Pa)';
      valSuffix = ' E+06 Pa';
      captionText = '* 복원된 저장탄성률(G\')과 손실탄젠트(tanδ) 간의 동적 물리 공식(G" = G\' * tanδ)을 적용하여 완성한 0.1M ~ 100M Pa 영역 평균 스펙트럼 곡선입니다.';
      titleText = '3. 선택 컴파운드 ARES Full Curve - G"';
    }

    const titleEl = document.getElementById('compare-ares-title');
    const captionEl = document.getElementById('compare-ares-caption');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${titleText}`;
    if (captionEl) captionEl.textContent = captionText;

    state.charts.aresCurve = new Chart(ctxAresCurve, {
      type: 'line',
      data: {
        labels: tempLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#1e293b', font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw;
                if (val === null) return null;
                return ` ${context.dataset.label}: ${val.toFixed(4)}${valSuffix}`;
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { color: '#1e293b', font: { size: 9 }, autoSkip: true, maxRotation: 0 } 
          },
          y: { 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { color: '#1e293b', font: { size: 10 } },
            title: { display: true, text: yTitle, color: '#1e293b', font: { size: 10 } }
          }
        }
      }
    });
  }

  // 12. 네온 테마 전용 4대 실시간 비교 차트 생성
  function renderCharts() {
    destroyCharts();

    const labels = state.selectedPatterns.map(p => `${p.maker}\n(${p.pattern})`);
    
    // 차트 컬러 세트 정의
    const colors = [
      { border: '#00f2fe', bg: 'rgba(0, 242, 254, 0.15)', solid: 'rgba(0, 242, 254, 0.7)' }, // Cyan
      { border: '#00e676', bg: 'rgba(0, 230, 118, 0.15)', solid: 'rgba(0, 230, 118, 0.7)' }, // Green
      { border: '#ff9100', bg: 'rgba(255, 145, 0, 0.15)', solid: 'rgba(255, 145, 0, 0.7)' }, // Orange
      { border: '#9c27b0', bg: 'rgba(156, 39, 176, 0.15)', solid: 'rgba(156, 39, 176, 0.7)' }  // Purple
    ];

    // --- CHART 1: Polymer Blend 가로 누적 바 차트 ---
    const ctxPoly = document.getElementById('chart-compare-polymer');
    if (ctxPoly) {
      const nrData = state.selectedPatterns.map(p => p.avgData.nr);
      const sbrData = state.selectedPatterns.map(p => p.avgData.sbr);
      const brData = state.selectedPatterns.map(p => p.avgData.br);

      state.charts.polymer = new Chart(ctxPoly, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'NR', data: nrData, backgroundColor: '#ff9100' },
            { label: 'SBR', data: sbrData, backgroundColor: '#2563eb' },
            { label: 'BR', data: brData, backgroundColor: '#00e676' }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#1e293b', font: { size: 10 } } }
          },
          scales: {
            x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#1e293b', font: { size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { color: '#1e293b', font: { size: 9 } } }
          }
        }
      });
    }



    // --- CHART 3: 물성 대표 밸런스 레이더 차트 (Radar) ---
    const ctxRadar = document.getElementById('chart-compare-radar');
    if (ctxRadar) {
      const maxHardness = Math.max(...state.selectedPatterns.map(p => p.avgData.hardness || 1), 80);
      const maxTg = Math.abs(Math.min(...state.selectedPatterns.map(p => p.avgData.tg || 0), -60));
      const maxG2 = Math.max(...state.selectedPatterns.map(p => p.avgData.g2_0 || 1), 50);
      const maxTand0 = Math.max(...state.selectedPatterns.map(p => p.avgData.tand0 || 0.1), 0.5);
      const maxTand60 = Math.max(...state.selectedPatterns.map(p => p.avgData.tand60 || 0.1), 0.3);

      const datasets = state.selectedPatterns.map((p, index) => {
        const c = colors[index % colors.length];
        
        const scoreHard = p.avgData.hardness ? (p.avgData.hardness / maxHardness) * 100 : 0;
        const scoreTg = p.avgData.tg ? (Math.abs(p.avgData.tg) / maxTg) * 100 : 0;
        const scoreG2 = p.avgData.g2_0 ? (p.avgData.g2_0 / maxG2) * 100 : 0;
        const scoreTand0 = p.avgData.tand0 ? (p.avgData.tand0 / maxTand0) * 100 : 0;
        const scoreTand60 = p.avgData.tand60 ? (p.avgData.tand60 / maxTand60) * 100 : 0;

        return {
          label: p.maker,
          data: [scoreHard, scoreTg, scoreG2, scoreTand0, scoreTand60],
          borderColor: c.border,
          backgroundColor: c.bg,
          borderWidth: 2,
          pointBackgroundColor: c.border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: c.border
        };
      });

      state.charts.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: ['Hardness (Shore A)', 'Tg (저온유연성)', "G'' @ 0℃ (손실저항)", 'tanδ @ 0℃ (젖은 그립)', 'tanδ @ 60℃ (RR 지표)'],
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#1e293b', font: { size: 10 } } }
          },
          scales: {
            r: {
              grid: { color: 'rgba(0,0,0,0.06)' },
              angleLines: { color: 'rgba(0,0,0,0.06)' },
              ticks: { display: false, stepSize: 20 },
              pointLabels: { color: '#1e293b', font: { size: 9, weight: 'bold' } }
            }
          }
        }
      });
    }

    // --- CHART 4: CB vs Silica 보강제 분석 차트 ---
    const ctxFillers = document.getElementById('chart-compare-fillers');
    if (ctxFillers) {
      const cbData = state.selectedPatterns.map(p => p.avgData.cb);
      const silicaData = state.selectedPatterns.map(p => p.avgData.silica);

      state.charts.fillers = new Chart(ctxFillers, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Carbon Black (phr)', data: cbData, backgroundColor: '#8a99ad', borderColor: '#4b5563', borderWidth: 1 },
            { label: 'Silica (phr)', data: silicaData, backgroundColor: '#00f2fe', borderColor: '#4facfe', borderWidth: 1 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#1e293b', font: { size: 10 } } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#1e293b', font: { size: 9 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#1e293b', font: { size: 10 } } }
          }
        }
      });
    }

    // --- CHART 5: ARES Full Curve (동적 지표 거동 분석) 멀티 라인 차트 ---
    updateCompareAresChart();
  }

  // 13. 차트 리소스 파괴
  function destroyCharts() {
    Object.keys(state.charts).forEach(key => {
      if (state.charts[key]) {
        state.charts[key].destroy();
        state.charts[key] = null;
      }
    });
  }

  // 노출할 외부 퍼블릭 인터페이스
  return {
    init: init,
    onSourceChange: onSourceChange,
    updateUI: updateUI,
    state: state
  };
})();
