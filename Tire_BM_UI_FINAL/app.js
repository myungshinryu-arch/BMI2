/**
 * Tire BM System - Premium Dashboard Application Logic
 * 관장 영역: 종합 분석 대시보드, PLC Timeline 매트릭스, EV 친환경 특화 보드, 보고서 라이브러리
 */

// 0. Global Error Diagnostics Logger
window.addEventListener('error', (e) => {
  console.error("Global Diagnostics Exception:", e.error);
  const toast = document.getElementById('toast');
  const msgSpan = document.getElementById('toast-message');
  if (toast && msgSpan) {
    msgSpan.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>[진단 오류]</strong> ${e.message} (라인: ${e.lineno})`;
    toast.style.background = 'linear-gradient(135deg, #ff1744, #990011)';
    toast.style.borderColor = 'rgba(255, 23, 68, 0.4)';
    toast.style.boxShadow = '0 0 20px rgba(255, 23, 68, 0.5)';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.style.background = '';
      toast.style.borderColor = '';
      toast.style.boxShadow = '';
    }, 8000);
  }
});

// 1. Application Global State
const state = {
  reports: [],
  plcTimeline: [],
  evData: [],
  imagesMap: {},
  currentTab: 'tab-dashboard',
  timeline: {
    activeSheet: 'Summer', // Summer, SUV, Winter-Alpin, All Weather
    filterSegments: [],
    filterMakers: []
  },
  reportsLibrary: {
    searchQuery: '',
    filterDept: '',   // Department - UI ID: report-filter-maker
    filterDrafter: '', // Drafter - UI ID: report-filter-type
    currentPage: 1,
    pageSize: 20
  },
  globalSearch: '' // Topbar global highlighting query
};

// 2. Constants & Configuration
const CONFIG = {
  mediaPath: 'plc_media_unzipped/xl/media/',
  subtitles: {
    'tab-dashboard': '자사 제품 수명 주기 및 벤치마킹 보고서 종합 추적 현황',
    'tab-timeline': '연도별 세그먼트 제품 출시 및 사양 변천 추적',
    'tab-ev': '글로벌 완성차 제조사 대응 친환경/전기차 전용 타이어 개발 진척 현황',
    'tab-reports': '전체 81개 Arena VPR 심층 분석 보고서 통합 검색 및 아카이브'
  }
};

// 3. Document Ready Entry Point
document.addEventListener('DOMContentLoaded', () => {
  // CORS warning check (local file browsing warning)
  checkCORS();

  // Initialize event listeners
  setupNavigation();
  setupSearch();
  setupFilters();
  setupPlcTimelineFilters();
  setupDrawer();
  setupBtsPopup(); // BTS 이스터에그 팝업 컨트롤러 등록

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

  // Load backend database files
  loadAllData();

  // URL 해시 변경 이벤트 리스너 탑재
  window.addEventListener('hashchange', handleHashRouting);
});

// 4. Safety CORS Warning Banner Controller
function checkCORS() {
  if (window.location.protocol === 'file:') {
    const banner = document.getElementById('cors-warning-banner');
    if (banner) banner.style.display = 'block';
  }
}

// 5. Data Loading Engine
async function loadAllData() {
  try {
    showToast('데이터 자산을 로드 중입니다...');
    
    let data, images;

    // 1단계: 전역 window 객체에 로드된 자바스크립트 자산이 있는지 우선 탐색 (CORS 및 경로 슬래시 이슈 완전 방어)
    if (window.PLC_DATA && window.PLC_IMAGES_MAP) {
      console.log('Using robust inlined JS data assets (Stable CORS-safe Mode)');
      data = window.PLC_DATA;
      images = window.PLC_IMAGES_MAP;
    } else {
      console.log('Inlined assets not found. Attempting to fetch via HTTP fallback...');
      // 2단계: Fallback으로 HTTP fetch 동시 처리
      const [dataRes, imagesRes] = await Promise.all([
        fetch('data/plc_data.json'),
        fetch('data/plc_images_map.json')
      ]);

      if (!dataRes.ok || !imagesRes.ok) {
        throw new Error('서버 데이터를 불러오는데 실패했습니다.');
      }

      data = await dataRes.json();
      images = await imagesRes.json();
    }

    // Populate state
    state.reports = data.reports || [];
    state.plcTimeline = data.plcTimeline || [];
    state.evData = data.evData || [];
    state.imagesMap = images || {};

    console.log(`Loaded ${state.reports.length} reports, ${state.plcTimeline.length} timeline items, ${state.evData.length} EV items.`);

    // Populate report filter dropdown options
    populateReportFilters();

    // Initialize PLC Timeline filters
    updatePlcFilterOptions();

    // Initial renders
    renderAllViews();

    showToast('데이터 자산이 완벽하게 로드되었습니다.');

    // 포털 검색어 연동 연계 패치
    checkPortalSearchQuery();

    // URL 해시값 기반 다이렉트 탭 라우팅 실행
    handleHashRouting();

  } catch (err) {
    console.error('Data load error:', err);
    showToast('데이터 로드 실패: 로컬 서버 구동 상태를 확인해 주세요.');
  }
}

function checkPortalSearchQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQ = urlParams.get('search');
  if (searchQ) {
    console.log(`포털 통합 검색어 감지: "${searchQ}"`);
    
    // 타임라인 시트 탭으로 강제 이동해 시각적 랜드 보장
    switchTab('tab-timeline');
    
    // 탑바 검색창에 검색어 자동 주입 및 필터링 하이라이팅 개시
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.value = searchQ;
      state.globalSearch = searchQ;
      applyGlobalHighlight(searchQ);
    }
  }
}

// URL 해시 변경 감지 및 강제 탭 활성화 유틸리티
function handleHashRouting() {
  const hash = window.location.hash;
  if (!hash) return;
  
  const tabId = hash.replace('#', '');
  // tabId 예: tab-dashboard, tab-timeline, tab-ev, tab-reports
  switchTab(tabId);
}

// 6. Navigation and Sidebar Tabs Controller
function setupNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Welcome banner quick action buttons
  const quickTimelineBtn = document.getElementById('btn-quick-timeline');
  if (quickTimelineBtn) {
    quickTimelineBtn.addEventListener('click', () => switchTab('tab-timeline'));
  }

  const quickReportsBtn = document.getElementById('btn-quick-reports');
  if (quickReportsBtn) {
    quickReportsBtn.addEventListener('click', () => switchTab('tab-reports'));
  }

  // Timeline Sheet Category Sub-Tabs
  const subTabs = document.querySelectorAll('.plc-sub-tab');
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      state.timeline.activeSheet = tab.getAttribute('data-plc-sheet');
      
      // Update Board Title inside timeline
      const mapTitle = document.getElementById('plc-map-board-title');
      if (mapTitle) {
        mapTitle.innerHTML = `<i class="fa-solid fa-timeline"></i> 2차원 연도별 제품 출시 현황 (${state.timeline.activeSheet} Map)`;
      }

      // 시트 변경 시 필터 옵션을 동적으로 다시 생성
      updatePlcFilterOptions();

      renderTimeline();
      
      // Keep search highlighting if globalSearch query exists
      if (state.globalSearch) {
        applyGlobalHighlight(state.globalSearch);
      }
    });
  });
}

function switchTab(tabId) {
  // Toggle sidebar active menu item
  const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
  menuItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Toggle visible tab contents
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    if (tab.id === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update Title / Subtitle
  const titleText = document.getElementById('header-title-text');
  const subtitleText = document.getElementById('header-subtitle-text');
  
  if (titleText && CONFIG.subtitles[tabId]) {
    const menuEl = document.querySelector(`.sidebar-menu .menu-item[data-tab="${tabId}"] span`);
    titleText.textContent = menuEl ? menuEl.textContent : 'Tire BM Report';
    if (subtitleText) {
      subtitleText.textContent = CONFIG.subtitles[tabId];
    }
  }

  // Toggle Global Top Highlighter Searchbar Visibility
  const globalSearchContainer = document.getElementById('global-search-container');
  if (globalSearchContainer) {
    if (tabId === 'tab-timeline' || tabId === 'tab-ev') {
      globalSearchContainer.style.display = 'flex';
    } else {
      globalSearchContainer.style.display = 'none';
    }
  }

  state.currentTab = tabId;
}

// 7. Global Top Bar Real-Time Highlighter
function setupSearch() {
  const searchInput = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('global-search-clear');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      state.globalSearch = q;
      applyGlobalHighlight(q);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        state.globalSearch = '';
        applyGlobalHighlight('');
      }
    });
  }
}

function applyGlobalHighlight(query) {
  const clearBtn = document.getElementById('global-search-clear');
  if (clearBtn) {
    clearBtn.style.display = query.trim() ? 'block' : 'none';
  }

  const lowerQ = query.toLowerCase().trim();

  // 1. Highlight Timeline Cards
  const timelineCards = document.querySelectorAll('.plc-tire-card');
  timelineCards.forEach(card => {
    if (!lowerQ) {
      card.classList.remove('pulsing-highlight', 'faded-non-match');
      return;
    }
    const title = card.querySelector('.plc-card-title').textContent.toLowerCase();
    const maker = card.querySelector('.plc-card-maker').textContent.toLowerCase();

    if (title.includes(lowerQ) || maker.includes(lowerQ)) {
      card.classList.add('pulsing-highlight');
      card.classList.remove('faded-non-match');
    } else {
      card.classList.add('faded-non-match');
      card.classList.remove('pulsing-highlight');
    }
  });

  // 2. Highlight EV Cards
  const evCards = document.querySelectorAll('.ev-product-card');
  evCards.forEach(card => {
    if (!lowerQ) {
      card.classList.remove('pulsing-highlight', 'faded-non-match');
      return;
    }
    const name = card.querySelector('.ev-product-name').textContent.toLowerCase();
    const makerCol = card.closest('.ev-maker-column');
    const makerName = makerCol ? makerCol.querySelector('.ev-maker-title span').textContent.toLowerCase() : '';

    if (name.includes(lowerQ) || makerName.includes(lowerQ)) {
      card.classList.add('pulsing-highlight');
      card.classList.remove('faded-non-match');
    } else {
      card.classList.add('faded-non-match');
      card.classList.remove('pulsing-highlight');
    }
  });
}

// 8. Reports Library Filters and Pagination Engine
function setupFilters() {
  const searchInput = document.getElementById('report-search-input');
  const deptSelect = document.getElementById('report-filter-maker');   // 기안부서
  const drafterSelect = document.getElementById('report-filter-type'); // 기안자
  const resetBtn = document.getElementById('btn-report-reset');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.reportsLibrary.searchQuery = val;
      state.reportsLibrary.currentPage = 1;
      renderReportsLibrary();

      // BTS Easter Egg Trigger
      if (val.trim().toUpperCase() === 'BTS') {
        const dontShow = localStorage.getItem('dontShowBtsPopup') === 'true';
        if (!dontShow) {
          const btsModal = document.getElementById('bts-popup-modal');
          if (btsModal) {
            btsModal.style.display = 'flex';
          }
        }
      }
    });
  }

  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      state.reportsLibrary.filterDept = e.target.value;
      state.reportsLibrary.currentPage = 1;
      renderReportsLibrary();
    });
  }

  if (drafterSelect) {
    drafterSelect.addEventListener('change', (e) => {
      state.reportsLibrary.filterDrafter = e.target.value;
      state.reportsLibrary.currentPage = 1;
      renderReportsLibrary();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (deptSelect) deptSelect.value = '';
      if (drafterSelect) drafterSelect.value = '';

      state.reportsLibrary.searchQuery = '';
      state.reportsLibrary.filterDept = '';
      state.reportsLibrary.filterDrafter = '';
      state.reportsLibrary.currentPage = 1;

      renderReportsLibrary();
      showToast('필터가 초기화되었습니다.');
    });
  }

  // Pagination buttons
  const prevBtn = document.getElementById('btn-rep-prev-page');
  const nextBtn = document.getElementById('btn-rep-next-page');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.reportsLibrary.currentPage > 1) {
        state.reportsLibrary.currentPage--;
        renderReportsLibrary();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.reportsLibrary.currentPage++;
      renderReportsLibrary();
    });
  }
}

// BTS Easter Egg Popup Modal Controller
function setupBtsPopup() {
  const modal = document.getElementById('bts-popup-modal');
  const closeBtn = document.getElementById('close-bts-modal-btn');
  const closeBottomBtn = document.getElementById('close-bts-modal-bottom-btn');
  const dontShowBtn = document.getElementById('dont-show-bts-btn');
  const dontShowCheckbox = document.getElementById('dont-show-bts-checkbox');

  if (!modal) return;

  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      modal.style.opacity = '';
    }, 200);
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBottomBtn) closeBottomBtn.addEventListener('click', closeModal);

  // 모달 오버레이 배경 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // 다시 보지 않기 버튼 이벤트
  if (dontShowBtn && dontShowCheckbox) {
    let isChecked = false;
    dontShowBtn.addEventListener('click', () => {
      isChecked = !isChecked;
      if (isChecked) {
        dontShowCheckbox.className = 'fa-solid fa-square-check';
        dontShowCheckbox.style.color = '#a855f7';
        localStorage.setItem('dontShowBtsPopup', 'true');
        // 체크 시 0.4초 후 자동 닫기
        setTimeout(closeModal, 400);
      } else {
        dontShowCheckbox.className = 'fa-regular fa-square';
        dontShowCheckbox.style.color = '';
        localStorage.removeItem('dontShowBtsPopup');
      }
    });
  }
}

function populateReportFilters() {
  const deptSelect = document.getElementById('report-filter-maker');   // 기안부서
  const drafterSelect = document.getElementById('report-filter-type'); // 기안자

  if (!deptSelect || !drafterSelect) return;

  // Clear existing options (keep the first 'all' option)
  deptSelect.innerHTML = '<option value="">전체 부서</option>';
  drafterSelect.innerHTML = '<option value="">전체 기안자</option>';

  // Extract unique departments
  const departments = [...new Set(state.reports.map(r => r.dept).filter(Boolean))].sort();
  departments.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    deptSelect.appendChild(opt);
  });

  // Extract unique drafters
  const drafters = [...new Set(state.reports.map(r => r.drafter).filter(Boolean))].sort();
  drafters.forEach(drafter => {
    const opt = document.createElement('option');
    opt.value = drafter;
    opt.textContent = drafter;
    drafterSelect.appendChild(opt);
  });
}

// 9. Premium Right Slide Drawer Control
function setupDrawer() {
  const overlay = document.getElementById('plc-drawer-overlay');
  const closeBtn = document.getElementById('plc-drawer-close');

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  // Support Esc key to close drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });
}

function openDrawer() {
  const overlay = document.getElementById('plc-drawer-overlay');
  const drawer = document.getElementById('plc-detail-drawer');

  if (overlay) overlay.classList.add('active');
  if (drawer) drawer.classList.add('active');
}

function closeDrawer() {
  const overlay = document.getElementById('plc-drawer-overlay');
  const drawer = document.getElementById('plc-detail-drawer');

  if (overlay) overlay.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
}

// 10. Core View Rendering Dispatcher
function renderAllViews() {
  renderDashboard();
  renderTimeline();
  renderEVBoard();
  renderReportsLibrary();
}

// 11. Dashboard Overview Tab Renderer
function renderDashboard() {
  // Stats Calculation
  const totalTiresCount = state.plcTimeline.length;
  const evTiresCount = state.evData.length;
  const evCompletedCount = state.evData.filter(item => item.status && item.status.includes('완료')).length;
  const reportsCount = state.reports.length;

  document.getElementById('stat-total-tires').textContent = totalTiresCount.toLocaleString();
  document.getElementById('stat-ev-tires').textContent = evTiresCount.toLocaleString();
  document.getElementById('stat-ev-completed').textContent = evCompletedCount.toLocaleString();
  document.getElementById('stat-total-reports').textContent = reportsCount.toLocaleString();

  // Category summary distribution bars
  const container = document.getElementById('category-distribution-container');
  if (container) {
    container.innerHTML = '';
    
    const categoryKeys = [
      'Summer', 
      'Winter-Alpin', 
      'Winter-Nordic', 
      'All Weather', 
      'NA All season', 
      'Pick Up', 
      'SUV', 
      'VAN'
    ];
    const barColors = {
      'Summer': 'linear-gradient(90deg, #ff9100, #f59e0b)',
      'Winter-Alpin': 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
      'Winter-Nordic': 'linear-gradient(90deg, #0284c7, #1e3a8a)',
      'All Weather': 'linear-gradient(90deg, #10b981, #047857)',
      'NA All season': 'linear-gradient(90deg, #6366f1, #4338ca)',
      'Pick Up': 'linear-gradient(90deg, #f97316, #c2410c)',
      'SUV': 'linear-gradient(90deg, #84cc16, #4d7c0f)',
      'VAN': 'linear-gradient(90deg, #a855f7, #6d28d9)'
    };

    categoryKeys.forEach(sheetKey => {
      const sheetCount = state.plcTimeline.filter(item => item.sheet === sheetKey).length;
      const pct = totalTiresCount > 0 ? Math.round((sheetCount / totalTiresCount) * 100) : 0;
      
      const distItem = document.createElement('div');
      distItem.className = 'category-dist-item';
      distItem.innerHTML = `
        <span class="cat-label">${sheetKey}</span>
        <div class="cat-progress-bar">
          <div class="cat-progress-fill" style="width: ${pct}%; background: ${barColors[sheetKey] || 'var(--primary)'};"></div>
        </div>
        <span class="cat-count-badge">${pct}%</span>
      `;
      container.appendChild(distItem);
    });
  }

  // Dashboard Recent reports table (Top 5 reports)
  const recentReportsTbody = document.getElementById('dashboard-recent-reports-tbody');
  if (recentReportsTbody) {
    recentReportsTbody.innerHTML = '';
    
    // Filter reports with valid dates, sort by date desc, and take first 5
    const recentReports = state.reports
      .filter(r => r.completeDate && r.completeDate.trim() && r.completeDate !== '-')
      .sort((a, b) => b.completeDate.localeCompare(a.completeDate))
      .slice(0, 5);

    if (recentReports.length === 0) {
      recentReportsTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">최근 리포트 내역이 없습니다.</td></tr>`;
      return;
    }

    recentReports.forEach(rep => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge-brand" style="background: rgba(79, 172, 254, 0.1); border-color: rgba(79, 172, 254, 0.2); color: var(--secondary);">${rep.dept}</span></td>
        <td style="font-weight: 600;">${rep.drafter}</td>
        <td style="font-weight: 500;">${rep.title}</td>
        <td style="color: var(--accent-green); font-weight: 600; font-size: 0.8rem;">${rep.completeDate}</td>
        <td style="text-align: center;">
          <a href="${rep.linkAddress || '#'}" target="_blank" class="btn-report-circle" title="Arena 원본조회">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </td>
      `;
      recentReportsTbody.appendChild(tr);
    });
  }
}

// 12. 2D Matrix PLC Timeline Renderer (정밀 이중 열 & 엑셀 행번호 1:1 매핑 + rowspan 동적 병합 렌더러)
function renderTimeline() {
  const viewport = document.getElementById('plc-timeline-viewport');
  if (!viewport) return;

  const activeSheetName = state.timeline.activeSheet;
  
  // 1. 해당 시트의 타임라인 아이템 수집
  const sheetItems = state.plcTimeline.filter(item => item.sheet === activeSheetName);

  if (sheetItems.length === 0) {
    viewport.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 50px 0;">활성 시트 [${activeSheetName}] 내에 벤치마킹 데이터가 없습니다.</div>`;
    return;
  }

  // 2. 고유한 연도 오름차순 정렬 추출
  const years = [...new Set(sheetItems.map(item => item.year))].sort((a, b) => a - b);

  // 3. 고유한 excelRow 오름차순으로 행 목록 생성하여 순서 100% 보장
  const excelRows = [...new Set(sheetItems.map(item => item.excelRow))].sort((a, b) => a - b);

  // 각 excelRow에 매칭되는 그룹핑 생성
  const matrixRows = excelRows.map(rowNum => {
    const rowItems = sheetItems.filter(item => item.excelRow === rowNum);
    const sample = rowItems[0];
    
    // 카테고리 명칭에서 괄호 및 개행 설명 정밀 사전 절삭 (예: "Super Sport (dry 성능 위주...)" -> "Super Sport")
    let rawCategory = (sample.category || '').trim();
    if (rawCategory.includes('(')) {
      rawCategory = rawCategory.split('(')[0].trim();
    }
    
    return {
      excelRow: rowNum,
      category: rawCategory,
      division: (sample.division || '').trim(),
      items: rowItems
    };
  });

  // 3-1. 세그먼트 및 제조사 다중 선택 필터링 적용 (엑셀형 실시간 대화식 행 단위 필터링)
  const filteredRows = matrixRows.filter(row => {
    // 세그먼트 다중 필터링 검사
    if (state.timeline.filterSegments.length > 0) {
      if (!state.timeline.filterSegments.includes(row.category)) {
        return false;
      }
    }

    // 제조사 다중 필터링 검사
    if (state.timeline.filterMakers.length > 0) {
      const makerDisplayName = getMakerDisplayName(row.division, row.items);
      if (!state.timeline.filterMakers.includes(makerDisplayName)) {
        return false;
      }
    }

    return true;
  });

  // 4. 동적 rowspan 정밀 사전 계산 (필터링된 행 목록 기준)
  // 4-1. Segment(category)의 rowspan 연속 횟수 계산
  for (let i = 0; i < filteredRows.length; i++) {
    if (i === 0 || filteredRows[i].category !== filteredRows[i - 1].category) {
      let span = 1;
      while (i + span < filteredRows.length && filteredRows[i + span].category === filteredRows[i].category) {
        span++;
      }
      filteredRows[i].categorySpan = span;
    } else {
      filteredRows[i].categorySpan = 0; // 0이면 렌더링하지 않고 건너뜀
    }
  }

  // 4-2. Maker(division)의 rowspan 연속 횟수 계산 (반드시 동일 카테고리 내에서만 병합되도록 가드배치)
  for (let i = 0; i < filteredRows.length; i++) {
    const currentCat = filteredRows[i].category;
    const currentDiv = filteredRows[i].division;
    
    if (i === 0 || filteredRows[i - 1].category !== currentCat || filteredRows[i - 1].division !== currentDiv) {
      let span = 1;
      while (
        i + span < filteredRows.length && 
        filteredRows[i + span].category === currentCat && 
        filteredRows[i + span].division === currentDiv
      ) {
        span++;
      }
      filteredRows[i].divisionSpan = span;
    } else {
      filteredRows[i].divisionSpan = 0; // 0이면 렌더링하지 않고 건너뜀
    }
  }

  // 5. 테이블 생성
  const table = document.createElement('table');
  table.className = 'plc-matrix-table';

  // 6. 테이블 헤더 (이중 Sticky 열 세팅)
  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');
  
  const segmentTh = document.createElement('th');
  segmentTh.className = 'segment-col';
  segmentTh.textContent = '세그먼트';
  headerTr.appendChild(segmentTh);

  const makerTh = document.createElement('th');
  makerTh.className = 'maker-col';
  makerTh.textContent = '구분';
  headerTr.appendChild(makerTh);

  years.forEach(year => {
    const th = document.createElement('th');
    th.textContent = year;
    if (year === 2025 || year === 2026) {
      th.classList.add('active-year');
    }
    headerTr.appendChild(th);
  });
  thead.appendChild(headerTr);
  table.appendChild(thead);

  // 7. 테이블 바디 렌더링 및 동적 rowspan 적용
  const tbody = document.createElement('tbody');
  
  if (filteredRows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = years.length + 2;
    td.style.textAlign = 'center';
    td.style.color = 'var(--text-muted)';
    td.style.padding = '50px 0';
    td.style.fontSize = '0.95rem';
    td.style.fontWeight = '600';
    td.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px; color: var(--primary);"></i> 선택된 필터 조건에 해당하는 데이터가 존재하지 않습니다.`;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    filteredRows.forEach((row) => {
      const tr = document.createElement('tr');
      
      // 자사 Hankook 행 판별하여 행 강조용 클래스 주입
      const isHankookRow = (row.division.toUpperCase() === 'HK' || row.division === '자사' || row.division.toUpperCase() === 'HANKOOK');
      if (isHankookRow) {
        tr.classList.add('hankook-row');
      }
      
      // 7-1. Segment (Category) 셀 렌더링 (동적 rowspan 적용)
      if (row.categorySpan > 0) {
        const segmentTd = document.createElement('td');
        segmentTd.className = 'segment-col group-first';
        segmentTd.rowSpan = row.categorySpan;
        segmentTd.innerHTML = `
          <div class="plc-segment-label">
            <span class="seg-name" title="${row.category}">${row.category}</span>
          </div>
        `;
        tr.appendChild(segmentTd);
      }
      
      // 7-2. Maker (Division) 셀 렌더링 (동적 rowspan 적용)
      if (row.divisionSpan > 0) {
        const makerTd = document.createElement('td');
        makerTd.className = 'maker-col group-first';
        makerTd.rowSpan = row.divisionSpan;
        
        const makerDisplayName = getMakerDisplayName(row.division, row.items);
        const isHankookLabel = (makerDisplayName === 'Hankook');
        
        makerTd.innerHTML = `
          <div class="plc-maker-label ${isHankookLabel ? 'hankook-label' : ''}">
            <span class="maker-name">${makerDisplayName}</span>
          </div>
        `;
        tr.appendChild(makerTd);
      }

      // 7-3. 연도별 타임라인 셀 채우기
      years.forEach(year => {
        const td = document.createElement('td');
        td.className = 'plc-matrix-cell';
        
        const cellItems = row.items.filter(item => item.year === year);
        
        if (cellItems.length > 0) {
          const cardsWrapper = document.createElement('div');
          cardsWrapper.className = 'plc-cell-cards-wrapper';

          cellItems.forEach(item => {
            const hasImg = findTireImage(item.sheet, item.excelRow, item.excelCol) !== null;
            const associatedRep = findAssociatedReport(item.productName);
            const hasRep = associatedRep !== null;

            const card = document.createElement('div');
            card.className = `plc-tire-card ${hasImg ? 'has-image' : ''} ${hasRep ? 'has-report' : ''}`;
            card.setAttribute('data-excel-row', item.excelRow);
            card.setAttribute('data-excel-col', item.excelCol);

            const makerText = detectMaker(item.productName);

            card.innerHTML = `
              <div class="plc-card-title" title="${item.productName}">${item.productName}</div>
              <div class="plc-card-maker">${makerText}</div>
              <div class="plc-card-icons">
                ${hasImg ? '<span class="plc-icon-indicator img" title="실물 이미지 연계"><i class="fa-solid fa-image"></i></span>' : ''}
                ${hasRep ? '<span class="plc-icon-indicator rep" title="기안 분석 보고서 연계"><i class="fa-solid fa-file-lines"></i></span>' : ''}
              </div>
            `;

            // 카드 클릭 시 드로워 확장
            card.addEventListener('click', (e) => {
              e.stopPropagation();
              showTimelineDetails(item);
            });

            cardsWrapper.appendChild(card);
          });

          td.appendChild(cardsWrapper);
        } else {
          td.innerHTML = `<span style="color: rgba(255,255,255,0.03); font-size: 0.75rem;">-</span>`;
        }
        
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  viewport.innerHTML = '';
  viewport.appendChild(table);

  // 렌더링 후 가장 최근 연도(가장 오른쪽)를 우선적으로 볼 수 있도록 횡스크롤을 오른쪽 끝으로 자동 이동
  setTimeout(() => {
    viewport.scrollLeft = viewport.scrollWidth;
  }, 100);
}

// 엑셀 내 구분을 실제 표시용 메이커로 매핑해주는 스마트 헬퍼 함수
function getMakerDisplayName(division, items) {
  if (!division) return '-';
  const cleanDiv = division.toUpperCase().trim();
  
  const mapping = {
    'CT': 'Continental',
    'MC': 'Michelin',
    'PR': 'Pirelli',
    'GY': 'Goodyear',
    'BS': 'Bridgestone',
    'HK': 'Hankook',
    '자사': 'Hankook',
    'HANKOOK': 'Hankook'
  };
  
  if (mapping[cleanDiv]) {
    return mapping[cleanDiv];
  }
  
  // 만약 사전에 매핑되지 않은 경우, 행 내부 아이템의 브랜드명을 역추적하여 안전 장치 마련
  if (items && items.length > 0) {
    for (const item of items) {
      const detected = detectMaker(item.productName);
      if (detected && detected !== '기타') {
        if (detected === 'Hankook') return 'Hankook';
        return detected;
      }
    }
  }
  
  return division;
}

// 13. EV 특화 보드 렌더러 (제조사별 Column & Kanban)
function renderEVBoard() {
  const viewport = document.getElementById('plc-ev-board-viewport');
  if (!viewport) return;

  if (state.evData.length === 0) {
    viewport.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 50px 0;">전기차 벤치마킹 타겟 데이터가 존재하지 않습니다.</div>`;
    return;
  }

  // Group items by maker
  const grouped = {};
  state.evData.forEach(item => {
    const m = item.maker || '기타';
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(item);
  });

  // Render Columns
  viewport.innerHTML = '';
  
  const sortedMakers = Object.keys(grouped).sort((a, b) => {
    // Put Michelin, Continental, Pirelli first if they exist
    const priority = { 'Michelin': 1, 'Continental': 2, 'Pirelli': 3, 'Bridgestone': 4 };
    const ap = priority[a] || 99;
    const bp = priority[b] || 99;
    if (ap !== bp) return ap - bp;
    return a.localeCompare(b);
  });

  sortedMakers.forEach(maker => {
    const makerItems = grouped[maker];
    
    const column = document.createElement('div');
    column.className = 'ev-maker-column';

    column.innerHTML = `
      <div class="ev-maker-header">
        <div class="ev-maker-title">
          <i class="fa-solid fa-industry" style="color: var(--primary);"></i>
          <span>${maker}</span>
        </div>
        <span class="ev-maker-badge">${makerItems.length} 모델</span>
      </div>
      <div class="ev-items-list">
        <!-- Cards insert here -->
      </div>
    `;

    const itemsList = column.querySelector('.ev-items-list');

    makerItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ev-product-card';
      card.setAttribute('data-excel-row', item.excelRow);

      const hasImg = findEVImage(item.excelRow) !== null;

      card.innerHTML = `
        <div class="ev-product-header">
          <div class="ev-product-name" title="${item.productName}">${item.productName}</div>
          <span class="ev-type-badge ${item.type === '전용상품' ? 'ev-type-exclusive' : 'ev-type-compatible'}">
            ${item.type}
          </span>
        </div>
        <div class="ev-product-details">
          <span>${item.segment}</span>
          <span class="ev-status-badge ${getEVStatusClass(item.status)}">
            <i class="${getEVStatusIcon(item.status)}"></i>
            ${item.status}
            ${hasImg ? ' <i class="fa-regular fa-image" style="color: var(--primary); margin-left: 2px;" title="이미지 연동"></i>' : ''}
          </span>
        </div>
      `;

      // Clicks handler for EV Card
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        showEVDetails(item);
      });

      itemsList.appendChild(card);
    });

    viewport.appendChild(column);
  });
}

function getEVStatusClass(status) {
  if (!status) return 'ev-status-todo';
  const val = status.toLowerCase();
  if (val.includes('완료') || val.includes('complete')) return 'ev-status-done';
  if (val.includes('진행') || val.includes('분석중') || val.includes('대기')) return 'ev-status-progress';
  return 'ev-status-todo';
}

function getEVStatusIcon(status) {
  if (!status) return 'fa-regular fa-circle-question';
  const val = status.toLowerCase();
  if (val.includes('완료') || val.includes('complete')) return 'fa-solid fa-circle-check';
  if (val.includes('진행') || val.includes('분석중') || val.includes('대기')) return 'fa-solid fa-circle-notch fa-spin';
  return 'fa-regular fa-circle';
}

// 14. Reports Library Archive Table Renderer
function renderReportsLibrary() {
  const tbody = document.getElementById('reports-library-tbody');
  if (!tbody) return;

  const query = state.reportsLibrary.searchQuery.toLowerCase().trim();
  const selectedDept = state.reportsLibrary.filterDept;
  const selectedDrafter = state.reportsLibrary.filterDrafter;

  // Filter reports
  const filtered = state.reports.filter(r => {
    const matchesQuery = !query || 
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.drafter && r.drafter.toLowerCase().includes(query)) ||
      (r.dept && r.dept.toLowerCase().includes(query)) ||
      (r.docNo && r.docNo.toLowerCase().includes(query)) ||
      (r.relatedProducts && r.relatedProducts.some(p => p.toLowerCase().includes(query)));

    const matchesDept = !selectedDept || r.dept === selectedDept;
    const matchesDrafter = !selectedDrafter || r.drafter === selectedDrafter;

    return matchesQuery && matchesDept && matchesDrafter;
  });

  const total = filtered.length;
  const pageSize = state.reportsLibrary.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Sync current page bounds
  if (state.reportsLibrary.currentPage > totalPages) {
    state.reportsLibrary.currentPage = totalPages;
  }
  if (state.reportsLibrary.currentPage < 1) {
    state.reportsLibrary.currentPage = 1;
  }

  const startIdx = (state.reportsLibrary.currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 50px 0;">
          검색 및 필터 조건에 부합하는 보고서가 아카이브에 존재하지 않습니다.
        </td>
      </tr>
    `;
    document.getElementById('reports-pagination-info').textContent = '검색 결과: 0개';
    document.getElementById('btn-rep-prev-page').disabled = true;
    document.getElementById('btn-rep-next-page').disabled = true;
    return;
  }

  const pageItems = filtered.slice(startIdx, endIdx);

  pageItems.forEach(r => {
    const tr = document.createElement('tr');
    
    // Highlight matched products tag
    let tagsHtml = '';
    if (r.relatedProducts && r.relatedProducts.length > 0) {
      tagsHtml = `
        <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
          ${r.relatedProducts.map(p => `<span class="badge-spec" style="font-size:0.65rem; background:rgba(0,242,254,0.04); border-color:rgba(0,242,254,0.1); color:var(--primary);"><i class="fa-solid fa-tag" style="font-size:0.55rem; margin-right:2px;"></i> ${p}</span>`).join('')}
        </div>
      `;
    }

    tr.innerHTML = `
      <td>
        <span class="badge-brand" style="background: rgba(79, 172, 254, 0.08); border-color: rgba(79, 172, 254, 0.18); color: var(--secondary); font-size: 0.75rem;">
          ${r.dept}
        </span>
      </td>
      <td style="font-weight: 600;">${r.drafter}</td>
      <td style="font-weight: 500; font-family: var(--font-sans); max-width: 400px; line-height: 1.45;">
        <span style="font-size: 0.9rem; font-weight: 600;">${r.title}</span>
        ${tagsHtml}
        <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; font-family: monospace;">DOC ID: ${r.docNo}</div>
      </td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${r.draftDate || '-'}</td>
      <td style="color: var(--accent-green); font-weight: 600; font-size: 0.8rem;">${r.completeDate || '-'}</td>
      <td style="text-align: center;">
        <a href="${r.linkAddress || '#'}" target="_blank" class="btn-report-circle" title="Arena 기술 분석 보고서 즉시 조회">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update pagination indicators
  const pInfo = document.getElementById('reports-pagination-info');
  if (pInfo) {
    pInfo.textContent = `조회 결과: ${total > 0 ? startIdx + 1 : 0} - ${endIdx} / 전체 ${total}개 보고서`;
  }

  const prevBtn = document.getElementById('btn-rep-prev-page');
  const nextBtn = document.getElementById('btn-rep-next-page');

  if (prevBtn) prevBtn.disabled = (state.reportsLibrary.currentPage === 1);
  if (nextBtn) nextBtn.disabled = (state.reportsLibrary.currentPage === totalPages);
}

// 15. Slide-Out Details Population helpers
function showTimelineDetails(item) {
  // Populate text specs
  document.getElementById('plc-drawer-tire-name').textContent = item.productName;
  
  const maker = detectMaker(item.productName);
  const makerBadge = document.getElementById('plc-drawer-tire-maker');
  makerBadge.textContent = maker;
  makerBadge.style.background = getMakerBadgeColor(maker);

  document.getElementById('plc-spec-sheet').textContent = item.sheet;
  
  let cleanCategory = (item.category || '').trim();
  if (cleanCategory.includes('(')) {
    cleanCategory = cleanCategory.split('(')[0].trim();
  }
  document.getElementById('plc-spec-category').textContent = cleanCategory;
  
  const cleanDivision = getMakerDisplayName(item.division, [item]);
  document.getElementById('plc-spec-division').textContent = cleanDivision;
  
  document.getElementById('plc-spec-year').textContent = `${item.year} 년`;
  document.getElementById('plc-spec-type').textContent = '벤치마킹 타이어';

  // Find image mapping using Manhattan priority offsets
  const matchedImg = findTireImage(item.sheet, item.excelRow, item.excelCol);
  const imgEl = document.getElementById('plc-drawer-img');
  const fallbackEl = document.getElementById('plc-drawer-img-fallback');

  if (matchedImg) {
    imgEl.src = `${CONFIG.mediaPath}${matchedImg}`;
    imgEl.style.display = 'block';
    fallbackEl.style.display = 'none';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
  }

  // Search associated Arena Report
  const associatedReport = findAssociatedReport(item.productName);
  const reportBtn = document.getElementById('plc-report-link-btn');
  const commentBox = document.getElementById('plc-drawer-comment');
  const statusSpec = document.getElementById('plc-spec-status');

  if (associatedReport) {
    statusSpec.textContent = '분석 완료 (VPR 연계)';
    statusSpec.style.color = 'var(--accent-green)';
    
    reportBtn.href = associatedReport.linkAddress || '#';
    reportBtn.style.display = 'flex';

    commentBox.innerHTML = `
<strong>[연계 Arena 기안 보고서 식별]</strong>
• 보고서명: ${associatedReport.title}
• 문서번호: ${associatedReport.docNo}
• 기안자: ${associatedReport.drafter} (${associatedReport.dept})
• 완료일자: ${associatedReport.completeDate}

* 상기 기안 보고서 버튼을 클릭하시면 사내망 Arena 시스템의 완성 원본 문서를 새 탭에서 즉시 조회하실 수 있습니다.
    `.trim();
  } else {
    statusSpec.textContent = 'PLC 등록 / 미분석';
    statusSpec.style.color = 'var(--text-muted)';
    
    reportBtn.href = '#';
    reportBtn.style.display = 'none';

    commentBox.textContent = '해당 제품규격에 직결된 VPR 분석 리포트 연계 내역이 없습니다. (사내 아카이브 검색 필터를 사용해 확인해 주세요)';
  }

  openDrawer();
}

function showEVDetails(item) {
  // Populate text specs
  document.getElementById('plc-drawer-tire-name').textContent = item.productName;
  
  const makerBadge = document.getElementById('plc-drawer-tire-maker');
  makerBadge.textContent = item.maker;
  makerBadge.style.background = getMakerBadgeColor(item.maker);

  document.getElementById('plc-spec-sheet').textContent = 'EV 친환경 Board';
  
  let cleanSegment = (item.segment || '').trim();
  if (cleanSegment.includes('(')) {
    cleanSegment = cleanSegment.split('(')[0].trim();
  }
  document.getElementById('plc-spec-category').textContent = cleanSegment;
  
  document.getElementById('plc-spec-division').textContent = item.maker;
  document.getElementById('plc-spec-year').textContent = item.rank ? `우선순위 Rank ${item.rank}` : 'EV 특화';
  document.getElementById('plc-spec-type').textContent = item.type; // 전용상품 / 호환상품

  const statusSpec = document.getElementById('plc-spec-status');
  statusSpec.textContent = item.status || '미분석';
  
  if (item.status && item.status.includes('완료')) {
    statusSpec.style.color = 'var(--accent-green)';
  } else {
    statusSpec.style.color = 'var(--accent-orange)';
  }

  // Find EV Image (by Row index matching)
  const matchedImg = findEVImage(item.excelRow);
  const imgEl = document.getElementById('plc-drawer-img');
  const fallbackEl = document.getElementById('plc-drawer-img-fallback');

  if (matchedImg) {
    imgEl.src = `${CONFIG.mediaPath}${matchedImg}`;
    imgEl.style.display = 'block';
    fallbackEl.style.display = 'none';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
  }

  // Find related report
  let evReport = state.reports.find(rep => item.reportTitle && rep.title && rep.title.toLowerCase().includes(item.reportTitle.toLowerCase()));
  if (!evReport) {
    evReport = findAssociatedReport(item.productName);
  }

  const reportBtn = document.getElementById('plc-report-link-btn');
  const commentBox = document.getElementById('plc-drawer-comment');

  if (evReport) {
    reportBtn.href = evReport.linkAddress || '#';
    reportBtn.style.display = 'flex';
  } else {
    reportBtn.href = '#';
    reportBtn.style.display = 'none';
  }

  let commentHtml = '';
  if (item.comment) {
    commentHtml += `<strong>[제품 특이 기술 및 분석 소견]</strong>\n${item.comment}\n\n`;
  }
  if (evReport) {
    commentHtml += `<strong>[연계 벤치마킹 보고서]</strong>\n• 보고서명: ${evReport.title}\n• 기안자: ${evReport.drafter} (${evReport.dept})\n• 완료일: ${evReport.completeDate}`;
  } else if (item.reportTitle) {
    commentHtml += `<strong>[명기된 연계 보고서명]</strong>\n${item.reportTitle}`;
  }

  commentBox.innerHTML = (commentHtml || '등록된 기술 비고 소견이 없습니다.').trim();

  openDrawer();
}

// Coordinate based Image Lookups
function findTireImage(sheetName, r, c) {
  const sheetImages = state.imagesMap[sheetName];
  if (!sheetImages || sheetImages.length === 0) return null;

  // Prioritized search offsets:
  // dr = imageRow - excelRow, dc = imageCol - excelCol
  const prioritizedOffsets = [
    { dr: 0, dc: 0 },  // Exact cell
    { dr: 0, dc: 1 },  // Shifted 1 column right (most common offset in Excel)
    { dr: 0, dc: -1 }, // Shifted 1 column left
    { dr: -1, dc: 0 }, // Shifted 1 row up
    { dr: 1, dc: 0 },  // Shifted 1 row down
    { dr: -1, dc: 1 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: -1 },
    { dr: 1, dc: -1 }
  ];

  for (const offset of prioritizedOffsets) {
    const found = sheetImages.find(img => img.row === r + offset.dr && img.col === c + offset.dc);
    if (found) return found.image;
  }

  // Fallback to the closest Manhattan distance if <= 2 cells
  let bestImage = null;
  let minDistance = Infinity;
  sheetImages.forEach(img => {
    const dr = img.row - r;
    const dc = img.col - c;
    const distance = Math.abs(dr) + Math.abs(dc);
    if (distance <= 2 && distance < minDistance) {
      minDistance = distance;
      bestImage = img.image;
    }
  });

  return bestImage;
}

function findEVImage(excelRow) {
  const evImages = state.imagesMap['EV'] || [];
  // Since each row in EV sheet is a unique product row, we can exact-match row index!
  const match = evImages.find(img => img.row === excelRow);
  return match ? match.image : null;
}

function findAssociatedReport(productName) {
  if (!productName) return null;
  
  // Clean product name for token-based robust substring comparison
  const cleanTire = productName.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

  return state.reports.find(rep => {
    // 1. Direct match with parsed relatedProducts
    if (rep.relatedProducts && rep.relatedProducts.length > 0) {
      const match = rep.relatedProducts.some(p => {
        const cleanP = p.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
        return cleanP && (cleanTire.includes(cleanP) || cleanP.includes(cleanTire));
      });
      if (match) return true;
    }

    // 2. Fallback: Check if tire name is a substring inside the report title
    if (rep.title) {
      const cleanTitle = rep.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
      if (cleanTitle.includes(cleanTire)) return true;
    }

    return false;
  });
}

// 제조사 판별 핵심 AI 매퍼 함수 (정밀 키워드 정합 매칭 기법)
function detectMaker(productName) {
  if (!productName) return '기타';
  const name = productName.toLowerCase();
  
  if (name.includes('michelin') || name.includes('cup 2') || name.includes('pilot sport') || name.includes('latitude') || name.includes('primacy') || name.includes('alpin')) {
    return 'Michelin';
  }
  if (name.includes('pirelli') || name.includes('p zero') || name.includes('pzero') || name.includes('cinturato') || name.includes('scorpion') || name.includes('sottozero')) {
    return 'Pirelli';
  }
  if (name.includes('continental') || name.includes('sportcontact') || name.includes('premiumcontact') || name.includes('ultracontact') || name.includes('ecocontact') || name.includes('wintercontact') || name.includes('crosscontact')) {
    return 'Continental';
  }
  if (name.includes('goodyear') || name.includes('eagle f1') || name.includes('efficientgrip') || name.includes('assurance') || name.includes('ultragrip')) {
    return 'Goodyear';
  }
  if (name.includes('bridgestone') || name.includes('potenza') || name.includes('alenza') || name.includes('turanza') || name.includes('ecopia') || name.includes('blizzak')) {
    return 'Bridgestone';
  }
  if (name.includes('hankook') || name.includes('ventus') || name.includes('dynapro') || name.includes('kinergy') || name.includes('ion ') || name.includes('i*cept') || name.includes('winter i*cept')) {
    return 'Hankook';
  }
  
  if (name.includes('miche') || name.includes('미쉐린')) return 'Michelin';
  if (name.includes('pire') || name.includes('피렐리')) return 'Pirelli';
  if (name.includes('conti') || name.includes('콘티넨탈')) return 'Continental';
  if (name.includes('goody') || name.includes('굿이어')) return 'Goodyear';
  if (name.includes('bridge') || name.includes('브릿지스톤')) return 'Bridgestone';
  if (name.includes('hanko') || name.includes('한국타이어')) return 'Hankook';

  return '기타';
}

function getMakerBadgeColor(maker) {
  const colors = {
    'Michelin': 'linear-gradient(135deg, #2563eb, #1d4ed8)',     // Navy blue
    'Pirelli': 'linear-gradient(135deg, #f59e0b, #d97706)',      // Golden yellow
    'Continental': 'linear-gradient(135deg, #ea580c, #ca8a04)',  // Orange-yellow
    'Goodyear': 'linear-gradient(135deg, #1e3a8a, #fbbf24)',     // Deep Blue-gold
    'Bridgestone': 'linear-gradient(135deg, #dc2626, #991b1b)',  // Solid Red
    'Hankook': 'linear-gradient(135deg, #ec4899, #db2777)'       // Pinkish-magenta
  };
  return colors[maker] || 'linear-gradient(135deg, #64748b, #475569)'; // Gray slate
}

// 16. Dynamic Toast Notifications Controller
function showToast(message) {
  const toast = document.getElementById('toast');
  const msgSpan = document.getElementById('toast-message');

  if (!toast || !msgSpan) return;

  msgSpan.textContent = message;
  toast.classList.add('show');

  // Slide away after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// 17. PLC Timeline Excel-style Live Filter Controllers (Premium Multi-Select Dropdowns)
function setupPlcTimelineFilters() {
  const segmentBtn = document.getElementById('btn-filter-segment');
  const segmentDropdown = document.getElementById('dropdown-filter-segment');
  const makerBtn = document.getElementById('btn-filter-maker');
  const makerDropdown = document.getElementById('dropdown-filter-maker');
  const resetBtn = document.getElementById('btn-reset-plc-filters');

  if (!segmentBtn || !segmentDropdown || !makerBtn || !makerDropdown) return;

  // 1. 드롭다운 토글 제어
  segmentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = segmentDropdown.style.display === 'block';
    makerDropdown.style.display = 'none';
    segmentDropdown.style.display = isOpen ? 'none' : 'block';
  });

  makerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = makerDropdown.style.display === 'block';
    segmentDropdown.style.display = 'none';
    makerDropdown.style.display = isOpen ? 'none' : 'block';
  });

  // 2. 바깥 영역 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (segmentDropdown.contains(e.target) || makerDropdown.contains(e.target)) {
      return;
    }
    segmentDropdown.style.display = 'none';
    makerDropdown.style.display = 'none';
  });

  // 3. 세그먼트 체크박스 이벤트 감지 (이벤트 위임)
  segmentDropdown.addEventListener('change', (e) => {
    if (e.target.classList.contains('plc-segment-checkbox')) {
      const val = e.target.value;
      if (e.target.checked) {
        if (!state.timeline.filterSegments.includes(val)) {
          state.timeline.filterSegments.push(val);
        }
      } else {
        state.timeline.filterSegments = state.timeline.filterSegments.filter(item => item !== val);
      }
      
      updateFilterButtonLabels();
      renderTimeline();
      
      if (state.globalSearch) {
        applyGlobalHighlight(state.globalSearch);
      }
    }
  });

  // 4. 제조사 체크박스 이벤트 감지 (이벤트 위임)
  makerDropdown.addEventListener('change', (e) => {
    if (e.target.classList.contains('plc-maker-checkbox')) {
      const val = e.target.value;
      if (e.target.checked) {
        if (!state.timeline.filterMakers.includes(val)) {
          state.timeline.filterMakers.push(val);
        }
      } else {
        state.timeline.filterMakers = state.timeline.filterMakers.filter(item => item !== val);
      }
      
      updateFilterButtonLabels();
      renderTimeline();
      
      if (state.globalSearch) {
        applyGlobalHighlight(state.globalSearch);
      }
    }
  });

  // 5. 필터 초기화 버튼 처리
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.timeline.filterSegments = [];
      state.timeline.filterMakers = [];
      
      // 모든 체크박스 체크 해제
      const segmentCbs = segmentDropdown.querySelectorAll('.plc-segment-checkbox');
      const makerCbs = makerDropdown.querySelectorAll('.plc-maker-checkbox');
      segmentCbs.forEach(cb => cb.checked = false);
      makerCbs.forEach(cb => cb.checked = false);

      updateFilterButtonLabels();
      renderTimeline();
      showToast('PLC 타임라인 필터가 초기화되었습니다.');

      if (state.globalSearch) {
        applyGlobalHighlight(state.globalSearch);
      }
    });
  }
}

function updatePlcFilterOptions() {
  const segmentDropdown = document.getElementById('dropdown-filter-segment');
  const makerDropdown = document.getElementById('dropdown-filter-maker');
  if (!segmentDropdown || !makerDropdown) return;

  const activeSheetName = state.timeline.activeSheet;
  const sheetItems = state.plcTimeline.filter(item => item.sheet === activeSheetName);

  // 고유 세그먼트 및 제조사 추출
  const categoriesSet = new Set();
  const makersSet = new Set();

  const excelRows = [...new Set(sheetItems.map(item => item.excelRow))].sort((a, b) => a - b);
  excelRows.forEach(rowNum => {
    const rowItems = sheetItems.filter(item => item.excelRow === rowNum);
    const sample = rowItems[0];
    if (sample) {
      let cat = (sample.category || '').trim();
      if (cat.includes('(')) {
        cat = cat.split('(')[0].trim();
      }
      if (cat) categoriesSet.add(cat);

      const makerName = getMakerDisplayName(sample.division, rowItems);
      if (makerName && makerName !== '-') {
        makersSet.add(makerName);
      }
    }
  });

  const sortedCategories = [...categoriesSet].sort();
  const sortedMakers = [...makersSet].sort();

  // 기존 다중 선택된 항목 중 현재 시트에 존재하지 않는 필터는 자동 제거
  state.timeline.filterSegments = state.timeline.filterSegments.filter(cat => categoriesSet.has(cat));
  state.timeline.filterMakers = state.timeline.filterMakers.filter(maker => makersSet.has(maker));

  // Segment 드롭다운 체크박스 렌더링
  let segmentHtml = '';
  sortedCategories.forEach(cat => {
    const checked = state.timeline.filterSegments.includes(cat) ? 'checked' : '';
    segmentHtml += `
      <label class="plc-multiselect-option">
        <input type="checkbox" class="plc-segment-checkbox" value="${cat}" ${checked}>
        <span>${cat}</span>
      </label>
    `;
  });
  if (segmentHtml === '') {
    segmentHtml = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 10px;">옵션이 없습니다.</div>';
  }
  segmentDropdown.innerHTML = segmentHtml;

  // Maker 드롭다운 체크박스 렌더링
  let makerHtml = '';
  sortedMakers.forEach(maker => {
    const checked = state.timeline.filterMakers.includes(maker) ? 'checked' : '';
    makerHtml += `
      <label class="plc-multiselect-option">
        <input type="checkbox" class="plc-maker-checkbox" value="${maker}" ${checked}>
        <span>${maker}</span>
      </label>
    `;
  });
  if (makerHtml === '') {
    makerHtml = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 10px;">옵션이 없습니다.</div>';
  }
  makerDropdown.innerHTML = makerHtml;

  // 버튼 텍스트 상태 동기화
  updateFilterButtonLabels();
}

function updateFilterButtonLabels() {
  const segmentBtnText = document.querySelector('#btn-filter-segment .btn-text');
  const makerBtnText = document.querySelector('#btn-filter-maker .btn-text');

  if (segmentBtnText) {
    const selected = state.timeline.filterSegments;
    if (selected.length === 0) {
      segmentBtnText.textContent = '전체 세그먼트';
      segmentBtnText.style.color = '#64748b';
    } else if (selected.length === 1) {
      segmentBtnText.textContent = selected[0];
      segmentBtnText.style.color = '#1e293b';
    } else {
      segmentBtnText.textContent = `${selected[0]} 외 ${selected.length - 1}`;
      segmentBtnText.style.color = '#1e293b';
    }
  }

  if (makerBtnText) {
    const selected = state.timeline.filterMakers;
    if (selected.length === 0) {
      makerBtnText.textContent = '전체 제조사';
      makerBtnText.style.color = '#64748b';
    } else if (selected.length === 1) {
      makerBtnText.textContent = selected[0];
      makerBtnText.style.color = '#1e293b';
    } else {
      makerBtnText.textContent = `${selected[0]} 외 ${selected.length - 1}`;
      makerBtnText.style.color = '#1e293b';
    }
  }
}
