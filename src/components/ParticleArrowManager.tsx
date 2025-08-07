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
}

export interface ParticleArrowManagerProps {
  algorithm?: Algorithm;
  isPlaying?: boolean;
  animationSpeed?: number; // Speed multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
  arrowColor?: string;
  particleCount?: number;
  particleSize?: number;
  autoTrigger?: boolean; // Automatically start animation when algorithm changes
  showMultipleArrows?: boolean; // Show all arrows simultaneously for 3-cycle visualization
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  onArrowComplete?: (arrowId: string) => void;
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
  onAnimationComplete,
  onAnimationStart,
  onArrowComplete
}: ParticleArrowManagerProps) {
  const [arrows, setArrows] = useState<ArrowAnimation[]>([]);
  const [completedArrows, setCompletedArrows] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Generate arrows for each cycle group
    cycleGroups.forEach((mappings, cycleGroup) => {
      mappings.forEach((mapping, index) => {
        const startPos = getStickerPosition(mapping.source);
        const endPos = getStickerPosition(mapping.target);

        if (startPos && endPos) {
          // Offset arrow positions slightly above the sticker surface to make them visible
          const offsetDistance = 0.1;
          const startOffset = startPos.clone().add(new Vector3(0, offsetDistance, 0));
          const endOffset = endPos.clone().add(new Vector3(0, offsetDistance, 0));

          // Use different colors for different cycle groups
          const cycleColors = ['#ffff00', '#ff6600', '#00ff66', '#6600ff', '#ff0066'];
          const cycleColor = cycleColors[cycleGroup % cycleColors.length];

          arrowAnimations.push({
            id: `arrow-${algo.id}-${cycleGroup}-${index}`,
            startPosition: startOffset,
            endPosition: endOffset,
            color: arrowColor || cycleColor,
            visible: false,
            mapping,
            cycleGroup
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
  const reset = useCallback(() => {
    cleanup();
    setCompletedArrows(new Set());
  }, [cleanup]);

  // Start animation function
  const startAnimation = useCallback(() => {
    if (arrows.length === 0) return;

    cleanup(); // Clean up any existing animation
    setIsAnimating(true);
    setCompletedArrows(new Set());

    if (onAnimationStart) {
      onAnimationStart();
    }

    if (showMultipleArrows) {
      // Show all arrows simultaneously for 3-cycle visualization
      setArrows(prev => prev.map(arrow => ({ ...arrow, visible: true })));
    } else {
      // Show arrows sequentially
      let currentArrowIndex = 0;
      const showNextArrow = () => {
        if (currentArrowIndex < arrows.length) {
          setArrows(prev => prev.map((arrow, index) => ({
            ...arrow,
            visible: index === currentArrowIndex
          })));
          currentArrowIndex++;
          
          // Schedule next arrow after current one completes
          const animationDuration = Math.max(500, 2000 / animationSpeed);
          animationTimeoutRef.current = setTimeout(showNextArrow, animationDuration + 200);
        }
      };
      showNextArrow();
    }
  }, [arrows, showMultipleArrows, animationSpeed, onAnimationStart, cleanup]);

  // Update arrows when algorithm changes
  useEffect(() => {
    if (algorithm) {
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
    } else {
      cleanup();
      setArrows([]);
    }
  }, [algorithm, generateArrows, autoTrigger, startAnimation, cleanup]);

  // Handle play/pause state changes (manual control)
  useEffect(() => {
    if (!autoTrigger) {
      if (isPlaying && arrows.length > 0) {
        startAnimation();
      } else {
        cleanup();
      }
    }
  }, [isPlaying, arrows.length, autoTrigger, startAnimation, cleanup]);

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
  const controls = {
    start: startAnimation,
    stop: cleanup,
    reset: reset,
    isAnimating
  };

  return (
    <>
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
          onAnimationComplete={handleArrowComplete}
        />
      ))}
    </>
  );
}