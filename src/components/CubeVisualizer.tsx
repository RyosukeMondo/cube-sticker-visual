import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';
import { Sticker } from './Sticker';
import { ParticleArrowManager } from './ParticleArrowManager';
import { ALL_STICKERS, type StickerPosition } from '../types/CubeStickers';
import { type CubeColors, DEFAULT_CUBE_COLORS, type StickerState } from '../types/CubeColors';
import { type BufferHighlightConfig, DEFAULT_BUFFER_CONFIG, getBufferStickers } from '../utils/bufferHighlighting';
import { type Algorithm } from '../types/Algorithm';

// Individual cubelet component (now just the black frame)
function Cubelet({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<Mesh>(null);

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            <meshStandardMaterial color="#1a1a1a" />
        </mesh>
    );
}

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
    // Particle arrow animation props
    algorithm?: Algorithm;
    isAnimationPlaying?: boolean;
    animationSpeed?: number;
    arrowColor?: string;
    particleCount?: number;
    particleSize?: number;
    autoTriggerAnimation?: boolean;
    showMultipleArrows?: boolean;
    onAnimationComplete?: () => void;
    onAnimationStart?: () => void;
    onArrowComplete?: (arrowId: string) => void;
}

export function CubeVisualizer({
    className,
    style,
    cubeColors = DEFAULT_CUBE_COLORS,
    highlightedStickers = [],
    highlightColor = '#ffff00',
    bufferConfig = DEFAULT_BUFFER_CONFIG,
    // Particle arrow animation props
    algorithm,
    isAnimationPlaying = false,
    animationSpeed = 1.0,
    arrowColor = '#ffff00',
    particleCount = 20,
    particleSize = 0.05,
    autoTriggerAnimation = true,
    showMultipleArrows = true,
    onAnimationComplete,
    onAnimationStart,
    onArrowComplete
}: CubeVisualizerProps) {
    const cubeletPositions = generateCubeletPositions();

    // Generate sticker states from the cube colors and highlighting
    const stickerStates = useMemo((): StickerState[] => {
        const bufferInfo = getBufferStickers(bufferConfig);

        return Object.values(ALL_STICKERS).map((stickerPos) => {
            const isRegularHighlight = highlightedStickers.includes(stickerPos.id);
            const isBufferHighlight = bufferInfo.stickerIds.includes(stickerPos.id);

            // Buffer highlighting takes precedence over regular highlighting
            const highlighted = isBufferHighlight || isRegularHighlight;
            const finalHighlightColor = isBufferHighlight
                ? bufferInfo.colorMap.get(stickerPos.id) || highlightColor
                : highlightColor;

            return {
                id: stickerPos.id,
                color: cubeColors[stickerPos.face],
                highlighted: highlighted,
                highlightColor: finalHighlightColor
            };
        });
    }, [cubeColors, highlightedStickers, highlightColor, bufferConfig]);

    return (
        <div className={className} style={style}>
            <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
                {/* Lighting setup */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <pointLight position={[-5, -5, -5]} intensity={0.3} />

                {/* Render all 27 cubelets (black frames) */}
                {cubeletPositions.map((position, index) => (
                    <Cubelet key={`cubelet-${index}`} position={position} />
                ))}

                {/* Render all 54 stickers */}
                {stickerStates.map((stickerState) => {
                    const stickerPos = ALL_STICKERS[stickerState.id];
                    const transform = getStickerTransform(stickerPos);

                    return (
                        <Sticker
                            key={stickerState.id}
                            sticker={stickerState}
                            position={transform.position}
                            rotation={transform.rotation}
                            size={0.3}
                        />
                    );
                })}

                {/* Particle Arrow Animation System */}
                <ParticleArrowManager
                    algorithm={algorithm}
                    isPlaying={isAnimationPlaying}
                    animationSpeed={animationSpeed}
                    arrowColor={arrowColor}
                    particleCount={particleCount}
                    particleSize={particleSize}
                    autoTrigger={autoTriggerAnimation}
                    showMultipleArrows={showMultipleArrows}
                    onAnimationComplete={onAnimationComplete}
                    onAnimationStart={onAnimationStart}
                    onArrowComplete={onArrowComplete}
                />

                {/* Camera controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={10}
                />
            </Canvas>
        </div>
    );
}