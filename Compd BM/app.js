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

  // Sidebar Toggle Listener
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('btn-sidebar-toggle');
  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
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
  allOpt.textContent = `전체 (All) (${totalCount.toLocaleString()})`;
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
  document.getElementById('stat-total-tires').textContent = data.length.toLocaleString();
  
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
  
  document.getElementById('stat-total-makers').textContent = makers.size;
  document.getElementById('stat-avg-tand60').textContent = countTanD60 > 0 ? (totalTanD60 / countTanD60).toFixed(4) : 'N/A';
  document.getElementById('stat-avg-tg').textContent = countTg > 0 ? (totalTg / countTg).toFixed(1) + ' ℃' : 'N/A';
  document.getElementById('stat-avg-g2_0').textContent = countG2_0 > 0 ? (totalG2_0 / countG2_0).toFixed(2) + ' E+06' : 'N/A';
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
  if (window.TireCharts && window.TireCharts.updateRadarChart) {
    window.TireCharts.updateRadarChart();
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
