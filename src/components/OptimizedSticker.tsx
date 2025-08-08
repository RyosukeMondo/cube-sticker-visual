import { useRef, useMemo } from 'react';
import { InstancedMesh, Object3D, BoxGeometry, MeshStandardMaterial, Color, Shape, ExtrudeGeometry, EdgesGeometry, LineBasicMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { type StickerState } from '../types/CubeColors';
import { isBufferSticker } from '../utils/bufferHighlighting';

interface StickerControlSettings {
  size: number;           // Sticker size (0.1 - 0.8)
  spacing: number;        // Distance between stickers (0.0 - 3.0)
  thickness: number;      // Sticker thickness (0.01 - 0.1)
  transparency: number;   // Transparency level (0.0 - 1.0)
  chamfer: number;        // Chamfer/bevel amount (0.0 - 0.1)
  showEdges: boolean;     // Show edge lines on stickers
  edgeThickness: number;  // Edge line thickness (1.0 - 5.0)
  edgeColor: string;      // Edge line color (hex)
}

interface OptimizedStickerProps {
  stickers: Array<{
    sticker: StickerState;
    position: [number, number, number];
    rotation: [number, number, number];
    size: number;
  }>;
  controls: StickerControlSettings;
}

/**
 * Rebuilt OptimizedSticker component with structured controls
 * Supports dynamic adjustment of size, spacing, thickness, and transparency
 */
export function OptimizedSticker({ stickers, controls }: OptimizedStickerProps) {
  const mainMeshRef = useRef<InstancedMesh>(null);
  const bufferBorderMeshRef = useRef<InstancedMesh>(null);
  
  // Create chamfered sticker shape
  const createChamferedShape = useMemo(() => {
    return (size: number, chamferAmount: number) => {
      if (chamferAmount === 0) {
        // No chamfer - use regular box geometry
        return new BoxGeometry(size, size, controls.thickness);
      }
      
      // Create rounded rectangle shape for chamfered edges
      const shape = new Shape();
      const halfSize = size / 2;
      const chamfer = Math.min(chamferAmount, halfSize * 0.4); // Limit chamfer to reasonable size
      
      // Start from bottom-left, going clockwise
      shape.moveTo(-halfSize + chamfer, -halfSize);
      shape.lineTo(halfSize - chamfer, -halfSize);
      shape.quadraticCurveTo(halfSize, -halfSize, halfSize, -halfSize + chamfer);
      shape.lineTo(halfSize, halfSize - chamfer);
      shape.quadraticCurveTo(halfSize, halfSize, halfSize - chamfer, halfSize);
      shape.lineTo(-halfSize + chamfer, halfSize);
      shape.quadraticCurveTo(-halfSize, halfSize, -halfSize, halfSize - chamfer);
      shape.lineTo(-halfSize, -halfSize + chamfer);
      shape.quadraticCurveTo(-halfSize, -halfSize, -halfSize + chamfer, -halfSize);
      
      // Extrude the shape to create 3D geometry
      const extrudeSettings = {
        depth: controls.thickness,
        bevelEnabled: false
      };
      
      return new ExtrudeGeometry(shape, extrudeSettings);
    };
  }, [controls.thickness]);
  
  // Calculate derived values from controls
  const stickerDimensions = useMemo(() => ({
    size: controls.size,
    thickness: controls.thickness,
    chamfer: controls.chamfer,
    borderSize: controls.size + 0.02, // Slightly larger for border
    borderThickness: controls.thickness * 0.8, // Slightly thinner border
    borderChamfer: controls.chamfer * 1.2 // Slightly more chamfer for border
  }), [controls.size, controls.thickness, controls.chamfer]);
  
  // Create geometries based on control settings
  const geometries = useMemo(() => {
    const mainGeometry = createChamferedShape(stickerDimensions.size, stickerDimensions.chamfer);
    const borderGeometry = createChamferedShape(stickerDimensions.borderSize, stickerDimensions.borderChamfer);
    
    return {
      main: mainGeometry,
      border: borderGeometry,
      mainEdges: controls.showEdges ? new EdgesGeometry(mainGeometry) : null,
      borderEdges: controls.showEdges ? new EdgesGeometry(borderGeometry) : null
    };
  }, [createChamferedShape, stickerDimensions, controls.showEdges]);
  
  // Create materials with transparency support
  const materials = useMemo(() => ({
    standard: new MeshStandardMaterial({ 
      transparent: controls.transparency < 1.0,
      opacity: controls.transparency
    }),
    highlighted: new MeshStandardMaterial({ 
      transparent: controls.transparency < 1.0,
      opacity: controls.transparency
    }),
    buffer: new MeshStandardMaterial({ 
      transparent: controls.transparency < 1.0,
      opacity: controls.transparency
    }),
    bufferBorder: new MeshStandardMaterial({ 
      color: '#000000',
      transparent: true,
      opacity: Math.min(0.4, controls.transparency * 0.6)
    }),
    edges: new LineBasicMaterial({
      color: controls.edgeColor,
      linewidth: controls.edgeThickness,
      transparent: controls.transparency < 1.0,
      opacity: controls.transparency
    }),
    borderEdges: new LineBasicMaterial({
      color: controls.edgeColor,
      linewidth: controls.edgeThickness * 0.8, // Slightly thinner for borders
      transparent: true,
      opacity: Math.min(0.6, controls.transparency * 0.8)
    })
  }), [controls.transparency, controls.edgeColor, controls.edgeThickness]);
  
  // Calculate adjusted positions based on spacing
  const adjustedStickers = useMemo(() => {
    return stickers.map(item => {
      const { position } = item;
      
      if (controls.spacing === 0) {
        // No spacing adjustment needed
        return {
          ...item,
          adjustedPosition: position
        };
      }
      
      // Determine which face this sticker belongs to based on position
      const [x, y, z] = position;
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      const absZ = Math.abs(z);
      
      let adjustedPosition: [number, number, number] = [x, y, z];
      
      // Apply spacing based on face orientation
      if (absZ > absX && absZ > absY) {
        // Front/Back face (Z is dominant) - adjust X and Y relative to face center
        adjustedPosition = [
          x * (1 + controls.spacing * 0.5), // Scale X away from face center
          y * (1 + controls.spacing * 0.5), // Scale Y away from face center
          z // Keep Z position (distance from cube center)
        ];
      } else if (absX > absY) {
        // Left/Right face (X is dominant) - adjust Y and Z relative to face center
        adjustedPosition = [
          x, // Keep X position (distance from cube center)
          y * (1 + controls.spacing * 0.5), // Scale Y away from face center
          z * (1 + controls.spacing * 0.5)  // Scale Z away from face center
        ];
      } else {
        // Top/Bottom face (Y is dominant) - adjust X and Z relative to face center
        adjustedPosition = [
          x * (1 + controls.spacing * 0.5), // Scale X away from face center
          y, // Keep Y position (distance from cube center)
          z * (1 + controls.spacing * 0.5)  // Scale Z away from face center
        ];
      }
      
      return {
        ...item,
        adjustedPosition
      };
    });
  }, [stickers, controls.spacing]);
  
  // Group stickers by type for efficient rendering
  const stickerGroups = useMemo(() => {
    const groups = {
      standard: [] as typeof adjustedStickers,
      highlighted: [] as typeof adjustedStickers,
      buffer: [] as typeof adjustedStickers,
      bufferBorders: [] as typeof adjustedStickers
    };
    
    adjustedStickers.forEach(item => {
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
  }, [adjustedStickers]);
  
  // Reusable objects for performance
  const dummy = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);
  
  // Update instance matrices and colors
  useFrame(() => {
    // Update main stickers
    if (mainMeshRef.current) {
      let instanceIndex = 0;
      
      // Process non-border groups
      ['standard', 'highlighted', 'buffer'].forEach(groupType => {
        const groupStickers = stickerGroups[groupType as keyof typeof stickerGroups];
        
        groupStickers.forEach((item) => {
          const { sticker, rotation, adjustedPosition } = item;
          
          // Set position and rotation
          dummy.position.set(...adjustedPosition);
          dummy.rotation.set(...rotation);
          dummy.updateMatrix();
          mainMeshRef.current!.setMatrixAt(instanceIndex, dummy.matrix);
          
          // Set color with transparency
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
        const { rotation, adjustedPosition } = item;
        
        // Position border slightly forward for layering
        const borderPosition: [number, number, number] = [
          adjustedPosition[0],
          adjustedPosition[1],
          adjustedPosition[2] + (adjustedPosition[2] > 0 ? 0.001 : -0.001)
        ];
        
        dummy.position.set(...borderPosition);
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
      {/* Main stickers */}
      {totalMainStickers > 0 && (
        <instancedMesh
          ref={mainMeshRef}
          args={[geometries.main, materials.standard, totalMainStickers]}
          frustumCulled={true}
        />
      )}
      
      {/* Buffer borders */}
      {totalBufferBorders > 0 && (
        <instancedMesh
          ref={bufferBorderMeshRef}
          args={[geometries.border, materials.bufferBorder, totalBufferBorders]}
          frustumCulled={true}
        />
      )}
      
      {/* Main sticker edges */}
      {controls.showEdges && geometries.mainEdges && adjustedStickers.map((item) => {
        const bufferInfo = isBufferSticker(item.sticker.id);
        if (bufferInfo.isBuffer) return null; // Skip buffer stickers, they have their own edges
        
        return (
          <lineSegments
            key={`edge-${item.sticker.id}`}
            position={item.adjustedPosition}
            rotation={item.rotation}
            geometry={geometries.mainEdges!}
            material={materials.edges}
          />
        );
      })}
      
      {/* Buffer border edges */}
      {controls.showEdges && geometries.borderEdges && stickerGroups.bufferBorders.map((item) => (
        <lineSegments
          key={`border-edge-${item.sticker.id}`}
          position={[
            item.adjustedPosition[0],
            item.adjustedPosition[1],
            item.adjustedPosition[2] + (item.adjustedPosition[2] > 0 ? 0.0015 : -0.0015)
          ]}
          rotation={item.rotation}
          geometry={geometries.borderEdges!}
          material={materials.borderEdges}
        />
      ))}
    </group>
  );
}
