import { describe, it, expect } from 'vitest'
import { ALGORITHM_DATA } from '../data/algorithms'

const algorithms = ALGORITHM_DATA.algorithms

describe('Algorithm Data Verification', () => {
  it('should have the correct total number of algorithms', () => {
    expect(algorithms.length).toBe(780)
  })

  it('should have the correct number of edge algorithms', () => {
    const edgeAlgorithms = algorithms.filter(algo => algo.type === 'edge')
    expect(edgeAlgorithms.length).toBe(420)
  })

  it('should have the correct number of corner algorithms', () => {
    const cornerAlgorithms = algorithms.filter(algo => algo.type === 'corner')
    expect(cornerAlgorithms.length).toBe(360)
  })

  it('should have valid algorithm structure', () => {
    algorithms.forEach(algo => {
      expect(algo).toHaveProperty('id')
      expect(algo).toHaveProperty('type')
      expect(algo).toHaveProperty('notation')
      expect(algo).toHaveProperty('stickerMappings')
      
      expect(typeof algo.id).toBe('string')
      expect(['edge', 'corner']).toContain(algo.type)
      expect(typeof algo.notation).toBe('string')
      expect(Array.isArray(algo.stickerMappings)).toBe(true)
    })
  })

  it('should have valid sticker mappings', () => {
    algorithms.forEach(algo => {
      algo.stickerMappings.forEach(mapping => {
        expect(mapping).toHaveProperty('source')
        expect(mapping).toHaveProperty('target')
        expect(typeof mapping.source).toBe('string')
        expect(typeof mapping.target).toBe('string')
        expect(mapping.source.length).toBeGreaterThan(0)
        expect(mapping.target.length).toBeGreaterThan(0)
      })
    })
  })

  it('should have non-empty notations', () => {
    algorithms.forEach(algo => {
      expect(algo.notation.trim().length).toBeGreaterThan(0)
    })
  })

  it('should have unique algorithm IDs', () => {
    const ids = algorithms.map(algo => algo.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(algorithms.length)
  })

  it('should have algorithms with sticker mappings', () => {
    algorithms.forEach(algo => {
      expect(algo.stickerMappings.length).toBeGreaterThan(0)
    })
  })

  it('should have valid sticker ID format', () => {
    // Sticker IDs should follow a consistent format
    algorithms.forEach(algo => {
      algo.stickerMappings.forEach(mapping => {
        // Sticker IDs should be at least 2 characters
        expect(mapping.source.length).toBeGreaterThanOrEqual(2)
        expect(mapping.target.length).toBeGreaterThanOrEqual(2)
        
        // Should start with a valid face letter
        expect(['U', 'D', 'F', 'B', 'L', 'R']).toContain(mapping.source[0])
        expect(['U', 'D', 'F', 'B', 'L', 'R']).toContain(mapping.target[0])
        
        // Corner stickers may have format like "UFR_U" (piece_face)
        if (mapping.source.includes('_')) {
          const [piece, face] = mapping.source.split('_')
          expect(piece.length).toBeGreaterThanOrEqual(2)
          expect(['U', 'D', 'F', 'B', 'L', 'R']).toContain(face)
        }
        
        if (mapping.target.includes('_')) {
          const [piece, face] = mapping.target.split('_')
          expect(piece.length).toBeGreaterThanOrEqual(2)
          expect(['U', 'D', 'F', 'B', 'L', 'R']).toContain(face)
        }
      })
    })
  })
})