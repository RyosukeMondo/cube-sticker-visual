import { Vector3, Euler } from 'three';
import type { StaticCubeState, StickerInfo, PieceInfo } from '../types/CubeState';
import { ALL_STICKERS } from '../types/CubeStickers';

/**
 * Creates the static cube state with fixed sticker positions and piece information
 * This represents the solved state of the cube with all pieces in their correct positions
 */
export function createStaticCubeState(): StaticCubeState {
  const stickers = new Map<string, StickerInfo>();
  const pieces = new Map<string, PieceInfo>();

  // Process all stickers and group them by pieces
  Object.values(ALL_STICKERS).forEach(stickerPos => {
    const position = new Vector3(
      stickerPos.position[0],
      stickerPos.position[1], 
      stickerPos.position[2]
    );

    // Determine piece ID based on sticker type and position
    const pieceId = getPieceIdFromSticker(stickerPos.id, stickerPos.type);

    const stickerInfo: StickerInfo = {
      id: stickerPos.id,
      face: stickerPos.face,
      type: stickerPos.type,
      position: position,
      pieceId: pieceId
    };

    stickers.set(stickerPos.id, stickerInfo);

    // Add sticker to piece or create new piece
    if (pieces.has(pieceId)) {
      const piece = pieces.get(pieceId)!;
      piece.stickerIds.push(stickerPos.id);
    } else {
      const piecePosition = calculatePiecePosition(stickerPos.type, stickerPos.id);
      const pieceRotation = new Euler(0, 0, 0); // All pieces start in solved orientation
      
      const pieceInfo: PieceInfo = {
        id: pieceId,
        type: stickerPos.type,
        position: piecePosition,
        rotation: pieceRotation,
        stickerIds: [stickerPos.id]
      };

      pieces.set(pieceId, pieceInfo);
    }
  });

  return { stickers, pieces };
}

/**
 * Determines the piece ID from a sticker ID
 * For centers: piece ID is the same as sticker ID
 * For edges: piece ID is the edge position (e.g., UF, UR, etc.) - need to map both stickers to same piece
 * For corners: piece ID is the corner position (e.g., UFR, UBL, etc.)
 */
function getPieceIdFromSticker(stickerId: string, type: 'edge' | 'corner' | 'center'): string {
  if (type === 'center') {
    return stickerId; // Centers have same piece ID as sticker ID
  }
  
  if (type === 'edge') {
    // Map edge stickers to their piece IDs
    // Each edge piece has two stickers, we need to map both to the same piece ID
    const edgeMapping: Record<string, string> = {
      // UF edge piece
      'UF': 'UF_edge', 'FU': 'UF_edge',
      // UB edge piece  
      'UB': 'UB_edge', 'BU': 'UB_edge',
      // UL edge piece
      'UL': 'UL_edge', 'LU': 'UL_edge',
      // UR edge piece
      'UR': 'UR_edge', 'RU': 'UR_edge',
      // DF edge piece
      'DF': 'DF_edge', 'FD': 'DF_edge',
      // DB edge piece
      'DB': 'DB_edge', 'BD': 'DB_edge',
      // DL edge piece
      'DL': 'DL_edge', 'LD': 'DL_edge',
      // DR edge piece
      'DR': 'DR_edge', 'RD': 'DR_edge',
      // FL edge piece
      'FL': 'FL_edge', 'LF': 'FL_edge',
      // FR edge piece
      'FR': 'FR_edge', 'RF': 'FR_edge',
      // BL edge piece
      'BL': 'BL_edge', 'LB': 'BL_edge',
      // BR edge piece
      'BR': 'BR_edge', 'RB': 'BR_edge'
    };
    
    return edgeMapping[stickerId] || stickerId + '_edge';
  }
  
  if (type === 'corner') {
    // Corner stickers have format like "UFR_U", extract the corner position "UFR"
    return stickerId.split('_')[0];
  }
  
  return stickerId;
}

/**
 * Calculates the 3D position of a piece based on its type and sticker information
 */
function calculatePiecePosition(type: 'edge' | 'corner' | 'center', stickerId: string): Vector3 {
  if (type === 'center') {
    const stickerPos = ALL_STICKERS[stickerId];
    return new Vector3(
      stickerPos.position[0],
      stickerPos.position[1],
      stickerPos.position[2]
    );
  }
  
  if (type === 'edge') {
    const stickerPos = ALL_STICKERS[stickerId];
    return new Vector3(
      stickerPos.position[0],
      stickerPos.position[1],
      stickerPos.position[2]
    );
  }
  
  if (type === 'corner') {
    // For corners, calculate the center position of the corner piece
    const cornerPosition = stickerId.split('_')[0];
    
    // Map corner positions to their 3D coordinates
    const cornerPositions: Record<string, [number, number, number]> = {
      'UFR': [0.5, 0.5, 0.5],
      'UFL': [-0.5, 0.5, 0.5],
      'UBL': [-0.5, 0.5, -0.5],
      'UBR': [0.5, 0.5, -0.5],
      'DFR': [0.5, -0.5, 0.5],
      'DFL': [-0.5, -0.5, 0.5],
      'DBL': [-0.5, -0.5, -0.5],
      'DBR': [0.5, -0.5, -0.5]
    };
    
    const pos = cornerPositions[cornerPosition] || [0, 0, 0];
    return new Vector3(pos[0], pos[1], pos[2]);
  }
  
  return new Vector3(0, 0, 0);
}

// Global static cube state instance
let staticCubeState: StaticCubeState | null = null;

/**
 * Gets the singleton static cube state instance
 */
export function getStaticCubeState(): StaticCubeState {
  if (!staticCubeState) {
    staticCubeState = createStaticCubeState();
  }
  return staticCubeState;
}