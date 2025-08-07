import { describe, it, expect } from 'vitest';
import { createStaticCubeState, getStaticCubeState } from '../cubeState';
import { getStickerPosition, getStickerInfo, isValidStickerId, getAllStickerIds } from '../stickerPositionLookup';
import { Vector3 } from 'three';

describe('Cube State System', () => {
  describe('Static Cube State Creation', () => {
    it('should create a static cube state with all 54 stickers', () => {
      const cubeState = createStaticCubeState();
      
      expect(cubeState.stickers.size).toBe(54);
      expect(cubeState.pieces.size).toBe(26); // 8 corners + 12 edges + 6 centers
    });

    it('should have consistent sticker and piece relationships', () => {
      const cubeState = getStaticCubeState();
      
      // Check that every sticker belongs to a valid piece
      cubeState.stickers.forEach((stickerInfo, stickerId) => {
        expect(cubeState.pieces.has(stickerInfo.pieceId)).toBe(true);
        
        const piece = cubeState.pieces.get(stickerInfo.pieceId)!;
        expect(piece.stickerIds).toContain(stickerId);
      });
    });

    it('should have correct piece counts by type', () => {
      const cubeState = getStaticCubeState();
      
      let centerCount = 0;
      let edgeCount = 0;
      let cornerCount = 0;
      
      cubeState.pieces.forEach(piece => {
        switch (piece.type) {
          case 'center': centerCount++; break;
          case 'edge': edgeCount++; break;
          case 'corner': cornerCount++; break;
        }
      });
      
      expect(centerCount).toBe(6);
      expect(edgeCount).toBe(12);
      expect(cornerCount).toBe(8);
    });
  });

  describe('Sticker Position Lookup', () => {
    it('should return valid positions for all sticker IDs', () => {
      const allStickerIds = getAllStickerIds();
      
      expect(allStickerIds.length).toBe(54);
      
      allStickerIds.forEach(stickerId => {
        const position = getStickerPosition(stickerId);
        expect(position).toBeInstanceOf(Vector3);
        expect(position).not.toBeNull();
      });
    });

    it('should return null for invalid sticker IDs', () => {
      const position = getStickerPosition('INVALID_ID');
      expect(position).toBeNull();
    });

    it('should validate sticker IDs correctly', () => {
      expect(isValidStickerId('U')).toBe(true);
      expect(isValidStickerId('UF')).toBe(true);
      expect(isValidStickerId('UFR_U')).toBe(true);
      expect(isValidStickerId('INVALID')).toBe(false);
    });

    it('should return correct sticker info', () => {
      const stickerInfo = getStickerInfo('UF');
      
      expect(stickerInfo).not.toBeNull();
      expect(stickerInfo!.id).toBe('UF');
      expect(stickerInfo!.face).toBe('U');
      expect(stickerInfo!.type).toBe('edge');
      expect(stickerInfo!.position).toBeInstanceOf(Vector3);
    });

    it('should handle buffer pieces correctly', () => {
      // Test edge buffer (UF)
      const edgeBufferInfo = getStickerInfo('UF');
      expect(edgeBufferInfo).not.toBeNull();
      expect(edgeBufferInfo!.type).toBe('edge');
      
      // Test corner buffer (UFR_U)
      const cornerBufferInfo = getStickerInfo('UFR_U');
      expect(cornerBufferInfo).not.toBeNull();
      expect(cornerBufferInfo!.type).toBe('corner');
    });
  });

  describe('Position Consistency', () => {
    it('should have consistent positions between stickers and ALL_STICKERS', () => {
      const cubeState = getStaticCubeState();
      
      // Test a few key stickers
      const testStickers = ['U', 'UF', 'UFR_U', 'D', 'DF', 'DFR_D'];
      
      testStickers.forEach(stickerId => {
        const stickerInfo = cubeState.stickers.get(stickerId);
        expect(stickerInfo).toBeDefined();
        
        const position = getStickerPosition(stickerId);
        expect(position).not.toBeNull();
        
        // Positions should match
        expect(position!.x).toBeCloseTo(stickerInfo!.position.x);
        expect(position!.y).toBeCloseTo(stickerInfo!.position.y);
        expect(position!.z).toBeCloseTo(stickerInfo!.position.z);
      });
    });
  });
});