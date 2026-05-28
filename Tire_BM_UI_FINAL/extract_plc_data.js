const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = "C:/Users/HANTA/Desktop/vivecoding_exercise/BM data/Tire/PLC Update_20260219.xlsx";
const outDir = "C:/Users/HANTA/Desktop/vivecoding_exercise/Compd%20BM/data"; // let's safe escape %20 space
const outPath = "C:/Users/HANTA/Desktop/vivecoding_exercise/Compd BM/data/plc_data.json";

console.log("Starting PLC Excel extraction...");

try {
  // Read sheets with SheetJS (Only specific sheets to optimize performance)
  const workbook = XLSX.readFile(excelPath, {
    sheets: ['BM Report List', 'Summer', 'SUV', 'EV', 'Winter-Alpin', 'All Weather'],
    cellDates: true
  });
  
  const result = {
    reports: [],
    plcTimeline: [], // Unified timeline milestones from Summer, SUV, etc.
    evData: []
  };

  // 1. Parse 'BM Report List' Sheet (Reports Registry)
  const reportSheet = workbook.Sheets['BM Report List'];
  if (reportSheet) {
    const rows = XLSX.utils.sheet_to_json(reportSheet, { header: 1 });
    // This sheet has some guide headers on top. Let's collect lines starting from row index 6 or so, or search for content
    rows.forEach((row, i) => {
      if (row && row.length > 0) {
        const text = row.join(' ').trim();
        // Look for report patterns like "▶ [Maker] ... [Report Title]"
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

  // 2. Parse Timeline Sheets (Summer, SUV, Winter-Alpin, All Weather)
  const timelineSheets = ['Summer', 'SUV', 'Winter-Alpin', 'All Weather'];
  timelineSheets.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;
    
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (rows.length < 2) return;
    
    // Find header row containing years. Usually it's Row 1 (index 1) but let's scan for years
    let headerRowIdx = -1;
    let years = [];
    
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (row && row.includes(2024) || row.includes('2024')) {
        headerRowIdx = r;
        // Collect years
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
    
    // Scan data rows
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 2) continue;
      
      // Col 1 is usually Category, Col 2 is Division/구분
      const category = (row[1] || '').toString().trim();
      const division = (row[2] || '').toString().trim();
      
      if (!category && !division) continue; // skip blank category lines
      
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

  // 3. Parse 'EV' Sheet (EV Benchmarking board)
  const evSheet = workbook.Sheets['EV'];
  if (evSheet) {
    const rows = XLSX.utils.sheet_to_json(evSheet, { header: 1 });
    // Find header row (usually Row 2:Rank, Maker, 전용상품...)
    let headerIdx = -1;
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (row && (row.includes('Rank') || row.includes('Maker') || row.includes('전용상품'))) {
        headerIdx = r;
        break;
      }
    }
    
    if (headerIdx !== -1) {
      // Collect records
      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length < 3) continue;
        
        const rank = row[1];
        const maker = (row[2] || '').toString().trim();
        const type = (row[3] || '').toString().trim(); // 전용상품 / 호환상품
        const productName = (row[4] || '').toString().trim();
        const segment = (row[5] || '').toString().trim();
        const status = (row[6] || '').toString().trim(); // 분석현황 (e.g. 22년 분석 완료)
        const comment = (row[7] || '').toString().trim(); // 비고
        const reportTitle = (row[8] || '').toString().trim(); // 관련 보고서 링크명
        
        if (!maker && !productName) continue; // skip empty rows
        
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

  // Ensure output folder exists
  const folder = path.dirname(outPath);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // Write compact JSON file
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`SUCCESS: Normalized PLC data written to: ${outPath}`);
  console.log(`Timeline milestones count: ${result.plcTimeline.length}`);
  console.log(`EV target count: ${result.evData.length}`);
  console.log(`Report index list count: ${result.reports.length}`);

} catch (err) {
  console.error("Critical error during extraction:", err);
}
