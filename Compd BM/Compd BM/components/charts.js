window.TireCharts = (function() {
  let polymerChart = null;
  let styreneVinylChart = null;
  let fillersChart = null;
  let znoSulfurChart = null;
  let scatterChart = null;
  let radarChart = null;

  // Global styling helper for Chart.js
  Chart.defaults.color = '#8a99ad';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  function init() {
    // Dropdown change listeners for scatter plot configuration
    document.getElementById('scatter-x').addEventListener('change', updateScatterChart);
    document.getElementById('scatter-y').addEventListener('change', updateScatterChart);

    // Initial draw
    updateAllCharts();
  }

  function updateAllCharts() {
    updatePolymerChart();
    updateStyreneVinylChart();
    updateFillersChart();
    updateZnoSulfurChart();
    updateScatterChart();
    updateRadarChart();
  }

  // --- 1. POLYMER BLEND CHART (Stacked Horizontal Bar) ---
  function updatePolymerChart() {
    const ctx = document.getElementById('chart-polymer');
    if (!ctx) return;

    if (polymerChart) {
      polymerChart.destroy();
    }

    const data = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? window.appState.selectedTires
      : window.appState.filteredData;
    const samples = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? data
      : data.slice(0, 10);

    const labels = [];
    const nrData = [];
    const sbrData = [];
    const brData = [];

    samples.forEach((item, idx) => {
      const maker = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(item, ['Pattern']) || '';
      labels.push(`${maker.substring(0, 10)} (${pattern.substring(0, 8)})`);

      // Parse polymer string: e.g., "15 / 53 / 32" or "100 / - / -"
      const polyStr = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR']) || '';
      const parsed = parseTripleRatio(polyStr);
      nrData.push(parsed[0]);
      sbrData.push(parsed[1]);
      brData.push(parsed[2]);
    });

    polymerChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'NR (천연고무)',
            data: nrData,
            backgroundColor: '#4facfe',
            borderWidth: 0
          },
          {
            label: 'SBR (합성고무)',
            data: sbrData,
            backgroundColor: '#00f2fe',
            borderWidth: 0
          },
          {
            label: 'BR (부타디엔고무)',
            data: brData,
            backgroundColor: '#9c27b0',
            borderWidth: 0
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            max: 100,
            title: { display: true, text: '성분 비율 (%)' }
          },
          y: { stacked: true }
        }
      }
    });
  }

  // --- 2. REINFORCEMENT FILLERS CHART (Side-by-Side Bar) ---
  function updateFillersChart() {
    const ctx = document.getElementById('chart-fillers');
    if (!ctx) return;

    if (fillersChart) {
      fillersChart.destroy();
    }

    const data = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? window.appState.selectedTires
      : window.appState.filteredData;
    const samples = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? data
      : data.slice(0, 10);

    const labels = [];
    const cbData = [];
    const silicaData = [];

    samples.forEach(item => {
      const maker = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(item, ['Pattern']) || '';
      labels.push(`${maker.substring(0, 10)} (${pattern.substring(0, 8)})`);

      // Parse fillers safely across Tread/TBR datasets
      const parsed = getCarbonBlackAndSilica(item);
      cbData.push(parsed[0]);
      silicaData.push(parsed[1]);
    });

    fillersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Carbon Black 함량',
            data: cbData,
            backgroundColor: '#ff9100',
            borderRadius: 4
          },
          {
            label: 'Silica 함량',
            data: silicaData,
            backgroundColor: '#00e676',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw} phr`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            title: { display: true, text: '배합 단위 (phr)' }
          }
        }
      }
    });
  }

  // --- 3. DYNAMIC SCATTER CORRELATION CHART ---
  function updateScatterChart() {
    const ctx = document.getElementById('chart-scatter');
    if (!ctx) return;

    if (scatterChart) {
      scatterChart.destroy();
    }

    const xField = document.getElementById('scatter-x').value;
    const yField = document.getElementById('scatter-y').value;

    const data = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? window.appState.selectedTires
      : window.appState.filteredData;
    const chartData = [];

    // Label dictionaries for axes and tooltip descriptions
    const xLabels = {
      'Silica': 'Silica 함량 (phr)',
      'Carbon Black': 'Carbon Black 함량 (phr)',
      'Polymer_NR': 'NR (천연고무) 비율 (%)',
      'Polymer_SBR': 'SBR (합성고무) 비율 (%)',
      'Polymer_BR': 'BR (부타디엔) 비율 (%)',
      'Styrene': 'SBR 내 Styrene 비율 (%)',
      'Vinyl': 'SBR 내 Vinyl 비율 (%)',
      'ZnO': 'ZnO 함량 (phr)',
      'Sulfur': 'Sulfur 함량 (phr)'
    };

    const yLabels = {
      'Tg': 'Tg_peak temp (유리전이온도, ℃)',
      'Hardness': 'Hardness (경도, Shore A)',
      'Elasticity': 'G\'\' @ 0℃ (전단 손실 탄성률)',
      'tanD_0': 'tanδ @ 0℃ (젖은 제동 지표)',
      'tanD_60': 'tanδ @ 60℃ (회전저항 지표)',
      'M100': 'Modulus 100% (MPa)',
      'M300': 'Modulus 300% (MPa)',
      'TS': 'Tensile Strength (인장강도, MPa)',
      'Elongation': 'Elongation (신율, %)'
    };

    data.forEach(item => {
      let xVal = null;
      let yVal = null;

      // Extract X Axis value
      if (xField === 'Silica') {
        xVal = getCarbonBlackAndSilica(item)[1]; // silica is second
      } else if (xField === 'Carbon Black') {
        xVal = getCarbonBlackAndSilica(item)[0]; // CB is first
      } else if (xField === 'Polymer_NR') {
        const polyStr = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR', 'Material Analysis']) || '';
        xVal = parseTripleRatio(polyStr)[0];
      } else if (xField === 'Polymer_SBR') {
        const polyStr = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR', 'Material Analysis']) || '';
        xVal = parseTripleRatio(polyStr)[1];
      } else if (xField === 'Polymer_BR') {
        const polyStr = window.appState.getProp(item, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR', 'Material Analysis']) || '';
        xVal = parseTripleRatio(polyStr)[2];
      } else if (xField === 'Styrene') {
        const ratioStr = window.appState.getProp(item, ['Styrene / Vinyl_NMR (%, in SBR)', 'Styrene / Vinyl_NMR (%, in SBR) ', 'Styrene / Vinyl_NMR', 'Styrene / Vinyl']) || '';
        xVal = parseStyreneVinyl(ratioStr)[0];
      } else if (xField === 'Vinyl') {
        const ratioStr = window.appState.getProp(item, ['Styrene / Vinyl_NMR (%, in SBR)', 'Styrene / Vinyl_NMR (%, in SBR) ', 'Styrene / Vinyl_NMR', 'Styrene / Vinyl']) || '';
        xVal = parseStyreneVinyl(ratioStr)[1];
      } else if (xField === 'ZnO') {
        const znoSulStr = window.appState.getProp(item, ['Aceton / ZnO / T.Sulfur (phr)', 'Aceton / ZnO / T.Sulfur (phr) ', 'Aceton / ZnO / T.Sulfur', 'Aceton / ZnO / T.Sulfur ', 'Aceton / ZnO / T.Sulfur']) || '';
        xVal = parseZnoSulfur(znoSulStr)[0];
      } else if (xField === 'Sulfur') {
        const znoSulStr = window.appState.getProp(item, ['Aceton / ZnO / T.Sulfur (phr)', 'Aceton / ZnO / T.Sulfur (phr) ', 'Aceton / ZnO / T.Sulfur', 'Aceton / ZnO / T.Sulfur ', 'Aceton / ZnO / T.Sulfur']) || '';
        xVal = parseZnoSulfur(znoSulStr)[1];
      }

      // Extract Y Axis value
      if (yField === 'Tg') {
        yVal = parseFloat(window.appState.getProp(item, ['Tg_peak temp. (℃)', 'Tg_peak temp. (C)', 'Tg', 'ARES Tg_peak temp. (℃)', 'Dynamic Tg']));
      } else if (yField === 'Hardness') {
        yVal = parseFloat(window.appState.getProp(item, ['Hardness', 'Hardness ', 'Hs', 'S-S (Initial)', 'S-S\n(initial)']));
      } else if (yField === 'Elasticity') {
        const elast = window.appState.getProp(item, ['G” @ 0℃ (E+06)', 'G” @ 0C', 'G” @ 0℃', "G'' @ 0℃", '0℃ tanδ']);
        yVal = parseFloat(elast);
      } else if (yField === 'tanD_0') {
        yVal = parseFloat(window.appState.getProp(item, ['tan δ @ 0℃', 'tanδ @ 0℃', '0℃ tanδ', 'tan δ @ 0C', 'tanδ @ 0C']));
      } else if (yField === 'tanD_60') {
        yVal = parseFloat(window.appState.getProp(item, ['tanδ @ 60℃', 'tanδ @ 60C', 'tan δ @ 60℃', '60', 'DMTS @ 60℃', 'tanδ @ 60℃ (@ 0.5%)']));
      } else if (yField === 'M100') {
        yVal = parseSlashValue(window.appState.getProp(item, ['M100% / M300%']), 0);
      } else if (yField === 'M300') {
        yVal = parseSlashValue(window.appState.getProp(item, ['M100% / M300%']), 1);
      } else if (yField === 'TS') {
        const tsRaw = window.appState.getProp(item, ['Tensile Strength', 'Tensile Strength ']);
        if (tsRaw !== null) {
          yVal = parseFloat(tsRaw);
        } else {
          yVal = parseSlashValue(window.appState.getProp(item, ['Elong. / T.S.']), 1);
        }
      } else if (yField === 'Elongation') {
        const elongRaw = window.appState.getProp(item, ['Elongation', 'Elongation ']);
        if (elongRaw !== null) {
          yVal = parseFloat(elongRaw);
        } else {
          yVal = parseSlashValue(window.appState.getProp(item, ['Elong. / T.S.']), 0);
        }
      }

      if (xVal !== null && yVal !== null && !isNaN(xVal) && !isNaN(yVal)) {
        chartData.push({
          x: xVal,
          y: yVal,
          maker: window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A',
          pattern: window.appState.getProp(item, ['Pattern']) || 'N/A',
          size: window.appState.getProp(item, ['Size', '규격']) || 'N/A'
        });
      }
    });

    // Calculate Pearson Correlation Coefficient dynamically
    const rVal = calculateCorrelation(chartData);
    updateCorrelationBadge(rVal);

    scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: '타이어 컴파운드 분산 포트폴리오',
          data: chartData,
          backgroundColor: 'rgba(0, 242, 254, 0.6)',
          borderColor: '#00f2fe',
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const p = context.raw;
                const xName = xLabels[xField] || xField;
                const yName = yLabels[yField] || yField;
                return [
                  `타이어: ${p.maker} ${p.pattern}`,
                  `규격: ${p.size}`,
                  `${xName}: ${p.x}`,
                  `${yName}: ${p.y}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: xLabels[xField] || `${xField} 수치` },
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          },
          y: {
            title: { display: true, text: yLabels[yField] || `${yField} 수치` },
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          }
        }
      }
    });
  }

  // --- 4. 대표 타이어 다차원 물성 비교 (Radar Chart) ---
  function updateRadarChart() {
    const ctx = document.getElementById('chart-radar');
    if (!ctx) return;

    if (radarChart) {
      radarChart.destroy();
    }

    const selected = window.appState.selectedTires;
    if (selected.length === 0) {
      // If none selected, draw placeholders using first 2 from filtered list to make UI look amazing
      const fallback = window.appState.filteredData.slice(0, 2);
      drawRadarWithData(ctx, fallback, true); // true indicates placeholders
    } else {
      drawRadarWithData(ctx, selected, false);
    }
  }

  function drawRadarWithData(ctx, tires, isPlaceholder) {
    const datasets = [];
    const colors = [
      'rgba(0, 242, 254, ', 
      'rgba(0, 230, 118, ', 
      'rgba(255, 145, 0, ', 
      'rgba(156, 39, 176, ', 
      'rgba(255, 23, 68, '
    ];

    tires.slice(0, 5).forEach((tire, index) => {
      const maker = window.appState.getProp(tire, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(tire, ['Pattern']) || '';
      
      // Calculate normalized 0-100 values for radar dimensions
      // Dim 1: Hardness (Target ~70 is 100%)
      const hRaw = parseFloat(window.appState.getProp(tire, ['Hardness', 'Hardness '])) || 60;
      const hScore = Math.max(0, Math.min(100, 100 - Math.abs(hRaw - 70) * 4)); // closer to 70 is higher score

      // Dim 2: Low Tg (Target: lower is better, -45℃ is 100%)
      const tgRaw = parseFloat(window.appState.getProp(tire, ['Tg_peak temp. (℃)', 'Tg_peak temp. (C)', 'Tg'])) || -25;
      const tgScore = Math.max(0, Math.min(100, (tgRaw - (-15)) / (-45 - (-15)) * 100)); // lower is 100%

      // Dim 3: Silica content (Target: higher is better, 100phr is 100%)
      const parsedFillers = getCarbonBlackAndSilica(tire);
      const silica = parsedFillers[1];
      const silicaScore = Math.max(0, Math.min(100, (silica / 100) * 100));

      // Dim 4: Carbon Black content (Target: higher is better, 80phr is 100%)
      const cb = parsedFillers[0];
      const cbScore = Math.max(0, Math.min(100, (cb / 80) * 100));

      // Dim 5: NR natural rubber ratio (Target: higher is better, 100% is 100%)
      const polyStr = window.appState.getProp(tire, ['NR / SBR / BR_GC', 'NR / SBR / BR_NMR']) || '';
      const nr = parseTripleRatio(polyStr)[0];
      const nrScore = nr; // since NR is already in percent [0-100]

      const colorBase = colors[index % colors.length];
      
      datasets.push({
        label: isPlaceholder ? `[예시] ${maker} ${pattern}` : `${maker} ${pattern}`,
        data: [hScore, tgScore, silicaScore, cbScore, nrScore],
        backgroundColor: colorBase + '0.15)',
        borderColor: colorBase + '1)',
        borderWidth: 2,
        pointBackgroundColor: colorBase + '1)',
        pointHoverRadius: 5
      });
    });

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['경도 밸런스(Hardness)', '저온 마모(Low Tg)', '젖은그립(Silica)', '보강 내구성(Carbon Black)', '천연고무 비율(NR)'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 10 }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#8a99ad',
              font: { size: 10, weight: 'bold' }
            }
          }
        }
      }
    });
  }

  // --- Helper parsing utilities ---
  function getCarbonBlackAndSilica(item) {
    const cbTbr = window.appState.getProp(item, ['Carbon Black']);
    const silicaTbr = window.appState.getProp(item, ['Silica']);
    if (cbTbr !== null || silicaTbr !== null) {
      return [parseFloat(cbTbr) || 0, parseFloat(silicaTbr) || 0];
    }
    const fillStr = window.appState.getProp(item, ['Carbon Black / Silica (phr)', 'Carbon Black / Silica']) || '';
    return parseDoubleRatio(fillStr);
  }

  function parseStyreneVinyl(str) {
    if (!str) return [0, 0];
    const match = str.toString().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (match) {
      return [parseFloat(match[1]) || 0, parseFloat(match[2]) || 0];
    }
    const single = parseFloat(str);
    if (!isNaN(single)) return [single, 0];
    return [0, 0];
  }

  function parseZnoSulfur(str) {
    if (!str) return [0, 0];
    const cleaned = str.toString().replace(/\([^)]*\)/g, '').trim();
    const parts = cleaned.split('/');
    if (parts.length >= 3) {
      const zno = parseFloat(parts[1].trim()) || 0;
      const sulfur = parseFloat(parts[2].trim()) || 0;
      return [zno, sulfur];
    }
    return [0, 0];
  }

  function parseTripleRatio(str) {
    if (!str) return [0, 0, 0];
    const match = str.toString().match(/(\d+)\s*\/\s*([\d\-]+)\s*\/\s*([\d\-]+)/);
    if (match) {
      const nr = parseInt(match[1]) || 0;
      const sbr = match[2] === '-' ? 0 : parseInt(match[2]) || 0;
      const br = match[3] === '-' ? 0 : parseInt(match[3]) || 0;
      return [nr, sbr, br];
    }
    // Single number case (e.g. 100% natural rubber is "100" or "100 / - / -")
    const single = parseInt(str);
    if (!isNaN(single)) return [single, 0, 0];
    return [0, 0, 0];
  }

  function parseDoubleRatio(str) {
    if (!str) return [0, 0];
    const match = str.toString().match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]) || 0, parseInt(match[2]) || 0];
    }
    // Single number case
    const single = parseInt(str);
    if (!isNaN(single)) return [single, 0];
    return [0, 0];
  }

  function parseSlashValue(str, index) {
    if (!str) return null;
    const parts = str.toString().split('/');
    if (parts.length > index) {
      const val = parseFloat(parts[index].trim());
      return isNaN(val) ? null : val;
    }
    return null;
  }

  function calculateCorrelation(points) {
    const n = points.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXY = 0;
    let sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = points[i].x;
      const y = points[i].y;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    if (den === 0) return 0;
    return num / den;
  }

  function updateCorrelationBadge(r) {
    const badge = document.getElementById('scatter-correlation-badge');
    const valElem = document.getElementById('correlation-value');
    if (!badge || !valElem) return;

    if (r === null || isNaN(r)) {
      valElem.textContent = 'N/A';
      badge.style.borderColor = 'var(--card-border)';
      badge.style.color = 'var(--text-muted)';
      badge.style.background = 'rgba(13, 20, 36, 0.6)';
      return;
    }

    const absR = Math.abs(r);
    let rText = r.toFixed(4);
    let desc = "";
    let color = "var(--primary)";
    let bg = "rgba(13, 20, 36, 0.75)";

    if (absR >= 0.7) {
      desc = "강한 상관관계";
      color = "#00e676"; // Green
      bg = "rgba(0, 230, 118, 0.08)";
    } else if (absR >= 0.4) {
      desc = "뚜렷한 상관관계";
      color = "var(--primary)"; // Cyan
      bg = "rgba(0, 242, 254, 0.08)";
    } else if (absR >= 0.1) {
      desc = "약한 상관관계";
      color = "#ff9100"; // Orange
      bg = "rgba(255, 145, 0, 0.08)";
    } else {
      desc = "상관관계 없음";
      color = "var(--text-muted)";
      bg = "rgba(13, 20, 36, 0.75)";
    }

    valElem.innerHTML = `<span style="font-size: 1rem; font-weight: 700; color: #fff;">${rText}</span> <span style="font-size: 0.75rem; font-weight: 500; color: ${color}; margin-left: 6px;">(${desc})</span>`;
    badge.style.borderColor = color;
    badge.style.color = '#fff';
    badge.style.background = `linear-gradient(135deg, ${bg}, rgba(13, 20, 36, 0.9))`;
  }

  // --- 5. STYRENE / VINYL NMR CHART (Side-by-Side Bar) ---
  function updateStyreneVinylChart() {
    const ctx = document.getElementById('chart-styrene-vinyl');
    if (!ctx) return;

    if (styreneVinylChart) {
      styreneVinylChart.destroy();
    }

    const data = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? window.appState.selectedTires
      : window.appState.filteredData;
    const samples = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? data
      : data.slice(0, 10);

    const labels = [];
    const styreneData = [];
    const vinylData = [];

    samples.forEach(item => {
      const maker = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(item, ['Pattern']) || '';
      labels.push(`${maker.toString().substring(0, 10)} (${pattern.toString().substring(0, 8)})`);

      const ratioStr = window.appState.getProp(item, ['Styrene / Vinyl_NMR (%, in SBR)', 'Styrene / Vinyl_NMR (%, in SBR) ', 'Styrene / Vinyl_NMR', 'Styrene / Vinyl']) || '';
      const parsed = parseStyreneVinyl(ratioStr);
      styreneData.push(parsed[0]);
      vinylData.push(parsed[1]);
    });

    styreneVinylChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Styrene 함량 (%)',
            data: styreneData,
            backgroundColor: '#ff5722',
            borderRadius: 4
          },
          {
            label: 'Vinyl 함량 (%)',
            data: vinylData,
            backgroundColor: '#4caf50',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            title: { display: true, text: '함량 비율 (%)' },
            max: 100
          }
        }
      }
    });
  }

  // --- 6. ZnO / SULFUR CHART (Side-by-Side Bar) ---
  function updateZnoSulfurChart() {
    const ctx = document.getElementById('chart-zno-sulfur');
    if (!ctx) return;

    if (znoSulfurChart) {
      znoSulfurChart.destroy();
    }

    const data = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? window.appState.selectedTires
      : window.appState.filteredData;
    const samples = (window.appState.selectedTires && window.appState.selectedTires.length > 0)
      ? data
      : data.slice(0, 10);

    const labels = [];
    const znoData = [];
    const sulfurData = [];

    samples.forEach(item => {
      const maker = window.appState.getProp(item, ['Maker', 'MakerPatternRaw']) || 'N/A';
      const pattern = window.appState.getProp(item, ['Pattern']) || '';
      labels.push(`${maker.toString().substring(0, 10)} (${pattern.toString().substring(0, 8)})`);

      const sulfurStr = window.appState.getProp(item, ['Aceton / ZnO / T.Sulfur (phr)', 'Aceton / ZnO / T.Sulfur (phr) ', 'Aceton / ZnO / T.Sulfur', 'Aceton / ZnO / T.Sulfur ']) || '';
      const parsed = parseZnoSulfur(sulfurStr);
      znoData.push(parsed[0]);
      sulfurData.push(parsed[1]);
    });

    znoSulfurChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'ZnO 함량 (phr)',
            data: znoData,
            backgroundColor: '#00f2fe',
            borderRadius: 4
          },
          {
            label: 'T.Sulfur 함량 (phr)',
            data: sulfurData,
            backgroundColor: '#9c27b0',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw} phr`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            title: { display: true, text: '배합 단위 (phr)' }
          }
        }
      }
    });
  }

  return {
    init: init,
    updateAllCharts: updateAllCharts,
    updateRadarChart: updateRadarChart
  };
})();
