import { EDGE_BUFFER, CORNER_BUFFER } from '../types/CubeStickers';

export interface BufferHighlightConfig {
  showEdgeBuffer: boolean;
  showCornerBuffer: boolean;
  edgeBufferColor: string;
  cornerBufferColor: string;
}

export const DEFAULT_BUFFER_CONFIG: BufferHighlightConfig = {
  showEdgeBuffer: true,
  showCornerBuffer: true,
  edgeBufferColor: '#00ffff', // Cyan for edge buffer
  cornerBufferColor: '#ff00ff', // Magenta for corner buffer
};

/**
 * Get the sticker IDs that should be highlighted as buffer pieces
 */
export function getBufferStickers(config: BufferHighlightConfig): {
  stickerIds: string[];
  colorMap: Map<string, string>;
} {
  const stickerIds: string[] = [];
  const colorMap = new Map<string, string>();
  
  if (config.showEdgeBuffer) {
    stickerIds.push(EDGE_BUFFER);
    colorMap.set(EDGE_BUFFER, config.edgeBufferColor);
  }
  
  if (config.showCornerBuffer) {
    stickerIds.push(CORNER_BUFFER);
    colorMap.set(CORNER_BUFFER, config.cornerBufferColor);
  }
  
  return { stickerIds, colorMap };
}

/**
 * Get all stickers related to the UFR corner (for corner buffer visualization)
 */
export function getUFRCornerStickers(): string[] {
  return ['UFR_U', 'UFR_F', 'UFR_R'];
}

/**
 * Get all stickers related to the UF edge (for edge buffer visualization)
 */
export function getUFEdgeStickers(): string[] {
  return ['UF', 'FU'];
}

/**
 * Check if a sticker is a buffer piece
 */
export function isBufferSticker(stickerId: string): { isBuffer: boolean; type?: 'edge' | 'corner' } {
  if (stickerId === EDGE_BUFFER || getUFEdgeStickers().includes(stickerId)) {
    return { isBuffer: true, type: 'edge' };
  }
  
  if (stickerId === CORNER_BUFFER || getUFRCornerStickers().includes(stickerId)) {
    return { isBuffer: true, type: 'corner' };
  }
  
  return { isBuffer: false };
}