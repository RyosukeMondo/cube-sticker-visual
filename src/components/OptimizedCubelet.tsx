import { useRef, useMemo } from 'react';
import { InstancedMesh, Object3D, BoxGeometry, MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

interface OptimizedCubeletProps {
  positions: [number, number, number][];
}

/**
 * Optimized cubelet component using geometry instancing
 * Renders all 27 cubelets with a single draw call
 */
export function OptimizedCubelet({ positions }: OptimizedCubeletProps) {
  const meshRef = useRef<InstancedMesh>(null);
  
  // Shared geometry and material (created once, reused for all instances)
  const geometry = useMemo(() => new BoxGeometry(0.95, 0.95, 0.95), []);
  const material = useMemo(() => new MeshStandardMaterial({ 
    color: '#000000',
    // Make cubelets completely invisible - no black plastic visible
    transparent: true,
    opacity: 0.0,
    visible: false,
    alphaTest: 0.1
  }), []);
  
  // Set up instance positions once
  const dummy = useMemo(() => new Object3D(), []);
  
  // Initialize instance positions (only once)
  useFrame(() => {
    if (!meshRef.current || meshRef.current.instanceMatrix.needsUpdate === false) return;
    
    positions.forEach((position, i) => {
      dummy.position.set(position[0], position[1], position[2]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, positions.length]}
      frustumCulled={true}
    />
  );
}
