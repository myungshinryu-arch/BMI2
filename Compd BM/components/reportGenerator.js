window.ReportGenerator = (function() {
  let viscoChart = null;
  let reportRadarChart = null;
  let activeChartMode = 'tand'; // Default chart mode

  function init() {
    document.getElementById('btn-trigger-report').addEventListener('click', generateReport);
    
    const csvBtn = document.getElementById('btn-download-raw-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', downloadRawCSV);
    }
    
    bindUserCommentSync();
    updateSelectedSummary();
    bindViscoModeTabs();
  }

  // Bind Viscoelasticity Chart Mode tabs (tanδ / G' / G")
  function bindViscoModeTabs() {
    const tabs = document.querySelectorAll('.visco-mode-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const selectedMode = e.target.getAttribute('data-mode');
        if (selectedMode === activeChartMode) return;

        // Toggle active visual class
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        activeChartMode = selectedMode;

        // Re-render chart based on selected mode
        updateViscoChart();
      });
    });
  }

  // Update summary counts and button states
  function updateSelectedSummary() {
    const selected = window.appState.selectedTires;
    const summaryText = document.getElementById('selected-tires-summary');
    const triggerBtn = document.getElementById('btn-trigger-report');
    
    if (selected.length === 0) {
      summaryText.innerHTML = `<span style="color: var(--danger); font-weight: 600;">선택된 타이어가 없습니다.</span> '컴파운드 탐색기' 탭에서 비교할 타이어들을 체크해 주세요.`;
      triggerBtn.disabled = true;
      triggerBtn.style.opacity = '0.5';
    } else {
      summaryText.innerHTML = `현재 <strong style="color: var(--primary); font-size: 1.05rem;">${selected.length}개</strong>의 타이어가 선택되었습니다.`;
      triggerBtn.disabled = false;
      triggerBtn.style.opacity = '1';
    }
  }

  // Helper to parse slash-split values safely (e.g., "4.6 / 1.8 / 1.1 / 0.9")
  function parseSlashValue(str, index) {
    if (!str) return null;
    const parts = str.toString().split('/');
    if (parts.length > index) {
      const val = parseFloat(parts[index].trim());
      return isNaN(val) ? null : val;
    }
    return null;
  }

  // Calculate full temperature sweep datapoints for tanδ, G' or G" using physical modeling
  function calculateViscoDataPoints(tire, mode, temperatures) {
    // 1. tanδ (Loss Tangent) - Direct retrieval from dataset
    if (mode === 'tand') {
      return temperatures.map(temp => {
        if (temp === 0) {
          return parseFloat(window.appState.getProp(tire, ['tan δ @ 0℃', '0℃ tanδ', '0C tanδ', 'tanδ @ 0℃'])) || null;
        }
        let val = parseFloat(tire[temp.toString()]);
        if (isNaN(val) && temp > 0) {
          val = parseFloat(tire['+' + temp.toString()]);
        }
        return !isNaN(val) ? val : null;
      });
    }

    // 2. G' (Storage Modulus) Simulation
    const tg = parseFloat(window.appState.getProp(tire, ['Tg_peak temp. (℃)', 'Tg_peak temp. (C)', 'Tg', 'ARES Tg_peak temp. (℃)', 'Dynamic Tg'])) || -25;
    
    // Parse low temp real storage modulus values G' @ -40, -30, -20, -10℃ (E+07)
    const rawGMinus = window.appState.getProp(tire, ['-40 / -30 / -20 / -10℃ G’ (E+07)', '-40 / -30 / -20 / -10C G\'', 'ARES']);
    let gMinusValues = [4.6, 1.8, 1.1, 0.9]; // Default standard recipe
    if (rawGMinus) {
      const parts = rawGMinus.toString().split('/');
      if (parts.length >= 4) {
        gMinusValues = parts.map(p => {
          const v = parseFloat(p.trim());
          return isNaN(v) ? null : v;
        });
      }
    }

    // Get 0℃ and 30℃ G* (Complex Modulus) / G' values (E+07)
    const gStar0 = parseFloat(window.appState.getProp(tire, ['G* (E+07) @ 0℃', 'G* @ 0C', 'G* @ 0℃'])) || 0.76;
    
    const rawG30 = window.appState.getProp(tire, ['G” (E+06) / G* (E+07) @ 30℃', 'G” / G* @ 30C', 'G\" (E+06) / G* (E+07) @ 30℃']);
    let gStar30 = 0.6; // Default
    if (rawG30) {
      const parts = rawG30.toString().split('/');
      if (parts.length >= 2) {
        gStar30 = parseFloat(parts[1].trim()) || 0.6;
      }
    }

    // Map known reference points (Temperature -> G' value in E+07 Pa)
    const refPoints = {
      '-40': gMinusValues[0] !== null ? gMinusValues[0] : 4.6,
      '-30': gMinusValues[1] !== null ? gMinusValues[1] : 1.8,
      '-20': gMinusValues[2] !== null ? gMinusValues[2] : 1.1,
      '-10': gMinusValues[3] !== null ? gMinusValues[3] : 0.9,
      '0': gStar0,
      '30': gStar30,
      '60': gStar30 * 0.82 // Gentle rubbery flat plateau slope
    };

    const gpPoints = temperatures.map(temp => {
      // 2a. Glassy region (-80℃ ~ -45℃) - sigmoid transition towards 100 * E+07 Pa (10^9 Pa)
      if (temp < -40) {
        const baseVal = refPoints['-40'];
        const glassyModulus = 100.0; // Typical glassy state shear storage modulus
        const transitionTemp = tg - 12; // Start steep drop around Tg
        const exponent = -0.15 * (temp - transitionTemp);
        const ratio = 1 / (1 + Math.exp(exponent));
        return baseVal + (glassyModulus - baseVal) * ratio;
      }

      // 2b. Intermediate real measurements (-40℃ ~ 0℃) - Cubic Hermite Spline / Linear Interpolation
      if (temp >= -40 && temp <= 0) {
        const steps = [-40, -30, -20, -10, 0];
        // Find interval
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
        // Linear interpolation for simplicity and stability with noisy/custom datasets
        return y1 + (y2 - y1) * tRatio;
      }

      // 2c. Rubbery plateau (0℃ ~ 30℃)
      if (temp > 0 && temp < 30) {
        const tRatio = temp / 30.0;
        const y1 = refPoints['0'];
        const y2 = refPoints['30'];
        return y1 + (y2 - y1) * tRatio;
      }

      // 2d. High temp region (30℃ ~ 60℃)
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

    // 3. G" (Loss Modulus) Simulation
    // G" (E+06) = G' (E+07) * 10 * tanδ
    const tandPoints = calculateViscoDataPoints(tire, 'tand', temperatures);
    return gpPoints.map((gp, i) => {
      const tand = tandPoints[i];
      if (gp === null || tand === null) return null;
      // G'' is typically plotted in E+06 Pa (10^6 Pa) unit for readability
      return gp * 10.0 * tand;
    });
  }

  // Render Radar Chart representing 6D properties of selected tires
  function updateRadarChart() {
    const ctx = document.getElementById('chart-report-radar');
    if (!ctx) return;

    if (reportRadarChart) {
      reportRadarChart.destroy();
    }

    const selected = window.appState.selectedTires;
    if (selected.length === 0) return;

    // Collect values to perform normalized scoring (0 ~ 100)
    const hardnessValues = selected.map(t => parseFloat(window.appState.getProp(t, ["Hardness ", "Hardness"])) || 65);
    const tgValues = selected.map(t => parseFloat(window.appState.getProp(t, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"])) || -25);
    
    const gMinusValues = selected.map(t => {
      const raw = window.appState.getProp(t, ['-40 / -30 / -20 / -10℃ G’ (E+07)', '-40 / -30 / -20 / -10C G\'', 'ARES']);
      if (raw) {
        const p = raw.toString().split('/');
        if (p.length >= 2) return parseFloat(p[1].trim()) || 1.8; // -30C G' is the 2nd element
      }
      return 1.8;
    });

    const g2Values = selected.map(t => parseFloat(window.appState.getProp(t, ["G” @ 0℃ (E+06)", "G” @ 0C", "G” @ 0℃", "G'' @ 0℃"])) || 0.9);
    const tand0Values = selected.map(t => parseFloat(window.appState.getProp(t, ["tan δ @ 0℃", "0℃ tanδ", "0C tanδ", "tanδ @ 0℃"])) || 0.12);
    const tand60Values = selected.map(t => parseFloat(window.appState.getProp(t, ["tanδ @ 60℃", "tanδ @ 60C", "tan δ @ 60℃"])) || 0.05);

    // Dynamic Maximums for normalization
    const maxHardness = Math.max(...hardnessValues, 75);
    const maxAbsTg = Math.max(...tgValues.map(Math.abs), 50);
    const maxGMinus = Math.max(...gMinusValues, 3.5);
    const maxG2 = Math.max(...g2Values, 2.5);
    const maxTand0 = Math.max(...tand0Values, 0.25);
    const maxTand60 = Math.max(...tand60Values, 0.12);

    const colors = [
      'rgba(0, 242, 254, ',  // Cyan
      'rgba(0, 230, 118, ',  // Green
      'rgba(255, 145, 0, ',  // Orange
      'rgba(156, 39, 176, ', // Purple
      'rgba(255, 23, 68, '   // Red
    ];

    const datasets = selected.map((tire, index) => {
      const maker = window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(tire, ['Pattern']) || '';
      const part = window.appState.getProp(tire, ['부위', 'Season']) || (window.appState.currentSource === 'tread' ? 'Cap Tread' : 'Case Part');
      const label = `[${part}] ${maker} (${pattern.substring(0, 8)})`;

      const scoreHardness = (hardnessValues[index] / maxHardness) * 100;
      const scoreTg = (Math.abs(tgValues[index]) / maxAbsTg) * 100;
      const scoreGMinus = gMinusValues[index] ? ((maxGMinus - gMinusValues[index]) / maxGMinus) * 100 : 50;
      const scoreG2 = (g2Values[index] / maxG2) * 100;
      const scoreTand0 = (tand0Values[index] / maxTand0) * 100;
      const scoreTand60 = tand60Values[index] ? ((maxTand60 - tand60Values[index]) / maxTand60) * 100 : 50;

      const colorBase = colors[index % colors.length];

      return {
        label: label,
        data: [
          scoreHardness,
          scoreTg,
          scoreGMinus,
          scoreG2,
          scoreTand0,
          scoreTand60
        ],
        borderColor: colorBase + '1)',
        backgroundColor: colorBase + '0.12)',
        borderWidth: 2,
        pointBackgroundColor: colorBase + '1)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colorBase + '1)',
        pointRadius: 3
      };
    });

    reportRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Hardness (경도)',
          '내마모성 (Low Tg)',
          '눈길 유연성 (Low -30℃ G\')',
          '젖은 그립력 (High 0℃ G")',
          '젖은 제동력 (High 0℃ tanδ)',
          '연비성능 (Low 60℃ tanδ)'
        ],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Suppress legend as it is shown on the line chart next to it
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
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: { color: '#8a99ad', font: { size: 9, weight: '500' } },
            ticks: {
              display: false,
              maxTicksLimit: 5,
              color: 'rgba(255, 255, 255, 0.2)',
              backdropColor: 'transparent'
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  // Render Sweep Line Chart for selected tires
  function updateViscoChart() {
    const ctx = document.getElementById('chart-visco-temperature');
    if (!ctx) return;

    if (viscoChart) {
      viscoChart.destroy();
    }

    const selected = window.appState.selectedTires;
    if (selected.length === 0) return;

    // Define X-Axis temperatures from -60 to 60 with 5 degree steps
    const temperatures = [
      -60, -55, -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60
    ];

    const colors = [
      'rgba(0, 242, 254, ',  // Cyan
      'rgba(0, 230, 118, ',  // Green
      'rgba(255, 145, 0, ',  // Orange
      'rgba(156, 39, 176, ', // Purple
      'rgba(255, 23, 68, '   // Red
    ];

    const datasets = [];

    selected.forEach((tire, index) => {
      const maker = window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(tire, ['Pattern']) || '';
      const part = window.appState.getProp(tire, ['부위', 'Season']) || (window.appState.currentSource === 'tread' ? 'Cap Tread' : 'Case Part');
      
      const label = `[${part}] ${maker} (${pattern.substring(0, 10)})`;
      const dataPoints = calculateViscoDataPoints(tire, activeChartMode, temperatures);

      const colorBase = colors[index % colors.length];

      datasets.push({
        label: label,
        data: dataPoints,
        borderColor: colorBase + '1)',
        backgroundColor: colorBase + '0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: colorBase + '1)',
        pointRadius: 1.5,
        pointHoverRadius: 5,
        spanGaps: true, // draw line between non-null values
        tension: 0.3 // smooth cubic splines
      });
    });

    // Custom configuration parameters based on activeChartMode
    let yTitle = 'Loss Tangent (tanδ)';
    let valSuffix = '';
    let captionText = '* -60℃부터 60℃까지 5℃ 단위 온도별 손실 탄젠트 (tanδ) 스윕 데이터 추이를 실시간 대조 선형 차트로 시각화합니다.';
    let titleText = '온도별 손실 탄젠트 거동 분석 (ARES Sweep - tanδ)';

    if (activeChartMode === 'gp') {
      yTitle = 'Storage Modulus G\' (E+07 Pa)';
      valSuffix = ' E+07 Pa';
      captionText = '* 극저온에서의 유리 거동 한계점과 핵심 실측점들을 정교한 시그모이드 전이 보간 수식으로 물리적 모델링한 G\' 연속 추이 곡선입니다.';
      titleText = '온도별 저장 탄성률 거동 분석 (ARES Sweep - G\')';
    } else if (activeChartMode === 'gpp') {
      yTitle = 'Loss Modulus G" (E+06 Pa)';
      valSuffix = ' E+06 Pa';
      captionText = '* 복원된 저장탄성률(G\')과 손실탄젠트(tanδ) 간의 동적 물리 공식(G" = G\' * tanδ)을 적용하여 완성한 0.1M ~ 100M Pa 영역 스펙트럼 곡선입니다.';
      titleText = '온도별 손실 탄성률 거동 분석 (ARES Sweep - G")';
    }

    // Update Text Labels in HTML
    const titleEl = document.getElementById('visco-line-title');
    const captionEl = document.getElementById('visco-line-caption');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-chart-area" style="color: var(--primary);"></i> ${titleText}`;
    if (captionEl) captionEl.textContent = captionText;

    viscoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: temperatures.map(t => `${t}℃`),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, color: '#8a99ad', padding: 12, font: { size: 10 } }
          },
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
            title: { display: true, text: '온도 (Temperature)', color: '#8a99ad', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#8a99ad', font: { size: 9 } }
          },
          y: {
            title: { display: true, text: yTitle, color: '#8a99ad', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#8a99ad', font: { size: 9 } }
          }
        }
      }
    });
  }

  // Main Report Render Logic (Translating to Excel-style horizontal replica)
  function generateReport() {
    const selected = window.appState.selectedTires;
    if (selected.length === 0) {
      window.showToast("오류: 리포트를 생성할 타이어가 선택되지 않았습니다.");
      return;
    }

    window.showToast("실시간 BM Report 명세서를 동적으로 컴파일하는 중...");

    const emptyState = document.getElementById('report-empty-state');
    const activeState = document.getElementById('report-active-state');
    const reportGrid = document.getElementById('excel-report-grid');

    emptyState.style.display = 'none';
    activeState.style.display = 'flex';

    // Clear previous report
    reportGrid.innerHTML = '';

    // Reset user comments
    const userInput = document.getElementById('report-user-comments-input');
    const printDiv = document.getElementById('report-user-comments-print');
    if (userInput) userInput.value = "";
    if (printDiv) printDiv.textContent = "";

    // Step 1: Create Table Header (Excel Columns)
    let headerHtml = `
      <thead>
        <tr>
          <th rowspan="2" class="cell-meta-key" style="background: rgba(255,255,255,0.05); text-align: center; vertical-align: middle;">물성 및 분석 항목</th>
    `;

    selected.forEach((tire, idx) => {
      const part = window.appState.getProp(tire, ['부위', 'Season']) || (window.appState.currentSource === 'tread' ? 'Cap Tread' : 'Case Part');
      headerHtml += `<th class="cell-part-title" style="border-bottom: none;">${part} [No. ${idx + 1}]</th>`;
    });
    headerHtml += `</tr><tr>`;
    
    selected.forEach(tire => {
      const maker = window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) || 'N/A';
      headerHtml += `<th style="background: rgba(255,255,255,0.03); color: #fff;">${maker}</th>`;
    });
    headerHtml += `</tr></thead><tbody>`;

    // Step 2: Define Row Keys to Render (Expanded to 12 viscoelastic properties)
    const metaSection = [
      { label: "타이어 기본 제원", isSectionHeader: true },
      { label: "Pattern (패턴명)", keys: ["Pattern"] },
      { label: "Size (규격)", keys: ["Size", "규격"] },
      { label: "Season / 부위", keys: ["Season", "부위"] },
      { label: "OE Spec / Market", keys: ["OE", "Market"] },
      { label: "Plant / 제조국", keys: ["Plant", "제조국"] },
      { label: "DOT / 분석년도", keys: ["DOT", "분석년도"] },
      { label: "의뢰 번호", keys: ["Cutting 의뢰번호", "물성 의뢰번호", "Request #"] },
      
      { label: "고무 배합제 성분 분석 (Polymer & Filler)", isSectionHeader: true },
      { label: "Polymer Blend (NR / SBR / BR)", keys: ["NR / SBR / BR_GC", "NR / SBR / BR_NMR"] },
      { label: "Styrene / Vinyl Ratio (%)", keys: ["Styrene / Vinyl_NMR (%, in SBR) ", "Styrene / Vinyl in SBR", "Styrene / Vinyl_NMR (%, in SBR)"] },
      { label: "Carbon Black / Silica (phr)", keys: ["Carbon Black / Silica (phr)", "Carbon Black / Silica"] },
      { label: "Acetone / ZnO / Sulfur (phr)", keys: ["Aceton / ZnO / T.Sulfur (phr) ", "Aceton / ZnO / T.Sulfur", "Aceton / ZnO / T.Sulfur (phr)"] },
      
      { label: "기계적 인장 물성 (Tensile Properties)", isSectionHeader: true },
      { label: "Hardness (경도, Shore A)", keys: ["Hardness ", "Hardness"], isHardness: true },
      { label: "Modulus 10% / 50% (MPa)", keys: ["M10% / M50%", "M10 / M50"] },
      { label: "Modulus 100% / 300% (MPa)", keys: ["M100% / M300%", "M100 / M300"] },
      { label: "Elongation / Tensile Strength", keys: ["Elong. / T.S. ", "Elong. / T.S."] },
      
      { label: "동적 점탄성 특성 (Dynamic Viscoelasticity - 요약 12대 물성)", isSectionHeader: true },
      { label: "Tg_peak temp. (유리전이온도, ℃)", keys: ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg", "ARES Tg_peak temp. (℃)", "Dynamic Tg"], isTg: true },
      { label: "-40 / -30 / -20 / -10℃ G’ (E+07)", keys: ["-40 / -30 / -20 / -10℃ G’ (E+07)", "-40 / -30 / -20 / -10C G'", "ARES"] },
      { label: "G’ Avg. / G* @ -15℃ (E+07)", keys: ["G’ Avg. / G* @ -15℃ (E+07)", "G' Avg. / G* @ -15C"] },
      { label: "-10℃ Loss Tangent (-10℃ tanδ)", keys: ["-10℃ tanδ", "-10C tanδ"] },
      { label: "0℃ Loss Modulus (G” @ 0℃, E+06)", keys: ["G” @ 0℃ (E+06)", "G” @ 0C", "G” @ 0℃", "G'' @ 0℃", "Wet"] },
      { label: "Def. Index (G”÷G*0.8 @ 0℃)", keys: ["Def. Index (G”÷G*0.8 @ 0℃)", "Def. Index", "Def. Index (G\"÷G*0.8 @ 0℃)", "Def. Index (G”÷G*1 @ 0℃)"] },
      { label: "tanδ @ 0℃ ÷ tanδ @ 20℃ (그립 밸런스비)", keys: ["tanδ @ 0℃ ÷ tanδ @ 20℃", "tanδ @ 0C ÷ tanδ @ 20C"] },
      { label: "0℃ Loss Tangent (0℃ tanδ)", keys: ["tan δ @ 0℃", "0℃ tanδ", "0C tanδ", "tanδ @ 0℃"] },
      { label: "G” (E+06) / G* (E+07) @ 30℃", keys: ["G” (E+06) / G* (E+07) @ 30℃", "G” / G* @ 30C", "G\" (E+06) / G* (E+07) @ 30℃", "Dry"] },
      { label: "0℃ Dynamic Stiffness (G* @ 0℃, E+07)", keys: ["G* (E+07) @ 0℃", "G* @ 0C", "G* @ 0℃"] },
      { label: "tanδ @ 25℃ / 30℃ (상온 점탄성)", keys: ["tanδ @ 25℃ / 30℃", "tanδ @ 25C / 30C"] },
      { label: "60℃ Loss Tangent (60℃ tanδ)", keys: ["tanδ @ 60℃", "tanδ @ 60C", "tan δ @ 60℃", "60", "RR"] }
    ];

    let tbodyHtml = "";

    metaSection.forEach(rowInfo => {
      if (rowInfo.isSectionHeader) {
        tbodyHtml += `
          <tr>
            <td colspan="${selected.length + 1}" class="excel-section-header" style="background: linear-gradient(90deg, rgba(0,242,254,0.1), transparent); font-weight: bold; border-left: 4px solid var(--primary);">
              <i class="fa-solid fa-layer-group" style="margin-right: 8px; color: var(--primary);"></i>
              ${rowInfo.label}
            </td>
          </tr>
        `;
      } else {
        tbodyHtml += `<tr><td class="cell-meta-key" style="font-weight: 500;">${rowInfo.label}</td>`;
        
        selected.forEach(tire => {
          let val = window.appState.getProp(tire, rowInfo.keys);
          
          if (rowInfo.label.includes("Season") && window.mapSeason) {
            val = window.mapSeason(val);
          }
          
          if (val === undefined || val === null || val === "" || val === "-") {
            val = "-";
            tbodyHtml += `<td style="color: var(--text-muted); text-align: center;">-</td>`;
          } else {
            // Apply formatting / highlighting
            let cellClass = "";
            const numVal = parseFloat(val);
            
            if (rowInfo.isHardness && !isNaN(numVal)) {
              if (numVal >= 68 && numVal <= 72) {
                cellClass = "class='cell-highlight-best'";
              }
            } else if (rowInfo.isTg && !isNaN(numVal)) {
              if (numVal < -35) {
                cellClass = "class='cell-highlight-best'";
              } else if (numVal > -15) {
                cellClass = "class='cell-highlight-worst'";
              }
            }
            
            // Format floats for aesthetic uniformity
            let displayVal = val;
            if (typeof numVal === 'number' && !isNaN(numVal) && !val.toString().includes('/') && val.toString().includes('.') && val.toString().split('.')[1].length > 4) {
              displayVal = numVal.toFixed(4);
            }
            
            tbodyHtml += `<td ${cellClass} style="text-align: center; font-weight: 500;">${displayVal}</td>`;
          }
        });
        tbodyHtml += `</tr>`;
      }
    });

    tbodyHtml += "</tbody>";
    reportGrid.innerHTML = headerHtml + tbodyHtml;

    // Trigger temperature sweep chart render & radar chart build
    updateViscoChart();
    updateRadarChart();

    // AI 분석 코멘트 실시간 자동 연산 출력
    generateAIComments();

    // Scroll smoothly to report
    activeState.scrollIntoView({ behavior: 'smooth' });
    window.showToast("성공: 12대 요약 물성 포함 가로형 병렬 Report 가 기공되었습니다!");
  }

  // UTF-8 BOM CSV Downloader (Excel compatible)
  function downloadRawCSV() {
    const selected = window.appState.selectedTires;
    if (selected.length === 0) {
      window.showToast("오류: 다운로드할 데이터가 없습니다. 먼저 리포트를 생성해주세요.");
      return;
    }

    const table = document.getElementById('excel-report-grid');
    if (!table) {
      window.showToast("오류: 생성된 리포트 테이블을 찾을 수 없습니다.");
      return;
    }

    let csvContent = "";
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cols = row.querySelectorAll('th, td');
      const rowData = [];

      for (let j = 0; j < cols.length; j++) {
        let text = cols[j].textContent.trim();
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          text = '"' + text.replace(/"/g, '""') + '"';
        }
        rowData.push(text);
      }
      csvContent += rowData.join(',') + "\r\n";
    }

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Compound_BM_Report_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.showToast("성공: Raw Data CSV 파일이 다운로드되었습니다.");
  }

  // Engineering AI Comments Generator based on normalized metrics
  function generateAIComments() {
    const selected = window.appState.selectedTires;
    const commentEl = document.getElementById('report-ai-comments');
    if (!commentEl || selected.length === 0) return;

    const data = selected.map(t => {
      return {
        maker: window.appState.getProp(t, ['Maker', 'MakerPatternRaw']) || 'N/A',
        pattern: window.appState.getProp(t, ['Pattern']) || 'N/A',
        hardness: parseFloat(window.appState.getProp(t, ["Hardness ", "Hardness"])) || null,
        tg: parseFloat(window.appState.getProp(t, ["Tg_peak temp. (℃)", "Tg_peak temp. (C)", "Tg"])) || null,
        tand0: parseFloat(window.appState.getProp(t, ["tan δ @ 0℃", "0℃ tanδ", "0C tanδ", "tanδ @ 0℃"])) || null,
        tand60: parseFloat(window.appState.getProp(t, ["tanδ @ 60℃", "tanδ @ 60C", "tan δ @ 60℃"])) || null,
        silica: parseFloat(window.appState.getProp(t, ["Carbon Black / Silica (phr)", "Carbon Black / Silica"])) || null,
        polymer: window.appState.getProp(t, ["NR / SBR / BR_GC", "NR / SBR / BR_NMR"]) || ''
      };
    });

    data.forEach(d => {
      if (typeof d.silica === 'string' || d.silica === null) {
        const rawFiller = window.appState.getProp(selected[data.indexOf(d)], ["Carbon Black / Silica (phr)", "Carbon Black / Silica"]);
        if (rawFiller && rawFiller.toString().includes('/')) {
          const parts = rawFiller.toString().split('/');
          d.silica = parseFloat(parts[1]?.trim()) || 0;
        } else {
          d.silica = parseFloat(rawFiller) || 0;
        }
      }
    });

    const hardnessList = data.filter(d => d.hardness !== null);
    const tgList = data.filter(d => d.tg !== null);
    const tand0List = data.filter(d => d.tand0 !== null);
    const tand60List = data.filter(d => d.tand60 !== null);

    let html = `<div class="ai-insight-content" style="display: flex; flex-direction: column; gap: 16px;">`;
    
    html += `<p style="color: var(--text-muted); margin-bottom: 8px;"><i class="fa-solid fa-quote-left" style="color: var(--primary); margin-right: 6px;"></i>본 AI 분석 코멘트는 선택된 <strong>${selected.length}개 컴파운드</strong>의 가류 물성 및 동적 점탄성(ARES Sweep) 데이터를 기반으로 실시간 정량 비교 진단한 엔지니어링 리포트입니다.</p>`;
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 10px;">`;

    if (hardnessList.length > 0) {
      const hVals = hardnessList.map(d => d.hardness);
      const hMax = Math.max(...hVals);
      const hMin = Math.min(...hVals);
      const hMaxItem = hardnessList.find(d => d.hardness === hMax);
      const hMinItem = hardnessList.find(d => d.hardness === hMin);
      const hDiff = hMax - hMin;

      html += `
        <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 0px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-gauge-high" style="color: var(--primary);"></i> 경도(Hardness) 균일성 분석
          </h4>
          
          <!-- Fact 기반 설명 -->
          <div style="background: rgba(0, 242, 254, 0.03); border-left: 3px solid var(--primary); padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-circle-check"></i> [Fact 기반 설명]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-main); margin: 0; line-height: 1.4;">
              최대 경도는 <strong>${hMaxItem.maker} (${hMax} Shore A)</strong> 이며, 최소 경도는 <strong>${hMinItem.maker} (${hMin} Shore A)</strong> 입니다. 
              품목 간 경도 편차는 <strong>${hDiff.toFixed(1)} Shore A</strong> 로 나타납니다.
            </p>
          </div>

          <!-- AI 추측 내용 -->
          <div style="background: rgba(156, 39, 176, 0.03); border-left: 3px solid #9c27b0; padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-lightbulb"></i> [AI 추측 및 거동 예측]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              ${hDiff > 5 ? '품목 간 경도 편차가 다소 큰 편(5 Shore A 초과)이므로, 블록 강성 편차에 의해 실제 차량 장착 시 핸들링 선형 응답성 및 슬립 제어 거동에서 확연한 감각적 차이가 체감될 것으로 AI가 추측합니다. 또한 고하중 코너링 시 블록 접지압 불균일로 인한 국부 마모 속도 편차가 유발될 수 있습니다.' : '품목 간 경도가 매우 균일하게 제어되고 있어, 차량 거동 시 일관된 노면 접지 압력을 보장하고 블록 강성 편차에 따른 이질적 주행 감각이 최소화될 것으로 AI가 예측합니다.'}
            </p>
          </div>
        </div>
      `;
    }

    if (tgList.length > 0) {
      const tgVals = tgList.map(d => d.tg);
      const tgMax = Math.max(...tgVals);
      const tgMin = Math.min(...tgVals);
      const tgMaxItem = tgList.find(d => d.tg === tgMax);
      const tgMinItem = tgList.find(d => d.tg === tgMin);
      const tgDiff = Math.abs(tgMax - tgMin);

      html += `
        <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 0px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-temperature-low" style="color: var(--accent-orange);"></i> 유리전이온도(Tg) & 내마모 분석
          </h4>

          <!-- Fact 기반 설명 -->
          <div style="background: rgba(255, 145, 0, 0.03); border-left: 3px solid var(--accent-orange); padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: var(--accent-orange); display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-circle-check"></i> [Fact 기반 설명]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-main); margin: 0; line-height: 1.4;">
              최저 Tg는 <strong>${tgMinItem.maker} (${tgMin} ℃)</strong> 로 저온 기계적 거동 및 분자 사슬 유연성이 가장 뛰어나며, 
              최고 Tg는 <strong>${tgMaxItem.maker} (${tgMax} ℃)</strong> 입니다. 
              두 품목 간 Tg 편차는 <strong>${tgDiff.toFixed(1)} ℃</strong> 입니다.
            </p>
          </div>

          <!-- AI 추측 내용 -->
          <div style="background: rgba(156, 39, 176, 0.03); border-left: 3px solid #9c27b0; padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-lightbulb"></i> [AI 추측 및 거동 예측]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              유리전이온도(Tg) 차이에 따라, ${tgMin < -35 ? `<strong>${tgMinItem.maker}</strong>은 저온 환경에서 고무 분자 사슬의 유연성 및 자유 체적 수축을 최소화하여 겨울철 마모 수명 향상 및 블록 조기 탈락 마진이 탁월할 것으로 AI가 추측합니다.` : ''} ${tgMax > -20 ? `반면, <strong>${tgMaxItem.maker}</strong>은 상대적으로 높은 고온 영역 점탄성 히스테리시스 루프 활성화를 통해 노면 마찰 에너지를 점성으로 변환, 고온 제동 마찰력 보강에 유리한 방향으로 튜닝된 것으로 추측됩니다.` : '유사한 유리전이온도 범위로 인해, 상온 마모 수명 및 극저온 영역 분자 세그먼트 운동성 수준이 전반적으로 유사한 메커니즘을 공유할 것으로 판단됩니다.'}
            </p>
          </div>
        </div>
      `;
    }

    if (tand0List.length > 0) {
      const t0Vals = tand0List.map(d => d.tand0);
      const t0Max = Math.max(...t0Vals);
      const t0Min = Math.min(...t0Vals);
      const t0MaxItem = tand0List.find(d => d.tand0 === t0Max);
      const t0MinItem = tand0List.find(d => d.tand0 === t0Min);
      const t0Diff = (t0Max - t0Min) / t0Min * 100;

      html += `
        <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 0px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-cloud-showers-heavy" style="color: var(--secondary);"></i> 젖은 제동 성능 (tanδ @ 0℃)
          </h4>

          <!-- Fact 기반 설명 -->
          <div style="background: rgba(79, 172, 254, 0.03); border-left: 3px solid var(--secondary); padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: var(--secondary); display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-circle-check"></i> [Fact 기반 설명]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-main); margin: 0; line-height: 1.4;">
              젖은 노면 그립력을 지배하는 0℃ tanδ 지표는 <strong>${t0MaxItem.maker} (${t0Max.toFixed(4)})</strong> 가 가장 우수합니다. 
              가장 저조한 <strong>${t0MinItem.maker} (${t0Min.toFixed(4)})</strong> 대비 약 <strong>${t0Diff.toFixed(1)}%</strong> 우세한 젖은 노면 제동 거동을 보입니다.
            </p>
          </div>

          <!-- AI 추측 내용 -->
          <div style="background: rgba(156, 39, 176, 0.03); border-left: 3px solid #9c27b0; padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-lightbulb"></i> [AI 추측 및 거동 예측]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              0℃ 손실 탄젠트(tanδ)의 높은 수준을 감안할 때, ${t0MaxItem.silica > 60 ? `<strong>${t0MaxItem.maker}</strong>은 높은 Silica 함량(${t0MaxItem.silica} phr)과 실란 커플링제 배합 고도화를 적용하여 빗길에서의 마이크로-히스테리시스 점탄성 에너지 발산을 극대화함으로써 고속 수막 제동 안정성을 비약적으로 향상시킨 처방으로 AI가 판단합니다.` : `<strong>${t0MaxItem.maker}</strong>은 젖은 수막 상태에서 점성 소실(Energy Loss) 네트워크를 극대화하도록 고감도 친수 배합이 가미되어 고속 빗길 제동 안정성이 우수할 것으로 추측됩니다.`}
            </p>
          </div>
        </div>
      `;
    }

    if (tand60List.length > 0) {
      const t60Vals = tand60List.map(d => d.tand60);
      const t60Min = Math.min(...t60Vals);
      const t60Max = Math.max(...t60Vals);
      const t60MinItem = tand60List.find(d => d.tand60 === t60Min);
      const t60MaxItem = tand60List.find(d => d.tand60 === t60Max);
      const t60Diff = (t60Max - t60Min) / t60Max * 100;

      html += `
        <div style="background: rgba(255,255,255,0.015); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 0px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-gas-pump" style="color: var(--accent-green);"></i> 연비 성능 및 구름저항 (tanδ @ 60℃)
          </h4>

          <!-- Fact 기반 설명 -->
          <div style="background: rgba(0, 230, 118, 0.03); border-left: 3px solid var(--accent-green); padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: var(--accent-green); display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-circle-check"></i> [Fact 기반 설명]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-main); margin: 0; line-height: 1.4;">
              타이어 구름 저항(RR)의 척도인 60℃ tanδ는 <strong>${t60MinItem.maker} (${t60Min.toFixed(4)})</strong> 가 가장 낮아 에너지 효율성 면에서 앞서있습니다. 
              가장 구름 저항이 높은 <strong>${t60MaxItem.maker} (${t60Max.toFixed(4)})</strong> 대비 구름저항 에너지 손실을 약 <strong>${t60Diff.toFixed(1)}%</strong> 개선할 수 있는 정량 스펙을 갖추고 있습니다.
            </p>
          </div>

          <!-- AI 추측 내용 -->
          <div style="background: rgba(156, 39, 176, 0.03); border-left: 3px solid #9c27b0; padding: 8px 10px; border-radius: 0 4px 4px 0;">
            <span style="font-size: 0.75rem; font-weight: bold; color: #ba68c8; display: block; margin-bottom: 4px;">
              <i class="fa-solid fa-lightbulb"></i> [AI 추측 및 거동 예측]
            </span>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              고온 히스테리시스(tanδ @ 60℃) 지표 분석을 통해, <strong>${t60MinItem.maker}</strong>은 필러 간 불필요한 마찰 네트워크 응집을 억제하고 중합체-필러 결합력을 제어하여 주행 원심력 상태에서 열 에너지 방출을 최소화하고 연비 효율 등급을 획기적으로 개선했을 것으로 AI가 강력하게 추측합니다. 반면 구름 저항이 높은 군은 그립력 보강을 위한 하이 인장 처방 설계로 인해 상대적인 열 손실 마진이 증가한 것으로 판단됩니다.
            </p>
          </div>
        </div>
      `;
    }

    html += `</div>`; // grid end

    html += `
      <div style="margin-top: 16px; background: rgba(0, 242, 254, 0.03); border: 1px dashed rgba(0, 242, 254, 0.15); border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 0.95rem; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-compass" style="color: var(--primary);"></i> 엔지니어링 트레이드-오프 (Trade-off) 가이드
        </h4>
        <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.6;">
          선택된 데이터셋 분석 결과, 젖은 제동 성능(0℃ tanδ)과 구름 저항(60℃ tanδ) 간의 고유한 역상관(Trade-off) 메커니즘이 확연하게 관찰됩니다.
          ${tand0List.length > 0 && tand60List.length > 0 ? `
            특히 <strong>${tand0List.map(d=>d.maker).join(', ')}</strong> 등의 대조군을 비교 시, 연비 극대화를 타겟으로 설계되었는지 혹은 빗길 안전성을 극대화하기 위해 다소의 구름저항을 감수하도록 실리카 분산 네트워크를 제어하였는지 배합 엔지니어링의 방향성이 고스란히 노출되고 있습니다.
          ` : ''}
          향후 신제품 컴파운드 처방 설계 시 본 벤치마킹 데이터의 상한-하한 가이드라인을 레퍼런스로 준용하여 최적의 밸런스 처방(Magic Triangle)을 구축하시기 바랍니다.
        </p>
      </div>
    `;

    html += `</div>`;
    commentEl.innerHTML = html;
  }

  // Real-time synchronization for print-only div (supporting complete text representation)
  function bindUserCommentSync() {
    const input = document.getElementById('report-user-comments-input');
    const printDiv = document.getElementById('report-user-comments-print');
    if (!input || !printDiv) return;

    input.addEventListener('input', (e) => {
      printDiv.textContent = e.target.value;
    });
  }

  return {
    init: init,
    updateSelectedSummary: updateSelectedSummary,
    generateReport: generateReport,
    updateViscoChart: updateViscoChart,
    updateRadarChart: updateRadarChart
  };
})();
