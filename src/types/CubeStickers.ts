// Comprehensive sticker ID system for all 54 cube stickers

export type FaceType = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export interface StickerPosition {
  id: string;
  face: FaceType;
  type: 'edge' | 'corner' | 'center';
  position: [number, number, number]; // 3D coordinates
}

// All 54 stickers on a Rubik's cube
export const ALL_STICKERS: Record<string, StickerPosition> = {
  // Center stickers (6 total)
  'U': { id: 'U', face: 'U', type: 'center', position: [0, 1, 0] },
  'D': { id: 'D', face: 'D', type: 'center', position: [0, -1, 0] },
  'F': { id: 'F', face: 'F', type: 'center', position: [0, 0, 1] },
  'B': { id: 'B', face: 'B', type: 'center', position: [0, 0, -1] },
  'L': { id: 'L', face: 'L', type: 'center', position: [-1, 0, 0] },
  'R': { id: 'R', face: 'R', type: 'center', position: [1, 0, 0] },

  // Edge stickers (24 total - 12 edges × 2 stickers each)
  // Up face edges
  'UF': { id: 'UF', face: 'U', type: 'edge', position: [0, 1, 0.5] },
  'UB': { id: 'UB', face: 'U', type: 'edge', position: [0, 1, -0.5] },
  'UL': { id: 'UL', face: 'U', type: 'edge', position: [-0.5, 1, 0] },
  'UR': { id: 'UR', face: 'U', type: 'edge', position: [0.5, 1, 0] },
  
  // Down face edges
  'DF': { id: 'DF', face: 'D', type: 'edge', position: [0, -1, 0.5] },
  'DB': { id: 'DB', face: 'D', type: 'edge', position: [0, -1, -0.5] },
  'DL': { id: 'DL', face: 'D', type: 'edge', position: [-0.5, -1, 0] },
  'DR': { id: 'DR', face: 'D', type: 'edge', position: [0.5, -1, 0] },
  
  // Front face edges
  'FU': { id: 'FU', face: 'F', type: 'edge', position: [0, 0.5, 1] },
  'FD': { id: 'FD', face: 'F', type: 'edge', position: [0, -0.5, 1] },
  'FL': { id: 'FL', face: 'F', type: 'edge', position: [-0.5, 0, 1] },
  'FR': { id: 'FR', face: 'F', type: 'edge', position: [0.5, 0, 1] },
  
  // Back face edges
  'BU': { id: 'BU', face: 'B', type: 'edge', position: [0, 0.5, -1] },
  'BD': { id: 'BD', face: 'B', type: 'edge', position: [0, -0.5, -1] },
  'BL': { id: 'BL', face: 'B', type: 'edge', position: [0.5, 0, -1] }, // Note: BL is on the right when looking at back
  'BR': { id: 'BR', face: 'B', type: 'edge', position: [-0.5, 0, -1] }, // Note: BR is on the left when looking at back
  
  // Left face edges
  'LU': { id: 'LU', face: 'L', type: 'edge', position: [-1, 0.5, 0] },
  'LD': { id: 'LD', face: 'L', type: 'edge', position: [-1, -0.5, 0] },
  'LF': { id: 'LF', face: 'L', type: 'edge', position: [-1, 0, 0.5] },
  'LB': { id: 'LB', face: 'L', type: 'edge', position: [-1, 0, -0.5] },
  
  // Right face edges
  'RU': { id: 'RU', face: 'R', type: 'edge', position: [1, 0.5, 0] },
  'RD': { id: 'RD', face: 'R', type: 'edge', position: [1, -0.5, 0] },
  'RF': { id: 'RF', face: 'R', type: 'edge', position: [1, 0, 0.5] },
  'RB': { id: 'RB', face: 'R', type: 'edge', position: [1, 0, -0.5] },

  // Corner stickers (24 total - 8 corners × 3 stickers each)
  // Up face corners
  'UFR_U': { id: 'UFR_U', face: 'U', type: 'corner', position: [0.5, 1, 0.5] },
  'UFR_F': { id: 'UFR_F', face: 'F', type: 'corner', position: [0.5, 0.5, 1] },
  'UFR_R': { id: 'UFR_R', face: 'R', type: 'corner', position: [1, 0.5, 0.5] },
  
  'UFL_U': { id: 'UFL_U', face: 'U', type: 'corner', position: [-0.5, 1, 0.5] },
  'UFL_F': { id: 'UFL_F', face: 'F', type: 'corner', position: [-0.5, 0.5, 1] },
  'UFL_L': { id: 'UFL_L', face: 'L', type: 'corner', position: [-1, 0.5, 0.5] },
  
  'UBL_U': { id: 'UBL_U', face: 'U', type: 'corner', position: [-0.5, 1, -0.5] },
  'UBL_B': { id: 'UBL_B', face: 'B', type: 'corner', position: [0.5, 0.5, -1] }, // Note: back face orientation
  'UBL_L': { id: 'UBL_L', face: 'L', type: 'corner', position: [-1, 0.5, -0.5] },
  
  'UBR_U': { id: 'UBR_U', face: 'U', type: 'corner', position: [0.5, 1, -0.5] },
  'UBR_B': { id: 'UBR_B', face: 'B', type: 'corner', position: [-0.5, 0.5, -1] }, // Note: back face orientation
  'UBR_R': { id: 'UBR_R', face: 'R', type: 'corner', position: [1, 0.5, -0.5] },
  
  // Down face corners
  'DFR_D': { id: 'DFR_D', face: 'D', type: 'corner', position: [0.5, -1, 0.5] },
  'DFR_F': { id: 'DFR_F', face: 'F', type: 'corner', position: [0.5, -0.5, 1] },
  'DFR_R': { id: 'DFR_R', face: 'R', type: 'corner', position: [1, -0.5, 0.5] },
  
  'DFL_D': { id: 'DFL_D', face: 'D', type: 'corner', position: [-0.5, -1, 0.5] },
  'DFL_F': { id: 'DFL_F', face: 'F', type: 'corner', position: [-0.5, -0.5, 1] },
  'DFL_L': { id: 'DFL_L', face: 'L', type: 'corner', position: [-1, -0.5, 0.5] },
  
  'DBL_D': { id: 'DBL_D', face: 'D', type: 'corner', position: [-0.5, -1, -0.5] },
  'DBL_B': { id: 'DBL_B', face: 'B', type: 'corner', position: [0.5, -0.5, -1] }, // Note: back face orientation
  'DBL_L': { id: 'DBL_L', face: 'L', type: 'corner', position: [-1, -0.5, -0.5] },
  
  'DBR_D': { id: 'DBR_D', face: 'D', type: 'corner', position: [0.5, -1, -0.5] },
  'DBR_B': { id: 'DBR_B', face: 'B', type: 'corner', position: [-0.5, -0.5, -1] }, // Note: back face orientation
  'DBR_R': { id: 'DBR_R', face: 'R', type: 'corner', position: [1, -0.5, -0.5] },
};

// Helper functions to get stickers by type
export function getEdgeStickers(): StickerPosition[] {
  return Object.values(ALL_STICKERS).filter(sticker => sticker.type === 'edge');
}

export function getCornerStickers(): StickerPosition[] {
  return Object.values(ALL_STICKERS).filter(sticker => sticker.type === 'corner');
}

export function getCenterStickers(): StickerPosition[] {
  return Object.values(ALL_STICKERS).filter(sticker => sticker.type === 'center');
}

// Get sticker by ID
export function getStickerById(id: string): StickerPosition | undefined {
  return ALL_STICKERS[id];
}

// Buffer pieces for blindfolded solving
export const EDGE_BUFFER = 'UF';
export const CORNER_BUFFER = 'UFR_U'; // The U face sticker of the UFR corner