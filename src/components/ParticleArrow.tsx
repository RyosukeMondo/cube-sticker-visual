import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, BufferAttribute, Points, PointsMaterial, Color, ArrowHelper, Group } from 'three';
import * as TWEEN from '@tweenjs/tween.js';

interface ParticleArrowProps {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  color?: string;
  particleCount?: number;
  animationDuration?: number; // in milliseconds
  particleSize?: number;
  visible?: boolean;
  showArrowHelper?: boolean; // Whether to show THREE.ArrowHelper
  arrowHelperLength?: number | undefined; // Length of the arrow helper
  arrowHelperHeadLength?: number | undefined; // Head length of arrow helper
  arrowHelperHeadWidth?: number | undefined; // Head width of arrow helper
  onAnimationComplete?: ((id: string) => void) | undefined;
}

export function ParticleArrow({
  id,
  startPosition,
  endPosition,
  color = '#ffff00',
  particleCount = 20,
  animationDuration = 2000,
  particleSize = 0.05,
  visible = true,
  showArrowHelper = true,
  arrowHelperLength,
  arrowHelperHeadLength = 0.2,
  arrowHelperHeadWidth = 0.1,
  onAnimationComplete
}: ParticleArrowProps) {
  const pointsRef = useRef<Points>(null);
  const arrowGroupRef = useRef<Group>(null);
  const arrowHelperRef = useRef<ArrowHelper | null>(null);
  const tweenRef = useRef<TWEEN.Tween<{ progress: number }> | null>(null);
  const animationStateRef = useRef({ progress: 0, isAnimating: false });

  // Create particle geometry and positions
  const { geometry, initialPositions } = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPos = new Float32Array(particleCount * 3);

    // Initialize all particles at the start position
    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;
      positions[index] = startPosition.x;
      positions[index + 1] = startPosition.y;
      positions[index + 2] = startPosition.z;
      
      initialPos[index] = startPosition.x;
      initialPos[index + 1] = startPosition.y;
      initialPos[index + 2] = startPosition.z;
    }

    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return { geometry: geo, initialPositions: initialPos };
  }, [startPosition, endPosition, particleCount]);

  // Create material
  const material = useMemo(() => {
    return new PointsMaterial({
      color: new Color(color),
      size: particleSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });
  }, [color, particleSize]);

  // Create ArrowHelper
  const arrowHelper = useMemo(() => {
    if (!showArrowHelper) return null;

    const direction = new Vector3().subVectors(endPosition, startPosition).normalize();
    const length = arrowHelperLength || startPosition.distanceTo(endPosition);
    const arrowColor = new Color(color);

    const arrow = new ArrowHelper(
      direction,
      startPosition,
      length,
      arrowColor,
      arrowHelperHeadLength,
      arrowHelperHeadWidth
    );

    // Make arrow slightly transparent
    if (arrow.line.material) {
      (arrow.line.material as any).transparent = true;
      (arrow.line.material as any).opacity = 0.7;
    }
    if (arrow.cone.material) {
      (arrow.cone.material as any).transparent = true;
      (arrow.cone.material as any).opacity = 0.7;
    }

    return arrow;
  }, [startPosition, endPosition, color, showArrowHelper, arrowHelperLength, arrowHelperHeadLength, arrowHelperHeadWidth]);

  // Animation function
  const startAnimation = () => {
    if (tweenRef.current) {
      tweenRef.current.stop();
    }

    animationStateRef.current.isAnimating = true;
    animationStateRef.current.progress = 0;

    const animationState = { progress: 0 };

    tweenRef.current = new TWEEN.Tween(animationState)
      .to({ progress: 1 }, animationDuration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        animationStateRef.current.progress = animationState.progress;
        updateParticlePositions(animationState.progress);
      })
      .onComplete(() => {
        animationStateRef.current.isAnimating = false;
        if (onAnimationComplete) {
          onAnimationComplete(id);
        }
      })
      .start();
  };

  // Update particle positions based on animation progress
  const updateParticlePositions = (progress: number) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes['position'] as BufferAttribute;
    const direction = new Vector3().subVectors(endPosition, startPosition);

    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;
      
      // Stagger particles along the animation timeline
      const particleDelay = (i / particleCount) * 0.3; // 30% of animation for staggering
      const adjustedProgress = Math.max(0, Math.min(1, (progress - particleDelay) / (1 - particleDelay)));
      
      // Calculate current position for this particle
      const currentPos = new Vector3(
        startPosition.x + direction.x * adjustedProgress,
        startPosition.y + direction.y * adjustedProgress,
        startPosition.z + direction.z * adjustedProgress
      );

      positions.array[index] = currentPos.x;
      positions.array[index + 1] = currentPos.y;
      positions.array[index + 2] = currentPos.z;
    }

    positions.needsUpdate = true;
  };

  // Reset particles to start position
  const resetParticles = () => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes['position'] as BufferAttribute;
    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;
      positions.array[index] = initialPositions[index];
      positions.array[index + 1] = initialPositions[index + 1];
      positions.array[index + 2] = initialPositions[index + 2];
    }
    positions.needsUpdate = true;
  };

  // Manage ArrowHelper in the group
  useEffect(() => {
    if (!arrowGroupRef.current) return () => {};

    // Clear existing arrow helper
    if (arrowHelperRef.current) {
      arrowGroupRef.current.remove(arrowHelperRef.current);
      arrowHelperRef.current = null;
    }

    // Add new arrow helper if visible and enabled
    if (visible && arrowHelper) {
      arrowGroupRef.current.add(arrowHelper);
      arrowHelperRef.current = arrowHelper;
    }

    return () => {
      if (arrowHelperRef.current && arrowGroupRef.current) {
        arrowGroupRef.current.remove(arrowHelperRef.current);
        arrowHelperRef.current = null;
      }
    };
  }, [visible, arrowHelper]);

  // Start animation when component becomes visible
  useEffect(() => {
    if (visible) {
      resetParticles();
      // Small delay to ensure geometry is ready
      const timer = setTimeout(() => {
        startAnimation();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      if (tweenRef.current) {
        tweenRef.current.stop();
      }
      animationStateRef.current.isAnimating = false;
      resetParticles();
      return () => {};
    }
  }, [visible, startPosition, endPosition]);

  // Update TWEEN animations
  useFrame(() => {
    TWEEN.update();
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tweenRef.current) {
        tweenRef.current.stop();
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <group ref={arrowGroupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  );
}