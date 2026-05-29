const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = "C:/Users/HANTA/Desktop/vivecoding_exercise/BM data/Tire/PLC Update_20260219.xlsx";

// Write both to local Tire_BM_UI_FINAL/data and root data directory to support both entry points
const outDir = path.join(__dirname, 'data');
const outJsonPath = path.join(outDir, 'plc_data.json');
const outJsPath = path.join(outDir, 'plc_data.js');

const rootOutDir = path.join(__dirname, '..', 'data');
const rootJsonPath = path.join(rootOutDir, 'plc_data.json');
const rootJsPath = path.join(rootOutDir, 'plc_data.js');

console.log("Starting PLC Excel extraction...");

try {
  // Read sheets with SheetJS (Include all 8 timeline sheets plus report list and EV)
  const workbook = XLSX.readFile(excelPath, {
    sheets: [
      'BM Report List', 
      'Summer', 
      'Winter-Alpin', 
      'Winter-Nordic', 
      'All Weather', 
      'NA All season', 
      'Pick Up', 
      'SUV', 
      'VAN', 
      'EV'
    ],
    cellDates: true
  });
  
  const result = {
    reports: [],
    plcTimeline: [], // Unified timeline milestones from all 8 sheets
    evData: []
  };

  // 1. Parse 'BM Report List' Sheet
  const reportSheet = workbook.Sheets['BM Report List'];
  if (reportSheet) {
    const rows = XLSX.utils.sheet_to_json(reportSheet, { header: 1 });
    rows.forEach((row, i) => {
      if (row && row.length > 0) {
        const text = row.join(' ').trim();
        if (text.startsWith('▶') || text.includes('Benchmarking') || text.includes('보고') || text.includes('분석')) {
          result.reports.push({
            id: i,
            title: text.replace(/^▶\s*/, ''),
            rawRow: i
          });
        }
      }
    });
  }

  // 2. Parse Timeline Sheets
  const timelineSheets = [
    'Summer',
    'Winter-Alpin',
    'Winter-Nordic',
    'All Weather',
    'NA All season',
    'Pick Up',
    'SUV',
    'VAN'
  ];
  
  timelineSheets.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet ${sheetName} not found in Excel!`);
      return;
    }
    
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (rows.length < 2) return;
    
    // Find header row containing years
    let headerRowIdx = -1;
    let years = [];
    
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (row && (row.includes(2024) || row.includes('2024'))) {
        headerRowIdx = r;
        row.forEach((cell, cIdx) => {
          const val = parseInt(cell);
          if (!isNaN(val) && val >= 1990 && val <= 2030) {
            years.push({ year: val, colIdx: cIdx });
          }
        });
        break;
      }
    }
    
    if (headerRowIdx === -1 || years.length === 0) {
      console.warn(`Could not detect year headers for sheet ${sheetName}`);
      return;
    }
    
    // Summer has an empty Column A, so Category/Division are at [1, 2]
    // The other 7 sheets have them at [0, 1]
    const isSummer = (sheetName === 'Summer');
    const catColIdx = isSummer ? 1 : 0;
    const divColIdx = isSummer ? 2 : 1;

    // Scan data rows
    let lastCategory = '';
    let lastDivision = '';
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      
      let category = (row[catColIdx] || '').toString().trim();
      let division = (row[divColIdx] || '').toString().trim();
      
      // Resolve merged Category
      if (category) {
        lastCategory = category;
      } else {
        category = lastCategory;
      }
      
      // Resolve merged Division
      if (division) {
        lastDivision = division;
      } else {
        division = lastDivision;
      }
      
      if (!category && !division) continue;
      
      // Avoid empty spacer rows in Excel by ensuring at least one product is present
      let hasProduct = false;
      years.forEach(({ colIdx }) => {
        const cellValue = (row[colIdx] || '').toString().trim();
        if (cellValue && cellValue !== '-' && cellValue !== 'null') {
          hasProduct = true;
        }
      });
      
      if (!hasProduct) continue;
      
      // Look at cells under each year column
      years.forEach(({ year, colIdx }) => {
        const cellValue = (row[colIdx] || '').toString().trim();
        if (cellValue && cellValue !== '-' && cellValue !== 'null') {
          result.plcTimeline.push({
            sheet: sheetName,
            category: category,
            division: division,
            year: year,
            productName: cellValue,
            excelRow: r,
            excelCol: colIdx
          });
        }
      });
    }
  });

  // 3. Parse 'EV' Sheet
  const evSheet = workbook.Sheets['EV'];
  if (evSheet) {
    const rows = XLSX.utils.sheet_to_json(evSheet, { header: 1 });
    let headerIdx = -1;
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (row && (row.includes('Rank') || row.includes('Maker') || row.includes('전용상품'))) {
        headerIdx = r;
        break;
      }
    }
    
    if (headerIdx !== -1) {
      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length < 3) continue;
        
        const rank = row[1];
        const maker = (row[2] || '').toString().trim();
        const type = (row[3] || '').toString().trim(); 
        const productName = (row[4] || '').toString().trim();
        const segment = (row[5] || '').toString().trim();
        const status = (row[6] || '').toString().trim(); 
        const comment = (row[7] || '').toString().trim(); 
        const reportTitle = (row[8] || '').toString().trim(); 
        
        if (!maker && !productName) continue; 
        
        result.evData.push({
          rank: rank || '',
          maker: maker,
          type: type || '호환상품',
          productName: productName,
          segment: segment || '-',
          status: status || '미분석',
          comment: comment || '',
          reportTitle: reportTitle || '',
          excelRow: r
        });
      }
    }
  }

  // Ensure output folders exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  if (!fs.existsSync(rootOutDir)) {
    fs.mkdirSync(rootOutDir, { recursive: true });
  }

  // Write compact JSON files to both targets
  fs.writeFileSync(outJsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(rootJsonPath, JSON.stringify(result, null, 2), 'utf8');
  
  // Write JS files for front-end global state to both targets
  const jsContent = `// Auto-generated global state data\nwindow.PLC_DATA = ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFileSync(outJsPath, jsContent, 'utf8');
  fs.writeFileSync(rootJsPath, jsContent, 'utf8');

  console.log(`SUCCESS: Normalized PLC data written to double paths!`);
  console.log(`Timeline milestones count: ${result.plcTimeline.length}`);
  console.log(`EV target count: ${result.evData.length}`);
  console.log(`Report index list count: ${result.reports.length}`);

} catch (err) {
  console.error("Critical error during extraction:", err);
}
