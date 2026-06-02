// Global Application State
window.appState = {
  currentSource: 'tread', // 'tread' | 'case' | 'tbr'
  allData: {
    tread: [],
    case: [],
    tbr: []
  },
  filteredData: [],
  selectedTires: [], // Tires selected for comparison/report
  currentPage: 1,
  pageSize: 50,
  
  // Helpers for safely fetching properties due to trailing spaces in original excel headers
  getProp: function(obj, keys) {
    if (!obj) return null;
    for (let key of keys) {
      // Direct match
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
      // Try trimmed match
      const trimKey = key.trim();
      for (let actualKey in obj) {
        if (actualKey.trim() === trimKey && obj[actualKey] !== undefined && obj[actualKey] !== null) {
          return obj[actualKey];
        }
      }
    }
    return null;
  }
};

// Toast notification helper
window.showToast = function(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  // Clear any existing timeout
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
};

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadAllData().then(() => {
    initFilters();
    updateDashboard();
    updateExplorerTable();
    
    // Wire up other global components
    if (window.TireCharts && typeof window.TireCharts.init === 'function') {
      window.TireCharts.init();
    }
    if (window.ReportGenerator && typeof window.ReportGenerator.init === 'function') {
      window.ReportGenerator.init();
    }
    if (window.AverageCompare && typeof window.AverageCompare.init === 'function') {
      window.AverageCompare.init();
    }
    
    // 포털 검색어 연동 연계 패치
    checkPortalSearchQuery();

    // URL 해시값 기반 다이렉트 탭 라우팅 실행
    handleHashRouting();
  });
  
  // URL 해시 변경 이벤트 리스너 탑재
  window.addEventListener('hashchange', handleHashRouting);
  
  // Listeners
  // 대시보드 전용 전역 필터 이벤트 리스너 바인딩
  const dbSeason = document.getElementById('dashboard-filter-season');
  const dbSegment = document.getElementById('dashboard-filter-segment');
  const dbReset = document.getElementById('btn-dashboard-filter-reset');

  if (dbSeason) {
    dbSeason.addEventListener('change', (e) => {
      if (!window.appState.dashboardFilters) window.appState.dashboardFilters = { season: '', segment: '' };
      window.appState.dashboardFilters.season = e.target.value;
      renderMakerComparison();
    });
  }
  if (dbSegment) {
    dbSegment.addEventListener('change', (e) => {
      if (!window.appState.dashboardFilters) window.appState.dashboardFilters = { season: '', segment: '' };
      window.appState.dashboardFilters.segment = e.target.value;
      renderMakerComparison();
    });
  }
  if (dbReset) {
    dbReset.addEventListener('click', () => {
      if (dbSeason) dbSeason.value = '';
      if (dbSegment) dbSegment.value = '';
      window.appState.dashboardFilters = { season: '', segment: '' };
      renderMakerComparison();
    });
  }

  document.getElementById('data-source').addEventListener('change', handleSourceChange);
  document.getElementById('btn-filter-reset').addEventListener('click', resetFilters);
  document.getElementById('check-all').addEventListener('change', handleSelectAll);
  
  // Filter change listeners
  document.getElementById('filter-maker').addEventListener('change', handleFilterChange);
  document.getElementById('filter-pattern').addEventListener('change', handleFilterChange);
  document.getElementById('filter-size').addEventListener('change', handleFilterChange);
  document.getElementById('filter-season').addEventListener('change', handleFilterChange);
  document.getElementById('filter-year').addEventListener('change', handleFilterChange);
  
  const selectPart = document.getElementById('filter-part');
  if (selectPart) {
    selectPart.addEventListener('change', handleFilterChange);
  }
  
  // Pagination listeners
  document.getElementById('btn-prev-page').addEventListener('click', () => changePage(-1));
  document.getElementById('btn-next-page').addEventListener('click', () => changePage(1));

  // BM Report 생성 및 이동 버튼 클릭 이벤트 리스너 탑재
  const btnGoToReport = document.getElementById('btn-go-to-report');
  if (btnGoToReport) {
    btnGoToReport.addEventListener('click', () => {
      // 1. 만약 선택된 타이어가 없다면 안내 문구 노출 및 경고
      if (!window.appState.selectedTires || window.appState.selectedTires.length === 0) {
        window.showToast("오류: 비교할 타이어가 선택되지 않았습니다. 테이블에서 타이어를 선택해 주세요.");
        return;
      }
      
      // 2. 'BM Report 생성기' 탭 클릭 및 전환
      const reportTabEl = document.querySelector('.sidebar .menu-item[data-tab="tab-report"]');
      if (reportTabEl) {
        reportTabEl.click();
      }
      
      // 3. 리포트 생성 트리거 실행
      const triggerBtn = document.getElementById('btn-trigger-report');
      if (triggerBtn) {
        setTimeout(() => {
          triggerBtn.click();
        }, 150); // 탭 전환 완료 후 안정적으로 보고서를 자동 컴파일
      }
    });
  }

  // Sidebar Toggle Listener
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('btn-sidebar-toggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    // 마우스가 사이드바에서 사라질 때 자동으로 닫기 (이탈 시 즉시 숨김 보장)
    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('active');
    });
    
    // 바깥 영역 클릭 시 사이드바 닫기 (오버레이 모드 편의성 증대)
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
  }
});

// Tab navigation controller
function initTabs() {
  const menuItems = document.querySelectorAll('.sidebar .menu-item');
  const tabContents = document.querySelectorAll('.content-body .tab-content');
  const headerTitle = document.getElementById('header-title-text');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      
      // Toggle sidebar active
      menuItems.forEach(i => item === i ? i.classList.add('active') : i.classList.remove('active'));
      
      // Toggle Tab Content active
      tabContents.forEach(tab => {
        if (tab.id === targetTab) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      
      // Update Header title dynamically
      headerTitle.textContent = item.querySelector('span').textContent;
      
      // Trigger charts resize/render when switching to dashboard tab
      if (targetTab === 'tab-dashboard' && window.TireCharts) {
        window.TireCharts.updateAllCharts();
      }

      // Trigger average comparison updater when switching to compare tab
      if (targetTab === 'tab-pattern-compare' && window.AverageCompare) {
        window.AverageCompare.updateUI();
      }

      // Smooth scroll back to top of the content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// URL 해시 변경 감지 및 강제 탭 활성화 유틸리티
function handleHashRouting() {
  const hash = window.location.hash;
  if (!hash) return;
  
  const tabId = hash.replace('#', '');
  const menuItems = document.querySelectorAll('.sidebar .menu-item');
  const tabContents = document.querySelectorAll('.content-body .tab-content');
  const headerTitle = document.getElementById('header-title-text');
  
  const targetItem = Array.from(menuItems).find(item => item.getAttribute('data-tab') === tabId);
  if (targetItem) {
    // 1. 사이드바 메뉴 활성화 클래스 스위칭
    menuItems.forEach(i => targetItem === i ? i.classList.add('active') : i.classList.remove('active'));
    
    // 2. 대시보드 메인 탭 콘텐츠 활성화 클래스 스위칭
    tabContents.forEach(tab => {
      if (tab.id === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // 3. 탑바 헤더 텍스트 실시간 치환
    if (headerTitle) {
      headerTitle.textContent = targetItem.querySelector('span').textContent;
    }
    
    // 4. 컴포넌트별 탭 전환 시 동적 라이프사이클 이벤트 연계 트리거
    if (tabId === 'tab-dashboard' && window.TireCharts) {
      window.TireCharts.updateAllCharts();
    }

    if (tabId === 'tab-pattern-compare' && window.AverageCompare) {
      window.AverageCompare.updateUI();
    }

    // 5. 시각적 연속성을 위한 스크롤 최상단 정렬
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Outlier data cleansing helper (tanδ @ 60℃ > 1이상인 이상치 제거)
function cleanOutliers(dataList) {
  if (!Array.isArray(dataList)) return dataList;
  const targetKeys = ['tanδ @ 60℃', 'tanδ @ 60C', 'tan δ @ 60℃', '60', 'DMTS @ 60℃', 'tanδ @ 60℃ (@ 0.5%)'];
  
  return dataList.map(item => {
    // 모든 키를 순회하여 혹시 공백이 있거나 철자가 매칭되는 tan delta 60 컬럼이 있는지 지능형 탐색
    for (let actualKey in item) {
      const trimmedKey = actualKey.trim();
      if (targetKeys.includes(trimmedKey)) {
        if (item[actualKey] !== undefined && item[actualKey] !== null) {
          const val = parseFloat(item[actualKey]);
          if (!isNaN(val) && val > 1) {
            console.warn(`Outlier cleaned for ${item.Maker || 'N/A'}: ${actualKey} = ${val}`);
            item[actualKey] = null; // 이상치 데이터를 원천 null 처리하여 정제
          }
        }
      }
    }
    return item;
  });
}
window.cleanOutliers = cleanOutliers; // 글로벌 노출로 fileParser.js 등 타 컴포넌트에서도 연동 가능하게 보장

// Fetch datasets from preprocessed JSONs
async function loadAllData() {
  const isFileProtocol = window.location.protocol === 'file:';
  
  if (isFileProtocol) {
    const banner = document.getElementById('cors-warning-banner');
    if (banner) banner.style.display = 'block';
    console.warn("Local file protocol detected. Showing safety CORS banner.");
  }

  window.showToast("데이터셋을 로드하는 중입니다...");
  try {
    const [treadRes, caseRes, tbrRes] = await Promise.all([
      fetch('data/tread_data.json').then(r => r.json()),
      fetch('data/case_data.json').then(r => r.json()),
      fetch('data/tbr_data.json').then(r => r.json())
    ]);
    
    window.appState.allData.tread = cleanOutliers(treadRes);
    window.appState.allData.case = cleanOutliers(caseRes);
    window.appState.allData.tbr = cleanOutliers(tbrRes);
    
    window.appState.filteredData = [...window.appState.allData.tread]; // initially tread
    window.showToast("실시간 컴파운드 분석 데이터 연동 완료!");
  } catch (err) {
    console.error("Error loading JSON datasets, loading local fallback demo data instead:", err);
    
    // Safety fallback mock datasets to ensure 100% functional UI experience even when fetch fails
    const fallbackTread = [
      { "Maker": "MICHELIN", "Pattern": "PILOT SPORT 5", "Size": "245/40R19", "Season": "Summer", "NR / SBR / BR_GC": "10 / 60 / 30", "Carbon Black / Silica (phr)": "15 / 80", "Hardness": 71, "Tg_peak temp. (℃)": -24, "분석년도": "2023" },
      { "Maker": "CONTINENTAL", "Pattern": "EXTREMECONTACT DWS06", "Size": "245/40R19", "Season": "All Season", "NR / SBR / BR_GC": "15 / 55 / 30", "Carbon Black / Silica (phr)": "25 / 65", "Hardness": 68, "Tg_peak temp. (℃)": -32, "분석년도": "2022" },
      { "Maker": "HANKOOK", "Pattern": "VENTUS S1 EVO3", "Size": "245/40R19", "Season": "Summer", "NR / SBR / BR_GC": "12 / 68 / 20", "Carbon Black / Silica (phr)": "10 / 85", "Hardness": 70, "Tg_peak temp. (℃)": -22, "분석년도": "2023" },
      { "Maker": "KUMHO", "Pattern": "SOLUS TA51", "Size": "245/40R19", "Season": "All Season", "NR / SBR / BR_GC": "20 / 50 / 30", "Carbon Black / Silica (phr)": "30 / 50", "Hardness": 67, "Tg_peak temp. (℃)": -35, "분석년도": "2021" }
    ];

    const fallbackCase = [
      { "부위": "Sidewall", "Maker": "MICHELIN", "Pattern": "E-PRIMACY", "Size": "215/55R17", "Season": "Summer", "NR / SBR / BR_GC": "50 / - / 50", "Carbon Black / Silica (phr)": "50 / -", "Hardness": 55, "Tg_peak temp. (℃)": -55, "분석년도": "2023" },
      { "부위": "Sidewall", "Maker": "HANKOOK", "Pattern": "iON GT", "Size": "215/55R17", "Season": "Summer", "NR / SBR / BR_GC": "45 / - / 55", "Carbon Black / Silica (phr)": "55 / -", "Hardness": 57, "Tg_peak temp. (℃)": -58, "분석년도": "2023" }
    ];

    const fallbackTbr = [
      { "Sheet": "CT 유럽 LH_S", "MakerPatternRaw": "BRIDGESTONE R249", "Size": "315/70R22.5", "NR / SBR / BR_GC": "100 / - / -", "Carbon Black / Silica (phr)": "50 / -", "Hardness": 66, "Tg_peak temp. (℃)": -62, "분석년도": "2021" }
    ];

    window.appState.allData.tread = fallbackTread;
    window.appState.allData.case = fallbackCase;
    window.appState.allData.tbr = fallbackTbr;
    
    window.appState.filteredData = [...fallbackTread];
    
    window.showToast("⚠️ 로컬 데모(데모용) 데이터셋 로드됨. 온전한 사용을 위해 http://localhost:3000 으로 접속을 권장합니다.");
  }
}

// When user changes tread/case/tbr source
function handleSourceChange(e) {
  const source = e.target.value;
  window.appState.currentSource = source;
  window.appState.filteredData = [...window.appState.allData[source]];
  window.appState.selectedTires = []; // Clear selections to avoid cross-source mismatched UI
  window.appState.currentPage = 1;
  
  document.getElementById('check-all').checked = false;
  
  // Dynamically toggle Season column header text
  const thSeason = document.querySelector('#explorer-table th:nth-child(5)');
  if (thSeason) {
    thSeason.textContent = source === 'case' ? '부위' : 'Season';
  }
  
  // Re-build multi-dimensional filter lists
  initFilters();
  
  // Re-render everything
  updateDashboard();
  updateExplorerTable();
  
  if (window.TireCharts) {
    window.TireCharts.updateAllCharts();
  }
  
  if (window.ReportGenerator) {
    window.ReportGenerator.updateSelectedSummary();
  }

  if (window.AverageCompare && typeof window.AverageCompare.onSourceChange === 'function') {
    window.AverageCompare.onSourceChange();
  }
  
  window.showToast(`${e.target.options[e.target.selectedIndex].text} 모드로 전환 완료.`);
}

// Helper to integrate Season to exactly 'Summer', 'Winter', 'All Season', and '-'
function mapSeason(rawSeason) {
  if (!rawSeason) return '-';
  const clean = rawSeason.toString().trim();
  if (clean === '' || clean === '-') return '-';
  
  const lower = clean.toLowerCase();
  if (lower.includes('summer')) {
    return 'Summer';
  }
  if (lower.includes('winter') || lower.includes('snow')) {
    return 'Winter';
  }
  if (lower.includes('all season') || lower.includes('all weather') || lower.includes('a/s') || lower === 'as' || lower.includes('van as') || lower === 'allseason') {
    return 'All Season';
  }
  if (lower === 'uhp') {
    return 'Summer';
  }
  if (lower === 'van') {
    return 'All Season';
  }
  
  return clean; // Fallback to raw value (or part name like Sub Tread in Case data)
}
window.mapSeason = mapSeason; // Global exposure for other modules

// Helper to get consistent 6-dimensional string values for an item
function getFieldValues(item) {
  const isCase = window.appState.currentSource === 'case';
  const rawSeason = isCase ? '' : (window.appState.getProp(item, ['Season']) || '');
  const rawPart = isCase ? (window.appState.getProp(item, ['부위']) || '') : '';
  
  return {
    maker: (window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || '').toString().trim(),
    pattern: (window.appState.getProp(item, ['Pattern']) || '').toString().trim(),
    size: (window.appState.getProp(item, ['Size', '규격']) || '').toString().trim(),
    season: mapSeason(rawSeason),
    part: rawPart.toString().trim(),
    year: (window.appState.getProp(item, ['분석년도', '분석년도 ']) || '').toString().trim()
  };
}

// Compute facet counts for a target field, given other active selection constraints
function getFacetCounts(field, otherSelections) {
  const original = window.appState.allData[window.appState.currentSource];
  const counts = {};
  
  original.forEach(item => {
    const vals = getFieldValues(item);
    
    // Check if item matches all OTHER selection constraints
    let match = true;
    for (const key in otherSelections) {
      if (otherSelections[key] && vals[key] !== otherSelections[key]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      const optionVal = vals[field];
      if (optionVal) {
        counts[optionVal] = (counts[optionVal] || 0) + 1;
      }
    }
  });
  
  return counts;
}

// 제조사 커스텀 정렬 함수 (Michelin, Continental, Goodyear, Hankook 상단 고정 + 나머지 오름차순 알파벳 정렬)
function sortMakersCustom(makersList) {
  const top4 = ["michelin", "continental", "goodyear", "hankook"]; // 대소문자/공백/접미사 방어형 지능형 매칭용 소문자 키
  
  return [...makersList].sort((a, b) => {
    const aLower = a.toString().toLowerCase().replace(/\s+/g, '');
    const bLower = b.toString().toLowerCase().replace(/\s+/g, '');
    
    // top4 내에서 포함 여부로 가중치 인덱스 검색
    const aIdx = top4.findIndex(brand => aLower.includes(brand));
    const bIdx = top4.findIndex(brand => bLower.includes(brand));
    
    if (aIdx !== -1 && bIdx !== -1) {
      return aIdx - bIdx; // 둘 다 상위 브랜드인 경우 지정된 순서 우선 정렬
    }
    if (aIdx !== -1) return -1; // a만 상위 브랜드인 경우 앞으로
    if (bIdx !== -1) return 1;  // b만 상위 브랜드인 경우 앞으로
    
    // 그 외 일반 제조사들은 알파벳/가나다 오름차순 정렬
    return a.toString().localeCompare(b.toString(), 'ko', { sensitivity: 'base' });
  });
}
window.sortMakersCustom = sortMakersCustom; // averageCompare.js 등에서도 호출 가능하도록 글로벌 바인딩

function initFilters() {
  const data = window.appState.allData[window.appState.currentSource];
  
  const makers = new Set();
  const patterns = new Set();
  const sizes = new Set();
  const seasons = new Set();
  const years = new Set();
  const parts = new Set();
  
  data.forEach(item => {
    const vals = getFieldValues(item);
    if (vals.maker) makers.add(vals.maker);
    if (vals.pattern) patterns.add(vals.pattern);
    if (vals.size) sizes.add(vals.size);
    if (vals.season && vals.season !== '-') seasons.add(vals.season);
    if (vals.part) parts.add(vals.part);
    if (vals.year) years.add(vals.year);
  });
  
  // Store full lists of sorted unique options inside global appState
  window.appState.filterOptions = {
    maker: sortMakersCustom(Array.from(makers)),
    pattern: Array.from(patterns).sort(),
    size: Array.from(sizes).sort(),
    season: Array.from(seasons).sort(),
    part: Array.from(parts).sort(),
    year: Array.from(years).sort()
  };
  
  // Re-build all dropdowns with initial full-counts
  updateDropdownsWithFacets();
}

// Populate a target select dropdown element using computed facets
function populateDropdownWithFacets(elemId, optionsList, counts, selectedValue) {
  const select = document.getElementById(elemId);
  if (!select) return;
  
  select.innerHTML = '';
  
  // Total count for "All" option equals sum of all option counts under other selection constraints
  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);
  
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = `전체 (${totalCount.toLocaleString()})`;
  if (selectedValue === '') {
    allOpt.selected = true;
  }
  select.appendChild(allOpt);
  
  optionsList.forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    const count = counts[val] || 0;
    
    opt.textContent = `${val} (${count.toLocaleString()})`;
    if (val === selectedValue) {
      opt.selected = true;
    }
    
    // Visually mute unavailable choices rather than removing them (completely prevents lock-in)
    if (count === 0) {
      opt.style.color = 'rgba(255, 255, 255, 0.4)';
    } else {
      opt.style.fontWeight = '500';
    }
    
    select.appendChild(opt);
  });
}

// Smart, non-locking cascading multi-dimensional facet engine
function updateDropdownsWithFacets() {
  const selectMaker = document.getElementById('filter-maker');
  const selectPattern = document.getElementById('filter-pattern');
  const selectSize = document.getElementById('filter-size');
  const selectSeason = document.getElementById('filter-season');
  const selectPart = document.getElementById('filter-part');
  const selectYear = document.getElementById('filter-year');
  const filterGroupPart = document.getElementById('filter-group-part');
  
  if (!selectMaker || !selectPattern || !selectSize || !selectSeason || !selectYear || !selectPart) return;
  
  const isCase = window.appState.currentSource === 'case';
  if (filterGroupPart) {
    if (isCase) {
      filterGroupPart.style.display = 'flex';
    } else {
      filterGroupPart.style.display = 'none';
      selectPart.value = '';
    }
  }
  
  const currentMaker = selectMaker.value;
  const currentPattern = selectPattern.value;
  const currentSize = selectSize.value;
  const currentSeason = selectSeason.value;
  const currentPart = isCase ? selectPart.value : '';
  const currentYear = selectYear.value;
  
  // Calculate facet counts for each filter by looking at the OTHER 5 filters (6대 다차원 필터링)
  const makerCounts = getFacetCounts('maker', {
    pattern: currentPattern,
    size: currentSize,
    season: currentSeason,
    part: currentPart,
    year: currentYear
  });
  
  const patternCounts = getFacetCounts('pattern', {
    maker: currentMaker,
    size: currentSize,
    season: currentSeason,
    part: currentPart,
    year: currentYear
  });
  
  const sizeCounts = getFacetCounts('size', {
    maker: currentMaker,
    pattern: currentPattern,
    season: currentSeason,
    part: currentPart,
    year: currentYear
  });
  
  const seasonCounts = getFacetCounts('season', {
    maker: currentMaker,
    pattern: currentPattern,
    size: currentSize,
    part: currentPart,
    year: currentYear
  });
  
  const partCounts = isCase ? getFacetCounts('part', {
    maker: currentMaker,
    pattern: currentPattern,
    size: currentSize,
    season: currentSeason,
    year: currentYear
  }) : {};
  
  const yearCounts = getFacetCounts('year', {
    maker: currentMaker,
    pattern: currentPattern,
    size: currentSize,
    season: currentSeason,
    part: currentPart
  });
  
  // Repopulate all selectors maintaining current values if they exist
  populateDropdownWithFacets('filter-maker', window.appState.filterOptions.maker, makerCounts, currentMaker);
  populateDropdownWithFacets('filter-pattern', window.appState.filterOptions.pattern, patternCounts, currentPattern);
  populateDropdownWithFacets('filter-size', window.appState.filterOptions.size, sizeCounts, currentSize);
  populateDropdownWithFacets('filter-season', window.appState.filterOptions.season, seasonCounts, currentSeason);
  populateDropdownWithFacets('filter-year', window.appState.filterOptions.year, yearCounts, currentYear);
  
  if (isCase) {
    populateDropdownWithFacets('filter-part', window.appState.filterOptions.part, partCounts, currentPart);
  }
}

// Reset filters to defaults
function resetFilters() {
  const original = window.appState.allData[window.appState.currentSource];
  window.appState.filteredData = [...original];
  
  // Reset select elements programmatically
  document.getElementById('filter-maker').value = '';
  document.getElementById('filter-pattern').value = '';
  document.getElementById('filter-size').value = '';
  document.getElementById('filter-season').value = '';
  document.getElementById('filter-year').value = '';
  const selectPart = document.getElementById('filter-part');
  if (selectPart) selectPart.value = '';
  
  initFilters();
  
  window.appState.currentPage = 1;
  updateExplorerTable();
  updateDashboard();
  
  if (window.TireCharts) {
    window.TireCharts.updateAllCharts();
  }
  
  // Reset reset-button styling
  const resetBtn = document.getElementById('btn-filter-reset');
  if (resetBtn) {
    resetBtn.style.background = '';
    resetBtn.style.borderColor = '';
    resetBtn.style.color = '';
  }
  
  window.showToast("필터 조건이 초기화되었습니다.");
}

// Handle multi-dimensional dynamic filter queries
function handleFilterChange() {
  const makerVal = document.getElementById('filter-maker').value;
  const patternVal = document.getElementById('filter-pattern').value;
  const sizeVal = document.getElementById('filter-size').value;
  const seasonVal = document.getElementById('filter-season').value;
  const yearVal = document.getElementById('filter-year').value;
  
  const isCase = window.appState.currentSource === 'case';
  const selectPart = document.getElementById('filter-part');
  const partVal = isCase && selectPart ? selectPart.value : '';
  
  const original = window.appState.allData[window.appState.currentSource];
  
  // Calculate final intersect
  window.appState.filteredData = original.filter(item => {
    const vals = getFieldValues(item);
    
    if (makerVal && vals.maker !== makerVal) return false;
    if (patternVal && vals.pattern !== patternVal) return false;
    if (sizeVal && vals.size !== sizeVal) return false;
    if (seasonVal && vals.season !== seasonVal) return false;
    if (partVal && vals.part !== partVal) return false;
    if (yearVal && vals.year !== yearVal) return false;
    
    return true;
  });
  
  // Update dropdown options in non-locking cascading way
  updateDropdownsWithFacets();
  
  // Dynamic Reset Button highlights
  const hasActiveFilter = makerVal || patternVal || sizeVal || seasonVal || partVal || yearVal;
  const resetBtn = document.getElementById('btn-filter-reset');
  if (resetBtn) {
    if (hasActiveFilter) {
      resetBtn.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(0, 242, 254, 0.05))';
      resetBtn.style.borderColor = 'var(--primary)';
      resetBtn.style.color = 'var(--primary)';
    } else {
      resetBtn.style.background = '';
      resetBtn.style.borderColor = '';
      resetBtn.style.color = '';
    }
  }
  
  window.appState.currentPage = 1;
  updateExplorerTable();
  updateDashboard();
  
  if (window.TireCharts) {
    window.TireCharts.updateAllCharts();
  }
  
  // Show helpful toast if no matching results are found under current combination
  if (window.appState.filteredData.length === 0) {
    window.showToast("⚠️ 선택하신 필터 조합에 해당하는 타이어가 없습니다. 다른 옵션을 클릭하거나 필터를 초기화해 주세요.", 4000);
  }
}

// Update Top Dashboard Stat Widgets
function updateDashboard() {
  const data = window.appState.filteredData;
  const statTotalTiresEl = document.getElementById('stat-total-tires');
  if (statTotalTiresEl) {
    statTotalTiresEl.textContent = data.length.toLocaleString();
  }
  
  // Dynamic Makers Set
  const makers = new Set();
  let totalTanD60 = 0;
  let countTanD60 = 0;
  let totalTg = 0;
  let countTg = 0;
  let totalG2_0 = 0;
  let countG2_0 = 0;
  
  data.forEach(item => {
    const m = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']);
    if (m) makers.add(m.toString().trim());
    
    // tanδ @ 60℃ parse
    const tand60Raw = window.appState.getProp(item, ['tanδ @ 60℃', 'tanδ @ 60C', 'tan δ @ 60℃', '60']);
    if (tand60Raw) {
      const num = parseFloat(tand60Raw);
      if (!isNaN(num)) {
        totalTanD60 += num;
        countTanD60++;
      }
    }
    
    // Tg peak parse
    const tgRaw = window.appState.getProp(item, ['Tg_peak temp. (℃)', 'Tg_peak temp. (C)', 'Tg']);
    if (tgRaw) {
      const tgNum = parseFloat(tgRaw);
      if (!isNaN(tgNum)) {
        totalTg += tgNum;
        countTg++;
      }
    }

    // G'' @ 0℃ parse
    const g2_0Raw = window.appState.getProp(item, ['G” @ 0℃ (E+06)', 'G” @ 0C', 'G” @ 0℃', "G'' @ 0℃"]);
    if (g2_0Raw) {
      const g2Num = parseFloat(g2_0Raw);
      if (!isNaN(g2Num)) {
        totalG2_0 += g2Num;
        countG2_0++;
      }
    }
  });
  
  const statTotalMakersEl = document.getElementById('stat-total-makers');
  const statAvgTand60El = document.getElementById('stat-avg-tand60');
  const statAvgTgEl = document.getElementById('stat-avg-tg');
  const statAvgG20El = document.getElementById('stat-avg-g2_0');

  if (statTotalMakersEl) statTotalMakersEl.textContent = makers.size;
  if (statAvgTand60El) statAvgTand60El.textContent = countTanD60 > 0 ? (totalTanD60 / countTanD60).toFixed(4) : 'N/A';
  if (statAvgTgEl) statAvgTgEl.textContent = countTg > 0 ? (totalTg / countTg).toFixed(1) + ' ℃' : 'N/A';
  if (statAvgG20El) statAvgG20El.textContent = countG2_0 > 0 ? (totalG2_0 / countG2_0).toFixed(2) + ' E+06' : 'N/A';

  // 제조사 수평 분석기(Gauges Grid) 렌더링 호출
  if (typeof renderMakerComparison === 'function') {
    renderMakerComparison();
  }
}

// Render dynamic table rows in Explorer
function updateExplorerTable() {
  const tableBody = document.getElementById('explorer-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  const data = window.appState.filteredData;
  const startIdx = (window.appState.currentPage - 1) * window.appState.pageSize;
  const endIdx = Math.min(startIdx + window.appState.pageSize, data.length);
  
  // Toggle pagination buttons
  document.getElementById('btn-prev-page').disabled = window.appState.currentPage === 1;
  document.getElementById('btn-next-page').disabled = endIdx >= data.length;
  
  document.getElementById('pagination-info').textContent = data.length > 0 
    ? `검색 결과: ${startIdx + 1} - ${endIdx} / 전체 ${data.length}개 항목`
    : '검색된 타이어 데이터가 없습니다.';
    
  const pageData = data.slice(startIdx, endIdx);
  
  pageData.forEach((item, index) => {
    const tr = document.createElement('tr');
    
    const isCase = window.appState.currentSource === 'case';
    const m = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A';
    const p = window.appState.getProp(item, ['Pattern']) || 'N/A';
    const s = window.appState.getProp(item, ['Size', '규격']) || 'N/A';
    const rawSe = isCase 
      ? (window.appState.getProp(item, ['부위']) || '-') 
      : (window.appState.getProp(item, ['Season']) || '-');
    const se = isCase ? rawSe : mapSeason(rawSe);
    const yr = window.appState.getProp(item, ['분석년도', '분석년도 ']) || 'N/A';
    
    const poly = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR']) || '-';
    const fill = window.appState.getProp(item, ['Carbon Black / Silica (phr)', 'Carbon Black / Silica']) || '-';
    const hard = window.appState.getProp(item, ['Hardness', 'Hardness ']) || '-';
    const tg = window.appState.getProp(item, ['Tg_peak temp. (℃)', 'Tg_peak temp. (C)', 'Tg']) || '-';
    
    // Check if currently selected
    const isSelected = window.appState.selectedTires.some(sel => 
      window.appState.getProp(sel, ['Maker', 'MakerPatternRaw']) === m && 
      window.appState.getProp(sel, ['Pattern']) === p && 
      window.appState.getProp(sel, ['Size', '규격']) === s
    );
    
    if (isSelected) tr.classList.add('selected');
    
    tr.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" class="checkbox-custom tire-selector" data-index="${startIdx + index}" ${isSelected ? 'checked' : ''}>
      </td>
      <td><span class="badge badge-brand">${m}</span></td>
      <td style="font-weight: 500;">${p}</td>
      <td><span class="badge badge-spec">${s}</span></td>
      <td>${se}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${poly}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${fill}</td>
      <td style="font-weight: 600; color: var(--accent-green);">${hard}</td>
      <td style="font-weight: 600; color: var(--primary);">${tg}</td>
      <td>${yr}</td>
    `;
    
    // Individual click row selection (ignoring if clicking checkbox directly)
    tr.addEventListener('click', (e) => {
      if (e.target.classList.contains('checkbox-custom')) return;
      const chk = tr.querySelector('.tire-selector');
      chk.checked = !chk.checked;
      handleRowSelection(chk.checked, parseInt(chk.getAttribute('data-index')), tr);
    });
    
    tr.querySelector('.tire-selector').addEventListener('change', (e) => {
      handleRowSelection(e.target.checked, parseInt(e.target.getAttribute('data-index')), tr);
    });
    
    tableBody.appendChild(tr);
  });
}

function handleRowSelection(checked, dataIndex, trElement) {
  const tire = window.appState.filteredData[dataIndex];
  
  if (checked) {
    trElement.classList.add('selected');
    // Prevent duplicates
    const alreadySelected = window.appState.selectedTires.some(sel => 
      window.appState.getProp(sel, ['Maker', 'MakerPatternRaw']) === window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) && 
      window.appState.getProp(sel, ['Pattern']) === window.appState.getProp(tire, ['Pattern']) && 
      window.appState.getProp(sel, ['Size', '규격']) === window.appState.getProp(tire, ['Size', '규격'])
    );
    if (!alreadySelected) {
      window.appState.selectedTires.push(tire);
    }
  } else {
    trElement.classList.remove('selected');
    window.appState.selectedTires = window.appState.selectedTires.filter(sel => !(
      window.appState.getProp(sel, ['Maker', 'MakerPatternRaw']) === window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) && 
      window.appState.getProp(sel, ['Pattern']) === window.appState.getProp(tire, ['Pattern']) && 
      window.appState.getProp(sel, ['Size', '규격']) === window.appState.getProp(tire, ['Size', '규격'])
    ));
    document.getElementById('check-all').checked = false;
  }
  
  // Dynamically update components dependent on selections
  if (window.ReportGenerator) {
    window.ReportGenerator.updateSelectedSummary();
  }
  if (window.TireCharts && window.TireCharts.updateAllCharts) {
    window.TireCharts.updateAllCharts();
  }
}

// Select All visible rows
function handleSelectAll(e) {
  const checked = e.target.checked;
  const checkboxes = document.querySelectorAll('#explorer-table-body .tire-selector');
  checkboxes.forEach(chk => {
    if (chk.checked !== checked) {
      chk.checked = checked;
      const tr = chk.closest('tr');
      handleRowSelection(checked, parseInt(chk.getAttribute('data-index')), tr);
    }
  });
}

function changePage(direction) {
  const maxPage = Math.ceil(window.appState.filteredData.length / window.appState.pageSize);
  const newPage = window.appState.currentPage + direction;
  
  if (newPage >= 1 && newPage <= maxPage) {
    window.appState.currentPage = newPage;
    updateExplorerTable();
  }
}

function checkPortalSearchQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQ = urlParams.get('search');
  if (searchQ) {
    console.log(`[Compd BM] 포털 통합 검색어 감지: "${searchQ}"`);
    
    // 컴파운드 탐색기 탭으로 강제 랜딩 및 시각적 유효성 확보
    const explorerTabEl = document.querySelector('.sidebar .menu-item[data-tab="tab-explorer"]');
    if (explorerTabEl) {
      explorerTabEl.click();
    }
    
    // 패턴 필터에 주입 및 필터 검색 반영
    const patternFilter = document.getElementById('filter-pattern');
    if (patternFilter) {
      let matchedValue = '';
      for (let option of patternFilter.options) {
        if (option.value.toLowerCase().includes(searchQ.toLowerCase())) {
          matchedValue = option.value;
          break;
        }
      }
      
      if (matchedValue) {
        patternFilter.value = matchedValue;
        patternFilter.dispatchEvent(new Event('change'));
      } else {
        // 일치하는 옵션이 없는 경우 동적 주입하여 자동 필터 검색 개시
        const tempOption = document.createElement('option');
        tempOption.value = searchQ;
        tempOption.textContent = searchQ;
        tempOption.selected = true;
        patternFilter.appendChild(tempOption);
        patternFilter.value = searchQ;
        patternFilter.dispatchEvent(new Event('change'));
      }
    }
  }
}

// ==========================================================================
// MAKER PRODUCT PERFORMANCE COMPARISON GAUGE WIDGET INTEGRATION
// ==========================================================================

// 데이터 레코드가 속한 Segment(차종)를 동적 판별하는 지능형 분류 헬퍼 함수
function getSegmentOfRecord(item) {
  const pattern = ((item.Pattern || '') + ' ' + (item['BM 주제'] || '')).toUpperCase();
  const season = (item.Season || '').toUpperCase();
  
  if (pattern.includes('EV') || pattern.includes('ION') || pattern.includes('아이온') || pattern.includes('E-PRIMACY') || pattern.includes('ELECT') || pattern.includes('ELECTRIC')) {
    return 'EV';
  }
  if (pattern.includes('SUV') || pattern.includes('HPX') || pattern.includes('ALENZA') || pattern.includes('CROSSCONTACT') || pattern.includes('DYNAPRO') || pattern.includes('CRUGEN')) {
    return 'SUV';
  }
  if (pattern.includes('WINTER') || pattern.includes('ICEPT') || pattern.includes('BLIZZAK') || pattern.includes('ALPIN') || pattern.includes('SNOW') || pattern.includes('스노우') || season.includes('WINTER')) {
    return 'Winter';
  }
  if (pattern.includes('SPORT') || pattern.includes('UHP') || pattern.includes('S1 EVO') || pattern.includes('PILOT SPORT') || pattern.includes('P ZERO') || pattern.includes('POTENZA') || pattern.includes('ADVAN') || pattern.includes('CORSA') || pattern.includes('YOKOHAMA')) {
    return 'UHP';
  }
  return 'Touring'; // 기본 사계절/투어링 세그먼트
}

// 7. Maker Compound properties Group By Calculator & Gauge Render (대시보드 직접 연동 이식)
function renderMakerComparison() {
  const viewport = document.getElementById('maker-compare-viewport');
  if (!viewport) return;

  // window.appState.allData.tread 또는 Mockup
  let treadList = window.appState.allData.tread;
  if (!treadList || treadList.length === 0) {
    treadList = getMockupTreadCompounds();
    window.appState.allData.tread = treadList;
  }

  // 대시보드 전역 필터값 조회
  const selectedSeason = window.appState.dashboardFilters ? window.appState.dashboardFilters.season : '';
  const selectedSegment = window.appState.dashboardFilters ? window.appState.dashboardFilters.segment : '';

  const makers = ["HANKOOK", "MICHELIN", "CONTINENTAL", "GOODYEAR", "BRIDGESTONE", "PIRELLI", "TOYO", "VREDESTEIN", "KUMHO"];

  if (!window.appState.selectedCompoundFilters) {
    window.appState.selectedCompoundFilters = {};
  }

  viewport.innerHTML = '';
  
  makers.forEach(maker => {
    const makerRecords = getMakerRecords(treadList, maker);

    // 1차 필터링: 전역 Season 및 Segment에 부합하는 레코드만 선별
    const filteredRecords = makerRecords.filter(item => {
      if (selectedSeason) {
        const itemSeason = (item.Season || '').trim().toUpperCase();
        const targetSeason = selectedSeason.trim().toUpperCase();
        if (itemSeason !== targetSeason) return false;
      }
      if (selectedSegment) {
        const itemSeg = getSegmentOfRecord(item);
        if (itemSeg !== selectedSegment) return false;
      }
      return true;
    });

    // 메이커 전체 패턴 목록 및 데이터 개수 계산 (필터링된 결과 기반)
    const pCounts = {};
    filteredRecords.forEach(item => {
      const p = (item.Pattern || '').trim();
      if (p && p !== '-' && p !== 'N/A' && p !== 'N/A ' && p.toLowerCase() !== 'test' && p.toLowerCase() !== 'n/a' && p.length > 1) {
        pCounts[p] = (pCounts[p] || 0) + 1;
      }
    });

    const pList = Object.keys(pCounts).sort();

    // 초기 상태 할당 또는 필터 조건 변경에 따른 패턴 자동 바인딩
    let activePattern = window.appState.selectedCompoundFilters[maker] ? window.appState.selectedCompoundFilters[maker].pattern : "";
    
    if (!activePattern || !pList.includes(activePattern)) {
      let maxPattern = "";
      let maxCount = 0;
      for (let p in pCounts) {
        if (pCounts[p] > maxCount) {
          maxCount = pCounts[p];
          maxPattern = p;
        }
      }
      activePattern = maxPattern || (pList.length > 0 ? pList[0] : "N/A");
      window.appState.selectedCompoundFilters[maker] = {
        pattern: activePattern
      };
    }

    // 최적 레코드 필터링 (필터링된 결과 내에서 activePattern 일치 레코드만 필터링)
    const selectedRecords = filteredRecords.filter(item => {
      return (item.Pattern || '').trim() === activePattern;
    });

    const averages = calculatePatternAverages(selectedRecords);
    
    const card = document.createElement('div');
    card.className = 'maker-compare-card';
    card.setAttribute('data-maker', maker);

    // 마우스 빛 번짐 효과 (Hover Glow Effect) 감지용 리스너 바인딩
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    // 물성 프로그레스 게이지 퍼센트 계산
    const tgVal = parseFloat(averages.avgTg);
    const tgPct = isNaN(tgVal) ? 0 : Math.min(100, Math.max(5, ((tgVal - (-45)) / 30) * 100));

    const tandVal = parseFloat(averages.avgTand60);
    const tandPct = isNaN(tandVal) ? 0 : Math.min(100, Math.max(5, ((tandVal - 0.03) / 0.06) * 100));

    const g0Val = parseFloat(averages.avgG0);
    const g0Pct = isNaN(g0Val) ? 0 : Math.min(100, Math.max(5, ((g0Val - 0.5) / 1.0) * 100));

    // 고무비 삼중 바 채움
    const nr = parseFloat(averages.avgNR) || 0;
    const sbr = parseFloat(averages.avgSBR) || 0;
    const br = parseFloat(averages.avgBR) || 0;
    const totalRubber = nr + sbr + br;
    const nrPct = totalRubber > 0 ? (nr / totalRubber) * 100 : 0;
    const sbrPct = totalRubber > 0 ? (sbr / totalRubber) * 100 : 0;
    const brPct = totalRubber > 0 ? (br / totalRubber) * 100 : 0;

    // 보강제 이중 바 채움
    const cbVal = parseFloat(averages.avgCB) || 0;
    const silVal = parseFloat(averages.avgSilica) || 0;
    const totalReinf = cbVal + silVal;
    const cbPct = totalReinf > 0 ? (cbVal / totalReinf) * 100 : 0;
    const silPct = totalReinf > 0 ? (silVal / totalReinf) * 100 : 0;

    const lowercaseMaker = maker.toLowerCase();

    // 단독 패턴 옵션 리스트 생성
    const patternOptionsHtml = pList.length > 0 ? pList.map(p => `
      <option value="${p}" ${p === activePattern ? 'selected' : ''}>${p}</option>
    `).join('') : `<option value="">해당 조건 패턴 없음</option>`;

    card.innerHTML = `
      <div class="mc-brand-header">
        <span class="mc-brand-name ${lowercaseMaker}">${maker}</span>
      </div>
      
      <!-- Pattern 단독 대형 드롭다운 필터 행 (패턴명 극대화 강조) -->
      <div class="mc-pattern-select-container">
        <select class="mc-pattern-dropdown-large" data-maker="${maker}">
          ${patternOptionsHtml}
        </select>
      </div>

      <!-- 배합 분석 결과 -->
      <div class="mc-ingredients-section">
        <div class="section-title">배합 분석 평균</div>
        
        <!-- 고무비 삼중 바 -->
        <div class="mini-ratio-bar-wrapper">
          <div class="ratio-info">
            <span>고무비</span>
            <span class="ratio-val">${averages.avgNR}/${averages.avgSBR}/${averages.avgBR}</span>
          </div>
          <div class="triple-ratio-bar">
            <div class="ratio-segment nr" style="width: ${nrPct}%;" title="NR: ${averages.avgNR}%"></div>
            <div class="ratio-segment sbr" style="width: ${sbrPct}%;" title="SBR: ${averages.avgSBR}%"></div>
            <div class="ratio-segment br" style="width: ${brPct}%;" title="BR: ${averages.avgBR}%"></div>
          </div>
        </div>

        <!-- CB / Silica 보강제 -->
        <div class="ingredient-item-row">
          <div class="ing-info">
            <span>보강제</span>
            <span class="ratio-val" style="font-weight: 700; color: var(--text-primary);">${averages.avgCB} / ${averages.avgSilica} phr</span>
          </div>
          <div class="reinf-ratio-bar">
            <div class="ratio-segment cb" style="width: ${cbPct}%;" title="Carbon Black: ${averages.avgCB} phr"></div>
            <div class="ratio-segment sil" style="width: ${silPct}%;" title="Silica: ${averages.avgSilica} phr"></div>
          </div>
        </div>
      </div>

      <!-- 핵심 물성 분석 결과 -->
      <div class="mc-gauge-section">
        <div class="section-title">핵심 물성 분석 결과</div>
        
        <!-- Tg Gauge -->
        <div class="mc-gauge-wrapper">
          <div class="mc-gauge-info">
            <span>유리전이온도</span>
            <span class="val">${averages.avgTg} ℃</span>
          </div>
          <div class="mc-progress-bar">
            <div class="mc-progress-fill" style="width: ${tgPct}%;"></div>
          </div>
        </div>

        <!-- Tand 60 Gauge -->
        <div class="mc-gauge-wrapper">
          <div class="mc-gauge-info">
            <span>회전저항지수 (Tan δ @ 60℃)</span>
            <span class="val">${averages.avgTand60}</span>
          </div>
          <div class="mc-progress-bar">
            <div class="mc-progress-fill tg" style="width: ${tandPct}%;"></div>
          </div>
        </div>

        <!-- G"0 Gauge -->
        <div class="mc-gauge-wrapper">
          <div class="mc-gauge-info">
            <span>제동성능지수 (G” @ 0℃)</span>
            <span class="val">${averages.avgG0} E+06</span>
          </div>
          <div class="mc-progress-bar">
            <div class="mc-progress-fill g0" style="width: ${g0Pct}%;"></div>
          </div>
        </div>
      </div>
    `;

    // 패턴 변경 시 상태 저장 후 실시간 비교 보드 리액티브 일제 갱신
    card.querySelector('.mc-pattern-dropdown-large').addEventListener('change', (e) => {
      window.appState.selectedCompoundFilters[maker].pattern = e.target.value;
      renderMakerComparison();
    });

    viewport.appendChild(card);
  });
}

// 브랜드 정밀 필터링 유닛 (Pirelli, Toyo, Vredestein 및 다국어/이명 통합 감지 지원)
function getMakerRecords(treadList, makerName) {
  return treadList.filter(item => {
    const m = (item.Maker || '').toUpperCase().replace(/[^A-Z0-9가-힣]/g, '').trim();
    const target = makerName.toUpperCase().replace(/[^A-Z0-9가-힣]/g, '').trim();
    
    // 브랜드별 다양한 이명/오기 매칭 네트워크 구축
    if (target === "HANKOOK") {
      return m.includes("HANKOOK") || m.includes("한국") || m.includes("KOREA");
    }
    if (target === "MICHELIN") {
      return m.includes("MICHELIN") || m.includes("미쉐린") || m.includes("미슐랭");
    }
    if (target === "CONTINENTAL") {
      return m.includes("CONTINENTAL") || m.includes("CONT") || m.includes("콘티");
    }
    if (target === "GOODYEAR") {
      return m.includes("GOODYEAR") || m.includes("GOOD") || m.includes("굿이어");
    }
    if (target === "BRIDGESTONE") {
      return m.includes("BRIDGESTONE") || m.includes("BRIDGE") || m.includes("브리지");
    }
    if (target === "PIRELLI") {
      return m.includes("PIRELLI") || m.includes("PIRE") || m.includes("피렐리");
    }
    if (target === "TOYO") {
      return m.includes("TOYO") || m.includes("토요");
    }
    if (target === "VREDESTEIN") {
      return m.includes("VREDESTEIN") || m.includes("VRED") || m.includes("브레데");
    }
    return m.includes(target);
  });
}

// 7.1 Compound String Parsers & Stat Calculators (Intelligent Property Lookup Helper 연계 이식)
function parseRubberRatio(str) {
  if (!str) return null;
  const parts = str.split('/').map(p => p.trim());
  if (parts.length >= 3) {
    const nr = parseFloat(parts[0].replace(/[^0-9.-]/g, '')) || 0;
    const sbr = parseFloat(parts[1].replace(/[^0-9.-]/g, '')) || 0;
    const br = parseFloat(parts[2].replace(/[^0-9.-]/g, '')) || 0;
    return { nr, sbr, br };
  }
  return null;
}

function parseReinforcer(str) {
  if (!str) return null;
  const parts = str.split('/').map(p => p.trim());
  if (parts.length >= 2) {
    const cb = parseFloat(parts[0].replace(/[^0-9.-]/g, '')) || 0;
    const silica = parseFloat(parts[1].replace(/[^0-9.-]/g, '')) || 0;
    return { cb, silica };
  }
  return null;
}

function parseOthers(str) {
  if (!str) return null;
  const parts = str.split('/').map(p => p.trim());
  if (parts.length >= 3) {
    const aceton = parseFloat(parts[0].replace(/[^0-9.-]/g, '')) || 0;
    const zno = parseFloat(parts[1].replace(/[^0-9.-]/g, '')) || 0;
    const sulfur = parseFloat(parts[2].replace(/[^0-9.-]/g, '')) || 0;
    return { aceton, zno, sulfur };
  }
  return null;
}

function calculatePatternAverages(records) {
  let rubberSum = { nr: 0, sbr: 0, br: 0, count: 0 };
  let reinfSum = { cb: 0, silica: 0, count: 0 };
  let otherSum = { aceton: 0, zno: 0, sulfur: 0, count: 0 };
  let tgSum = { val: 0, count: 0 };
  let tandSum = { val: 0, count: 0 };
  let g0Sum = { val: 0, count: 0 };

  records.forEach(item => {
    // 1. 고무비 파싱 (지능형 변종 수집 적용)
    const rr = parseRubberRatio(window.appState.getProp(item, ["NR / SBR / BR_NMR", "NR / SBR / BR_GC"]));
    if (rr) {
      rubberSum.nr += rr.nr;
      rubberSum.sbr += rr.sbr;
      rubberSum.br += rr.br;
      rubberSum.count++;
    }

    // 2. 보강제 파싱
    const rf = parseReinforcer(window.appState.getProp(item, ["Carbon Black / Silica (phr)", "Carbon Black / Silica"]));
    if (rf) {
      reinfSum.cb += rf.cb;
      reinfSum.silica += rf.silica;
      reinfSum.count++;
    }

    // 3. 기타배합제 파싱
    const ot = parseOthers(window.appState.getProp(item, ["Aceton / ZnO / T.Sulfur (phr)", "Aceton / ZnO / T.Sulfur"]));
    if (ot) {
      otherSum.aceton += ot.aceton;
      otherSum.zno += ot.zno;
      otherSum.sulfur += ot.sulfur;
      otherSum.count++;
    }

    // 4. Tg 파싱
    const tg = parseFloat(window.appState.getProp(item, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"]));
    if (!isNaN(tg)) {
      tgSum.val += tg;
      tgSum.count++;
    }

    // 5. Tan d 60 파싱
    const tand = parseFloat(window.appState.getProp(item, ["tanδ @ 60℃", "tanδ @ 60C", "tand60", "tand 60"]));
    if (!isNaN(tand)) {
      tandSum.val += tand;
      tandSum.count++;
    }

    // 6. G" 0 파싱
    const g0 = parseFloat(window.appState.getProp(item, ["G” @ 0℃ (E+06)", "G” @ 0C", "G\" @ 0C", "G\"0"]));
    if (!isNaN(g0)) {
      g0Sum.val += g0;
      g0Sum.count++;
    }
  });

  return {
    count: records.length,
    avgNR: rubberSum.count > 0 ? Math.round(rubberSum.nr / rubberSum.count) : 0,
    avgSBR: rubberSum.count > 0 ? Math.round(rubberSum.sbr / rubberSum.count) : 0,
    avgBR: rubberSum.count > 0 ? Math.round(rubberSum.br / rubberSum.count) : 0,
    avgCB: reinfSum.count > 0 ? (reinfSum.cb / reinfSum.count).toFixed(1) : 0,
    avgSilica: reinfSum.count > 0 ? (reinfSum.silica / reinfSum.count).toFixed(1) : 0,
    avgAceton: otherSum.count > 0 ? (otherSum.aceton / otherSum.count).toFixed(1) : 0,
    avgZnO: otherSum.count > 0 ? (otherSum.zno / otherSum.count).toFixed(2) : 0,
    avgSulfur: otherSum.count > 0 ? (otherSum.sulfur / otherSum.count).toFixed(2) : 0,
    avgTg: tgSum.count > 0 ? (tgSum.val / tgSum.count).toFixed(1) : "N/A",
    avgTand60: tandSum.count > 0 ? (tandSum.val / tandSum.count).toFixed(3) : "N/A",
    avgG0: g0Sum.count > 0 ? (g0Sum.val / g0Sum.count).toFixed(2) : "N/A"
  };
}

function getMockupTreadCompounds() {
  return [
    { "Maker": "HANKOOK", "Pattern": "Ventus S1 evo3", "NR / SBR / BR_GC": "5 / 75 / 20", "Carbon Black / Silica (phr)": "5.0 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.4", "Tg_peak temp. (℃)": -20.5, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 1.15, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Ventus S1 evo3 EV", "NR / SBR / BR_GC": "5 / 72 / 23", "Carbon Black / Silica (phr)": "4.0 / 88.0", "Aceton / ZnO / T.Sulfur (phr)": "49.0 / 0.38 / 3.5", "Tg_peak temp. (℃)": -19.2, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 1.22, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "HANKOOK", "Pattern": "iON EVO", "NR / SBR / BR_GC": "5 / 70 / 25", "Carbon Black / Silica (phr)": "3.5 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.4", "Tg_peak temp. (℃)": -20.5, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 1.12, "Season": "Summer", "분석년도": 2025 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT 4S", "NR / SBR / BR_GC": "5 / 75 / 20", "Carbon Black / Silica (phr)": "5.0 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.5", "Tg_peak temp. (℃)": -20.8, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 1.15, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "CONTINENTAL", "Pattern": "SportContact 7", "NR / SBR / BR_GC": "0 / 80 / 20", "Carbon Black / Silica (phr)": "3.0 / 92.0", "Aceton / ZnO / T.Sulfur (phr)": "52.0 / 0.35 / 3.8", "Tg_peak temp. (℃)": -18.5, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 1.34, "Season": "Summer", "분석년도": 2023 }
  ];
}
