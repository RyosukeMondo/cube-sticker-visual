import type { StickerMapping } from '../types/Algorithm';
import { getStickerById, EDGE_BUFFER, CORNER_BUFFER } from '../types/CubeStickers';

/**
 * Get the 3D position of a sticker by its ID
 */
export function getStickerPosition(stickerId: string): [number, number, number] {
  const sticker = getStickerById(stickerId);
  if (!sticker) {
    console.warn(`Sticker not found: ${stickerId}`);
    return [0, 0, 0];
  }
  return sticker.position;
}

/**
 * Get all source stickers from a set of mappings
 */
export function getSourceStickers(mappings: StickerMapping[]): string[] {
  return mappings.map(mapping => mapping.source);
}

/**
 * Get all target stickers from a set of mappings
 */
export function getTargetStickers(mappings: StickerMapping[]): string[] {
  return mappings.map(mapping => mapping.target);
}

/**
 * Get all unique stickers involved in the mappings (both source and target)
 */
export function getInvolvedStickers(mappings: StickerMapping[]): string[] {
  const stickers = new Set<string>();
  mappings.forEach(mapping => {
    stickers.add(mapping.source);
    stickers.add(mapping.target);
  });
  return Array.from(stickers);
}

/**
 * Check if a sticker is a buffer piece
 */
export function isBufferSticker(stickerId: string): boolean {
  return stickerId === EDGE_BUFFER || stickerId === CORNER_BUFFER;
}

/**
 * Get the buffer sticker for a given piece type
 */
export function getBufferSticker(pieceType: 'edge' | 'corner'): string {
  return pieceType === 'edge' ? EDGE_BUFFER : CORNER_BUFFER;
}

/**
 * Validate that sticker mappings form a proper 3-cycle
 */
export function validate3Cycle(mappings: StickerMapping[]): boolean {
  if (mappings.length !== 3) {
    return false;
  }

  // Check that each target appears as a source exactly once
  const sources = getSourceStickers(mappings);
  const targets = getTargetStickers(mappings);
  
  // Sort both arrays to compare
  const sortedSources = [...sources].sort();
  const sortedTargets = [...targets].sort();
  
  return JSON.stringify(sortedSources) === JSON.stringify(sortedTargets);
}

/**
 * Get the cycle order of stickers (which sticker comes after which in the cycle)
 */
export function getCycleOrder(mappings: StickerMapping[]): string[] {
  if (!validate3Cycle(mappings)) {
    console.warn('Invalid 3-cycle mappings');
    return [];
  }

  // Start with the first mapping and follow the cycle
  const cycleOrder: string[] = [];
  let currentSticker = mappings[0].source;
  
  for (let i = 0; i < 3; i++) {
    cycleOrder.push(currentSticker);
    const nextMapping = mappings.find(m => m.source === currentSticker);
    if (!nextMapping) break;
    currentSticker = nextMapping.target;
  }
  
  return cycleOrder;
}

/**
 * Get arrow paths for visualization (from source position to target position)
 */
export function getArrowPaths(mappings: StickerMapping[]): Array<{
  from: [number, number, number];
  to: [number, number, number];
  cyclePosition: number;
}> {
  return mappings.map(mapping => ({
    from: getStickerPosition(mapping.source),
    to: getStickerPosition(mapping.target),
    cyclePosition: mapping.cyclePosition || 0
  }));
}