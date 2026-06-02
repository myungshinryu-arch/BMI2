const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = "C:/Users/HANTA/Desktop/vivecoding_exercise/BM data/Tire/PLC Update_20260219.xlsx";
console.log("Analyzing content of:", excelPath);

try {
  // Read book
  const workbook = XLSX.readFile(excelPath, { 
    sheets: ['BM Report List', 'Summer', 'SUV', 'EV'], // read some main sheets only to avoid memory crash
    cellDates: true 
  });
  
  for (let sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n===========================================`);
    console.log(`SHEET: ${sheetName}`);
    console.log(`Total rows parsed: ${data.length}`);
    
    // Print first 5 rows
    console.log("SAMPLE ROWS (First 5):");
    const sample = data.slice(0, 5);
    sample.forEach((row, i) => {
      console.log(`Row ${i}:`, JSON.stringify(row).slice(0, 300) + (JSON.stringify(row).length > 300 ? "..." : ""));
    });
  }
} catch (e) {
  console.error("Error analyzing content:", e);
}
