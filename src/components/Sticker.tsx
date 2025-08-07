import { useRef } from 'react';
import { Mesh } from 'three';
import { type StickerState } from '../types/CubeColors';
import { isBufferSticker } from '../utils/bufferHighlighting';

interface StickerProps {
  sticker: StickerState;
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
}

export function Sticker({ sticker, position, rotation = [0, 0, 0], size = 0.3 }: StickerProps) {
  const meshRef = useRef<Mesh>(null);
  const bufferInfo = isBufferSticker(sticker.id);
  
  const displayColor = sticker.highlighted && sticker.highlightColor 
    ? sticker.highlightColor 
    : sticker.color;
  
  // Buffer pieces get special visual treatment
  const isBuffer = bufferInfo.isBuffer;
  const opacity = sticker.highlighted ? (isBuffer ? 0.9 : 0.8) : 1.0;
  const emissive = isBuffer ? 0.1 : 0;
  
  return (
    <group>
      {/* Main sticker */}
      <mesh 
        ref={meshRef} 
        position={position}
        rotation={rotation}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color={displayColor}
          transparent={sticker.highlighted}
          opacity={opacity}
          emissive={displayColor}
          emissiveIntensity={emissive}
        />
      </mesh>
      
      {/* Buffer pieces get an additional border for extra distinction */}
      {isBuffer && (
        <mesh 
          position={[position[0], position[1], position[2] + 0.001]}
          rotation={rotation}
        >
          <planeGeometry args={[size + 0.05, size + 0.05]} />
          <meshStandardMaterial 
            color="#000000"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}