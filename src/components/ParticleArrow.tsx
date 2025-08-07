import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, BufferAttribute, Points, PointsMaterial, Color } from 'three';
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
  onAnimationComplete?: (id: string) => void;
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
  onAnimationComplete
}: ParticleArrowProps) {
  const pointsRef = useRef<Points>(null);
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

    const positions = pointsRef.current.geometry.attributes.position;
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

    const positions = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;
      positions.array[index] = initialPositions[index];
      positions.array[index + 1] = initialPositions[index + 1];
      positions.array[index + 2] = initialPositions[index + 2];
    }
    positions.needsUpdate = true;
  };

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
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}