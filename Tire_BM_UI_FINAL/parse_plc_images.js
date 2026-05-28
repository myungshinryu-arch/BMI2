const fs = require('fs');
const path = require('path');

const unzippedDir = "C:/Users/HANTA/Desktop/vivecoding_exercise/Compd BM/plc_media_unzipped";
const outDir = "C:/Users/HANTA/Desktop/vivecoding_exercise/Compd BM/data";
const outPath = path.join(outDir, "plc_images_map.json");

console.log("Starting PLC Excel Drawing XML parsing to map cell rows/cols to images...");

try {
  // 1. Read xl/workbook.xml to map sheet names to rId
  const workbookXmlPath = path.join(unzippedDir, "xl/workbook.xml");
  if (!fs.existsSync(workbookXmlPath)) {
    throw new Error(`workbook.xml not found at ${workbookXmlPath}`);
  }
  const workbookXml = fs.readFileSync(workbookXmlPath, 'utf8');
  const sheets = [];
  
  // Regex to extract sheets
  const sheetRegex = /<sheet\s+[^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g;
  let match;
  while ((match = sheetRegex.exec(workbookXml)) !== null) {
    sheets.push({
      name: match[1],
      sheetId: match[2],
      rId: match[3]
    });
  }
  
  console.log(`Found ${sheets.length} sheets in workbook.xml`);

  // 2. Read xl/_rels/workbook.xml.rels to map rId to worksheet file
  const workbookRelsPath = path.join(unzippedDir, "xl/_rels/workbook.xml.rels");
  if (!fs.existsSync(workbookRelsPath)) {
    throw new Error(`workbook.xml.rels not found at ${workbookRelsPath}`);
  }
  const workbookRelsXml = fs.readFileSync(workbookRelsPath, 'utf8');
  const rels = {};
  
  const relRegex = /<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  while ((match = relRegex.exec(workbookRelsXml)) !== null) {
    rels[match[1]] = match[2];
  }

  // Map each sheet name to its XML file path
  sheets.forEach(s => {
    s.xmlPath = rels[s.rId]; // e.g. "worksheets/sheet3.xml"
  });

  // 3. For each sheet, find drawings association
  const sheetImageMap = {};

  sheets.forEach(s => {
    if (!s.xmlPath) return;
    
    // Normalizing file path (some might have forward vs backward slash)
    const normalizedXmlPath = s.xmlPath.replace(/\\/g, '/');
    const sheetXmlDir = path.dirname(normalizedXmlPath); // e.g. "worksheets"
    const sheetXmlBase = path.basename(normalizedXmlPath); // e.g. "sheet3.xml"
    
    const sheetRelPath = path.join(unzippedDir, "xl", sheetXmlDir, "_rels", sheetXmlBase + ".rels");
    if (!fs.existsSync(sheetRelPath)) {
      console.warn(`Worksheet rel file not found for ${s.name}: ${sheetRelPath}`);
      return;
    }
    
    const sheetRelsXml = fs.readFileSync(sheetRelPath, 'utf8');
    // Match relationship for drawings: Target="../drawings/drawing1.xml"
    const drawingRelMatch = /<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="..\/drawings\/drawing([0-9]+).xml"/i.exec(sheetRelsXml);
    if (!drawingRelMatch) {
      console.log(`No drawings associated with sheet: ${s.name}`);
      return;
    }
    
    const drawingId = drawingRelMatch[2]; // e.g. "1"
    const drawingFile = `xl/drawings/drawing${drawingId}.xml`;
    const drawingRelsFile = `xl/drawings/_rels/drawing${drawingId}.xml.rels`;
    
    const dPath = path.join(unzippedDir, drawingFile);
    const drPath = path.join(unzippedDir, drawingRelsFile);
    
    if (!fs.existsSync(dPath) || !fs.existsSync(drPath)) {
      console.warn(`Drawing files missing for ${s.name} at: ${dPath} or ${drPath}`);
      return;
    }
    
    // Parse drawing rels to map rId to media file
    const drawingRelsXml = fs.readFileSync(drPath, 'utf8');
    const dRels = {};
    const dRelRegex = /<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="..\/media\/([^"]+)"/g;
    let drMatch;
    while ((drMatch = dRelRegex.exec(drawingRelsXml)) !== null) {
      dRels[drMatch[1]] = drMatch[2]; // e.g. "rId1" -> "image3.png" or "hdphoto1.wdp"
    }
    
    // Parse drawing.xml to find from-anchors (col, row) and embed rId
    const drawingXml = fs.readFileSync(dPath, 'utf8');
    
    // We match anchors: can be <xdr:twoCellAnchor> or <xdr:oneCellAnchor>
    // Splitting by anchors enables parsing each block separately to avoid regex overlap issues
    const anchors = drawingXml.split(/<xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)[^>]*>/);
    const mappings = [];
    
    anchors.forEach(block => {
      if (!block.includes('<xdr:from>')) return;
      
      // Extract col & row
      const colMatch = /<xdr:col>([0-9]+)<\/xdr:col>/.exec(block);
      const rowMatch = /<xdr:row>([0-9]+)<\/xdr:row>/.exec(block);
      
      // Support nested a:blip or other ways sheet drawings embed pictures
      const rEmbedMatch = /<a:blip[^>]*r:embed="([^"]+)"/.exec(block);
      
      if (colMatch && rowMatch && rEmbedMatch) {
        const col = parseInt(colMatch[1]);
        const row = parseInt(rowMatch[1]);
        const rId = rEmbedMatch[1];
        const mediaFile = dRels[rId];
        
        if (mediaFile) {
          // Normalize wdp to png in our json map since we are batch converting all .wdp files to .png
          const webSafeImage = mediaFile.replace(/\.wdp$/i, '.png');
          mappings.push({
            row: row,
            col: col,
            image: webSafeImage
          });
        }
      }
    });
    
    if (mappings.length > 0) {
      sheetImageMap[s.name] = mappings;
      console.log(`SUCCESS: Sheet '${s.name}' mapped ${mappings.length} drawings to files.`);
    }
  });

  // Ensure outDir exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(sheetImageMap, null, 2), 'utf8');
  console.log(`\nCOMPLETED: Full image map successfully written to: ${outPath}`);
  console.log("Mapped sheets summary:");
  for (let shName in sheetImageMap) {
    console.log(` - ${shName}: ${sheetImageMap[shName].length} images mapped.`);
  }

} catch (err) {
  console.error("Critical error during drawing XML analysis:", err);
}
