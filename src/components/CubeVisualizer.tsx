import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OptimizedCubelet } from './OptimizedCubelet';
import { OptimizedSticker } from './OptimizedSticker';
import { ParticleArrowManager } from './ParticleArrowManager';
import { ALL_STICKERS, type StickerPosition } from '../types/CubeStickers';
import { type CubeColors, DEFAULT_CUBE_COLORS, type StickerState } from '../types/CubeColors';
import { type BufferHighlightConfig, DEFAULT_BUFFER_CONFIG, getBufferStickers } from '../utils/bufferHighlighting';
import { type Algorithm } from '../types/Algorithm';
import { useViewport } from '../hooks/useViewport';

// Legacy individual cubelet component (replaced by OptimizedCubelet)
// Kept for backward compatibility but not used in optimized rendering

// Generate positions for all 27 cubelets (3x3x3 cube)
function generateCubeletPositions(): [number, number, number][] {
    const positions: [number, number, number][] = [];

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                positions.push([x, y, z]);
            }
        }
    }

    return positions;
}

// Calculate sticker position and rotation based on face
function getStickerTransform(stickerPos: StickerPosition): {
    position: [number, number, number];
    rotation: [number, number, number];
} {
    const [x, y, z] = stickerPos.position;

    switch (stickerPos.face) {
        case 'U': // Up face - stickers face down
            return {
                position: [x, y + 0.51, z],
                rotation: [-Math.PI / 2, 0, 0]
            };
        case 'D': // Down face - stickers face up
            return {
                position: [x, y - 0.51, z],
                rotation: [Math.PI / 2, 0, 0]
            };
        case 'F': // Front face - stickers face forward
            return {
                position: [x, y, z + 0.51],
                rotation: [0, 0, 0]
            };
        case 'B': // Back face - stickers face backward
            return {
                position: [x, y, z - 0.51],
                rotation: [0, Math.PI, 0]
            };
        case 'L': // Left face - stickers face right
            return {
                position: [x - 0.51, y, z],
                rotation: [0, -Math.PI / 2, 0]
            };
        case 'R': // Right face - stickers face left
            return {
                position: [x + 0.51, y, z],
                rotation: [0, Math.PI / 2, 0]
            };
        default:
            return {
                position: [x, y, z],
                rotation: [0, 0, 0]
            };
    }
}

interface CubeVisualizerProps {
    className?: string;
    style?: React.CSSProperties;
    cubeColors?: CubeColors;
    highlightedStickers?: string[];
    highlightColor?: string;
    bufferConfig?: BufferHighlightConfig;
    // New structured sticker controls
    stickerSize?: number;        // Sticker size (0.1 - 0.8)
    stickerSpacing?: number;     // Distance between stickers (0.0 - 3.0)
    stickerThickness?: number;   // Sticker thickness (0.01 - 0.1)
    stickerTransparency?: number; // Transparency level (0.0 - 1.0)
    stickerChamfer?: number;     // Chamfer/bevel amount (0.0 - 0.1)
    // Particle arrow animation props
    algorithm?: Algorithm;
    isAnimationPlaying?: boolean;
    animationSpeed?: number;
    arrowColor?: string;
    particleCount?: number;
    particleSize?: number;
    autoTriggerAnimation?: boolean;
    showMultipleArrows?: boolean;
    cycleTiming?: 'simultaneous' | 'sequential' | 'staggered';
    showArrowHelper?: boolean;
    showCycleConnections?: boolean;
    arrowHelperLength?: number | undefined;
    arrowHelperHeadLength?: number | undefined;
    arrowHelperHeadWidth?: number | undefined;
    onAnimationComplete?: (() => void) | undefined;
    onAnimationStart?: (() => void) | undefined;
    onArrowComplete?: ((arrowId: string) => void) | undefined;
    onRegisterCleanup?: ((cleanupFn: () => void) => void) | undefined;
}

export function CubeVisualizer({
    className,
    style,
    cubeColors = DEFAULT_CUBE_COLORS,
    highlightedStickers = [],
    highlightColor = '#ffff00',
    bufferConfig = DEFAULT_BUFFER_CONFIG,
    // New structured sticker controls with defaults
    stickerSize = 0.45,          // Default sticker size
    stickerSpacing = 0.0,        // Default spacing (no gap)
    stickerThickness = 0.05,     // Default thickness
    stickerTransparency = 1.0,   // Default fully opaque
    stickerChamfer = 0.02,       // Default chamfer amount
    // Particle arrow animation props
    algorithm,
    isAnimationPlaying = false,
    animationSpeed = 1.0,
    arrowColor = '#ffff00',
    particleCount = 30, // Increased particle count for better visibility
    particleSize = 0.08, // Increased particle size for better visibility
    autoTriggerAnimation = true,
    showMultipleArrows = true,
    cycleTiming = 'simultaneous',
    showArrowHelper = true,
    showCycleConnections = true,
    arrowHelperLength,
    arrowHelperHeadLength = 0.2,
    arrowHelperHeadWidth = 0.1,
    onAnimationComplete,
    onAnimationStart,
    onArrowComplete,
    onRegisterCleanup
}: CubeVisualizerProps) {
    const viewport = useViewport();
    const cubeletPositions = generateCubeletPositions();
    const cleanupFunctionsRef = useRef<(() => void)[]>([]);
    
    // Register cleanup function with parent component
    const registerCleanup = useCallback((cleanupFn: () => void) => {
        cleanupFunctionsRef.current.push(cleanupFn);
    }, []);
    
    // Execute all cleanup functions
    const executeCleanup = useCallback(() => {
        cleanupFunctionsRef.current.forEach(fn => {
            try {
                fn();
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        });
        cleanupFunctionsRef.current = [];
    }, []);
    
    // Register the cleanup executor with parent component
    useEffect(() => {
        if (onRegisterCleanup) {
            onRegisterCleanup(executeCleanup);
        }
    }, [onRegisterCleanup, executeCleanup]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            executeCleanup();
        };
    }, [executeCleanup]);

    // Generate optimized sticker data for instanced rendering
    const optimizedStickerData = useMemo(() => {
        const bufferInfo = getBufferStickers(bufferConfig);

        return Object.values(ALL_STICKERS).map((stickerPos) => {
            const isRegularHighlight = highlightedStickers.includes(stickerPos.id);
            const isBufferHighlight = bufferInfo.stickerIds.includes(stickerPos.id);

            // Buffer highlighting takes precedence over regular highlighting
            const highlighted = isBufferHighlight || isRegularHighlight;
            const finalHighlightColor = isBufferHighlight
                ? bufferInfo.colorMap.get(stickerPos.id) || highlightColor
                : highlightColor;

            const stickerState: StickerState = {
                id: stickerPos.id,
                color: cubeColors[stickerPos.face],
                highlighted: highlighted,
                highlightColor: finalHighlightColor
            };

            const transform = getStickerTransform(stickerPos);
            
            return {
                sticker: stickerState,
                position: transform.position,
                rotation: transform.rotation,
                size: 0.3
            };
        });
    }, [cubeColors, highlightedStickers, highlightColor, bufferConfig]);

    // Responsive canvas sizing
    const canvasStyle = useMemo(() => {
        const baseStyle = {
            border: '1px solid #ccc',
            borderRadius: '8px',
            ...style
        };

        if (viewport.isMobile) {
            return {
                ...baseStyle,
                width: '100%',
                height: '300px',
                maxHeight: '50vh'
            };
        } else if (viewport.isTablet) {
            return {
                ...baseStyle,
                width: '100%',
                height: '400px'
            };
        } else {
            return {
                ...baseStyle,
                width: '600px',
                height: '600px'
            };
        }
    }, [viewport, style]);

    // Adaptive particle count for performance
    const adaptiveParticleCount = useMemo(() => {
        if (viewport.isMobile) {
            return Math.max(5, Math.floor(particleCount * 0.3)); // Reduce particles on mobile
        } else if (viewport.isTablet) {
            return Math.max(10, Math.floor(particleCount * 0.6));
        }
        return particleCount;
    }, [viewport, particleCount]);

    // Adaptive animation speed for mobile performance
    const adaptiveAnimationSpeed = useMemo(() => {
        if (viewport.isMobile) {
            return Math.min(animationSpeed * 1.5, 3.0); // Faster animations on mobile
        }
        return animationSpeed;
    }, [viewport, animationSpeed]);

    return (
        <div className={className} style={canvasStyle}>
            <Canvas 
                camera={{ 
                    position: viewport.isMobile ? [3, 3, 3] : [4, 4, 4], 
                    fov: viewport.isMobile ? 60 : 50 
                }}
                performance={{ min: 0.5 }} // Adaptive performance
                dpr={viewport.isMobile ? [1, 1.5] : [1, 2]} // Adaptive pixel ratio
            >
                {/* Optimized lighting setup */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow={!viewport.isMobile} // Disable shadows on mobile
                    shadow-mapSize-width={viewport.isMobile ? 512 : 1024}
                    shadow-mapSize-height={viewport.isMobile ? 512 : 1024}
                />
                {!viewport.isMobile && (
                    <pointLight position={[-5, -5, -5]} intensity={0.3} />
                )}

                {/* Optimized cubelets using instancing */}
                <OptimizedCubelet positions={cubeletPositions} />

                {/* Optimized stickers using instancing */}
                <OptimizedSticker 
                    stickers={optimizedStickerData} 
                    controls={{
                        size: stickerSize,
                        spacing: stickerSpacing,
                        thickness: stickerThickness,
                        transparency: stickerTransparency,
                        chamfer: stickerChamfer
                    }}
                />

                {/* Particle Arrow Animation System */}
                {algorithm && (
                    <ParticleArrowManager
                        algorithm={algorithm}
                        isPlaying={isAnimationPlaying}
                        animationSpeed={adaptiveAnimationSpeed}
                        arrowColor={arrowColor}
                        particleCount={adaptiveParticleCount}
                        particleSize={particleSize}
                        autoTrigger={autoTriggerAnimation}
                        showMultipleArrows={showMultipleArrows}
                        cycleTiming={cycleTiming}
                        showArrowHelper={showArrowHelper && !viewport.isMobile} // Hide arrow helpers on mobile
                        showCycleConnections={showCycleConnections}
                        arrowHelperLength={arrowHelperLength}
                        arrowHelperHeadLength={arrowHelperHeadLength}
                        arrowHelperHeadWidth={arrowHelperHeadWidth}
                        onAnimationComplete={onAnimationComplete}
                        onAnimationStart={onAnimationStart}
                        onArrowComplete={onArrowComplete}
                        onRegisterCleanup={registerCleanup}
                    />
                )}

                {/* Responsive camera controls */}
                <OrbitControls
                    enablePan={!viewport.isMobile} // Disable pan on mobile to prevent conflicts
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={viewport.isMobile ? 2 : 3}
                    maxDistance={viewport.isMobile ? 8 : 10}
                    touches={{
                        ONE: 2, // TOUCH.ROTATE
                        TWO: 1  // TOUCH.DOLLY_PAN
                    }}
                />
            </Canvas>
        </div>
    );
}