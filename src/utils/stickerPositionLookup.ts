import { Vector3 } from 'three';
import { getStaticCubeState } from './cubeState';
import type { StickerInfo, PieceInfo } from '../types/CubeState';
import type { FaceType } from '../types/CubeStickers';

/**
 * Gets the 3D coordinates for a specific sticker ID
 * @param stickerId - The unique identifier for the sticker
 * @returns Vector3 position or null if sticker not found
 */
export function getStickerPosition(stickerId: string): Vector3 | null {
  const cubeState = getStaticCubeState();
  const stickerInfo = cubeState.stickers.get(stickerId);
  
  if (!stickerInfo) {
    console.warn(`Sticker with ID "${stickerId}" not found`);
    return null;
  }
  
  return stickerInfo.position.clone();
}

/**
 * Gets detailed information about a sticker including position, face, and type
 * @param stickerId - The unique identifier for the sticker
 * @returns StickerInfo object or null if not found
 */
export function getStickerInfo(stickerId: string): StickerInfo | null {
  const cubeState = getStaticCubeState();
  const stickerInfo = cubeState.stickers.get(stickerId);
  
  if (!stickerInfo) {
    console.warn(`Sticker with ID "${stickerId}" not found`);
    return null;
  }
  
  return { ...stickerInfo, position: stickerInfo.position.clone() };
}

/**
 * Gets all stickers belonging to a specific face
 * @param face - The face identifier (U, D, F, B, L, R)
 * @returns Array of StickerInfo objects for that face
 */
export function getStickersOnFace(face: FaceType): StickerInfo[] {
  const cubeState = getStaticCubeState();
  const stickers: StickerInfo[] = [];
  
  cubeState.stickers.forEach(stickerInfo => {
    if (stickerInfo.face === face) {
      stickers.push({ ...stickerInfo, position: stickerInfo.position.clone() });
    }
  });
  
  return stickers;
}

/**
 * Gets all stickers of a specific type (edge, corner, center)
 * @param type - The sticker type
 * @returns Array of StickerInfo objects of that type
 */
export function getStickersByType(type: 'edge' | 'corner' | 'center'): StickerInfo[] {
  const cubeState = getStaticCubeState();
  const stickers: StickerInfo[] = [];
  
  cubeState.stickers.forEach(stickerInfo => {
    if (stickerInfo.type === type) {
      stickers.push({ ...stickerInfo, position: stickerInfo.position.clone() });
    }
  });
  
  return stickers;
}

/**
 * Gets the piece information for a given piece ID
 * @param pieceId - The unique identifier for the piece
 * @returns PieceInfo object or null if not found
 */
export function getPieceInfo(pieceId: string): PieceInfo | null {
  const cubeState = getStaticCubeState();
  const pieceInfo = cubeState.pieces.get(pieceId);
  
  if (!pieceInfo) {
    console.warn(`Piece with ID "${pieceId}" not found`);
    return null;
  }
  
  return { 
    ...pieceInfo, 
    position: pieceInfo.position.clone(),
    rotation: pieceInfo.rotation.clone()
  };
}

/**
 * Gets all stickers belonging to a specific piece
 * @param pieceId - The unique identifier for the piece
 * @returns Array of StickerInfo objects for that piece
 */
export function getStickersOnPiece(pieceId: string): StickerInfo[] {
  const cubeState = getStaticCubeState();
  const pieceInfo = cubeState.pieces.get(pieceId);
  
  if (!pieceInfo) {
    console.warn(`Piece with ID "${pieceId}" not found`);
    return [];
  }
  
  const stickers: StickerInfo[] = [];
  pieceInfo.stickerIds.forEach(stickerId => {
    const stickerInfo = cubeState.stickers.get(stickerId);
    if (stickerInfo) {
      stickers.push({ ...stickerInfo, position: stickerInfo.position.clone() });
    }
  });
  
  return stickers;
}

/**
 * Gets the piece ID that contains a specific sticker
 * @param stickerId - The unique identifier for the sticker
 * @returns Piece ID string or null if sticker not found
 */
export function getPieceIdFromSticker(stickerId: string): string | null {
  const cubeState = getStaticCubeState();
  const stickerInfo = cubeState.stickers.get(stickerId);
  
  if (!stickerInfo) {
    console.warn(`Sticker with ID "${stickerId}" not found`);
    return null;
  }
  
  return stickerInfo.pieceId;
}

/**
 * Validates that a sticker ID exists in the cube state
 * @param stickerId - The sticker ID to validate
 * @returns True if sticker exists, false otherwise
 */
export function isValidStickerId(stickerId: string): boolean {
  const cubeState = getStaticCubeState();
  return cubeState.stickers.has(stickerId);
}

/**
 * Gets all sticker IDs in the cube
 * @returns Array of all sticker ID strings
 */
export function getAllStickerIds(): string[] {
  const cubeState = getStaticCubeState();
  return Array.from(cubeState.stickers.keys());
}

/**
 * Gets all piece IDs in the cube
 * @returns Array of all piece ID strings
 */
export function getAllPieceIds(): string[] {
  const cubeState = getStaticCubeState();
  return Array.from(cubeState.pieces.keys());
}

/**
 * Calculates the distance between two stickers
 * @param stickerId1 - First sticker ID
 * @param stickerId2 - Second sticker ID
 * @returns Distance between stickers or null if either sticker not found
 */
export function getDistanceBetweenStickers(stickerId1: string, stickerId2: string): number | null {
  const pos1 = getStickerPosition(stickerId1);
  const pos2 = getStickerPosition(stickerId2);
  
  if (!pos1 || !pos2) {
    return null;
  }
  
  return pos1.distanceTo(pos2);
}

/**
 * Gets stickers within a certain distance of a target sticker
 * @param targetStickerId - The target sticker ID
 * @param maxDistance - Maximum distance to search
 * @returns Array of nearby sticker IDs with their distances
 */
export function getNearbyStickers(targetStickerId: string, maxDistance: number): Array<{id: string, distance: number}> {
  const targetPos = getStickerPosition(targetStickerId);
  if (!targetPos) {
    return [];
  }
  
  const cubeState = getStaticCubeState();
  const nearbyStickers: Array<{id: string, distance: number}> = [];
  
  cubeState.stickers.forEach((stickerInfo, stickerId) => {
    if (stickerId === targetStickerId) return; // Skip the target sticker itself
    
    const distance = targetPos.distanceTo(stickerInfo.position);
    if (distance <= maxDistance) {
      nearbyStickers.push({ id: stickerId, distance });
    }
  });
  
  // Sort by distance
  nearbyStickers.sort((a, b) => a.distance - b.distance);
  
  return nearbyStickers;
}