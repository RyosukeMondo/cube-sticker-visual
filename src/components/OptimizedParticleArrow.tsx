import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Vector3, 
  BufferGeometry, 
  BufferAttribute, 
  Points, 
  PointsMaterial,
  ArrowHelper,
  Color
} from 'three';

interface OptimizedParticleArrowProps {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  color: string;
  particleCount?: number;
  animationDuration?: number;
  particleSize?: number;
  visible?: boolean;
  showArrowHelper?: boolean;
  arrowHelperLength?: number;
  arrowHelperHeadLength?: number;
  arrowHelperHeadWidth?: number;
  onAnimationComplete?: (id: string) => void;
}

/**
 * Performance-optimized particle arrow using BufferGeometry and efficient animation loops
 * Uses object pooling and optimized update cycles for smooth 60fps performance
 */
export function OptimizedParticleArrow({
  id,
  startPosition,
  endPosition,
  color,
  particleCount = 20,
  animationDuration = 2000,
  particleSize = 0.05,
  visible = true,
  showArrowHelper = true,
  arrowHelperLength,
  arrowHelperHeadLength = 0.2,
  arrowHelperHeadWidth = 0.1,
  onAnimationComplete
}: OptimizedParticleArrowProps) {
  const particlesRef = useRef<Points>(null);
  const arrowHelperRef = useRef<ArrowHelper>(null);
  const animationStateRef = useRef({
    startTime: 0,
    isAnimating: false,
    hasCompleted: false
  });

  // Pre-calculate animation data for performance
  const animationData = useMemo(() => {
    const direction = new Vector3().subVectors(endPosition, startPosition);
    const distance = direction.length();
    const normalizedDirection = direction.normalize();
    
    // Pre-calculate particle positions along the path
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleLifetimes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1);
      const position = new Vector3().lerpVectors(startPosition, endPosition, t);
      
      particlePositions[i * 3] = position.x;
      particlePositions[i * 3 + 1] = position.y;
      particlePositions[i * 3 + 2] = position.z;
      
      // Stagger particle start times for wave effect
      particleLifetimes[i] = t * 0.3; // 30% stagger
    }
    
    return {
      direction: normalizedDirection,
      distance,
      particlePositions,
      particleVelocities,
      particleLifetimes,
      totalDuration: animationDuration / 1000 // Convert to seconds
    };
  }, [startPosition, endPosition, particleCount, animationDuration]);

  // Create optimized geometry and material
  const { geometry, material } = useMemo(() => {
    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(animationData.particlePositions.slice(), 3));
    geom.setAttribute('alpha', new BufferAttribute(new Float32Array(particleCount).fill(0), 1));
    
    const mat = new PointsMaterial({
      color: new Color(color),
      size: particleSize,
      transparent: true,
      opacity: 0.8,
      vertexColors: false,
      sizeAttenuation: true
    });
    
    return { geometry: geom, material: mat };
  }, [color, particleSize, particleCount, animationData.particlePositions]);

  // Create arrow helper
  const arrowHelper = useMemo(() => {
    if (!showArrowHelper) return null;
    
    const direction = animationData.direction;
    const length = arrowHelperLength || animationData.distance;
    
    return new ArrowHelper(
      direction,
      startPosition,
      length,
      color,
      arrowHelperHeadLength,
      arrowHelperHeadWidth
    );
  }, [
    showArrowHelper,
    animationData.direction,
    animationData.distance,
    startPosition,
    color,
    arrowHelperLength,
    arrowHelperHeadLength,
    arrowHelperHeadWidth
  ]);

  // Start animation
  const startAnimation = useCallback(() => {
    animationStateRef.current = {
      startTime: performance.now() / 1000,
      isAnimating: true,
      hasCompleted: false
    };
  }, []);

  // Optimized animation loop using useFrame
  useFrame((state) => {
    if (!visible || !animationStateRef.current.isAnimating || !particlesRef.current) {
      return;
    }

    const currentTime = state.clock.elapsedTime;
    const { startTime } = animationStateRef.current;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationData.totalDuration, 1);

    if (progress >= 1 && !animationStateRef.current.hasCompleted) {
      // Animation completed
      animationStateRef.current.isAnimating = false;
      animationStateRef.current.hasCompleted = true;
      
      if (onAnimationComplete) {
        onAnimationComplete(id);
      }
      return;
    }

    // Update particle positions and alpha values efficiently
    const positions = particlesRef.current.geometry.attributes['position'];
    const alphas = particlesRef.current.geometry.attributes['alpha'];
    
    for (let i = 0; i < particleCount; i++) {
      const particleStartTime = animationData.particleLifetimes[i];
      const particleProgress = Math.max(0, Math.min(1, (progress - particleStartTime) / (1 - particleStartTime)));
      
      if (particleProgress > 0) {
        // Update position along the path
        const currentPos = new Vector3().lerpVectors(startPosition, endPosition, particleProgress);
        positions.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
        
        // Update alpha for fade in/out effect
        const alpha = particleProgress < 0.1 
          ? particleProgress / 0.1 
          : particleProgress > 0.9 
            ? (1 - particleProgress) / 0.1 
            : 1;
        alphas.setX(i, alpha);
      } else {
        alphas.setX(i, 0);
      }
    }
    
    positions.needsUpdate = true;
    alphas.needsUpdate = true;
  });

  // Auto-start animation when visible
  useMemo(() => {
    if (visible && !animationStateRef.current.hasCompleted) {
      startAnimation();
    }
  }, [visible, startAnimation]);

  if (!visible) return null;

  return (
    <group>
      {/* Optimized particle system */}
      <points ref={particlesRef} geometry={geometry} material={material} />
      
      {/* Arrow helper */}
      {arrowHelper && (
        <primitive ref={arrowHelperRef} object={arrowHelper} />
      )}
    </group>
  );
}
