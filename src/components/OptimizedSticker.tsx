import { useRef, useMemo } from 'react';
import { InstancedMesh, Object3D, BoxGeometry, MeshStandardMaterial, Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { type StickerState } from '../types/CubeColors';
import { isBufferSticker } from '../utils/bufferHighlighting';

interface OptimizedStickerProps {
  stickers: Array<{
    sticker: StickerState;
    position: [number, number, number];
    rotation: [number, number, number];
    size: number;
  }>;
  stickerSize?: number; // Dynamic sticker size
}

/**
 * Optimized sticker component using geometry instancing and material sharing
 * Groups stickers by material properties to minimize draw calls
 */
export function OptimizedSticker({ stickers, stickerSize = 0.45 }: OptimizedStickerProps) {
  const mainMeshRef = useRef<InstancedMesh>(null);
  const bufferBorderMeshRef = useRef<InstancedMesh>(null);
  
  // Shared geometries (created once, reused for all instances)
  // Made stickers as thin 3D cubes (rectangular prisms) for better realism
  const mainGeometry = useMemo(() => new BoxGeometry(stickerSize, stickerSize, 0.05), [stickerSize]); // Thin cube: width, height, depth
  const borderGeometry = useMemo(() => new BoxGeometry(stickerSize + 0.05, stickerSize + 0.05, 0.04), [stickerSize]); // Slightly larger border
  
  // Shared materials for different sticker types
  const materials = useMemo(() => ({
    standard: new MeshStandardMaterial({ transparent: true }),
    highlighted: new MeshStandardMaterial({ transparent: true }),
    buffer: new MeshStandardMaterial({ transparent: true }),
    bufferBorder: new MeshStandardMaterial({ 
      color: '#000000', 
      transparent: true, 
      opacity: 0.3 
    })
  }), []);
  
  // Group stickers by material type for efficient rendering
  const stickerGroups = useMemo(() => {
    const groups = {
      standard: [] as typeof stickers,
      highlighted: [] as typeof stickers,
      buffer: [] as typeof stickers,
      bufferBorders: [] as typeof stickers
    };
    
    stickers.forEach(item => {
      const bufferInfo = isBufferSticker(item.sticker.id);
      
      if (bufferInfo.isBuffer) {
        groups.buffer.push(item);
        groups.bufferBorders.push(item);
      } else if (item.sticker.highlighted) {
        groups.highlighted.push(item);
      } else {
        groups.standard.push(item);
      }
    });
    
    return groups;
  }, [stickers]);
  
  const dummy = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);
  
  // Update instance matrices and colors
  useFrame(() => {
    // Update main stickers
    if (mainMeshRef.current) {
      let instanceIndex = 0;
      
      // Process each group
      Object.entries(stickerGroups).forEach(([groupType, groupStickers]) => {
        if (groupType === 'bufferBorders') return; // Skip buffer borders for main mesh
        
        groupStickers.forEach((item) => {
          const { sticker, position, rotation } = item;
          
          // Set position and rotation
          dummy.position.set(...position);
          dummy.rotation.set(...rotation);
          dummy.updateMatrix();
          mainMeshRef.current!.setMatrixAt(instanceIndex, dummy.matrix);
          
          // Set color
          const displayColor = sticker.highlighted && sticker.highlightColor 
            ? sticker.highlightColor 
            : sticker.color;
          tempColor.set(displayColor);
          mainMeshRef.current!.setColorAt(instanceIndex, tempColor);
          
          instanceIndex++;
        });
      });
      
      mainMeshRef.current.instanceMatrix.needsUpdate = true;
      if (mainMeshRef.current.instanceColor) {
        mainMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
    
    // Update buffer borders
    if (bufferBorderMeshRef.current && stickerGroups.bufferBorders.length > 0) {
      stickerGroups.bufferBorders.forEach((item, index) => {
        const { position, rotation } = item;
        
        dummy.position.set(position[0], position[1], position[2] + 0.001);
        dummy.rotation.set(...rotation);
        dummy.updateMatrix();
        bufferBorderMeshRef.current!.setMatrixAt(index, dummy.matrix);
      });
      
      bufferBorderMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  const totalMainStickers = stickers.length - stickerGroups.bufferBorders.length;
  const totalBufferBorders = stickerGroups.bufferBorders.length;
  
  return (
    <group>
      {/* Main stickers (all non-buffer-border stickers) */}
      {totalMainStickers > 0 && (
        <instancedMesh
          ref={mainMeshRef}
          args={[mainGeometry, materials.standard, totalMainStickers]}
          frustumCulled={true}
        />
      )}
      
      {/* Buffer borders */}
      {totalBufferBorders > 0 && (
        <instancedMesh
          ref={bufferBorderMeshRef}
          args={[borderGeometry, materials.bufferBorder, totalBufferBorders]}
          frustumCulled={true}
        />
      )}
    </group>
  );
}
