import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { ParticleArrow } from './ParticleArrow';
import { getStickerPosition } from '../utils/stickerPositionLookup';
import { type Algorithm, type StickerMapping } from '../types/Algorithm';

interface ArrowAnimation {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  color: string;
  visible: boolean;
  mapping: StickerMapping;
  cycleGroup?: number; // For grouping arrows in 3-cycles
  cyclePosition?: number; // Position within the 3-cycle (0, 1, 2)
  isPartOfCycle?: boolean; // Whether this arrow is part of a complete 3-cycle
}



export interface ParticleArrowManagerProps {
  algorithm: Algorithm;
  isPlaying?: boolean;
  animationSpeed?: number; // Speed multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
  arrowColor?: string;
  particleCount?: number;
  particleSize?: number;
  autoTrigger?: boolean; // Automatically start animation when algorithm changes
  showMultipleArrows?: boolean; // Show all arrows simultaneously for 3-cycle visualization
  cycleTiming?: 'simultaneous' | 'sequential' | 'staggered'; // How to time arrows within cycles
  showArrowHelper?: boolean; // Whether to show THREE.ArrowHelper
  arrowHelperLength?: number | undefined; // Length of the arrow helper
  arrowHelperHeadLength?: number | undefined; // Head length of arrow helper
  arrowHelperHeadWidth?: number | undefined; // Head width of arrow helper
  // New arrow customization properties
  magnification?: number; // Overall arrow size multiplier
  lineThickness?: number; // Thickness of arrow line
  coneSize?: number; // Size of arrow cone/head
  onAnimationComplete?: (() => void) | undefined;
  onAnimationStart?: (() => void) | undefined;
  onArrowComplete?: ((arrowId: string) => void) | undefined;
  onRegisterCleanup?: ((cleanupFn: () => void) => void) | undefined;
}

export function ParticleArrowManager({
  algorithm,
  isPlaying = false,
  animationSpeed = 1.0,
  arrowColor = '#ffff00',
  particleCount = 20,
  particleSize = 0.05,
  autoTrigger = true,
  showMultipleArrows = true,
  cycleTiming = 'simultaneous',
  showArrowHelper = true,
  arrowHelperLength,
  magnification = 1.0,
  lineThickness = 0.02,
  coneSize = 0.2,
  onAnimationComplete,
  onAnimationStart,
  onArrowComplete,
  onRegisterCleanup
}: ParticleArrowManagerProps) {
  const [arrows, setArrows] = useState<ArrowAnimation[]>([]);
  const [, setCompletedArrows] = useState<Set<string>>(new Set());
  const [, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);

  // Register cleanup function with parent component
  useEffect(() => {
    if (onRegisterCleanup) {
      const cleanupFn = () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
        setIsAnimating(false);
        setCompletedArrows(new Set());
      };
      onRegisterCleanup(cleanupFn);
    }
  }, [onRegisterCleanup]);

  // Generate single direct arrow showing point1 -> point2 movement
  const generateArrows = useCallback((algo: Algorithm): ArrowAnimation[] => {
    const arrowAnimations: ArrowAnimation[] = [];

    // Show the second sticker mapping (point1 -> point2), not buffer -> point1
    if (algo.stickerMappings.length > 1) {
      const mapping = algo.stickerMappings[1]; // Take the second mapping (point1 -> point2)
      const startPos = getStickerPosition(mapping.source);
      const endPos = getStickerPosition(mapping.target);

      if (startPos && endPos) {
        // Position arrows slightly above sticker surfaces to avoid intersection
        const surfaceOffset = 0.1; // Small offset above sticker surface
        const startNormal = startPos.clone().normalize().multiplyScalar(surfaceOffset);
        const endNormal = endPos.clone().normalize().multiplyScalar(surfaceOffset);
        
        // Calculate base arrow positions at sticker centers with surface offset
        const startOffset = startPos.clone().add(startNormal);
        const endOffset = endPos.clone().add(endNormal);
        
        // Apply magnification to arrow length while keeping it sticker-to-sticker
        if (magnification !== 1.0) {
          const direction = endOffset.clone().sub(startOffset);
          const scaledDirection = direction.multiplyScalar(magnification);
          endOffset.copy(startOffset.clone().add(scaledDirection));
        }

        arrowAnimations.push({
          id: `arrow-${algo.id}-1`,
          startPosition: startOffset,
          endPosition: endOffset,
          color: arrowColor,
          visible: false,
          mapping,
          isPartOfCycle: false
        });
      } else {
        console.warn(`Could not find positions for sticker mapping: ${mapping.source} -> ${mapping.target}`);
      }
    }

    return arrowAnimations;
  }, [arrowColor, magnification]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCompletedArrows(new Set());
    setArrows(prev => prev.map(arrow => ({ ...arrow, visible: false })));
  }, []);

  // Reset function
  // const reset = useCallback(() => {
  //   cleanup();
  //   setCompletedArrows(new Set());
  // }, [cleanup]);

  // Start animation function
  const startAnimation = useCallback(() => {
    // Access current arrows through state callback to avoid dependency
    setArrows(currentArrows => {
      if (currentArrows.length === 0) return currentArrows;
      return currentArrows;
    });

    // Clean up any existing animation first
    cleanup();
    setIsAnimating(true);
    setCompletedArrows(new Set());

    if (onAnimationStart) {
      onAnimationStart();
    }

    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      setArrows(currentArrows => {
        if (showMultipleArrows) {
          // Enhanced 3-cycle visualization based on timing mode
          if (cycleTiming === 'simultaneous') {
            // Show all arrows simultaneously for 3-cycle visualization
            return currentArrows.map(arrow => ({ ...arrow, visible: true }));
          } else if (cycleTiming === 'sequential') {
            // Show arrows sequentially by cycle group, then by position within cycle
            let currentArrowIndex = 0;
            const showNextArrow = () => {
              if (currentArrowIndex < currentArrows.length) {
                setArrows(prev => prev.map((arrow, index) => ({
                  ...arrow,
                  visible: index === currentArrowIndex
                })));
                currentArrowIndex++;
                
                const animationDuration = Math.max(500, 2000 / animationSpeed);
                animationTimeoutRef.current = setTimeout(showNextArrow, animationDuration + 200);
              }
            };
            showNextArrow();
            return currentArrows;
          } else if (cycleTiming === 'staggered') {
            // Show arrows with staggered timing based on cycle groups
            const cycleGroups = new Map<number, number[]>();
            currentArrows.forEach((arrow, index) => {
              const group = arrow.cycleGroup || 0;
              if (!cycleGroups.has(group)) {
                cycleGroups.set(group, []);
              }
              cycleGroups.get(group)!.push(index);
            });

            let currentGroupIndex = 0;
            const groupArray = Array.from(cycleGroups.entries());
            
            const showNextGroup = () => {
              if (currentGroupIndex < groupArray.length) {
                const [, arrowIndices] = groupArray[currentGroupIndex];
                setArrows(prev => prev.map((arrow, index) => ({
                  ...arrow,
                  visible: arrowIndices.includes(index)
                })));
                currentGroupIndex++;
                
                const staggerDelay = Math.max(300, 1000 / animationSpeed);
                animationTimeoutRef.current = setTimeout(showNextGroup, staggerDelay);
              }
            };
            showNextGroup();
            return currentArrows;
          }
        } else {
          // Single arrow mode - show arrows one by one
          let currentArrowIndex = 0;
          const showNextArrow = () => {
            if (currentArrowIndex < currentArrows.length) {
              setArrows(prev => prev.map((arrow, index) => ({
                ...arrow,
                visible: index <= currentArrowIndex
              })));
              currentArrowIndex++;
              
              const animationDuration = Math.max(500, 2000 / animationSpeed);
              animationTimeoutRef.current = setTimeout(showNextArrow, animationDuration + 200);
            }
          };
          showNextArrow();
        }
        return currentArrows;
      });
    }, 10);
  }, [showMultipleArrows, animationSpeed, cycleTiming, onAnimationStart, cleanup]);

  // Update arrows when algorithm changes
  useEffect(() => {
    const newArrows = generateArrows(algorithm);
    setArrows(newArrows);
    setCompletedArrows(new Set());
    
    // Auto-trigger animation if enabled
    if (autoTrigger) {
      // Small delay to ensure arrows are ready
      const timer = setTimeout(() => {
        startAnimation();
      }, 100);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [algorithm, autoTrigger, generateArrows, startAnimation]);

  // Handle play/pause state changes (manual control)
  useEffect(() => {
    if (!autoTrigger) {
      if (isPlaying) {
        startAnimation();
      } else {
        cleanup();
      }
    }
  }, [isPlaying, autoTrigger, startAnimation, cleanup]);

  // Handle individual arrow completion
  const handleArrowComplete = useCallback((arrowId: string) => {
    if (onArrowComplete) {
      onArrowComplete(arrowId);
    }

    setCompletedArrows(prev => {
      const newCompleted = new Set(prev);
      newCompleted.add(arrowId);
      
      // Check if all arrows are completed
      if (newCompleted.size === arrows.length && arrows.length > 0) {
        setIsAnimating(false);
        
        // Small delay before calling completion callback
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 100);
      }
      
      return newCompleted;
    });
  }, [arrows.length, onAnimationComplete, onArrowComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Calculate animation duration based on speed
  const animationDuration = Math.max(500, 2000 / animationSpeed);

  // Expose control methods (could be used by parent components)
  // const controls = {
  //   start: startAnimation,
  //   stop: cleanup,
  //   reset: reset,
  //   isAnimating
  // };

  return (
    <>
      {/* Render individual arrows */}
      {arrows.map((arrow) => (
        <ParticleArrow
          key={arrow.id}
          id={arrow.id}
          startPosition={arrow.startPosition}
          endPosition={arrow.endPosition}
          color={arrow.color}
          particleCount={particleCount}
          animationDuration={animationDuration}
          particleSize={particleSize}
          visible={arrow.visible}
          showArrowHelper={showArrowHelper}
          arrowHelperLength={arrowHelperLength}
          arrowHelperHeadLength={coneSize}
          arrowHelperHeadWidth={coneSize * 0.5}
          lineThickness={lineThickness}
          onAnimationComplete={handleArrowComplete}
        />
      ))}
    </>
  );
}