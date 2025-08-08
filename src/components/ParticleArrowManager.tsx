import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3, CatmullRomCurve3, TubeGeometry, MeshBasicMaterial } from 'three';
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

interface CycleConnectionProps {
  arrows: ArrowAnimation[];
  cycleGroup: number;
  visible: boolean;
  color: string;
}

function CycleConnection({ arrows, visible, color }: CycleConnectionProps) {
  if (!visible || arrows.length !== 3) return null;

  // Sort arrows by cycle position to ensure proper connection order
  const sortedArrows = [...arrows].sort((a, b) => (a.cyclePosition || 0) - (b.cyclePosition || 0));
  
  // Create a curved path connecting all arrows in the cycle
  const points = [
    sortedArrows[0].startPosition,
    sortedArrows[0].endPosition,
    sortedArrows[1].endPosition,
    sortedArrows[2].endPosition,
    sortedArrows[0].startPosition // Complete the cycle
  ];

  // Create a smooth curve through the points
  const curve = new CatmullRomCurve3(points);
  const tubeGeometry = new TubeGeometry(curve, 20, 0.02, 8, false);
  const material = new MeshBasicMaterial({ 
    color: color, 
    transparent: true, 
    opacity: 0.3,
    wireframe: false
  });

  return (
    <mesh geometry={tubeGeometry} material={material} />
  );
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
  showCycleConnections?: boolean; // Whether to show connecting lines between cycle arrows
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
  arrowHelperHeadLength = 0.2,
  arrowHelperHeadWidth = 0.1,
  showCycleConnections = true,
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

  // Generate arrows from algorithm sticker mappings with 3-cycle grouping
  const generateArrows = useCallback((algo: Algorithm): ArrowAnimation[] => {
    const arrowAnimations: ArrowAnimation[] = [];

    // Group sticker mappings into 3-cycles based on cyclePosition
    const cycleGroups = new Map<number, StickerMapping[]>();
    
    algo.stickerMappings.forEach((mapping) => {
      const cycleGroup = mapping.cyclePosition !== undefined ? Math.floor(mapping.cyclePosition / 3) : 0;
      if (!cycleGroups.has(cycleGroup)) {
        cycleGroups.set(cycleGroup, []);
      }
      cycleGroups.get(cycleGroup)!.push(mapping);
    });

    // Generate arrows for each cycle group with enhanced 3-cycle visualization
    cycleGroups.forEach((mappings, cycleGroup) => {
      // Sort mappings by cyclePosition to ensure proper order
      const sortedMappings = mappings.sort((a, b) => {
        const posA = a.cyclePosition !== undefined ? a.cyclePosition % 3 : 0;
        const posB = b.cyclePosition !== undefined ? b.cyclePosition % 3 : 0;
        return posA - posB;
      });

      const isComplete3Cycle = sortedMappings.length === 3;

      sortedMappings.forEach((mapping, index) => {
        const startPos = getStickerPosition(mapping.source);
        const endPos = getStickerPosition(mapping.target);

        if (startPos && endPos) {
          // Offset arrow positions slightly above the sticker surface to make them visible
          const offsetDistance = 0.1;
          const startOffset = startPos.clone().add(new Vector3(0, offsetDistance, 0));
          const endOffset = endPos.clone().add(new Vector3(0, offsetDistance, 0));

          // Enhanced color scheme for 3-cycles
          let cycleColor: string;
          if (isComplete3Cycle) {
            // Use consistent colors for complete 3-cycles with slight variations for each arrow
            const baseColors = ['#ffff00', '#ff6600', '#00ff66', '#6600ff', '#ff0066', '#00ffff'];
            const baseColor = baseColors[cycleGroup % baseColors.length];
            
            // Slightly modify color for each position in the cycle
            const colorVariations = [baseColor, baseColor + '99', baseColor + 'CC'];
            cycleColor = colorVariations[index % 3];
          } else {
            // Use default color for incomplete cycles
            const defaultColors = ['#888888', '#999999', '#aaaaaa'];
            cycleColor = defaultColors[cycleGroup % defaultColors.length];
          }

          const cyclePosition = mapping.cyclePosition !== undefined ? mapping.cyclePosition % 3 : index;

          arrowAnimations.push({
            id: `arrow-${algo.id}-${cycleGroup}-${index}`,
            startPosition: startOffset,
            endPosition: endOffset,
            color: arrowColor || cycleColor,
            visible: false,
            mapping,
            cycleGroup,
            cyclePosition,
            isPartOfCycle: isComplete3Cycle
          });
        } else {
          console.warn(`Could not find positions for sticker mapping: ${mapping.source} -> ${mapping.target}`);
        }
      });
    });

    return arrowAnimations;
  }, [arrowColor]);

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

  // Group arrows by cycle for connection visualization
  const cycleGroups = new Map<number, ArrowAnimation[]>();
  arrows.forEach(arrow => {
    if (arrow.isPartOfCycle && arrow.cycleGroup !== undefined) {
      const group = arrow.cycleGroup;
      if (!cycleGroups.has(group)) {
        cycleGroups.set(group, []);
      }
      cycleGroups.get(group)!.push(arrow);
    }
  });

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
          arrowHelperHeadLength={arrowHelperHeadLength}
          arrowHelperHeadWidth={arrowHelperHeadWidth}
          onAnimationComplete={handleArrowComplete}
        />
      ))}

      {/* Render cycle connections */}
      {showCycleConnections && Array.from(cycleGroups.entries()).map(([cycleGroup, groupArrows]) => {
        const isVisible = groupArrows.some(arrow => arrow.visible);
        const groupColor = groupArrows[0]?.color || '#ffff00';
        
        return (
          <CycleConnection
            key={`cycle-${cycleGroup}`}
            arrows={groupArrows}
            cycleGroup={cycleGroup}
            visible={isVisible}
            color={groupColor}
          />
        );
      })}
    </>
  );
}