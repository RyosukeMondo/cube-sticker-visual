import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Map Japanese notation to sticker IDs for edges
const JAPANESE_TO_EDGE_STICKER = {
  'あ (UB)': 'UB',
  'い (UR)': 'UR', 
  'え (UL)': 'UL',
  'き (FR)': 'FR',
  'く (FD)': 'FD',
  'け (FL)': 'FL',
  'さ (LU)': 'LU',
  'し (LF)': 'LF',
  'す (LD)': 'LD',
  'せ (LB)': 'LB',
  'た (BD)': 'BD',
  'ち (BR)': 'BR',
  'つ (BU)': 'BU',
  'て (BL)': 'BL',
  'な (RU)': 'RU',
  'に (RB)': 'RB',
  'ぬ (RD)': 'RD',
  'ね (RF)': 'RF',
  'は (DF)': 'DF',
  'ひ (DR)': 'DR',
  'ふ (DB)': 'DB',
  'へ (DL)': 'DL'
};

// Map Japanese notation to sticker IDs for corners
const JAPANESE_TO_CORNER_STICKER = {
  'あ (UBL)': 'UBL_U',
  'い (UBR)': 'UBR_U',
  'え (UFL)': 'UFL_U',
  'か (FLU)': 'UFL_F', // FLU is the F face of UFL corner
  'く (FDR)': 'DFR_F', // FDR is the F face of DFR corner
  'け (FDL)': 'DFL_F', // FDL is the F face of DFL corner
  'さ (LBU)': 'UBL_L', // LBU is the L face of UBL corner
  'し (LFU)': 'UFL_L', // LFU is the L face of UFL corner
  'す (LDF)': 'DFL_L', // LDF is the L face of DFL corner
  'せ (LBD)': 'DBL_L', // LBD is the L face of DBL corner
  'た (BDL)': 'DBL_B', // BDL is the B face of DBL corner
  'ち (BDR)': 'DBR_B', // BDR is the B face of DBR corner
  'つ (BRU)': 'UBR_B', // BRU is the B face of UBR corner
  'て (BLU)': 'UBL_B', // BLU is the B face of UBL corner
  'に (RBU)': 'UBR_R', // RBU is the R face of UBR corner
  'ぬ (RBD)': 'DBR_R', // RBD is the R face of DBR corner
  'ね (RDF)': 'DFR_R', // RDF is the R face of DFR corner
  'は (DFL)': 'DFL_D', // DFL is the D face of DFL corner
  'ひ (DFR)': 'DFR_D', // DFR is the D face of DFR corner
  'ふ (DBR)': 'DBR_D', // DBR is the D face of DBR corner
  'へ (DBL)': 'DBL_D'  // DBL is the D face of DBL corner
};



// Generate 3-cycle sticker mappings for blindfolded solving
function generate3CycleMappings(sourceSticker, targetSticker, algorithmType) {
  const bufferSticker = algorithmType === 'edge' ? 'UF' : 'UFR_U';
  
  // For blindfolded solving, the typical 3-cycle is:
  // Buffer -> Target -> Source -> Buffer
  // This means: Buffer piece goes to Target position, Target piece goes to Source position, Source piece goes to Buffer position
  
  return [
    {
      source: bufferSticker,
      target: targetSticker,
      cyclePosition: 0
    },
    {
      source: targetSticker,
      target: sourceSticker,
      cyclePosition: 1
    },
    {
      source: sourceSticker,
      target: bufferSticker,
      cyclePosition: 2
    }
  ];
}

function parseCSV(csvContent, algorithmType) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split('\t');
  const algorithms = [];
  
  const stickerMap = algorithmType === 'edge' ? JAPANESE_TO_EDGE_STICKER : JAPANESE_TO_CORNER_STICKER;
  
  // Skip the header row and process data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split('\t');
    const sourceNotation = row[0];
    
    if (!sourceNotation || !stickerMap[sourceNotation]) {
      continue;
    }
    
    const sourceSticker = stickerMap[sourceNotation];
    
    // Process each column (target sticker)
    for (let j = 1; j < headers.length && j < row.length; j++) {
      const targetNotation = headers[j];
      const algorithmNotation = row[j];
      
      if (!algorithmNotation || algorithmNotation.trim() === '' || !stickerMap[targetNotation]) {
        continue;
      }
      
      const targetSticker = stickerMap[targetNotation];
      
      // Skip if source and target are the same
      if (sourceSticker === targetSticker) {
        continue;
      }
      
      const bufferPieces = algorithmType === 'edge' ? ['UF'] : ['UFR_U'];
      
      // Create algorithm ID from source and target
      const algorithmId = `${sourceSticker}-${targetSticker}`;
      
      // Create 3-cycle sticker mappings for blindfolded solving
      const stickerMappings = generate3CycleMappings(sourceSticker, targetSticker, algorithmType);
      
      algorithms.push({
        id: algorithmId,
        type: algorithmType,
        notation: algorithmNotation.trim(),
        stickerMappings,
        bufferPieces
      });
    }
  }
  
  return algorithms;
}

function generateAlgorithmData() {
  try {
    // Read both CSV files
    const edgeCsvPath = path.join(__dirname, '../public/algo_edge.csv');
    const cornerCsvPath = path.join(__dirname, '../public/algo_corner.csv');
    
    const edgeCsvContent = fs.readFileSync(edgeCsvPath, 'utf-8');
    const cornerCsvContent = fs.readFileSync(cornerCsvPath, 'utf-8');
    
    // Parse both CSV files
    const edgeAlgorithms = parseCSV(edgeCsvContent, 'edge');
    const cornerAlgorithms = parseCSV(cornerCsvContent, 'corner');
    
    // Combine all algorithms
    const algorithms = [...edgeAlgorithms, ...cornerAlgorithms];
    
    // Count edge and corner algorithms
    const edgeCount = edgeAlgorithms.length;
    const cornerCount = cornerAlgorithms.length;
    
    // Create the algorithm data object
    const algorithmData = {
      algorithms,
      edgeCount,
      cornerCount
    };
    
    // Generate JavaScript file content
    const jsContent = `// Auto-generated algorithm data from algo_edge.csv and algo_corner.csv
// Generated on: ${new Date().toISOString()}

export const ALGORITHM_DATA = ${JSON.stringify(algorithmData, null, 2)};

export default ALGORITHM_DATA;
`;
    
    // Write the JavaScript file
    const outputPath = path.join(__dirname, '../src/data/algorithms.js');
    
    // Ensure the data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, jsContent);
    
    // Generate TypeScript declaration file
    const dtsContent = `import { AlgorithmData } from '../types/Algorithm';

export declare const ALGORITHM_DATA: AlgorithmData;
export default ALGORITHM_DATA;
`;
    
    const dtsPath = path.join(__dirname, '../src/data/algorithms.d.ts');
    fs.writeFileSync(dtsPath, dtsContent);
    
    console.log(`✅ Generated algorithm data:`);
    console.log(`   - Total algorithms: ${algorithms.length}`);
    console.log(`   - Edge algorithms: ${edgeCount}`);
    console.log(`   - Corner algorithms: ${cornerCount}`);
    console.log(`   - Output files: ${outputPath}, ${dtsPath}`);
    
    return algorithmData;
    
  } catch (error) {
    console.error('❌ Error generating algorithm data:', error);
    process.exit(1);
  }
}

// Run the script if called directly
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  generateAlgorithmData();
}

export { generateAlgorithmData };