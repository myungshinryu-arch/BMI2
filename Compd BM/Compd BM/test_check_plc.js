const fs = require('fs');
const path = require('path');

try {
  // Let's resolve node_modules from the project directory
  const XLSX = require('xlsx');
  console.log("SUCCESS: XLSX library loaded.");
  
  const excelPath = "C:/Users/HANTA/Desktop/vivecoding_exercise/BM data/Tire/PLC Update_20260219.xlsx";
  console.log("Reading workbook sheets...");
  const workbook = XLSX.readFile(excelPath, { bookSheets: true });
  console.log("Sheets found:");
  console.log(workbook.SheetNames);
} catch (e) {
  console.error("Failed to load or read excel:", e);
}
