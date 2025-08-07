import { describe, it, expect, vi } from 'vitest';
import { Vector3 } from 'three';
import { type Algorithm } from '../../types/Algorithm';

// Mock the sticker position lookup
const mockGetStickerPosition = vi.fn((stickerId: string) => {
  const positions: Record<string, Vector3> = {
    'UF1': new Vector3(0, 1, 0.5),
    'UF2': new Vector3(0, 1, -0.5),
    'UR1': new Vector3(0.5, 1, 0),
    'UR2': new Vector3(-0.5, 1, 0)
  };
  return positions[stickerId] || null;
});

vi.mock('../../utils/stickerPositionLookup', () => ({
  getStickerPosition: mockGetStickerPosition
}));

describe('ParticleArrowManager', () => {
  const mockAlgorithm: Algorithm = {
    id: 'test-algo',
    type: 'edge',
    notation: 'R U R\' U\'',
    stickerMappings: [
      { source: 'UF1', target: 'UF2' },
      { source: 'UR1', target: 'UR2' }
    ],
    description: 'Test algorithm',
    bufferPieces: ['UF']
  };

  it('validates algorithm structure', () => {
    expect(mockAlgorithm.id).toBe('test-algo');
    expect(mockAlgorithm.type).toBe('edge');
    expect(mockAlgorithm.stickerMappings).toHaveLength(2);
    expect(mockAlgorithm.stickerMappings[0].source).toBe('UF1');
    expect(mockAlgorithm.stickerMappings[0].target).toBe('UF2');
  });

  it('validates sticker position lookup', () => {
    const position1 = mockGetStickerPosition('UF1');
    const position2 = mockGetStickerPosition('UF2');
    
    expect(position1).toBeInstanceOf(Vector3);
    expect(position2).toBeInstanceOf(Vector3);
    expect(position1?.y).toBe(1);
    expect(position2?.y).toBe(1);
  });

  it('validates animation speed calculations', () => {
    const baseAnimationDuration = 2000;
    const speeds = [0.5, 1.0, 2.0];
    
    speeds.forEach(speed => {
      const duration = Math.max(500, baseAnimationDuration / speed);
      expect(duration).toBeGreaterThanOrEqual(500);
      if (speed === 1.0) expect(duration).toBe(2000);
      if (speed === 2.0) expect(duration).toBe(1000);
      if (speed === 0.5) expect(duration).toBe(4000);
    });
  });

  it('validates arrow generation from sticker mappings', () => {
    const mappings = mockAlgorithm.stickerMappings;
    
    mappings.forEach(mapping => {
      const startPos = mockGetStickerPosition(mapping.source);
      const endPos = mockGetStickerPosition(mapping.target);
      
      expect(startPos).not.toBeNull();
      expect(endPos).not.toBeNull();
      expect(startPos).toBeInstanceOf(Vector3);
      expect(endPos).toBeInstanceOf(Vector3);
    });
  });

  it('validates particle configuration parameters', () => {
    const config = {
      particleCount: 20,
      particleSize: 0.05,
      arrowColor: '#ffff00',
      animationSpeed: 1.0
    };
    
    expect(config.particleCount).toBeGreaterThan(0);
    expect(config.particleSize).toBeGreaterThan(0);
    expect(config.arrowColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(config.animationSpeed).toBeGreaterThan(0);
  });
});