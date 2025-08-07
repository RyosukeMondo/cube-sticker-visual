export interface StickerMapping {
  source: string; // Source sticker ID
  target: string; // Target sticker ID
  cyclePosition?: number; // Position in the 3-cycle (0, 1, or 2)
}

export interface Algorithm {
  id: string;
  type: 'edge' | 'corner';
  notation: string; // Japanese notation from CSV
  stickerMappings: StickerMapping[]; // Direct source->target mappings
  description?: string;
  bufferPieces: string[]; // UF for edges, UFR for corners
}

export interface AlgorithmData {
  algorithms: Algorithm[];
  edgeCount: number;
  cornerCount: number;
}