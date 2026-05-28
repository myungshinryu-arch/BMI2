window.FileParser = (function() {
  let parsedDataset = null;
  let activeFileName = "";

  function init() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const applyBtn = document.getElementById('btn-apply-parsed');

    if (!dropZone || !fileInput || !applyBtn) return;

    // Trigger file dialog on click
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
    });

    // Drag-and-Drop event listeners
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    ['dragleave', 'dragend'].forEach(evtName => {
      dropZone.addEventListener(evtName, () => {
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    });

    // Integrate parsed data into the active state source
    applyBtn.addEventListener('click', integrateData);
  }

  // Handle excel binary read via SheetJS
  function processFile(file) {
    activeFileName = file.name;
    window.showToast(`파일 파싱을 시작합니다: ${activeFileName}`);

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = e.target.result;
        // Supports xls, xlsx, xlsb seamlessly
        const workbook = XLSX.read(data, { type: 'binary', cellNF: false, cellText: false });
        
        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to raw row arrays
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 3) {
          window.showToast("오류: 엑셀 파일 내 유효한 행 데이터가 부족합니다.");
          return;
        }

        // Try to identify header row (usually contains 'Maker' or '부위')
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          if (rows[i] && rows[i].some(cell => cell && (cell.toString().includes('Maker') || cell.toString().includes('부위') || cell.toString().includes('Pattern')))) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = rows[headerRowIdx];
        const records = [];

        // Build list of records
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) continue; // Skip empty rows

          const record = {};
          headers.forEach((header, colIdx) => {
            if (header) {
              record[header.toString().trim()] = row[colIdx] !== undefined ? row[colIdx] : null;
            }
          });
          records.push(record);
        }

        if (records.length === 0) {
          window.showToast("오류: 파일 형식 분석에 실패했거나 레코드를 찾지 못했습니다.");
          return;
        }

        parsedDataset = records;
        
        // Show result feedback panel
        document.getElementById('parsed-file-name').textContent = activeFileName;
        document.getElementById('parsed-file-stats').textContent = `첫 번째 시트(${sheetName})에서 총 ${records.length}개의 커스텀 컴파운드 분석 데이터를 성공적으로 분석했습니다.`;
        document.getElementById('parse-result-panel').style.display = 'block';

        window.showToast(`성공: ${records.length}개의 데이터 분석 완료! '데이터에 통합' 버튼을 눌러주세요.`);

      } catch (err) {
        console.error("Error reading file:", err);
        window.showToast(`오류: 엑셀 데이터를 처리하는 도중 에러가 발생했습니다.`);
      }
    };

    reader.onerror = function() {
      window.showToast("오류: 로컬 파일 읽기에 실패했습니다.");
    };

    reader.readAsBinaryString(file);
  }

  // Merge parsed dataset into current app state
  function integrateData() {
    if (!parsedDataset || parsedDataset.length === 0) return;

    const source = window.appState.currentSource;
    
    // Apply outlier cleansing to parsed dataset too (guarantees newly uploaded files are sanitized)
    let cleanedParsed = parsedDataset;
    if (window.cleanOutliers && typeof window.cleanOutliers === 'function') {
      cleanedParsed = window.cleanOutliers(parsedDataset);
    }
    
    // Concat to existing state in memory
    window.appState.allData[source] = cleanedParsed.concat(window.appState.allData[source]);
    window.appState.filteredData = [...window.appState.allData[source]];
    window.appState.currentPage = 1;

    // Reset table checkboxes
    document.getElementById('check-all').checked = false;

    // Refresh dashboard stats, tables and plots
    if (window.initFilters) window.initFilters();
    if (window.updateDashboard) window.updateDashboard();
    if (window.updateExplorerTable) window.updateExplorerTable();
    if (window.TireCharts) window.TireCharts.updateAllCharts();

    // Reset uploader state
    parsedDataset = null;
    document.getElementById('parse-result-panel').style.display = 'none';
    document.getElementById('file-input').value = '';

    window.showToast(`완료: '${activeFileName}' 데이터셋이 현재 대시보드 및 탐색기에 즉각 통합되었습니다!`);
  }

  return {
    init: init
  };
})();
