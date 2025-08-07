import { Vector3, Euler } from 'three';
import type { FaceType } from './CubeStickers';

export interface CubeState {
  pieces: CubePiece[];
  highlightedStickers: string[];
  arrows: Arrow[];
}

export interface CubePiece {
  id: string;
  position: Vector3;
  rotation: Euler;
  stickers: Sticker[];
}

export interface Sticker {
  id: string;
  color: string;
  face: FaceType;
  highlighted: boolean;
  position: Vector3;
}

export interface Arrow {
  id: string;
  start: Vector3;
  end: Vector3;
  color: string;
  visible: boolean;
}

// Static cube state - represents the solved state with fixed positions
export interface StaticCubeState {
  stickers: Map<string, StickerInfo>;
  pieces: Map<string, PieceInfo>;
}

export interface StickerInfo {
  id: string;
  face: FaceType;
  type: 'edge' | 'corner' | 'center';
  position: Vector3;
  pieceId: string; // Which piece this sticker belongs to
}

export interface PieceInfo {
  id: string;
  type: 'edge' | 'corner' | 'center';
  position: Vector3;
  rotation: Euler;
  stickerIds: string[]; // All stickers on this piece
}