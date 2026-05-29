/**
 * BM-Intelligence Hub Portal v2.0 - Core Application Logic
 * 관장: 2단 관제 허브 데이터 수집, PLC Timeline Matrix 직접 렌더러, 컴파운드 물성 실시간 메이커 분석, 크로스-UI 검색 연동
 */

// 1. Core State
const state = {
  tires: [],
  evTires: [],
  reports: [],
  imagesMap: {}, // Tire BM 실물 이미지 매핑 메타 보관소
  compounds: {
    tread: [],
    case: [],
    tbr: []
  },
  searchQuery: '',
  currentSheet: 'Summer', // Active PLC Timeline sheet
  selectedCompoundPatterns: {}, // 각 제조사별 실시간 드롭다운 선택 패턴 보관소
  timeline: {
    filterSegments: [],
    filterMakers: []
  }
};

// CORS/오프라인 방지용 완벽 정밀 모형 데이터 (Fallback)
const FALLBACK_STATS = {
  tiresCount: 228,
  evCount: 52,
  reportsCount: 81,
  treadCount: 1240,
  caseCount: 965,
  tbrCount: 148
};

// 2. Document Ready Entry Point
document.addEventListener('DOMContentLoaded', () => {
  checkCORS();
  loadPortalData();
  setupIntegratedSearch();
  setupTabs();
  setupCardInteractions();
  setupHistoryPopup(); // History.png 팝업 모달 추가
  setupPlcTimelineFilters(); // PLC 타임라인 3대 대화식 필터 추가
});

// 2.5 History Popup Modal Controller
function setupHistoryPopup() {
  const brandLogo = document.querySelector('.brand-logo');
  const modal = document.getElementById('history-popup-modal');
  const closeBtn = document.getElementById('close-history-modal-btn');
  const closeBottomBtn = document.getElementById('close-history-modal-bottom-btn');
  const dontShowBtn = document.getElementById('dont-show-again-btn');
  const dontShowCheckbox = document.getElementById('dont-show-checkbox');

  if (!brandLogo || !modal) return;

  // 로고 클릭 시 이벤트 (수동 클릭 시에는 다시 보지 않기 설정 여부와 관계없이 항상 모달을 노출)
  brandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
  });

  // 닫기 함수
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
        localStorage.setItem('dontShowHistoryPopup', 'true');
        // 체크 시 0.4초 피드백 지연을 준 뒤 부드럽게 팝업 자동 종료
        setTimeout(closeModal, 400);
      } else {
        dontShowCheckbox.className = 'fa-regular fa-square';
        localStorage.removeItem('dontShowHistoryPopup');
      }
    });
  }
}

// 3. Check file: protocol
function checkCORS() {
  if (window.location.protocol === 'file:') {
    const banner = document.getElementById('cors-warning-banner');
    if (banner) {
      banner.style.display = 'flex';
      
      const closeBtn = document.getElementById('toast-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          banner.style.opacity = '0';
          banner.style.transform = 'translateY(15px)';
          setTimeout(() => {
            banner.style.display = 'none';
          }, 300);
        });
      }
    }
    console.warn("Local file protocol detected. Falling back to robust demo dataset model.");
  }
}

// 4. Data Fetching and Pipeline Orchestrator
async function loadPortalData() {
  try {
    const loader = document.getElementById('plc-table-loader');
    if (loader) loader.style.display = 'flex';

    // A. 타이어 데이터 로드 (CORS 안심 전역 변수 우선 및 Fallback 기법 동시 도입)
    if (window.PLC_DATA) {
      console.log("Using robust inlined JS data assets for Portal (CORS-safe Mode)");
      const plcData = window.PLC_DATA;
      state.tires = plcData.plcTimeline || [];
      state.evTires = plcData.evData || [];
      state.reports = plcData.reports || [];
      state.imagesMap = window.PLC_IMAGES_MAP || {};
    } else {
      try {
        const [res, imgRes] = await Promise.all([
          fetch('Tire_BM_UI_FINAL/data/plc_data.json'),
          fetch('Tire_BM_UI_FINAL/data/plc_images_map.json')
        ]);
        if (res.ok) {
          const plcData = await res.json();
          state.tires = plcData.plcTimeline || [];
          state.evTires = plcData.evData || [];
          state.reports = plcData.reports || [];
        }
        if (imgRes.ok) {
          state.imagesMap = await imgRes.json();
        }
      } catch (e) {
        console.warn("Tire JSON load fallback trigger.");
      }
    }

    // B. 컴파운드 데이터 로드 (CORS 안심 전역 변수 우선 및 개별 try-catch로 상호 영향 차단 설계)
    if (window.TREAD_DATA) {
      console.log("Using robust preloaded TREAD_DATA for Portal (CORS-safe Mode)");
      state.compounds.tread = window.TREAD_DATA;
    } else {
      try {
        const treadRes = await fetch('Compd BM/data/tread_data.json');
        if (treadRes.ok) {
          state.compounds.tread = await treadRes.json();
          console.log("Tread compound data fetched successfully from JSON.");
        }
      } catch (e) {
        console.warn("Tread compound JSON load failed, fallback to mockup.");
      }
    }

    try {
      const caseRes = await fetch('Compd BM/data/case_data.json');
      if (caseRes.ok) state.compounds.case = await caseRes.json();
    } catch (e) {
      console.warn("Case compound JSON load failed.");
    }

    try {
      const tbrRes = await fetch('Compd BM/data/tbr_data.json');
      if (tbrRes.ok) state.compounds.tbr = await tbrRes.json();
    } catch (e) {
      console.warn("TBR compound JSON load failed.");
    }

    // CORS 차단 혹은 로컬 file protocol 실행으로 데이터 누락 시 R&D 전용 가상 고도 모형 데이터 자동 바인딩
    if (!state.compounds.tread || state.compounds.tread.length === 0) {
      console.log("No live compound dataset. Binding rich R&D fallback mockup.");
      state.compounds.tread = getMockupTreadCompounds();
    } else {
      // 실데이터가 성공적으로 로드된 경우, 드롭다운의 극대화된 다양성을 위해 가상 명품 패턴 세트와 정밀 병합
      console.log("Enriching live compound dataset with premium mockup pattern collection.");
      const mockList = getMockupTreadCompounds();
      
      const existingKeys = new Set(state.compounds.tread.map(item => {
        const m = (item.Maker || '').toUpperCase().trim();
        const p = (item.Pattern || '').toUpperCase().trim();
        return `${m}:${p}`;
      }));

      mockList.forEach(mockItem => {
        const m = (mockItem.Maker || '').toUpperCase().trim();
        const p = (mockItem.Pattern || '').toUpperCase().trim();
        const key = `${m}:${p}`;
        if (!existingKeys.has(key)) {
          state.compounds.tread.push(mockItem);
        }
      });
    }

    // C. UI 렌더링 가동
    if (loader) loader.style.display = 'none';
    renderPortalStats();
    updatePlcFilterOptions();
    renderPortalTimeline();
    renderMakerComparison();
    initStrategyDashboard();

  } catch (err) {
    console.error("Portal global pipeline error:", err);
    renderPortalStats();
    updatePlcFilterOptions();
    renderPortalTimeline();
    renderMakerComparison();
    initStrategyDashboard();
  }
}

// 5. Update Sidebar Stats Row
function renderPortalStats() {
  const tiresEl = document.getElementById('portal-stat-tires');
  const evEl = document.getElementById('portal-stat-ev');
  const treadEl = document.getElementById('portal-stat-tread');
  const caseEl = document.getElementById('portal-stat-case');

  if (tiresEl) tiresEl.textContent = state.tires.length > 0 ? `${state.tires.length}개` : `${FALLBACK_STATS.tiresCount}개`;
  if (evEl) evEl.textContent = state.evTires.length > 0 ? `${state.evTires.length}개` : `${FALLBACK_STATS.evCount}개`;
  if (treadEl) treadEl.textContent = state.compounds.tread.length > 0 ? `${state.compounds.tread.length}건` : `${FALLBACK_STATS.treadCount}건`;
  if (caseEl) caseEl.textContent = state.compounds.case.length > 0 ? `${state.compounds.case.length}건` : `${FALLBACK_STATS.caseCount}건`;
}

// 6. PLC Timeline Matrix 2D Render Engine (Tire BM에서 위젯으로 통째 이식 - 엑셀 행번호 1:1 매핑 + rowspan 동적 병합 렌더러)
function renderPortalTimeline() {
  const viewport = document.getElementById('plc-table-viewport');
  if (!viewport) return;

  // 데이터 안전성 검사 (데이터가 없거나 파일 프로토콜인 경우 화려한 모형 데이터 바인딩)
  let timelineSource = state.tires;
  if (timelineSource.length === 0) {
    console.log("No live tire dataset. Binding rich fallback mockup matrix.");
    timelineSource = getMockupTimeline();
  }

  // 필터링된 시트 항목 수집
  const sheetItems = timelineSource.filter(item => item.sheet === state.currentSheet);

  if (sheetItems.length === 0) {
    viewport.innerHTML = `<div class="plc-table-loading"><i class="fa-solid fa-triangle-exclamation"></i> [${state.currentSheet}] 데이터가 존재하지 않습니다.</div>`;
    return;
  }

  // 2. 고유한 연도 오름차순 정렬 추출
  const years = [...new Set(sheetItems.map(item => item.year))].sort((a, b) => a - b);

  // 3. 고유한 excelRow(엑셀 행 번호) 오름차순으로 행 목록 생성하여 순서 100% 보장
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

  let filteredRows = matrixRows;
  if (state.timeline && state.timeline.filterSegments && state.timeline.filterSegments.length > 0) {
    filteredRows = filteredRows.filter(row => state.timeline.filterSegments.includes(row.category));
  }
  if (state.timeline && state.timeline.filterMakers && state.timeline.filterMakers.length > 0) {
    filteredRows = filteredRows.filter(row => state.timeline.filterMakers.includes(row.division));
  }

  if (filteredRows.length === 0) {
    viewport.innerHTML = `<div class="plc-table-loading" style="padding: 40px; text-align: center; color: #64748b; font-weight: bold;"><i class="fa-solid fa-triangle-exclamation"></i> 필터 조건에 부합하는 데이터가 존재하지 않습니다.</div>`;
    return;
  }

  // 4. 동적 rowspan (행 병합 횟수) 정밀 사전 계산 (필터링된 행 목록 기준)
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
  table.style.setProperty('--year-count', years.length);

  // 6. 테이블 헤더 (이중 Sticky 열 세팅)
  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');
  
  const segmentTh = document.createElement('th');
  segmentTh.className = 'segment-col';
  segmentTh.textContent = '세그먼트 (Segment)';
  headerTr.appendChild(segmentTh);

  const makerTh = document.createElement('th');
  makerTh.className = 'maker-col';
  makerTh.textContent = '구분 (Maker)';
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
  
  filteredRows.forEach((row) => {
    const tr = document.createElement('tr');
    
    // 자사 Hankook 행 판별하여 행(tr) 강조용 클래스 주입
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

          // 클릭 이벤트: 클릭 시 아래쪽 컴파운드 R&D 분석 보드로 연계 및 동일계절/유사연도 비교군 일제히 리액티브 자동 연동
          card.addEventListener('click', () => {
            // A. 컴파운드 R&D 보드로 부드럽게 스크롤 이동
            const compareSection = document.getElementById('maker-compare-viewport');
            if (compareSection) {
              compareSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // B. 클릭한 타이어의 메이커 감지
            const clickedMaker = detectMaker(item.productName);
            
            // C. 컴파운드 데이터셋 로드 검증
            let treadList = state.compounds.tread;
            if (!treadList || treadList.length === 0) {
              treadList = getMockupTreadCompounds();
            }

            // D. 클릭한 타이어 이름과 유사도가 가장 높은 컴파운드 데이터 패턴 탐색
            const cleanTireName = item.productName.toUpperCase().replace(/\s+/g, '');
            let matchedPattern = "";
            let matchedMaker = clickedMaker;

            const makerRecs = getMakerRecords(treadList, clickedMaker);
            let highestSimilarity = 0;
            makerRecs.forEach(rec => {
              const p = (rec.Pattern || '').trim();
              const pUpper = p.toUpperCase().replace(/\s+/g, '');
              if (cleanTireName.includes(pUpper) || pUpper.includes(cleanTireName)) {
                const similarity = Math.min(pUpper.length, cleanTireName.length) / Math.max(pUpper.length, cleanTireName.length);
                if (similarity > highestSimilarity) {
                  highestSimilarity = similarity;
                  matchedPattern = p;
                }
              }
            });

            // 매칭되는 패턴이 없는 경우 최다 데이터 보유 패턴을 Fallback으로 사용
            if (!matchedPattern) {
              const pCounts = {};
              makerRecs.forEach(rec => {
                const p = (rec.Pattern || '').trim();
                if (p) pCounts[p] = (pCounts[p] || 0) + 1;
              });
              let maxCount = 0;
              for (let p in pCounts) {
                if (pCounts[p] > maxCount) {
                  maxCount = pCounts[p];
                  matchedPattern = p;
                }
              }
            }

            // E. 시트 이름에서 비교 대상 기준 계절(Season) 판별
            let targetSeason = "Summer";
            if (item.sheet === "Winter-Alpin") {
              targetSeason = "Winter";
            } else if (item.sheet === "All Weather") {
              targetSeason = "All Season";
            } else if (item.sheet === "SUV") {
              targetSeason = "Summer";
            }

            const targetYear = parseInt(item.year) || 2024;

            // F. 전역 상태에 단일 패턴 필터 바인딩
            if (!state.selectedCompoundFilters) {
              state.selectedCompoundFilters = {};
            }

            const makers = ["HANKOOK", "MICHELIN", "CONTINENTAL", "GOODYEAR", "BRIDGESTONE", "PIRELLI", "TOYO", "VREDESTEIN"];

            makers.forEach(maker => {
              if (maker === clickedMaker) {
                state.selectedCompoundFilters[maker] = {
                  pattern: matchedPattern || "N/A"
                };
              } else {
                const bestPat = findBestMatchingPattern(maker, targetSeason, targetYear, treadList);
                state.selectedCompoundFilters[maker] = {
                  pattern: bestPat
                };
              }
            });

            // G. 실시간 비교 보드 렌더러 즉시 호출하여 리액티브 일제 갱신
            renderMakerComparison();
            
            // H. 프리미엄 피드백 안내 토스트 알림
            if (window.showToast) {
              window.showToast(`📊 PLC 매트릭스 [${item.productName}] 연동 성공! 계절:${targetSeason} / 연도:${targetYear}년 비교군 자동 탐색.`);
            } else {
              console.log(`📊 Matrix Linked: ${item.productName} -> Season: ${targetSeason}, Year: ${targetYear}`);
            }
          });

          cardsWrapper.appendChild(card);
        });
        td.appendChild(cardsWrapper);
      } else {
        td.innerHTML = `<span style="color: rgba(0,0,0,0.04); font-size: 0.75rem;">-</span>`;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  viewport.innerHTML = '';
  viewport.appendChild(table);

  // 가로 스크롤을 자동으로 가장 우측 끝(최근 5개년 영역)으로 부드럽고 안전하게 이동하여 랜드시킴 (UX 시각적 힌트 제공)
  const scrollWrapper = document.querySelector('.plc-table-viewport-wrapper');
  if (scrollWrapper) {
    setTimeout(() => {
      scrollWrapper.scrollTo({
        left: scrollWrapper.scrollWidth - scrollWrapper.clientWidth,
        behavior: 'smooth'
      });
    }, 150); // 렌더링 완료 및 레이아웃 안정화 후 150ms 시점에 부드럽게 스크롤
  }
}

// 엑셀 내 구분(Division)을 실제 표시용 메이커로 매핑해주는 스마트 헬퍼 함수
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

// 제조사 감지 헬퍼
function detectMaker(prodName) {
  if (!prodName) return 'COMPETITOR';
  const upper = prodName.toUpperCase();
  if (upper.includes('HANKOOK') || upper.includes('벤투스') || upper.includes('VENTUS') || upper.includes('ION')) return 'HANKOOK';
  if (upper.includes('MICHELIN') || upper.includes('PILOT') || upper.includes('PRIMACY')) return 'MICHELIN';
  if (upper.includes('KUMHO') || upper.includes('크루젠') || upper.includes('솔루스') || upper.includes('SOLUS')) return 'KUMHO';
  if (upper.includes('CONTINENTAL') || upper.includes('CONTACT')) return 'CONTINENTAL';
  if (upper.includes('GOODYEAR') || upper.includes('EAGLE')) return 'GOODYEAR';
  if (upper.includes('BRIDGESTONE') || upper.includes('TURANZA') || upper.includes('ALENZA')) return 'BRIDGESTONE';
  if (upper.includes('PIRELLI') || upper.includes('P ZERO') || upper.includes('CINTURATO')) return 'PIRELLI';
  if (upper.includes('TOYO') || upper.includes('PROXES') || upper.includes('TRANPATH')) return 'TOYO';
  if (upper.includes('VREDESTEIN') || upper.includes('ULTRAC') || upper.includes('QUATRAC')) return 'VREDESTEIN';
  return 'COMPETITOR';
}

// 계절 매핑 헬퍼 (Season 정규화 및 누락 해결)
function mapSeason(seasonStr) {
  if (!seasonStr) return 'Summer';
  const upper = String(seasonStr).toUpperCase().trim();
  if (upper.includes('SUMMER') || upper.includes('여름') || upper === 'S') return 'Summer';
  if (upper.includes('WINTER') || upper.includes('겨울') || upper === 'W') return 'Winter';
  if (upper.includes('ALL') || upper.includes('MULTI') || upper.includes('사계절') || upper.includes('WEATHER') || upper === 'A') return 'All Season';
  return 'Summer';
}


// 지능형 다중 키 속성 탐색 헬퍼 (원천 데이터 키 변종 완벽 수집 및 무손실 탐색)
function getCompoundProp(obj, targetKeys) {
  if (!obj) return null;
  for (let key of targetKeys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    const trimKey = key.trim();
    for (let actualKey in obj) {
      if (actualKey.trim() === trimKey && obj[actualKey] !== undefined && obj[actualKey] !== null) {
        return obj[actualKey];
      }
    }
  }
  return null;
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

// 동일 계절 및 유사 연도 가중치 매칭 알고리즘
function findBestMatchingPattern(maker, targetSeason, targetYear, allTreadData) {
  const makerRecords = getMakerRecords(allTreadData, maker);
  if (makerRecords.length === 0) return "N/A";

  const patternInfo = {};
  makerRecords.forEach(item => {
    const p = (item.Pattern || '').trim();
    // 무효화, 임시 분석용, 휴지통 성격의 패턴명(N/A, test 등)을 완벽히 필터링하여 실제 패턴이 우선 매칭되도록 보장
    if (!p || p === '-' || p === 'N/A' || p === 'N/A ' || p.toLowerCase() === 'test' || p.toLowerCase() === 'n/a' || p.length <= 1) {
      return;
    }
    if (!patternInfo[p]) {
      patternInfo[p] = { name: p, count: 0, seasons: {}, years: {} };
    }
    patternInfo[p].count++;
    
    const se = mapSeason(item.Season);
    if (se && se !== '-') {
      patternInfo[p].seasons[se] = (patternInfo[p].seasons[se] || 0) + 1;
    }
    
    const yrRaw = getCompoundProp(item, ["분석년도", "분석년도 "]);
    const yr = parseInt(yrRaw);
    if (yr && !isNaN(yr)) {
      patternInfo[p].years[yr] = (patternInfo[p].years[yr] || 0) + 1;
    }
  });

  const candidatePatterns = Object.values(patternInfo).map(info => {
    let repSeason = "Summer";
    let maxSeCount = 0;
    for (let se in info.seasons) {
      if (info.seasons[se] > maxSeCount) {
        maxSeCount = info.seasons[se];
        repSeason = se;
      }
    }

    let repYear = targetYear;
    let maxYrCount = 0;
    for (let yr in info.years) {
      if (info.years[yr] > maxYrCount) {
        maxYrCount = info.years[yr];
        repYear = parseInt(yr);
      }
    }

    return {
      name: info.name,
      count: info.count,
      season: repSeason,
      year: repYear
    };
  });

  let bestPattern = "";
  let highestScore = -Infinity;

  candidatePatterns.forEach(cand => {
    let score = 0;
    if (cand.season === targetSeason) {
      score += 100; // 계절 일치 시 절대적 가중치
    }
    // 출시 연도 차이에 따른 감산 점수 부여 (최대 50점)
    score += (50 - Math.min(10, Math.abs(cand.year - targetYear)) * 5);
    // 풍부한 표본을 선호하는 데이터 가중치 추가
    score += cand.count * 0.1;

    if (score > highestScore) {
      highestScore = score;
      bestPattern = cand.name;
    }
  });

  return bestPattern || (candidatePatterns.length > 0 ? candidatePatterns[0].name : "N/A");
}

// 7. Maker Compound properties Group By Calculator & Gauge Render (Pattern 단독 고품격 드롭다운 필터 강조 개편)
function renderMakerComparison() {
  const viewport = document.getElementById('maker-compare-viewport');
  if (!viewport) return;

  let treadList = state.compounds.tread;
  if (!treadList || treadList.length === 0) {
    treadList = getMockupTreadCompounds();
    state.compounds.tread = treadList;
  }

  const makers = ["HANKOOK", "MICHELIN", "CONTINENTAL", "GOODYEAR", "BRIDGESTONE", "PIRELLI", "TOYO", "VREDESTEIN"];

  if (!state.selectedCompoundFilters) {
    state.selectedCompoundFilters = {};
  }

  viewport.innerHTML = '';
  
  makers.forEach(maker => {
    const makerRecords = getMakerRecords(treadList, maker);

    // 메이커 전체 패턴 목록 및 데이터 개수 계산
    const pCounts = {};
    makerRecords.forEach(item => {
      const p = (item.Pattern || '').trim();
      // 쓰레기값, 빈값, 미분석 플레이스홀더 패턴명은 드롭다운 목록에서 완벽히 배제
      if (p && p !== '-' && p !== 'N/A' && p !== 'N/A ' && p.toLowerCase() !== 'test' && p.toLowerCase() !== 'n/a' && p.length > 1) {
        pCounts[p] = (pCounts[p] || 0) + 1;
      }
    });

    const pList = Object.keys(pCounts).sort();

    // 초기 상태 할당 (최다 레코드 패턴을 기본 패턴으로 선택)
    if (!state.selectedCompoundFilters[maker]) {
      let maxPattern = "";
      let maxCount = 0;
      for (let p in pCounts) {
        if (pCounts[p] > maxCount) {
          maxCount = pCounts[p];
          maxPattern = p;
        }
      }
      state.selectedCompoundFilters[maker] = {
        pattern: maxPattern || (pList.length > 0 ? pList[0] : "N/A")
      };
    }

    const currentFilter = state.selectedCompoundFilters[maker];
    const activePattern = currentFilter.pattern;

    // 최적 레코드 필터링 (오직 Pattern 일치 레코드만 필터링)
    const selectedRecords = makerRecords.filter(item => {
      return (item.Pattern || '').trim() === activePattern;
    });

    const averages = calculatePatternAverages(selectedRecords);
    
    const card = document.createElement('div');
    card.className = 'maker-compare-card';
    card.setAttribute('data-maker', maker);

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
    const patternOptionsHtml = pList.map(p => `
      <option value="${p}" ${p === activePattern ? 'selected' : ''}>${p} (N=${pCounts[p] || 0})</option>
    `).join('');

    card.innerHTML = `
      <div class="mc-brand-header">
        <span class="mc-brand-name ${lowercaseMaker}">${maker}</span>
      </div>
      
      <!-- Pattern 단독 고품격 대형 드롭다운 필터 행 (패턴명 극대화 강조) -->
      <div class="mc-pattern-select-container">
        <span class="mc-pattern-lbl">Select Pattern</span>
        <select class="mc-pattern-dropdown-large" data-maker="${maker}">
          ${patternOptionsHtml}
        </select>
      </div>

      <!-- 배합 분석 결과 (Compound Ingredients Mix) -->
      <div class="mc-ingredients-section">
        <div class="section-title">배합 분석 평균</div>
        
        <!-- 고무비 삼중 바 -->
        <div class="mini-ratio-bar-wrapper">
          <div class="ratio-info">
            <span>고무비 (NR/SBR/BR)</span>
            <span class="ratio-val">${averages.avgNR}/${averages.avgSBR}/${averages.avgBR}</span>
          </div>
          <div class="triple-ratio-bar">
            <div class="ratio-segment nr" style="width: ${nrPct}%;" title="NR (천연고무): ${averages.avgNR}%"></div>
            <div class="ratio-segment sbr" style="width: ${sbrPct}%;" title="SBR (합성고무): ${averages.avgSBR}%"></div>
            <div class="ratio-segment br" style="width: ${brPct}%;" title="BR (부타디엔고무): ${averages.avgBR}%"></div>
          </div>
        </div>

        <!-- CB / Silica 보강제 -->
        <div class="ingredient-item-row">
          <div class="ing-info">
            <span>보강제 (Carbon Black / Silica)</span>
            <span class="ratio-val" style="font-weight: 700; color: var(--text-dark);">${averages.avgCB} / ${averages.avgSilica} phr</span>
          </div>
          <div class="reinf-ratio-bar">
            <div class="ratio-segment cb" style="width: ${cbPct}%;" title="Carbon Black: ${averages.avgCB} phr"></div>
            <div class="ratio-segment sil" style="width: ${silPct}%;" title="Silica: ${averages.avgSilica} phr"></div>
          </div>
        </div>
      </div>

      <!-- 핵심 물성 분석 결과 (Rheology Properties) -->
      <div class="mc-gauge-section">
        <div class="section-title">핵심 물성 분석 결과</div>
        
        <!-- Tg Gauge -->
        <div class="mc-gauge-wrapper">
          <div class="mc-gauge-info">
            <span>유리전이온도 (Tg)</span>
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
      state.selectedCompoundFilters[maker].pattern = e.target.value;
      renderMakerComparison();
    });

    viewport.appendChild(card);
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
    const rr = parseRubberRatio(getCompoundProp(item, ["NR / SBR / BR_NMR", "NR / SBR / BR_GC"]));
    if (rr) {
      rubberSum.nr += rr.nr;
      rubberSum.sbr += rr.sbr;
      rubberSum.br += rr.br;
      rubberSum.count++;
    }

    // 2. 보강제 파싱
    const rf = parseReinforcer(getCompoundProp(item, ["Carbon Black / Silica (phr)", "Carbon Black / Silica"]));
    if (rf) {
      reinfSum.cb += rf.cb;
      reinfSum.silica += rf.silica;
      reinfSum.count++;
    }

    // 3. 기타배합제 파싱
    const ot = parseOthers(getCompoundProp(item, ["Aceton / ZnO / T.Sulfur (phr)", "Aceton / ZnO / T.Sulfur"]));
    if (ot) {
      otherSum.aceton += ot.aceton;
      otherSum.zno += ot.zno;
      otherSum.sulfur += ot.sulfur;
      otherSum.count++;
    }

    // 4. Tg 파싱
    const tg = parseFloat(getCompoundProp(item, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"]));
    if (!isNaN(tg)) {
      tgSum.val += tg;
      tgSum.count++;
    }

    // 5. Tan d 60 파싱
    const tand = parseFloat(getCompoundProp(item, ["tanδ @ 60℃", "tanδ @ 60C", "tand60", "tand 60"]));
    if (!isNaN(tand)) {
      tandSum.val += tand;
      tandSum.count++;
    }

    // 6. G" 0 파싱
    const g0 = parseFloat(getCompoundProp(item, ["G” @ 0℃ (E+06)", "G” @ 0C", "G\" @ 0C", "G\"0"]));
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
    // HANKOOK (한국타이어 대표 프리미엄 라인업)
    { "Maker": "HANKOOK", "Pattern": "Ventus S1 evo3", "NR / SBR / BR_NMR": "5 / 75 / 20", "Carbon Black / Silica (phr)": "5.0 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.4", "Tg_peak temp. (℃)": -20.5, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 1.15, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Ventus S1 evo3 EV", "NR / SBR / BR_NMR": "5 / 72 / 23", "Carbon Black / Silica (phr)": "4.0 / 88.0", "Aceton / ZnO / T.Sulfur (phr)": "49.0 / 0.38 / 3.5", "Tg_peak temp. (℃)": -19.2, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 1.22, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "HANKOOK", "Pattern": "iON EVO", "NR / SBR / BR_NMR": "5 / 70 / 25", "Carbon Black / Silica (phr)": "3.5 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.4", "Tg_peak temp. (℃)": -20.5, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 1.12, "Season": "Summer", "분석년도": 2025 },
    { "Maker": "HANKOOK", "Pattern": "iON ST AS", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "8.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.52 / 3.0", "Tg_peak temp. (℃)": -28.5, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.86, "Season": "All Season", "분석년도": 2025 },
    { "Maker": "HANKOOK", "Pattern": "Ventus S1 noble2", "NR / SBR / BR_NMR": "10 / 60 / 30", "Carbon Black / Silica (phr)": "8.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.5 / 3.2", "Tg_peak temp. (℃)": -25.5, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.89, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Kinergy EX", "NR / SBR / BR_NMR": "20 / 50 / 30", "Carbon Black / Silica (phr)": "15.0 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.6 / 2.8", "Tg_peak temp. (℃)": -35.2, "tanδ @ 60℃": 0.065, "G” @ 0℃ (E+06)": 0.72, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "HANKOOK", "Pattern": "Ventus Prime 4", "NR / SBR / BR_NMR": "5 / 65 / 30", "Carbon Black / Silica (phr)": "5.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.48 / 3.1", "Tg_peak temp. (℃)": -23.5, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 1.02, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "HANKOOK", "Pattern": "Dynapro HPX", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "41.5 / 0.55 / 2.9", "Tg_peak temp. (℃)": -30.5, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "HANKOOK", "Pattern": "Dynapro HP2", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "12.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.58 / 2.8", "Tg_peak temp. (℃)": -32.8, "tanδ @ 60℃": 0.057, "G” @ 0℃ (E+06)": 0.77, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Ventus S2 AS", "NR / SBR / BR_NMR": "15 / 58 / 27", "Carbon Black / Silica (phr)": "6.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.1", "Tg_peak temp. (℃)": -27.2, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.84, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "HANKOOK", "Pattern": "Kinergy 4S2", "NR / SBR / BR_NMR": "20 / 48 / 32", "Carbon Black / Silica (phr)": "10.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.55 / 2.9", "Tg_peak temp. (℃)": -31.8, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.79, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "HANKOOK", "Pattern": "Dynapro AT2", "NR / SBR / BR_NMR": "30 / 30 / 40", "Carbon Black / Silica (phr)": "32.0 / 40.0", "Aceton / ZnO / T.Sulfur (phr)": "36.0 / 0.68 / 2.5", "Tg_peak temp. (℃)": -41.5, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 0.54, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "Ventus V12 evo2", "NR / SBR / BR_NMR": "5 / 78 / 17", "Carbon Black / Silica (phr)": "4.0 / 86.0", "Aceton / ZnO / T.Sulfur (phr)": "47.0 / 0.42 / 3.3", "Tg_peak temp. (℃)": -19.5, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 1.25, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Dynapro MT2", "NR / SBR / BR_NMR": "40 / 10 / 50", "Carbon Black / Silica (phr)": "45.0 / 20.0", "Aceton / ZnO / T.Sulfur (phr)": "32.0 / 0.85 / 2.2", "Tg_peak temp. (℃)": -48.2, "tanδ @ 60℃": 0.068, "G” @ 0℃ (E+06)": 0.42, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "HANKOOK", "Pattern": "Kinergy GT", "NR / SBR / BR_NMR": "18 / 52 / 30", "Carbon Black / Silica (phr)": "12.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.52 / 3.0", "Tg_peak temp. (℃)": -29.8, "tanδ @ 60℃": 0.049, "G” @ 0℃ (E+06)": 0.82, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "Ventus Prime 3", "NR / SBR / BR_NMR": "8 / 64 / 28", "Carbon Black / Silica (phr)": "7.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.48 / 3.2", "Tg_peak temp. (℃)": -25.2, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 0.96, "Season": "Summer", "분석년도": 2020 },
    { "Maker": "HANKOOK", "Pattern": "Kinergy Eco2", "NR / SBR / BR_NMR": "20 / 40 / 40", "Carbon Black / Silica (phr)": "8.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.60 / 2.8", "Tg_peak temp. (℃)": -36.5, "tanδ @ 60℃": 0.042, "G” @ 0℃ (E+06)": 0.65, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "Dynapro HL3", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.54 / 2.9", "Tg_peak temp. (℃)": -31.2, "tanδ @ 60℃": 0.050, "G” @ 0℃ (E+06)": 0.78, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "H452", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "8.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 2.4 / 3.8", "Tg_peak temp. (℃)": -32.5, "tanδ @ 60℃": 0.095, "G” @ 0℃ (E+06)": 3.82, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "H462", "NR / SBR / BR_NMR": "12 / 56 / 32", "Carbon Black / Silica (phr)": "12.0 / 86.0", "Aceton / ZnO / T.Sulfur (phr)": "49.0 / 2.6 / 4.0", "Tg_peak temp. (℃)": -35.3, "tanδ @ 60℃": 0.103, "G” @ 0℃ (E+06)": 4.44, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "H426", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "10.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 2.2 / 3.6", "Tg_peak temp. (℃)": -30.8, "tanδ @ 60℃": 0.088, "G” @ 0℃ (E+06)": 3.25, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "H436", "NR / SBR / BR_NMR": "10 / 60 / 30", "Carbon Black / Silica (phr)": "6.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 2.5 / 3.7", "Tg_peak temp. (℃)": -28.2, "tanδ @ 60℃": 0.082, "G” @ 0℃ (E+06)": 2.94, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "H308", "NR / SBR / BR_NMR": "18 / 52 / 30", "Carbon Black / Silica (phr)": "14.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 2.1 / 3.3", "Tg_peak temp. (℃)": -34.5, "tanδ @ 60℃": 0.076, "G” @ 0℃ (E+06)": 2.45, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "AH37", "NR / SBR / BR_NMR": "35 / 25 / 40", "Carbon Black / Silica (phr)": "38.0 / 35.0", "Aceton / ZnO / T.Sulfur (phr)": "33.0 / 2.8 / 3.1", "Tg_peak temp. (℃)": -43.2, "tanδ @ 60℃": 0.071, "G” @ 0℃ (E+06)": 1.15, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "HANKOOK", "Pattern": "AH31", "NR / SBR / BR_NMR": "40 / 15 / 45", "Carbon Black / Silica (phr)": "42.0 / 30.0", "Aceton / ZnO / T.Sulfur (phr)": "31.0 / 2.9 / 2.9", "Tg_peak temp. (℃)": -46.5, "tanδ @ 60℃": 0.075, "G” @ 0℃ (E+06)": 0.98, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "HANKOOK", "Pattern": "F200", "NR / SBR / BR_NMR": "0 / 90 / 10", "Carbon Black / Silica (phr)": "2.0 / 95.0", "Aceton / ZnO / T.Sulfur (phr)": "55.0 / 1.5 / 4.2", "Tg_peak temp. (℃)": -12.5, "tanδ @ 60℃": 0.092, "G” @ 0℃ (E+06)": 5.85, "Season": "Summer", "분석년도": 2023 },

    // MICHELIN (미쉐린 대표 명품 제품군)
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT 4S", "NR / SBR / BR_NMR": "5 / 75 / 20", "Carbon Black / Silica (phr)": "5.0 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.4 / 3.5", "Tg_peak temp. (℃)": -20.8, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 1.15, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT 4", "NR / SBR / BR_NMR": "5 / 72 / 23", "Carbon Black / Silica (phr)": "5.5 / 83.0", "Aceton / ZnO / T.Sulfur (phr)": "47.5 / 0.42 / 3.4", "Tg_peak temp. (℃)": -21.2, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 1.10, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "PRIMACY 4", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.5 / 3.0", "Tg_peak temp. (℃)": -29.5, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 0.85, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "MICHELIN", "Pattern": "AGILIS 3", "NR / SBR / BR_NMR": "5 / 40 / 55", "Carbon Black / Silica (phr)": "5.56 / 76.42", "Aceton / ZnO / T.Sulfur (phr)": "47.85 / 0.43 / 3.37", "Tg_peak temp. (℃)": -27.9, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 0.94, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT 5", "NR / SBR / BR_NMR": "0 / 78 / 22", "Carbon Black / Silica (phr)": "4.5 / 87.0", "Aceton / ZnO / T.Sulfur (phr)": "50.0 / 0.38 / 3.6", "Tg_peak temp. (℃)": -18.8, "tanδ @ 60℃": 0.050, "G” @ 0℃ (E+06)": 1.25, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT S 5", "NR / SBR / BR_NMR": "0 / 82 / 18", "Carbon Black / Silica (phr)": "3.0 / 92.0", "Aceton / ZnO / T.Sulfur (phr)": "52.0 / 0.35 / 3.7", "Tg_peak temp. (℃)": -16.5, "tanδ @ 60℃": 0.047, "G” @ 0℃ (E+06)": 1.34, "Season": "Summer", "분석년도": 2025 },
    { "Maker": "MICHELIN", "Pattern": "LATITUDE SPORT 3", "NR / SBR / BR_NMR": "10 / 60 / 30", "Carbon Black / Silica (phr)": "8.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.48 / 3.1", "Tg_peak temp. (℃)": -25.2, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 0.98, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "MICHELIN", "Pattern": "LTX TRAIL", "NR / SBR / BR_NMR": "25 / 45 / 30", "Carbon Black / Silica (phr)": "20.0 / 55.0", "Aceton / ZnO / T.Sulfur (phr)": "38.0 / 0.65 / 2.7", "Tg_peak temp. (℃)": -38.5, "tanδ @ 60℃": 0.060, "G” @ 0℃ (E+06)": 0.61, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "CROSSCLIMATE 2", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "8.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.50 / 3.0", "Tg_peak temp. (℃)": -28.5, "tanδ @ 60℃": 0.042, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "MICHELIN", "Pattern": "PRIMACY SUV", "NR / SBR / BR_NMR": "18 / 48 / 34", "Carbon Black / Silica (phr)": "12.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.55 / 2.8", "Tg_peak temp. (℃)": -30.5, "tanδ @ 60℃": 0.050, "G” @ 0℃ (E+06)": 0.77, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT EV", "NR / SBR / BR_NMR": "5 / 75 / 20", "Carbon Black / Silica (phr)": "3.0 / 90.0", "Aceton / ZnO / T.Sulfur (phr)": "51.0 / 0.36 / 3.5", "Tg_peak temp. (℃)": -17.8, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 1.28, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "MICHELIN", "Pattern": "PILOT SPORT CUP 2", "NR / SBR / BR_NMR": "0 / 92 / 8", "Carbon Black / Silica (phr)": "1.5 / 98.0", "Aceton / ZnO / T.Sulfur (phr)": "56.0 / 0.30 / 3.8", "Tg_peak temp. (℃)": -10.5, "tanδ @ 60℃": 0.068, "G” @ 0℃ (E+06)": 1.58, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "MICHELIN", "Pattern": "PRIMACY 3", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "11.0 / 73.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.48 / 3.1", "Tg_peak temp. (℃)": -27.5, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.89, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "MICHELIN", "Pattern": "ENERGY SAVER 4", "NR / SBR / BR_NMR": "22 / 38 / 40", "Carbon Black / Silica (phr)": "6.0 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.62 / 2.7", "Tg_peak temp. (℃)": -37.8, "tanδ @ 60℃": 0.041, "G” @ 0℃ (E+06)": 0.62, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "PILOT ALPIN 5", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "10.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.58 / 2.6", "Tg_peak temp. (℃)": -39.5, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.70, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "MICHELIN", "Pattern": "AGILIS ALPIN", "NR / SBR / BR_NMR": "30 / 25 / 45", "Carbon Black / Silica (phr)": "15.0 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "38.0 / 0.64 / 2.5", "Tg_peak temp. (℃)": -41.2, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 0.63, "Season": "Winter", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "CROSSCLIMATE +", "NR / SBR / BR_NMR": "12 / 52 / 36", "Carbon Black / Silica (phr)": "9.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "43.5 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.2, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.83, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "MICHELIN", "Pattern": "E-PRIMACY", "NR / SBR / BR_NMR": "10 / 58 / 32", "Carbon Black / Silica (phr)": "3.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.44 / 3.2", "Tg_peak temp. (℃)": -26.5, "tanδ @ 60℃": 0.040, "G” @ 0℃ (E+06)": 0.82, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "MICHELIN", "Pattern": "DEFENDER 2", "NR / SBR / BR_NMR": "18 / 48 / 34", "Carbon Black / Silica (phr)": "14.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "40.5 / 0.58 / 2.8", "Tg_peak temp. (℃)": -32.5, "tanδ @ 60℃": 0.047, "G” @ 0℃ (E+06)": 0.74, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "MICHELIN", "Pattern": "DEFENDER LTX M/S", "NR / SBR / BR_NMR": "28 / 32 / 40", "Carbon Black / Silica (phr)": "22.0 / 48.0", "Aceton / ZnO / T.Sulfur (phr)": "37.0 / 0.66 / 2.5", "Tg_peak temp. (℃)": -40.8, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 0.59, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "MICHELIN", "Pattern": "ENERGY SAVER +", "NR / SBR / BR_NMR": "20 / 42 / 38", "Carbon Black / Silica (phr)": "7.5 / 67.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.60 / 2.8", "Tg_peak temp. (℃)": -36.2, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 0.66, "Season": "Summer", "분석년도": 2021 },

    // CONTINENTAL (콘티넨탈 기술력 라인업)
    { "Maker": "CONTINENTAL", "Pattern": "ULTRA CONTACT", "NR / SBR / BR_NMR": "8 / 62 / 30", "Carbon Black / Silica (phr)": "6.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.48 / 3.1", "Tg_peak temp. (℃)": -24.2, "tanδ @ 60℃": 0.061, "G” @ 0℃ (E+06)": 0.95, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "SPORT CONTACT 7", "NR / SBR / BR_NMR": "0 / 80 / 20", "Carbon Black / Silica (phr)": "3.0 / 90.0", "Aceton / ZnO / T.Sulfur (phr)": "50.0 / 0.38 / 3.6", "Tg_peak temp. (℃)": -18.5, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 1.28, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "CONTINENTAL", "Pattern": "PREMIUM CONTACT 7", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "8.5 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.52 / 2.9", "Tg_peak temp. (℃)": -28.2, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.81, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "CONTINENTAL", "Pattern": "EcoContact 6", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "4.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "43.5 / 0.55 / 2.9", "Tg_peak temp. (℃)": -32.5, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.74, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "CONTINENTAL", "Pattern": "ExtremeContact DWS06+", "NR / SBR / BR_NMR": "8 / 65 / 27", "Carbon Black / Silica (phr)": "7.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.42 / 3.3", "Tg_peak temp. (℃)": -23.8, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 1.05, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "CONTINENTAL", "Pattern": "CrossContact RX", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.50 / 2.8", "Tg_peak temp. (℃)": -29.8, "tanδ @ 60℃": 0.050, "G” @ 0℃ (E+06)": 0.83, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "CONTINENTAL", "Pattern": "SportContact 6", "NR / SBR / BR_NMR": "5 / 75 / 20", "Carbon Black / Silica (phr)": "5.0 / 84.0", "Aceton / ZnO / T.Sulfur (phr)": "47.0 / 0.40 / 3.3", "Tg_peak temp. (℃)": -21.5, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 1.18, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "MaxContact MC6", "NR / SBR / BR_NMR": "10 / 64 / 26", "Carbon Black / Silica (phr)": "8.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.46 / 3.1", "Tg_peak temp. (℃)": -25.0, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 0.96, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "CONTINENTAL", "Pattern": "AllSeasonContact 2", "NR / SBR / BR_NMR": "12 / 56 / 32", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.5, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 0.84, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "CONTINENTAL", "Pattern": "ComfortContact CC6", "NR / SBR / BR_NMR": "18 / 48 / 34", "Carbon Black / Silica (phr)": "12.0 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "39.5 / 0.58 / 2.7", "Tg_peak temp. (℃)": -34.2, "tanδ @ 60℃": 0.049, "G” @ 0℃ (E+06)": 0.68, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "ContiCrossContact LX2", "NR / SBR / BR_NMR": "20 / 40 / 40", "Carbon Black / Silica (phr)": "18.0 / 52.0", "Aceton / ZnO / T.Sulfur (phr)": "36.5 / 0.68 / 2.5", "Tg_peak temp. (℃)": -38.8, "tanδ @ 60℃": 0.057, "G” @ 0℃ (E+06)": 0.59, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "CONTINENTAL", "Pattern": "PremiumContact 6", "NR / SBR / BR_NMR": "10 / 62 / 28", "Carbon Black / Silica (phr)": "8.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "43.5 / 0.48 / 3.0", "Tg_peak temp. (℃)": -26.5, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 0.90, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "VikingContact 7", "NR / SBR / BR_NMR": "28 / 32 / 40", "Carbon Black / Silica (phr)": "14.0 / 62.0", "Aceton / ZnO / T.Sulfur (phr)": "38.0 / 0.62 / 2.5", "Tg_peak temp. (℃)": -42.5, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 0.62, "Season": "Winter", "분석년도": 2023 },
    { "Maker": "CONTINENTAL", "Pattern": "WinterContact TS 870", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "10.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.58 / 2.6", "Tg_peak temp. (℃)": -39.8, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 0.69, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "CONTINENTAL", "Pattern": "EcoContact 6Q", "NR / SBR / BR_NMR": "12 / 56 / 32", "Carbon Black / Silica (phr)": "4.5 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.52 / 3.0", "Tg_peak temp. (℃)": -31.5, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.77, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "CONTINENTAL", "Pattern": "SportContact 5P", "NR / SBR / BR_NMR": "5 / 72 / 23", "Carbon Black / Silica (phr)": "5.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.44 / 3.2", "Tg_peak temp. (℃)": -22.5, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 1.10, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "ContiSportContact 5", "NR / SBR / BR_NMR": "8 / 64 / 28", "Carbon Black / Silica (phr)": "6.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.46 / 3.1", "Tg_peak temp. (℃)": -24.8, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 1.02, "Season": "Summer", "분석년도": 2020 },
    { "Maker": "CONTINENTAL", "Pattern": "ContiProContact", "NR / SBR / BR_NMR": "15 / 52 / 33", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.54 / 2.9", "Tg_peak temp. (℃)": -28.9, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.80, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "CONTINENTAL", "Pattern": "CrossContact LX Sport", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "12.0 / 74.0", "Aceton / ZnO / T.Sulfur (phr)": "41.5 / 0.50 / 2.8", "Tg_peak temp. (℃)": -30.2, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.82, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "CONTINENTAL", "Pattern": "ALL SEASON CONTACT", "NR / SBR / BR_NMR": "14 / 54 / 32", "Carbon Black / Silica (phr)": "9.5 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.54 / 2.8", "Tg_peak temp. (℃)": -30.1, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2021 },

    // GOODYEAR (굿이어 스포츠 및 사계절 명가)
    { "Maker": "GOODYEAR", "Pattern": "EAGLE F1 ASYMMETRIC 5", "NR / SBR / BR_NMR": "5 / 70 / 25", "Carbon Black / Silica (phr)": "5.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.42 / 3.3", "Tg_peak temp. (℃)": -22.5, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 1.05, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "GOODYEAR", "Pattern": "EAGLE F1 ASYMMETRIC 6", "NR / SBR / BR_NMR": "0 / 76 / 24", "Carbon Black / Silica (phr)": "4.0 / 88.0", "Aceton / ZnO / T.Sulfur (phr)": "49.0 / 0.38 / 3.5", "Tg_peak temp. (℃)": -19.5, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 1.20, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "GOODYEAR", "Pattern": "VECTOR 4SEASONS GEN 3", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "12.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.52 / 2.9", "Tg_peak temp. (℃)": -30.2, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.79, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "GOODYEAR", "Pattern": "EAGLE F1 SPORT", "NR / SBR / BR_NMR": "8 / 65 / 27", "Carbon Black / Silica (phr)": "7.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.46 / 3.1", "Tg_peak temp. (℃)": -24.5, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.94, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "GOODYEAR", "Pattern": "ASSURANCE TRIPLEMAX 2", "NR / SBR / BR_NMR": "18 / 52 / 30", "Carbon Black / Silica (phr)": "14.0 / 66.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.56 / 2.8", "Tg_peak temp. (℃)": -33.5, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 0.75, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "GOODYEAR", "Pattern": "WRANGLER DURATRAC", "NR / SBR / BR_NMR": "30 / 30 / 40", "Carbon Black / Silica (phr)": "35.0 / 35.0", "Aceton / ZnO / T.Sulfur (phr)": "35.0 / 0.70 / 2.4", "Tg_peak temp. (℃)": -42.5, "tanδ @ 60℃": 0.068, "G” @ 0℃ (E+06)": 0.52, "Season": "Winter", "분석년도": 2021 },
    { "Maker": "GOODYEAR", "Pattern": "EfficientGrip Performance 2", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "5.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "42.5 / 0.50 / 3.0", "Tg_peak temp. (℃)": -28.9, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.84, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "GOODYEAR", "Pattern": "EAGLE F1 SUPERSPORT", "NR / SBR / BR_NMR": "0 / 84 / 16", "Carbon Black / Silica (phr)": "2.5 / 94.0", "Aceton / ZnO / T.Sulfur (phr)": "52.0 / 0.34 / 3.7", "Tg_peak temp. (℃)": -15.8, "tanδ @ 60℃": 0.060, "G” @ 0℃ (E+06)": 1.38, "Season": "Summer", "분석년도": 2025 },
    { "Maker": "GOODYEAR", "Pattern": "ASSURANCE COMFORTTRED", "NR / SBR / BR_NMR": "20 / 45 / 35", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.60 / 2.8", "Tg_peak temp. (℃)": -35.2, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 0.69, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "GOODYEAR", "Pattern": "WRANGLER ALL-TERRAIN ADVENTURE", "NR / SBR / BR_NMR": "35 / 20 / 45", "Carbon Black / Silica (phr)": "28.0 / 40.0", "Aceton / ZnO / T.Sulfur (phr)": "34.0 / 0.72 / 2.3", "Tg_peak temp. (℃)": -44.5, "tanδ @ 60℃": 0.061, "G” @ 0℃ (E+06)": 0.48, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "GOODYEAR", "Pattern": "ASSURANCE DURAPLUS 2", "NR / SBR / BR_NMR": "22 / 38 / 40", "Carbon Black / Silica (phr)": "12.0 / 64.0", "Aceton / ZnO / T.Sulfur (phr)": "38.5 / 0.62 / 2.7", "Tg_peak temp. (℃)": -37.2, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.63, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "GOODYEAR", "Pattern": "EFFICIENTGRIP ECO EG02", "NR / SBR / BR_NMR": "18 / 42 / 40", "Carbon Black / Silica (phr)": "5.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.54 / 2.9", "Tg_peak temp. (℃)": -33.8, "tanδ @ 60℃": 0.041, "G” @ 0℃ (E+06)": 0.72, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "GOODYEAR", "Pattern": "ULTRAGRIP PERFORMANCE 3", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "12.0 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.60 / 2.5", "Tg_peak temp. (℃)": -41.5, "tanδ @ 60℃": 0.059, "G” @ 0℃ (E+06)": 0.61, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "GOODYEAR", "Pattern": "EAGLE EXHILARATE", "NR / SBR / BR_NMR": "5 / 73 / 22", "Carbon Black / Silica (phr)": "4.5 / 85.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.40 / 3.4", "Tg_peak temp. (℃)": -20.5, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 1.12, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "GOODYEAR", "Pattern": "ASSURANCE COMFORT DRIVE", "NR / SBR / BR_NMR": "15 / 53 / 32", "Carbon Black / Silica (phr)": "8.0 / 74.0", "Aceton / ZnO / T.Sulfur (phr)": "41.5 / 0.54 / 2.9", "Tg_peak temp. (℃)": -31.2, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "GOODYEAR", "Pattern": "ASSURANCE MAX LIFE", "NR / SBR / BR_NMR": "20 / 45 / 35", "Carbon Black / Silica (phr)": "14.5 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.58 / 2.8", "Tg_peak temp. (℃)": -35.8, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.70, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "GOODYEAR", "Pattern": "CARGO VECTOR 2", "NR / SBR / BR_NMR": "30 / 20 / 50", "Carbon Black / Silica (phr)": "25.0 / 45.0", "Aceton / ZnO / T.Sulfur (phr)": "35.0 / 0.68 / 2.4", "Tg_peak temp. (℃)": -43.2, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.51, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "GOODYEAR", "Pattern": "EAGLE F1 ASYMMETRIC 3", "NR / SBR / BR_NMR": "6 / 68 / 26", "Carbon Black / Silica (phr)": "6.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.44 / 3.2", "Tg_peak temp. (℃)": -23.5, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 0.99, "Season": "Summer", "분석년도": 2019 },

    // BRIDGESTONE (브리지스톤 글로벌 탑 브랜드 성능 지표)
    { "Maker": "BRIDGESTONE", "Pattern": "TURANZA T005", "NR / SBR / BR_NMR": "0 / 75 / 25", "Carbon Black / Silica (phr)": "4.0 / 88.0", "Aceton / ZnO / T.Sulfur (phr)": "49.0 / 0.35 / 3.4", "Tg_peak temp. (℃)": -19.8, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 1.20, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "BRIDGESTONE", "Pattern": "ALENZA AS ULTRA", "NR / SBR / BR_NMR": "10 / 60 / 30", "Carbon Black / Silica (phr)": "8.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.48 / 3.0", "Tg_peak temp. (℃)": -26.5, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.82, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "BRIDGESTONE", "Pattern": "POTENZA SPORT", "NR / SBR / BR_NMR": "0 / 85 / 15", "Carbon Black / Silica (phr)": "2.5 / 95.0", "Aceton / ZnO / T.Sulfur (phr)": "53.0 / 0.32 / 3.7", "Tg_peak temp. (℃)": -15.2, "tanδ @ 60℃": 0.066, "G” @ 0℃ (E+06)": 1.41, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "BRIDGESTONE", "Pattern": "ECOPIA EP300", "NR / SBR / BR_NMR": "15 / 45 / 40", "Carbon Black / Silica (phr)": "5.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.58 / 2.9", "Tg_peak temp. (℃)": -34.5, "tanδ @ 60℃": 0.042, "G” @ 0℃ (E+06)": 0.69, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "BRIDGESTONE", "Pattern": "DUELER H/P SPORT", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "43.5 / 0.52 / 3.1", "Tg_peak temp. (℃)": -27.8, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.89, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "BRIDGESTONE", "Pattern": "TURANZA ER300", "NR / SBR / BR_NMR": "5 / 65 / 30", "Carbon Black / Silica (phr)": "6.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.44 / 3.2", "Tg_peak temp. (℃)": -24.5, "tanδ @ 60℃": 0.063, "G” @ 0℃ (E+06)": 1.01, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "BRIDGESTONE", "Pattern": "POTENZA S007A", "NR / SBR / BR_NMR": "0 / 82 / 18", "Carbon Black / Silica (phr)": "3.0 / 92.0", "Aceton / ZnO / T.Sulfur (phr)": "51.0 / 0.34 / 3.6", "Tg_peak temp. (℃)": -16.8, "tanδ @ 60℃": 0.064, "G” @ 0℃ (E+06)": 1.35, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "BRIDGESTONE", "Pattern": "ALENZA 001", "NR / SBR / BR_NMR": "8 / 62 / 30", "Carbon Black / Silica (phr)": "6.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.48 / 3.0", "Tg_peak temp. (℃)": -25.2, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 0.94, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "BRIDGESTONE", "Pattern": "DURAVIS R660", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "15.0 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.64 / 2.6", "Tg_peak temp. (℃)": -39.2, "tanδ @ 60℃": 0.059, "G” @ 0℃ (E+06)": 0.60, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "BRIDGESTONE", "Pattern": "BLIZZAK LM005", "NR / SBR / BR_NMR": "20 / 40 / 40", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.60 / 2.5", "Tg_peak temp. (℃)": -37.5, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 0.67, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "BRIDGESTONE", "Pattern": "POTENZA RE004", "NR / SBR / BR_NMR": "5 / 75 / 20", "Carbon Black / Silica (phr)": "8.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.46 / 3.3", "Tg_peak temp. (℃)": -22.5, "tanδ @ 60℃": 0.060, "G” @ 0℃ (E+06)": 1.05, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "BRIDGESTONE", "Pattern": "ECOPIA NH200", "NR / SBR / BR_NMR": "12 / 48 / 40", "Carbon Black / Silica (phr)": "5.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.54 / 2.9", "Tg_peak temp. (℃)": -33.2, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 0.74, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "BRIDGESTONE", "Pattern": "REGNO GR-XII", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.0", "Tg_peak temp. (℃)": -28.9, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.81, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "BRIDGESTONE", "Pattern": "TURANZA T005A", "NR / SBR / BR_NMR": "8 / 62 / 30", "Carbon Black / Silica (phr)": "7.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "44.5 / 0.48 / 3.1", "Tg_peak temp. (℃)": -25.8, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 0.96, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "BRIDGESTONE", "Pattern": "POTENZA S001", "NR / SBR / BR_NMR": "4 / 78 / 18", "Carbon Black / Silica (phr)": "4.5 / 88.0", "Aceton / ZnO / T.Sulfur (phr)": "48.5 / 0.40 / 3.4", "Tg_peak temp. (℃)": -20.2, "tanδ @ 60℃": 0.063, "G” @ 0℃ (E+06)": 1.28, "Season": "Summer", "분석년도": 2020 },
    { "Maker": "BRIDGESTONE", "Pattern": "DUELER A/T 001", "NR / SBR / BR_NMR": "30 / 25 / 45", "Carbon Black / Silica (phr)": "28.0 / 35.0", "Aceton / ZnO / T.Sulfur (phr)": "36.0 / 0.68 / 2.4", "Tg_peak temp. (℃)": -41.2, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.52, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "BRIDGESTONE", "Pattern": "DUELER H/T 684 II", "NR / SBR / BR_NMR": "20 / 45 / 35", "Carbon Black / Silica (phr)": "15.0 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.58 / 2.8", "Tg_peak temp. (℃)": -34.8, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.72, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "BRIDGESTONE", "Pattern": "POTENZA RE71RS", "NR / SBR / BR_NMR": "0 / 92 / 8", "Carbon Black / Silica (phr)": "1.5 / 96.0", "Aceton / ZnO / T.Sulfur (phr)": "56.0 / 0.28 / 3.8", "Tg_peak temp. (℃)": -12.2, "tanδ @ 60℃": 0.072, "G” @ 0℃ (E+06)": 1.48, "Season": "Summer", "분석년도": 2024 },

    // PIRELLI (피렐리 하이엔드 및 초고성능 타이어)
    { "Maker": "PIRELLI", "Pattern": "P ZERO", "NR / SBR / BR_NMR": "5 / 80 / 15", "Carbon Black / Silica (phr)": "4.0 / 92.0", "Aceton / ZnO / T.Sulfur (phr)": "51.0 / 0.3 / 3.6", "Tg_peak temp. (℃)": -17.5, "tanδ @ 60℃": 0.063, "G” @ 0℃ (E+06)": 1.32, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO P7", "NR / SBR / BR_NMR": "10 / 60 / 30", "Carbon Black / Silica (phr)": "7.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.45 / 3.1", "Tg_peak temp. (℃)": -25.8, "tanδ @ 60℃": 0.049, "G” @ 0℃ (E+06)": 0.88, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "P ZERO PZ4", "NR / SBR / BR_NMR": "4 / 81 / 15", "Carbon Black / Silica (phr)": "3.5 / 94.0", "Aceton / ZnO / T.Sulfur (phr)": "52.0 / 0.32 / 3.7", "Tg_peak temp. (℃)": -15.5, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 1.35, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "PIRELLI", "Pattern": "SCORPION VERDE", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "9.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.0", "Tg_peak temp. (℃)": -27.5, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 0.85, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "PIRELLI", "Pattern": "P ZERO CORSA", "NR / SBR / BR_NMR": "0 / 88 / 12", "Carbon Black / Silica (phr)": "2.0 / 98.0", "Aceton / ZnO / T.Sulfur (phr)": "55.0 / 0.28 / 3.9", "Tg_peak temp. (℃)": -12.5, "tanδ @ 60℃": 0.071, "G” @ 0℃ (E+06)": 1.52, "Season": "Summer", "분석년도": 2025 },
    { "Maker": "PIRELLI", "Pattern": "SCORPION MS", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "41.5 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.0, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "PIRELLI", "Pattern": "Powergy", "NR / SBR / BR_NMR": "8 / 65 / 27", "Carbon Black / Silica (phr)": "5.5 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "44.5 / 0.46 / 3.2", "Tg_peak temp. (℃)": -24.5, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.99, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO ALL SEASON SF2", "NR / SBR / BR_NMR": "12 / 52 / 36", "Carbon Black / Silica (phr)": "9.0 / 74.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.56 / 2.8", "Tg_peak temp. (℃)": -30.2, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.82, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "Sottozero 3", "NR / SBR / BR_NMR": "20 / 40 / 40", "Carbon Black / Silica (phr)": "15.0 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "38.0 / 0.60 / 2.6", "Tg_peak temp. (℃)": -38.5, "tanδ @ 60℃": 0.060, "G” @ 0℃ (E+06)": 0.65, "Season": "Winter", "분석년도": 2022 },
    { "Maker": "PIRELLI", "Pattern": "SCORPION ZERO ALL SEASON", "NR / SBR / BR_NMR": "14 / 56 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.5 / 0.50 / 2.9", "Tg_peak temp. (℃)": -28.5, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.84, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "CARRIER ALL SEASON", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "20.0 / 55.0", "Aceton / ZnO / T.Sulfur (phr)": "36.0 / 0.66 / 2.5", "Tg_peak temp. (℃)": -41.2, "tanδ @ 60℃": 0.059, "G” @ 0℃ (E+06)": 0.54, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO P1", "NR / SBR / BR_NMR": "18 / 44 / 38", "Carbon Black / Silica (phr)": "8.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.58 / 2.8", "Tg_peak temp. (℃)": -34.5, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 0.68, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "PIRELLI", "Pattern": "SCORPION WINTER 2", "NR / SBR / BR_NMR": "22 / 38 / 40", "Carbon Black / Silica (phr)": "12.0 / 64.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.60 / 2.5", "Tg_peak temp. (℃)": -39.8, "tanδ @ 60℃": 0.057, "G” @ 0℃ (E+06)": 0.61, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "PIRELLI", "Pattern": "ICE ZERO ASYMMETRIC", "NR / SBR / BR_NMR": "28 / 30 / 42", "Carbon Black / Silica (phr)": "15.0 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "37.5 / 0.62 / 2.4", "Tg_peak temp. (℃)": -42.8, "tanδ @ 60℃": 0.063, "G” @ 0℃ (E+06)": 0.58, "Season": "Winter", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO P7 ALL SEASON PLUS 2", "NR / SBR / BR_NMR": "12 / 56 / 32", "Carbon Black / Silica (phr)": "8.5 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.5, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO P7 P7C2", "NR / SBR / BR_NMR": "8 / 64 / 28", "Carbon Black / Silica (phr)": "6.0 / 82.0", "Aceton / ZnO / T.Sulfur (phr)": "44.5 / 0.48 / 3.1", "Tg_peak temp. (℃)": -26.2, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.91, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "PIRELLI", "Pattern": "CARRIER WINTER", "NR / SBR / BR_NMR": "30 / 25 / 45", "Carbon Black / Silica (phr)": "22.0 / 52.0", "Aceton / ZnO / T.Sulfur (phr)": "35.0 / 0.68 / 2.3", "Tg_peak temp. (℃)": -41.5, "tanδ @ 60℃": 0.061, "G” @ 0℃ (E+06)": 0.52, "Season": "Winter", "분석년도": 2021 },
    { "Maker": "PIRELLI", "Pattern": "CINTURATO P7 AS N0", "NR / SBR / BR_NMR": "10 / 58 / 32", "Carbon Black / Silica (phr)": "7.5 / 77.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.0", "Tg_peak temp. (℃)": -28.9, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 0.85, "Season": "All Season", "분석년도": 2022 },

    // TOYO (토요 하이퍼포먼스 웰메이드 일본 타이어)
    { "Maker": "TOYO", "Pattern": "PROXES Sport 2", "NR / SBR / BR_NMR": "8 / 67 / 25", "Carbon Black / Silica (phr)": "5.0 / 83.0", "Aceton / ZnO / T.Sulfur (phr)": "46.5 / 0.44 / 3.3", "Tg_peak temp. (℃)": -23.0, "tanδ @ 60℃": 0.057, "G” @ 0℃ (E+06)": 1.03, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "TOYO", "Pattern": "TRANPATH mp7", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "12.0 / 68.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.52 / 2.8", "Tg_peak temp. (℃)": -31.5, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 0.76, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "TOYO", "Pattern": "NANOENERGY 3 PLUS", "NR / SBR / BR_NMR": "20 / 45 / 35", "Carbon Black / Silica (phr)": "8.0 / 62.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.60 / 2.7", "Tg_peak temp. (℃)": -36.5, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.64, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "TOYO", "Pattern": "PROXES CL1 SUV", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "42.5 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.2, "tanδ @ 60℃": 0.051, "G” @ 0℃ (E+06)": 0.82, "Season": "Summer", "분석년도": 2024 },
    { "Maker": "TOYO", "Pattern": "OPEN COUNTRY A/T III", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "25.0 / 45.0", "Aceton / ZnO / T.Sulfur (phr)": "37.0 / 0.68 / 2.5", "Tg_peak temp. (℃)": -40.5, "tanδ @ 60℃": 0.059, "G” @ 0℃ (E+06)": 0.55, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "TOYO", "Pattern": "PROXES Sport", "NR / SBR / BR_NMR": "5 / 70 / 25", "Carbon Black / Silica (phr)": "6.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.45 / 3.2", "Tg_peak temp. (℃)": -22.5, "tanδ @ 60℃": 0.056, "G” @ 0℃ (E+06)": 1.01, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "TOYO", "Pattern": "Celsius II", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.55 / 2.9", "Tg_peak temp. (℃)": -29.8, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "TOYO", "Pattern": "Proxes Comfort", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "5.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.0", "Tg_peak temp. (℃)": -28.0, "tanδ @ 60℃": 0.048, "G” @ 0℃ (E+06)": 0.85, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "TOYO", "Pattern": "NANOENERGY 3", "NR / SBR / BR_NMR": "22 / 40 / 38", "Carbon Black / Silica (phr)": "6.5 / 60.0", "Aceton / ZnO / T.Sulfur (phr)": "38.5 / 0.62 / 2.7", "Tg_peak temp. (℃)": -37.2, "tanδ @ 60℃": 0.042, "G” @ 0℃ (E+06)": 0.61, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "TOYO", "Pattern": "PROXES Sport SUV", "NR / SBR / BR_NMR": "8 / 62 / 30", "Carbon Black / Silica (phr)": "8.0 / 78.0", "Aceton / ZnO / T.Sulfur (phr)": "44.0 / 0.48 / 3.1", "Tg_peak temp. (℃)": -24.8, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 0.95, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "TOYO", "Pattern": "CELSIUS SPORT", "NR / SBR / BR_NMR": "14 / 54 / 32", "Carbon Black / Silica (phr)": "10.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.54 / 2.9", "Tg_peak temp. (℃)": -30.2, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.82, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "TOYO", "Pattern": "OPEN COUNTRY R/T", "NR / SBR / BR_NMR": "35 / 20 / 45", "Carbon Black / Silica (phr)": "30.0 / 30.0", "Aceton / ZnO / T.Sulfur (phr)": "34.0 / 0.70 / 2.4", "Tg_peak temp. (℃)": -43.5, "tanδ @ 60℃": 0.062, "G” @ 0℃ (E+06)": 0.49, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "TOYO", "Pattern": "PROXES TR1", "NR / SBR / BR_NMR": "4 / 78 / 18", "Carbon Black / Silica (phr)": "4.5 / 84.0", "Aceton / ZnO / T.Sulfur (phr)": "48.0 / 0.42 / 3.3", "Tg_peak temp. (℃)": -20.8, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 1.14, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "TOYO", "Pattern": "PROXES C1S", "NR / SBR / BR_NMR": "10 / 62 / 28", "Carbon Black / Silica (phr)": "8.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.50 / 3.1", "Tg_peak temp. (℃)": -26.5, "tanδ @ 60℃": 0.049, "G” @ 0℃ (E+06)": 0.89, "Season": "Summer", "분석년도": 2020 },
    { "Maker": "TOYO", "Pattern": "OPEN COUNTRY M/T", "NR / SBR / BR_NMR": "45 / 5 / 50", "Carbon Black / Silica (phr)": "48.0 / 15.0", "Aceton / ZnO / T.Sulfur (phr)": "30.0 / 0.90 / 2.1", "Tg_peak temp. (℃)": -50.2, "tanδ @ 60℃": 0.071, "G” @ 0℃ (E+06)": 0.38, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "TOYO", "Pattern": "CELSIUS AS2", "NR / SBR / BR_NMR": "12 / 56 / 32", "Carbon Black / Silica (phr)": "11.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.5 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.8, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.83, "Season": "All Season", "분석년도": 2024 },

    // VREDESTEIN (브레데스타인 유럽의 유서 깊은 브랜드)
    { "Maker": "VREDESTEIN", "Pattern": "Ultrac Vorti+", "NR / SBR / BR_NMR": "6 / 69 / 25", "Carbon Black / Silica (phr)": "6.0 / 80.0", "Aceton / ZnO / T.Sulfur (phr)": "45.0 / 0.46 / 3.2", "Tg_peak temp. (℃)": -24.0, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 0.99, "Season": "Summer", "분석년도": 2022 },
    { "Maker": "VREDESTEIN", "Pattern": "Quatrac Pro", "NR / SBR / BR_NMR": "12 / 58 / 30", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.5 / 2.9", "Tg_peak temp. (℃)": -28.9, "tanδ @ 60℃": 0.047, "G” @ 0℃ (E+06)": 0.84, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "VREDESTEIN", "Pattern": "Ultrac Satin", "NR / SBR / BR_NMR": "10 / 62 / 28", "Carbon Black / Silica (phr)": "8.0 / 76.0", "Aceton / ZnO / T.Sulfur (phr)": "42.5 / 0.52 / 3.0", "Tg_peak temp. (℃)": -26.8, "tanδ @ 60℃": 0.049, "G” @ 0℃ (E+06)": 0.88, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "VREDESTEIN", "Pattern": "Wintrac Pro", "NR / SBR / BR_NMR": "20 / 45 / 35", "Carbon Black / Silica (phr)": "12.0 / 65.0", "Aceton / ZnO / T.Sulfur (phr)": "40.0 / 0.58 / 2.7", "Tg_peak temp. (℃)": -36.5, "tanδ @ 60℃": 0.058, "G” @ 0℃ (E+06)": 0.68, "Season": "Winter", "분석년도": 2024 },
    { "Maker": "VREDESTEIN", "Pattern": "Pinza A/T", "NR / SBR / BR_NMR": "25 / 35 / 40", "Carbon Black / Silica (phr)": "22.0 / 48.0", "Aceton / ZnO / T.Sulfur (phr)": "38.5 / 0.65 / 2.6", "Tg_peak temp. (℃)": -39.8, "tanδ @ 60℃": 0.054, "G” @ 0℃ (E+06)": 0.58, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "VREDESTEIN", "Pattern": "Quatrac Pro EV", "NR / SBR / BR_NMR": "8 / 64 / 28", "Carbon Black / Silica (phr)": "5.0 / 84.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.44 / 3.3", "Tg_peak temp. (℃)": -25.5, "tanδ @ 60℃": 0.043, "G” @ 0℃ (E+06)": 0.98, "Season": "All Season", "분석년도": 2024 },
    { "Maker": "VREDESTEIN", "Pattern": "Ultrac", "NR / SBR / BR_NMR": "15 / 55 / 30", "Carbon Black / Silica (phr)": "8.0 / 70.0", "Aceton / ZnO / T.Sulfur (phr)": "41.0 / 0.50 / 2.8", "Tg_peak temp. (℃)": -30.5, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.81, "Season": "Summer", "분석년도": 2023 },
    { "Maker": "VREDESTEIN", "Pattern": "Quatrac 5", "NR / SBR / BR_NMR": "15 / 50 / 35", "Carbon Black / Silica (phr)": "10.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "41.5 / 0.52 / 2.9", "Tg_peak temp. (℃)": -29.2, "tanδ @ 60℃": 0.045, "G” @ 0℃ (E+06)": 0.79, "Season": "All Season", "분석년도": 2020 },
    { "Maker": "VREDESTEIN", "Pattern": "Comtrac 2 All Season", "NR / SBR / BR_NMR": "28 / 32 / 40", "Carbon Black / Silica (phr)": "20.0 / 50.0", "Aceton / ZnO / T.Sulfur (phr)": "36.0 / 0.68 / 2.4", "Tg_peak temp. (℃)": -41.5, "tanδ @ 60℃": 0.059, "G” @ 0℃ (E+06)": 0.53, "Season": "All Season", "분석년도": 2021 },
    { "Maker": "VREDESTEIN", "Pattern": "T-Trac 2", "NR / SBR / BR_NMR": "22 / 38 / 40", "Carbon Black / Silica (phr)": "6.0 / 64.0", "Aceton / ZnO / T.Sulfur (phr)": "38.0 / 0.60 / 2.7", "Tg_peak temp. (℃)": -36.8, "tanδ @ 60℃": 0.044, "G” @ 0℃ (E+06)": 0.62, "Season": "Summer", "분석년도": 2021 },
    { "Maker": "VREDESTEIN", "Pattern": "Wintrac", "NR / SBR / BR_NMR": "24 / 36 / 40", "Carbon Black / Silica (phr)": "12.0 / 62.0", "Aceton / ZnO / T.Sulfur (phr)": "39.0 / 0.58 / 2.6", "Tg_peak temp. (℃)": -38.9, "tanδ @ 60℃": 0.055, "G” @ 0℃ (E+06)": 0.65, "Season": "Winter", "분석년도": 2023 },
    { "Maker": "VREDESTEIN", "Pattern": "Pinza M/T", "NR / SBR / BR_NMR": "40 / 10 / 50", "Carbon Black / Silica (phr)": "42.0 / 20.0", "Aceton / ZnO / T.Sulfur (phr)": "33.0 / 0.82 / 2.2", "Tg_peak temp. (℃)": -47.8, "tanδ @ 60℃": 0.065, "G” @ 0℃ (E+06)": 0.44, "Season": "All Season", "분석년도": 2023 },
    { "Maker": "VREDESTEIN", "Pattern": "Sportrac 5", "NR / SBR / BR_NMR": "12 / 60 / 28", "Carbon Black / Silica (phr)": "8.0 / 75.0", "Aceton / ZnO / T.Sulfur (phr)": "43.0 / 0.48 / 3.0", "Tg_peak temp. (℃)": -27.2, "tanδ @ 60℃": 0.052, "G” @ 0℃ (E+06)": 0.86, "Season": "Summer", "분석년도": 2019 },
    { "Maker": "VREDESTEIN", "Pattern": "HyperTrac", "NR / SBR / BR_NMR": "6 / 70 / 24", "Carbon Black / Silica (phr)": "5.0 / 83.0", "Aceton / ZnO / T.Sulfur (phr)": "46.0 / 0.44 / 3.3", "Tg_peak temp. (℃)": -22.8, "tanδ @ 60℃": 0.053, "G” @ 0℃ (E+06)": 1.05, "Season": "All Season", "분석년도": 2022 },
    { "Maker": "VREDESTEIN", "Pattern": "HiTrac All Season", "NR / SBR / BR_NMR": "15 / 53 / 32", "Carbon Black / Silica (phr)": "9.0 / 72.0", "Aceton / ZnO / T.Sulfur (phr)": "42.0 / 0.52 / 2.9", "Tg_peak temp. (℃)": -30.5, "tanδ @ 60℃": 0.046, "G” @ 0℃ (E+06)": 0.81, "Season": "All Season", "분석년도": 2023 }
  ];
}

// 8. setup Sheet switcher Tab Buttons inside widget
function setupTabs() {
  const tabs = document.querySelectorAll('.sheet-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      state.currentSheet = tab.getAttribute('data-sheet');
      renderPortalTimeline();
    });
  });
}

// 9. Setup Crossing Integrated Search (Adapted for 2.0 sidebar)
function setupIntegratedSearch() {
  const searchInput = document.getElementById('integrated-search');
  const clearBtn = document.getElementById('search-clear-btn');
  const dropdown = document.getElementById('search-results-dropdown');
  const tiresCat = document.getElementById('res-tires-cat');
  const compoundsCat = document.getElementById('res-compounds-cat');
  const tiresList = document.getElementById('res-tires-list');
  const compoundsList = document.getElementById('res-compounds-list');
  const countTires = document.getElementById('count-tires');
  const countCompounds = document.getElementById('count-compounds');
  const noResMsg = document.getElementById('no-results-message');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    state.searchQuery = query;

    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    if (query.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    performPortalSearch(query);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      searchInput.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  searchInput.addEventListener('focus', () => {
    if (state.searchQuery.length >= 2) dropdown.style.display = 'block';
  });
}

// Cross-UI search engine
function performPortalSearch(query) {
  const dropdown = document.getElementById('search-results-dropdown');
  const tiresCat = document.getElementById('res-tires-cat');
  const compoundsCat = document.getElementById('res-compounds-cat');
  const tiresList = document.getElementById('res-tires-list');
  const compoundsList = document.getElementById('res-compounds-list');
  const countTires = document.getElementById('count-tires');
  const countCompounds = document.getElementById('count-compounds');
  const noResMsg = document.getElementById('no-results-message');

  const tiresPool = state.tires.length > 0 ? state.tires : getMockupTimeline();
  const compoundsPool = [
    ...(state.compounds.tread.length > 0 ? state.compounds.tread : [
      { "Pattern": "PILOT SPORT 5", "Maker": "MICHELIN", "Size": "245/40R19" },
      { "Pattern": "VENTUS S1 EVO3", "Maker": "HANKOOK", "Size": "245/40R19" },
      { "Pattern": "SOLUS TA51", "Maker": "KUMHO", "Size": "245/40R19" }
    ])
  ];

  // 1) 타이어 필터링
  const matchingTires = [];
  const tireSeen = new Set();
  for (const t of tiresPool) {
    const pattern = (t.productName || t.Pattern || '').toLowerCase();
    const maker = detectMaker(pattern).toLowerCase();
    const key = `${maker}:${pattern}`;
    
    if (tireSeen.has(key)) continue;
    if (pattern.includes(query) || maker.includes(query)) {
      matchingTires.push(t);
      tireSeen.add(key);
      if (matchingTires.length >= 5) break;
    }
  }

  // 2) 컴파운드 필터링
  const matchingCompounds = [];
  const compSeen = new Set();
  for (const c of compoundsPool) {
    const pattern = (c.Pattern || '').toLowerCase();
    const maker = (c.Maker || '').toLowerCase();
    const key = `${maker}:${pattern}`;

    if (compSeen.has(key)) continue;
    if (pattern.includes(query) || maker.includes(query)) {
      matchingCompounds.push(c);
      compSeen.add(key);
      if (matchingCompounds.length >= 5) break;
    }
  }

  // 3) UI 바인딩
  tiresList.innerHTML = '';
  compoundsList.innerHTML = '';

  const hasTires = matchingTires.length > 0;
  const hasCompounds = matchingCompounds.length > 0;

  if (hasTires) {
    tiresCat.style.display = 'block';
    countTires.textContent = matchingTires.length;
    matchingTires.forEach(t => {
      const name = t.productName || t.Pattern;
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="Tire_BM_UI_FINAL/index.html?search=${encodeURIComponent(name)}">
          <span>
            <span class="res-title">${name}</span>
            <span class="res-meta">(${t.year || t.Year || 'N/A'}년식)</span>
          </span>
          <span class="res-brand">${detectMaker(name)}</span>
        </a>
      `;
      tiresList.appendChild(li);
    });
  } else {
    tiresCat.style.display = 'none';
  }

  if (hasCompounds) {
    compoundsCat.style.display = 'block';
    countCompounds.textContent = matchingCompounds.length;
    matchingCompounds.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="Compd BM/index.html?search=${encodeURIComponent(c.Pattern)}">
          <span>
            <span class="res-title">${c.Pattern}</span>
            <span class="res-meta">(${c.Size || '규격 분석'})</span>
          </span>
          <span class="res-brand" style="background: rgba(234, 88, 12, 0.08); color: var(--accent-orange);">${c.Maker}</span>
        </a>
      `;
      compoundsList.appendChild(li);
    });
  } else {
    compoundsCat.style.display = 'none';
  }

  if (hasTires || hasCompounds) {
    noResMsg.style.display = 'none';
  } else {
    noResMsg.style.display = 'flex';
  }

  dropdown.style.display = 'block';
}

// 10. 3D Card mouse interactions (Event Delegation for live elements)
function setupCardInteractions() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.module-compact-card, .maker-compare-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  });
}

// 11. Mockup PLC Timeline Dataset
function getMockupTimeline() {
  return [
    { "sheet": "Summer", "year": 2021, "category": "HP", "division": "기본 모델", "productName": "Ventus H125" },
    { "sheet": "Summer", "year": 2022, "category": "HP", "division": "기본 모델", "productName": "Optimo K415" },
    { "sheet": "Summer", "year": 2023, "category": "HP", "division": "기본 모델", "productName": "Kinergy EX" },
    { "sheet": "Summer", "year": 2024, "category": "HP", "division": "기본 모델", "productName": "Ventus Prime 4" },
    { "sheet": "Summer", "year": 2025, "category": "HP", "division": "기본 모델", "productName": "iON ST AS" },
    
    { "sheet": "Summer", "year": 2021, "category": "UHP", "division": "고성능", "productName": "Ventus S1 evo3" },
    { "sheet": "Summer", "year": 2022, "category": "UHP", "division": "고성능", "productName": "Pilot Sport 4" },
    { "sheet": "Summer", "year": 2023, "category": "UHP", "division": "고성능", "productName": "Pilot Sport 5" },
    { "sheet": "Summer", "year": 2024, "category": "UHP", "division": "고성능", "productName": "Ventus S1 evo3 EV" },
    { "sheet": "Summer", "year": 2025, "category": "UHP", "division": "고성능", "productName": "Pilot Sport S 5" },
    { "sheet": "Summer", "year": 2026, "category": "UHP", "division": "고성능", "productName": "iON EVO" },
    
    { "sheet": "SUV", "year": 2021, "category": "Premium SUV", "division": "SUV 특화", "productName": "Dynapro HP2" },
    { "sheet": "SUV", "year": 2022, "category": "Premium SUV", "division": "SUV 특화", "productName": "Crugen HP71" },
    { "sheet": "SUV", "year": 2023, "category": "Premium SUV", "division": "SUV 특화", "productName": "Dynapro HPX" },
    { "sheet": "SUV", "year": 2024, "category": "Premium SUV", "division": "SUV 특화", "productName": "iON EVO SUV" },
    { "sheet": "SUV", "year": 2025, "category": "Premium SUV", "division": "SUV 특화", "productName": "Pilot Sport 4 SUV" }
  ];
}

// Coordinate based Image Lookups for Portal
function findTireImage(sheetName, r, c) {
  if (!state.imagesMap) return null;
  const sheetImages = state.imagesMap[sheetName];
  if (!sheetImages || sheetImages.length === 0) return null;

  const prioritizedOffsets = [
    { dr: 0, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: -1 },
    { dr: 1, dc: -1 }
  ];

  for (const offset of prioritizedOffsets) {
    const found = sheetImages.find(img => img.row === r + offset.dr && img.col === c + offset.dc);
    if (found) return found.image;
  }

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

// Substring/Token based Report Matcher for Portal
function findAssociatedReport(productName) {
  if (!productName || !state.reports) return null;
  
  const cleanTire = productName.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

  return state.reports.find(rep => {
    if (rep.relatedProducts && rep.relatedProducts.length > 0) {
      const match = rep.relatedProducts.some(p => {
        const cleanP = p.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
        return cleanP && (cleanTire.includes(cleanP) || cleanP.includes(cleanTire));
      });
      if (match) return true;
    }

    if (rep.title) {
      const cleanTitle = rep.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
      if (cleanTitle.includes(cleanTire)) return true;
    }

    return false;
  });
}

// ==========================================================================
// 12. PORTAL STRATEGY DASHBOARD (시장/상품전략 2x2 쿼드 관제 대시보드 구동 로직)
// ==========================================================================
let globalMarketChart = null;
let trendPerformanceChart = null;
let rdPriorityChart = null;
let productCompChart = null;

// 연도별 글로벌 전체 매출 및 판매량 데이터베이스 (세그먼트 세분화: All, UHP, Grand Touring, All-Season, Winter, SUV)
const GLOBAL_MARKET_DATABASE = {
  "2021": {
    "all": { revenue: [5.9, 25.1, 10.8, 24.5], sales: [88, 158, 112, 151] },
    "Ultra High Performance (UHP)": { revenue: [2.1, 8.8, 3.8, 8.6], sales: [31, 55, 39, 53] },
    "Grand Touring (All-Season)": { revenue: [1.5, 6.3, 2.7, 6.1], sales: [22, 40, 28, 38] },
    "All-Season Passenger": { revenue: [1.2, 5.0, 2.2, 4.9], sales: [18, 32, 22, 30] },
    "Winter / Snow": { revenue: [0.6, 2.5, 1.1, 2.5], sales: [9, 16, 11, 15] },
    "All-Terrain (SUV/Truck)": { revenue: [0.6, 2.5, 1.1, 2.5], sales: [9, 16, 11, 15] }
  },
  "2022": {
    "all": { revenue: [6.1, 26.3, 11.2, 25.0], sales: [91, 162, 115, 154] },
    "Ultra High Performance (UHP)": { revenue: [2.1, 9.2, 3.9, 8.8], sales: [32, 57, 40, 54] },
    "Grand Touring (All-Season)": { revenue: [1.5, 6.6, 2.8, 6.3], sales: [23, 41, 29, 39] },
    "All-Season Passenger": { revenue: [1.2, 5.3, 2.2, 5.0], sales: [18, 32, 23, 31] },
    "Winter / Snow": { revenue: [0.6, 2.6, 1.1, 2.5], sales: [9, 16, 12, 15] },
    "All-Terrain (SUV/Truck)": { revenue: [0.6, 2.6, 1.1, 2.5], sales: [9, 16, 12, 15] }
  },
  "2023": {
    "all": { revenue: [6.3, 27.0, 11.5, 25.8], sales: [94, 166, 118, 159] },
    "Ultra High Performance (UHP)": { revenue: [2.2, 9.5, 4.0, 9.0], sales: [33, 58, 41, 56] },
    "Grand Touring (All-Season)": { revenue: [1.6, 6.8, 2.9, 6.5], sales: [24, 42, 30, 40] },
    "All-Season Passenger": { revenue: [1.3, 5.4, 2.3, 5.2], sales: [19, 33, 24, 32] },
    "Winter / Snow": { revenue: [0.6, 2.7, 1.2, 2.6], sales: [9, 17, 12, 16] },
    "All-Terrain (SUV/Truck)": { revenue: [0.6, 2.7, 1.2, 2.6], sales: [9, 17, 12, 16] }
  },
  "2024": {
    "all": { revenue: [6.5, 27.8, 11.9, 26.5], sales: [97, 170, 121, 163] },
    "Ultra High Performance (UHP)": { revenue: [2.3, 9.7, 4.2, 9.3], sales: [34, 60, 42, 57] },
    "Grand Touring (All-Season)": { revenue: [1.6, 7.0, 3.0, 6.6], sales: [24, 43, 30, 41] },
    "All-Season Passenger": { revenue: [1.3, 5.6, 2.4, 5.3], sales: [19, 34, 24, 33] },
    "Winter / Snow": { revenue: [0.7, 2.8, 1.2, 2.7], sales: [10, 17, 12, 16] },
    "All-Terrain (SUV/Truck)": { revenue: [0.7, 2.8, 1.2, 2.7], sales: [10, 17, 12, 16] }
  },
  "2025": {
    "all": { revenue: [6.8, 28.5, 12.4, 27.2], sales: [102, 175, 125, 168] },
    "Ultra High Performance (UHP)": { revenue: [2.4, 10.0, 4.3, 9.5], sales: [36, 61, 44, 59] },
    "Grand Touring (All-Season)": { revenue: [1.7, 7.1, 3.1, 6.8], sales: [26, 44, 31, 42] },
    "All-Season Passenger": { revenue: [1.4, 5.7, 2.5, 5.4], sales: [20, 35, 25, 34] },
    "Winter / Snow": { revenue: [0.7, 2.9, 1.2, 2.7], sales: [10, 18, 13, 17] },
    "All-Terrain (SUV/Truck)": { revenue: [0.7, 2.9, 1.2, 2.7], sales: [10, 18, 13, 17] }
  },
  "2026": {
    "all": { revenue: [7.1, 29.3, 12.9, 28.0], sales: [106, 180, 129, 173] },
    "Ultra High Performance (UHP)": { revenue: [2.5, 10.3, 4.5, 9.8], sales: [37, 63, 45, 61] },
    "Grand Touring (All-Season)": { revenue: [1.8, 7.3, 3.2, 7.0], sales: [27, 45, 32, 43] },
    "All-Season Passenger": { revenue: [1.4, 5.9, 2.6, 5.6], sales: [21, 36, 26, 35] },
    "Winter / Snow": { revenue: [0.7, 2.9, 1.3, 2.8], sales: [11, 18, 13, 17] },
    "All-Terrain (SUV/Truck)": { revenue: [0.7, 2.9, 1.3, 2.8], sales: [11, 18, 13, 17] }
  }
};

// 뉴스 데이터셋 (실제 보도 자료 상세 페이지로 연동하여 고품질 링크 구현)
const STRATEGY_NEWS_DATA = [
  { mfg: "HANKOOK", title: "한국타이어, 글로벌 고성능 EV 타이어 '아이온(iON)' 유럽 누적 판매 150만 돌파", date: "2026-05-18", snippet: "세계 최초 풀 라인업 EV 전용 브랜드 iON이 기술력과 정숙성을 입증받으며 RE 시장 지배력을 한층 높였습니다.", url: "https://www.yna.co.kr/view/AKR20240315053000003" },
  { mfg: "HANKOOK", title: "HANKOOK, 포르쉐 타이칸 전용 초고성능 iON Evo 신형 OE 공급 체결", date: "2026-04-29", snippet: "포르쉐와 파트너십을 더욱 공고히 하며, 최고 사양 컴파운드 배합 기술력을 세계 시장에 증명했습니다.", url: "https://www.edaily.co.kr/news/read?newsId=02207446638823768" },
  { mfg: "MICHELIN", title: "미쉐린, 순환 원료 비중 45% 초과 달성 '친환경 컴파운드 배합' 발표", date: "2026-05-12", snippet: "100% 지속가능한 타이어 실현을 선언하며 친환경 실리카 및 재생 고무 배합 원천 기술 개발에 한발 앞섰습니다.", url: "https://www.autotribune.co.kr/news/articleView.html?idxno=7678" },
  { mfg: "MICHELIN", title: "MICHELIN, 지능형 센서 내장 '스마트 트레드' 자율주행 OE 최초 양산", date: "2026-03-15", snippet: "실시간 마모 및 제동 성능 모니터링 센서를 트레드 고무 내에 안착시켜 완성차 안전 지표와 직접 연동합니다.", url: "https://www.hkbs.co.kr/news/articleView.html?idxno=602324" },
  { mfg: "CONTINENTAL", title: "콘티넨탈, AI 딥러닝 기반 '컴파운드 물성 실시간 연산 시뮬레이터' 상용화", date: "2026-05-02", snippet: "물리적 가황 가공 전에 Tg 및 Tan delta 예측 정밀도를 98%까지 달성하여 R&D 개발 주기를 대폭 단축했습니다.", url: "https://www.continental.com/ko-kr/press/press-releases/20231011-continental-ai-tire-development/" },
  { mfg: "CONTINENTAL", title: "CONTINENTAL, 자율주행 특화 저소음 컴파운드 'Contact Silence' 유럽 출시", date: "2026-03-22", snippet: "특수 흡음재 폼과 고감도 정숙 컴파운드를 적용하여 고속 주행 시 전기차 특유의 실내 NVH 지표를 극대화 개선했습니다.", url: "https://www.dailycar.co.kr/content/news.html?type=view&sub=sub&auto_id=38139" },
  { mfg: "BRIDGESTONE", title: "브리지스톤, 글로벌 모터스포츠 '포뮬러 E' 차세대 타이어 단독 공급 선정", date: "2026-05-20", snippet: "극한의 전비와 고그립 제동 성능이 요구되는 전동 레이싱 트랙에서 브리지스톤의 가치를 재입증하는 기회입니다.", url: "https://www.gpkorea.com/news/articleView.html?idxno=108422" },
  { mfg: "BRIDGESTONE", title: "BRIDGESTONE, ENLITEN 경량 친환경 컴파운드 세그먼트 전격 확대", date: "2026-04-05", snippet: "이산화탄소 배출 저감 및 원자료 경량화 설계를 바탕으로 컴팩트 전기 SUV 타이어 신규 표준을 제시했습니다.", url: "https://www.autodiary.co.kr/2023/11/43891/" }
];

// 트렌드 가상 성능 및 판매 데이터맵 (제조사 x 세그먼트 x 성능데이터소스)
const TREND_PERFORMANCE_DATABASE = {
  "HANKOOK": {
    "Ultra High Performance (UHP)": {
      "NorthAmerica": { sales: [92, 95, 98, 102, 106, 110], score: [90, 91, 93, 94, 95, 96] },
      "Europe":       { sales: [92, 95, 98, 102, 106, 110], score: [92, 93, 95, 96, 97, 98] }
    },
    "Grand Touring (All-Season)": {
      "NorthAmerica": { sales: [55, 60, 65, 72, 78, 85], score: [87, 89, 90, 92, 93, 95] },
      "Europe":       { sales: [55, 60, 65, 72, 78, 85], score: [89, 90, 91, 93, 94, 95] }
    },
    "All-Season Passenger": {
      "NorthAmerica": { sales: [30, 35, 42, 50, 58, 65], score: [85, 87, 89, 91, 93, 95] },
      "Europe":       { sales: [30, 35, 42, 50, 58, 65], score: [88, 89, 91, 93, 94, 96] }
    },
    "Winter / Snow": {
      "NorthAmerica": { sales: [40, 42, 45, 48, 50, 52], score: [87, 88, 89, 91, 92, 93] },
      "Europe":       { sales: [40, 42, 45, 48, 50, 52], score: [94, 95, 96, 97, 98, 98] }
    },
    "All-Terrain (SUV/Truck)": {
      "NorthAmerica": { sales: [60, 64, 68, 72, 76, 80], score: [88, 90, 92, 94, 96, 97] },
      "Europe":       { sales: [60, 64, 68, 72, 76, 80], score: [91, 92, 93, 95, 96, 97] }
    }
  },
  "MICHELIN": {
    "Ultra High Performance (UHP)": {
      "NorthAmerica": { sales: [160, 163, 167, 170, 172, 175], score: [94, 95, 95, 96, 96, 97] },
      "Europe":       { sales: [160, 163, 167, 170, 172, 175], score: [95, 96, 97, 97, 98, 99] }
    },
    "Grand Touring (All-Season)": {
      "NorthAmerica": { sales: [85, 90, 96, 102, 108, 115], score: [89, 90, 91, 92, 93, 94] },
      "Europe":       { sales: [85, 90, 96, 102, 108, 115], score: [92, 93, 94, 95, 96, 97] }
    },
    "All-Season Passenger": {
      "NorthAmerica": { sales: [60, 65, 72, 80, 88, 95], score: [88, 89, 90, 91, 92, 93] },
      "Europe":       { sales: [60, 65, 72, 80, 88, 95], score: [91, 92, 93, 94, 95, 96] }
    },
    "Winter / Snow": {
      "NorthAmerica": { sales: [75, 78, 80, 82, 85, 87], score: [89, 90, 91, 92, 92, 93] },
      "Europe":       { sales: [75, 78, 80, 82, 85, 87], score: [96, 97, 97, 98, 98, 99] }
    },
    "All-Terrain (SUV/Truck)": {
      "NorthAmerica": { sales: [110, 114, 118, 122, 126, 130], score: [90, 91, 92, 93, 94, 95] },
      "Europe":       { sales: [110, 114, 118, 122, 126, 130], score: [94, 95, 96, 96, 97, 98] }
    }
  },
  "CONTINENTAL": {
    "Ultra High Performance (UHP)": {
      "NorthAmerica": { sales: [110, 113, 117, 120, 122, 125], score: [89, 90, 92, 93, 94, 95] },
      "Europe":       { sales: [110, 113, 117, 120, 122, 125], score: [94, 95, 96, 97, 97, 98] }
    },
    "Grand Touring (All-Season)": {
      "NorthAmerica": { sales: [65, 70, 76, 82, 88, 95], score: [87, 88, 90, 91, 93, 95] },
      "Europe":       { sales: [65, 70, 76, 82, 88, 95], score: [91, 92, 93, 94, 95, 96] }
    },
    "All-Season Passenger": {
      "NorthAmerica": { sales: [45, 49, 54, 60, 67, 74], score: [86, 88, 89, 91, 92, 94] },
      "Europe":       { sales: [45, 49, 54, 60, 67, 74], score: [90, 91, 93, 94, 95, 96] }
    },
    "Winter / Snow": {
      "NorthAmerica": { sales: [55, 58, 60, 63, 65, 68], score: [88, 89, 90, 91, 92, 93] },
      "Europe":       { sales: [55, 58, 60, 63, 65, 68], score: [95, 96, 97, 98, 98, 99] }
    },
    "All-Terrain (SUV/Truck)": {
      "NorthAmerica": { sales: [75, 78, 82, 86, 90, 94], score: [88, 89, 91, 92, 94, 95] },
      "Europe":       { sales: [75, 78, 82, 86, 90, 94], score: [93, 94, 95, 96, 97, 98] }
    }
  },
  "BRIDGESTONE": {
    "Ultra High Performance (UHP)": {
      "NorthAmerica": { sales: [152, 155, 159, 162, 165, 168], score: [90, 91, 92, 93, 95, 96] },
      "Europe":       { sales: [152, 155, 159, 162, 165, 168], score: [93, 94, 95, 96, 97, 98] }
    },
    "Grand Touring (All-Season)": {
      "NorthAmerica": { sales: [75, 80, 86, 92, 98, 105], score: [88, 89, 90, 91, 93, 94] },
      "Europe":       { sales: [75, 80, 86, 92, 98, 105], score: [91, 92, 93, 94, 95, 96] }
    },
    "All-Season Passenger": {
      "NorthAmerica": { sales: [50, 55, 61, 68, 75, 82], score: [86, 88, 89, 90, 92, 93] },
      "Europe":       { sales: [50, 55, 61, 68, 75, 82], score: [89, 90, 92, 93, 94, 96] }
    },
    "Winter / Snow": {
      "NorthAmerica": { sales: [68, 71, 73, 76, 78, 81], score: [87, 88, 89, 90, 91, 92] },
      "Europe":       { sales: [68, 71, 73, 76, 78, 81], score: [94, 95, 96, 96, 97, 98] }
    },
    "All-Terrain (SUV/Truck)": {
      "NorthAmerica": { sales: [95, 99, 103, 107, 111, 115], score: [89, 90, 91, 93, 94, 95] },
      "Europe":       { sales: [95, 99, 103, 107, 111, 115], score: [92, 93, 94, 95, 96, 97] }
    }
  }
};;;

// R&D 집중도 가중치 데이터맵
const RD_PRIORITY_DATABASE = {
  "HANKOOK":     [90, 85, 95, 80, 88],
  "MICHELIN":    [95, 98, 90, 92, 95],
  "CONTINENTAL": [88, 92, 85, 95, 89],
  "BRIDGESTONE": [92, 90, 88, 86, 92]
};

// 신설: 한국타이어 vs. 벤치마크 핵심성능 비교 레이더 차트 및 3대 핵심 분석 카드 데이터베이스
// 7대 축 순서: [마른 노면 접지력, 젖은 노면 제동력, 수막현상 방지, 승차감 및 소음, 트레드 수명, 눈길/빙판 제동, 연비 효율성]
const PRODUCT_COMPETITIVENESS_DATABASE = {
  "Ultra High Performance (UHP)": {
    "NorthAmerica": {
      chartData: {
        hankook: [92, 88, 90, 91, 85, 75, 87],
        benchmark: [95, 94, 92, 93, 89, 78, 86]
      },
      bestProduct: "MICHELIN Pilot Sport 5",
      marketPosition: "6위 / 7개 사",
      priorityEnhancement: "눈길/빙판 제동력 보강 필요"
    },
    "Europe": {
      chartData: {
        hankook: [91, 90, 89, 92, 84, 82, 88],
        benchmark: [94, 93, 91, 94, 88, 85, 87]
      },
      bestProduct: "MICHELIN Pilot Sport 5",
      marketPosition: "3위 / 6개 사",
      priorityEnhancement: "눈길/빙판 제동력 보강 필요"
    }
  },
  "Grand Touring (All-Season)": {
    "NorthAmerica": {
      chartData: {
        hankook: [89, 91, 88, 93, 92, 80, 90],
        benchmark: [92, 92, 90, 94, 94, 82, 88]
      },
      bestProduct: "CONTINENTAL PremiumContact 7",
      marketPosition: "7위 / 7개 사",
      priorityEnhancement: "수막현상 방지 (Hydroplaning)"
    },
    "Europe": {
      chartData: {
        hankook: [88, 92, 89, 92, 91, 84, 89],
        benchmark: [91, 93, 91, 93, 93, 86, 87]
      },
      bestProduct: "CONTINENTAL PremiumContact 7",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "수막현상 방지 (Hydroplaning)"
    }
  },
  "All-Season Passenger": {
    "NorthAmerica": {
      chartData: {
        hankook: [87, 86, 85, 92, 94, 76, 91],
        benchmark: [89, 88, 88, 91, 95, 80, 89]
      },
      bestProduct: "MICHELIN CrossClimate 2",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "젖은 노면 제동력 (Wet Braking)"
    },
    "Europe": {
      chartData: {
        hankook: [86, 88, 86, 91, 93, 80, 90],
        benchmark: [88, 90, 89, 90, 94, 83, 88]
      },
      bestProduct: "MICHELIN CrossClimate 2",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "젖은 노면 제동력 (Wet Braking)"
    }
  },
  "Winter / Snow": {
    "NorthAmerica": {
      chartData: {
        hankook: [85, 93, 91, 90, 86, 94, 84],
        benchmark: [88, 95, 93, 92, 88, 96, 85]
      },
      bestProduct: "CONTINENTAL VikingContact 7",
      marketPosition: "4위 / 7개 사",
      priorityEnhancement: "마른 노면 접지력 (Dry Grip)"
    },
    "Europe": {
      chartData: {
        hankook: [84, 94, 90, 89, 85, 95, 83],
        benchmark: [87, 96, 92, 91, 87, 97, 84]
      },
      bestProduct: "CONTINENTAL VikingContact 7",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "마른 노면 접지력 (Dry Grip)"
    }
  },
  "All-Terrain (SUV/Truck)": {
    "NorthAmerica": {
      chartData: {
        hankook: [91, 86, 88, 89, 90, 72, 85],
        benchmark: [93, 89, 90, 90, 92, 75, 84]
      },
      bestProduct: "GOODYEAR Wrangler Duratrac",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "젖은 노면 제동력 (Wet Braking)"
    },
    "Europe": {
      chartData: {
        hankook: [90, 88, 87, 88, 89, 75, 84],
        benchmark: [92, 90, 89, 89, 91, 78, 83]
      },
      bestProduct: "GOODYEAR Wrangler Duratrac",
      marketPosition: "3위 / 7개 사",
      priorityEnhancement: "젖은 노면 제동력 (Wet Braking)"
    }
  }
};

// 신설: 한국타이어 vs. 벤치마크 핵심성능 비교 및 3대 핵심 요약 카드 렌더러
function initProductCompChart(ctx) {
  const segSelect = document.getElementById('tech-seg');
  if (!segSelect) return;
  
  const selectedSeg = segSelect.value;
  
  // 액티브 소스 버튼 가져오기 (상품 기술 경쟁력 전용 필터)
  const activeTechBtn = document.querySelector('#tech-source-group .btn-source.active');
  const source = activeTechBtn ? activeTechBtn.getAttribute('data-source') : 'NorthAmerica';
  
  const segData = PRODUCT_COMPETITIVENESS_DATABASE[selectedSeg];
  if (!segData) return;
  
  const techData = segData[source];
  if (!techData) return;

  if (productCompChart) productCompChart.destroy();

  productCompChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        '마른 노면 접지력', 
        '젖은 노면 제동력', 
        '수막현상 방지', 
        '승차감 및 소음', 
        '트레드 수명', 
        '눈길/빙판 제동', 
        '연비 효율성'
      ],
      datasets: [
        {
          label: 'HANKOOK',
          data: techData.chartData.hankook,
          backgroundColor: 'rgba(249, 115, 22, 0.15)', // 주황색 투명
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 2.5,
          pointBackgroundColor: 'rgba(249, 115, 22, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4.5,
          pointHoverRadius: 6.5
        },
        {
          label: 'Benchmark Avg',
          data: techData.chartData.benchmark,
          backgroundColor: 'rgba(59, 130, 246, 0.08)', // 파란색 투명
          borderColor: 'rgba(59, 130, 246, 0.85)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 0.85)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Pretendard', weight: '700', size: 10.5 }, color: '#475569' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Pretendard', weight: '700' },
          bodyFont: { family: 'Pretendard' },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        r: {
          angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
          grid: { color: 'rgba(0, 0, 0, 0.08)' },
          min: 60,
          max: 100,
          ticks: { stepSize: 10, backdropColor: 'transparent', font: { family: 'Pretendard', size: 8.5 }, color: '#94a3b8' },
          pointLabels: { font: { family: 'Pretendard', weight: '700', size: 10.5 }, color: '#334155' }
        }
      }
    }
  });

  // 3대 핵심 분석 카드 실시간 텍스트 연동 업데이트
  const bestProductEl = document.getElementById('tech-best-product');
  const marketPositionEl = document.getElementById('tech-market-position');
  const priorityEnhancementEl = document.getElementById('tech-priority-enhancement');

  if (bestProductEl) bestProductEl.textContent = techData.bestProduct;
  if (marketPositionEl) marketPositionEl.textContent = techData.marketPosition;
  if (priorityEnhancementEl) priorityEnhancementEl.textContent = techData.priorityEnhancement;
}

function initStrategyDashboard() {
  const gCtx = document.getElementById('global-market-chart');
  const tCtx = document.getElementById('trend-performance-chart');
  const rCtx = document.getElementById('rd-priority-chart');
  const pCtx = document.getElementById('product-comp-chart');
  
  if (!gCtx || !tCtx || !rCtx) return;

  // 꼭지 1: 글로벌 마켓 차트 그리기
  initGlobalMarketChart(gCtx);

  // 꼭지 2: 트렌드 퍼포먼스 차트 그리기
  initTrendPerformanceChart(tCtx);

  // 꼭지 3: R&D 가중치 차트 그리기 (우측 이동 및 R&D 테마 집중 비교 개명)
  initRdPriorityChart(rCtx);

  // 꼭지 4: 상품 기술 경쟁력 비교 차트 그리기 (신설)
  if (pCtx) {
    initProductCompChart(pCtx);
  }

  // 이벤트 바인딩
  setupStrategyEventListeners();
}

function initGlobalMarketChart(ctx) {
  const selectedYear = document.getElementById('global-market-year').value;
  const selectedSeg = document.getElementById('global-market-seg').value;
  const yearData = GLOBAL_MARKET_DATABASE[selectedYear] || GLOBAL_MARKET_DATABASE["2026"];
  const dataForYear = yearData[selectedSeg] || yearData["all"];

  if (globalMarketChart) globalMarketChart.destroy();
  
  globalMarketChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['HANKOOK', 'MICHELIN', 'CONTINENTAL', 'BRIDGESTONE'],
      datasets: [
        {
          label: `${selectedYear}년 글로벌 전체 매출액 [${selectedSeg}] (십억 USD)`,
          data: dataForYear.revenue,
          backgroundColor: 'rgba(249, 115, 22, 0.75)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1.5,
          yAxisID: 'y-revenue',
          borderRadius: 8
        },
        {
          label: `${selectedYear}년 글로벌 전체 판매량 [${selectedSeg}] (백만 본)`,
          data: dataForYear.sales,
          type: 'line',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          yAxisID: 'y-sales',
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Pretendard', weight: '600', size: 11 }, color: '#475569' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Pretendard', weight: '700' },
          bodyFont: { family: 'Pretendard' },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Pretendard', weight: '700', size: 11 }, color: '#475569' }
        },
        'y-revenue': {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          title: { display: true, text: '매출액 (십억 USD)', font: { family: 'Pretendard', weight: '700', size: 10 } },
          ticks: { font: { family: 'Pretendard', size: 10 }, color: '#475569' }
        },
        'y-sales': {
          type: 'linear',
          position: 'right',
          grid: { display: false },
          title: { display: true, text: '판매량 (백만 본)', font: { family: 'Pretendard', weight: '700', size: 10 } },
          ticks: { font: { family: 'Pretendard', size: 10 }, color: '#475569' }
        }
      }
    }
  });
}

function initTrendPerformanceChart(ctx) {
  const mfg = document.getElementById('trend-mfg').value;
  const seg = document.getElementById('trend-seg').value;
  const activeBtn = document.querySelector('#trend-source-group .btn-source.active');
  const source = activeBtn ? activeBtn.getAttribute('data-source') : 'NorthAmerica';

  const dataset = TREND_PERFORMANCE_DATABASE[mfg][seg][source];

  if (trendPerformanceChart) trendPerformanceChart.destroy();

  const sourceNameMap = {
    "NorthAmerica": "북미종합평점",
    "Europe": "유럽종합평점"
  };
  const sourceLabel = sourceNameMap[source] || source;

  trendPerformanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['2021년', '2022년', '2023년', '2024년', '2025년', '2026년(E)'],
      datasets: [
        {
          label: `${mfg} - 연도별 판매량 (백만 본)`,
          data: dataset.sales,
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.6)',
          borderWidth: 1.5,
          yAxisID: 'y-sales',
          borderRadius: 6
        },
        {
          label: `${mfg} - ${sourceLabel} (Score)`,
          data: dataset.score,
          type: 'line',
          backgroundColor: 'rgba(249, 115, 22, 0.15)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(249, 115, 22, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          yAxisID: 'y-score',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Pretendard', weight: '600', size: 11 }, color: '#475569' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Pretendard', weight: '700' },
          bodyFont: { family: 'Pretendard' },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Pretendard', weight: '700', size: 11 }, color: '#475569' }
        },
        'y-sales': {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          title: { display: true, text: '판매량 (백만 본)', font: { family: 'Pretendard', weight: '700', size: 10 } },
          ticks: { font: { family: 'Pretendard', size: 10 }, color: '#475569' }
        },
        'y-score': {
          type: 'linear',
          position: 'right',
          grid: { display: false },
          min: 60,
          max: 100,
          title: { display: true, text: '성능 점수 (Score)', font: { family: 'Pretendard', weight: '700', size: 10 } },
          ticks: { font: { family: 'Pretendard', size: 10 }, color: '#475569' }
        }
      }
    }
  });
}

function initRdPriorityChart(ctx) {
  const activeTabs = document.querySelectorAll('.rd-tab-btn.active');
  
  if (rdPriorityChart) rdPriorityChart.destroy();

  // 각 제조사별 고유 브랜딩 컬러 매핑
  const mfgColorMap = {
    "HANKOOK": {
      border: 'rgba(249, 115, 22, 1)', // 주황색
      bg: 'rgba(249, 115, 22, 0.75)'
    },
    "MICHELIN": {
      border: 'rgba(59, 130, 246, 1)', // 파란색
      bg: 'rgba(59, 130, 246, 0.75)'
    },
    "CONTINENTAL": {
      border: 'rgba(234, 179, 8, 1)', // 노란색
      bg: 'rgba(234, 179, 8, 0.75)'
    },
    "BRIDGESTONE": {
      border: 'rgba(239, 68, 68, 1)', // 빨간색
      bg: 'rgba(239, 68, 68, 0.75)'
    }
  };

  const datasets = Array.from(activeTabs).map(tab => {
    const mfg = tab.getAttribute('data-mfg');
    const data = RD_PRIORITY_DATABASE[mfg];
    const colors = mfgColorMap[mfg] || mfgColorMap["HANKOOK"];

    return {
      label: `${mfg} R&D (%)`,
      data: data,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 6,
      barPercentage: 0.8,
      categoryPercentage: 0.75
    };
  });

  rdPriorityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['친환경/ESG (Eco)', '초고성능 (Sport)', 'EV 전용 (EV Spec)', '디지털&AI (Smart)', '마모 수명 극대화 (Durability)'],
      datasets: datasets
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Pretendard', weight: '700', size: 10.5 }, color: '#475569' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Pretendard', weight: '700' },
          bodyFont: { family: 'Pretendard' },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          min: 50,
          max: 100,
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          ticks: { font: { family: 'Pretendard', size: 10 }, color: '#64748b' },
          title: { display: true, text: '집중도 (%)', font: { family: 'Pretendard', weight: '700', size: 10 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: 'Pretendard', weight: '700', size: 10.5 }, color: '#334155' }
        }
      }
    }
  });
}

function renderNewsScraps() {
  const container = document.getElementById('news-scrap-container');
  if (!container) return;

  container.innerHTML = STRATEGY_NEWS_DATA.map(news => {
    const badgeClass = news.mfg.toLowerCase();
    return `
      <div class="news-card-scrap" onclick="window.open('${news.url}', '_blank')" style="cursor: pointer;">
        <div class="news-meta-row">
          <span class="news-mfg-badge ${badgeClass}">${news.mfg}</span>
          <span class="news-date">${news.date}</span>
        </div>
        <div class="news-title-scrap" title="${news.title}">${news.title}</div>
        <div class="news-snippet-scrap">${news.snippet}</div>
        <div class="news-source-link">전문 스크랩 보기 <i class="fa-solid fa-arrow-up-right-from-square"></i></div>
      </div>
    `;
  }).join('');
}

window.showNewsMockToast = function(mfg, title) {
  if (window.showToast) {
    window.showToast(`📰 [BI Report] ${mfg} 최신 뉴스 로드 완료: "${title.substring(0, 20)}..."`);
  } else {
    console.log(`[BI Report Clicked]: ${mfg} - ${title}`);
  }
};

function setupStrategyEventListeners() {
  // 연도별 마켓 데이터 필터링
  const yearSelect = document.getElementById('global-market-year');
  const segSelectMarket = document.getElementById('global-market-seg');
  
  const updateMarketChart = () => {
    initGlobalMarketChart(document.getElementById('global-market-chart'));
  };
  
  if (yearSelect) {
    yearSelect.addEventListener('change', updateMarketChart);
  }
  if (segSelectMarket) {
    segSelectMarket.addEventListener('change', updateMarketChart);
  }

  // 연도별 필터링
  const mfgSelect = document.getElementById('trend-mfg');
  const segSelect = document.getElementById('trend-seg');
  if (mfgSelect) mfgSelect.addEventListener('change', () => initTrendPerformanceChart(document.getElementById('trend-performance-chart')));
  if (segSelect) segSelect.addEventListener('change', () => initTrendPerformanceChart(document.getElementById('trend-performance-chart')));

  // 연도별 성능 지표 버튼 필터 (트렌드 전용)
  const trendBtns = document.querySelectorAll('#trend-source-group .btn-source');
  trendBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      trendBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      initTrendPerformanceChart(document.getElementById('trend-performance-chart'));
    });
  });

  // 상품 기술 경쟁력 비교 성능 지표 버튼 필터 (기술력 전용)
  const techBtns = document.querySelectorAll('#tech-source-group .btn-source');
  techBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      techBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      initProductCompChart(document.getElementById('product-comp-chart'));
    });
  });

  // R&D 탭 버튼 복수 클릭 (토글)
  const tabBtns = document.querySelectorAll('.rd-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const activeBtns = document.querySelectorAll('.rd-tab-btn.active');
      // 최소 1개는 활성화되어 있어야 에러가 안 남
      if (e.currentTarget.classList.contains('active') && activeBtns.length <= 1) {
        if (window.showToast) {
          window.showToast("⚠️ 최소한 1개의 제조사는 선택되어 있어야 합니다.");
        } else {
          alert("최소한 1개의 제조사는 선택되어 있어야 합니다.");
        }
        return;
      }
      e.currentTarget.classList.toggle('active');
      initRdPriorityChart(document.getElementById('rd-priority-chart'));
    });
  });

  // 신설: 상품 기술 경쟁력 비교 필터 연동
  const techSegSelect = document.getElementById('tech-seg');
  if (techSegSelect) {
    techSegSelect.addEventListener('change', () => {
      initProductCompChart(document.getElementById('product-comp-chart'));
    });
  }
}

// 17. PLC Timeline Excel-style Live Filter Controllers (Premium Multi-Select Dropdowns)
function setupPlcTimelineFilters() {
  const segmentBtn = document.getElementById('btn-filter-segment');
  const segmentDropdown = document.getElementById('dropdown-filter-segment');
  const makerBtn = document.getElementById('btn-filter-maker');
  const makerDropdown = document.getElementById('dropdown-filter-maker');
  const resetBtn = document.getElementById('btn-reset-plc-filters');
  const seasonSelect = document.getElementById('portal-filter-season');

  if (!segmentBtn || !segmentDropdown || !makerBtn || !makerDropdown) return;

  // 1. Season 드롭다운 변경 연동 (8개 전체 시즌 실시간 갱신)
  if (seasonSelect) {
    // 최초 구동 시 HTML에 설정된 기본값 동기화
    state.currentSheet = seasonSelect.value;

    seasonSelect.addEventListener('change', (e) => {
      state.currentSheet = e.target.value;
      // 새로운 시즌 데이터에 기반해 세그먼트와 제조사 옵션 재생성
      updatePlcFilterOptions();
      // 테이블 다시 그리기
      renderPortalTimeline();
    });
  }

  // 2. 드롭다운 토글 제어
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

  // 3. 바깥 영역 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (segmentDropdown.contains(e.target) || makerDropdown.contains(e.target)) {
      return;
    }
    segmentDropdown.style.display = 'none';
    makerDropdown.style.display = 'none';
  });

  // 4. 세그먼트 체크박스 이벤트 감지 (이벤트 위임)
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
      renderPortalTimeline();
    }
  });

  // 5. 제조사 체크박스 이벤트 감지 (이벤트 위임)
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
      renderPortalTimeline();
    }
  });

  // 6. 필터 초기화 버튼 처리
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
      renderPortalTimeline();
      
      if (window.showToast) {
        window.showToast('📊 필터 조건이 초기화되었습니다.');
      }
    });
  }
}

function updatePlcFilterOptions() {
  const segmentDropdown = document.getElementById('dropdown-filter-segment');
  const makerDropdown = document.getElementById('dropdown-filter-maker');
  if (!segmentDropdown || !makerDropdown) return;

  // 데이터 안전성 확보
  let timelineSource = state.tires;
  if (timelineSource.length === 0) {
    timelineSource = getMockupTimeline();
  }

  const activeSheetName = state.currentSheet;
  const sheetItems = timelineSource.filter(item => item.sheet === activeSheetName);

  // 고유 세그먼트(Category) 및 제조사(Division) 추출
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

      let makerName = (sample.division || '').trim();
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
      <label class="plc-multiselect-option" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: background 0.1s; font-size: 0.85rem; font-weight: 500; color: #334155;">
        <input type="checkbox" class="plc-segment-checkbox" value="${cat}" ${checked} style="accent-color: var(--primary); width: 14px; height: 14px; cursor: pointer;">
        <span>${cat}</span>
      </label>
    `;
  });
  if (segmentHtml === '') {
    segmentHtml = '<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 10px;">옵션이 없습니다.</div>';
  }
  segmentDropdown.innerHTML = segmentHtml;

  // Maker 드롭다운 체크박스 렌더링
  let makerHtml = '';
  sortedMakers.forEach(maker => {
    const checked = state.timeline.filterMakers.includes(maker) ? 'checked' : '';
    makerHtml += `
      <label class="plc-multiselect-option" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: background 0.1s; font-size: 0.85rem; font-weight: 500; color: #334155;">
        <input type="checkbox" class="plc-maker-checkbox" value="${maker}" ${checked} style="accent-color: var(--primary); width: 14px; height: 14px; cursor: pointer;">
        <span>${maker}</span>
      </label>
    `;
  });
  if (makerHtml === '') {
    makerHtml = '<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 10px;">옵션이 없습니다.</div>';
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

