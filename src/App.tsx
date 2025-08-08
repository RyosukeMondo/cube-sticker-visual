import { useState, useCallback, useEffect, useRef } from 'react'
import { CubeVisualizer } from './components/CubeVisualizer'
import { AlgorithmSelector } from './components/AlgorithmSelector'
import { AlgorithmDisplay } from './components/AlgorithmDisplay'
import { AnimationControls } from './components/AnimationControls'
import { ColorSettings } from './components/ColorSettings'
import type { Algorithm } from './types/Algorithm'
import type { CubeColors } from './types/CubeColors'
import { DEFAULT_CUBE_COLORS } from './types/CubeColors'
import { DEFAULT_BUFFER_CONFIG } from './utils/bufferHighlighting'
import './App.css'

function App() {
  // Application state
  const [initialized] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | undefined>()
  const [highlightedStickers] = useState(['F', 'R']) // Demo highlighting (non-buffer stickers)
  const [error, setError] = useState<string | null>(null)
  
  // Animation control state
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [showArrows, setShowArrows] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationKey, setAnimationKey] = useState(0) // Used to trigger replay
  
  // Color configuration state
  const [cubeColors, setCubeColors] = useState<CubeColors>(DEFAULT_CUBE_COLORS)
  
  // Refs for cleanup and coordination
  const animationCleanupRef = useRef<(() => void) | null>(null)
  const algorithmChangeTimeoutRef = useRef<number | null>(null)

  const handleAlgorithmSelect = useCallback((algorithm: Algorithm) => {
    try {
      // Clear any existing error state
      setError(null);
      
      // Clear any pending algorithm change timeout
      if (algorithmChangeTimeoutRef.current) {
        clearTimeout(algorithmChangeTimeoutRef.current);
      }
      
      // Cleanup any ongoing animation before switching
      if (animationCleanupRef.current) {
        animationCleanupRef.current();
        animationCleanupRef.current = null;
      }
      
      // Reset animation state for clean transition
      setIsAnimating(false);
      
      // Set new algorithm with slight delay to ensure cleanup is complete
      algorithmChangeTimeoutRef.current = setTimeout(() => {
        setSelectedAlgorithm(algorithm);
        // Increment animation key to force fresh animation setup
        setAnimationKey(prev => prev + 1);
        console.log('Selected algorithm:', algorithm);
      }, 50);
      
    } catch (err) {
      console.error('Error selecting algorithm:', err);
      setError('Failed to select algorithm. Please try again.');
    }
  }, []);

  // Animation control handlers
  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);

  const handleToggleArrows = useCallback(() => {
    setShowArrows(prev => !prev);
  }, []);

  const handleReplay = useCallback(() => {
    if (selectedAlgorithm) {
      try {
        // Clear any error state
        setError(null);
        
        // Cleanup current animation if running
        if (animationCleanupRef.current) {
          animationCleanupRef.current();
          animationCleanupRef.current = null;
        }
        
        // Reset animation state
        setIsAnimating(false);
        
        // Small delay to ensure cleanup, then restart
        setTimeout(() => {
          setAnimationKey(prev => prev + 1);
          setIsAnimating(true);
        }, 100);
        
      } catch (err) {
        console.error('Error replaying animation:', err);
        setError('Failed to replay animation. Please try again.');
      }
    }
  }, [selectedAlgorithm]);

  const handleAnimationStart = useCallback(() => {
    try {
      setIsAnimating(true);
      setError(null); // Clear any previous errors when animation starts successfully
    } catch (err) {
      console.error('Error starting animation:', err);
      setError('Animation failed to start.');
    }
  }, []);

  const handleAnimationComplete = useCallback(() => {
    try {
      setIsAnimating(false);
      // Clear cleanup reference since animation completed naturally
      animationCleanupRef.current = null;
    } catch (err) {
      console.error('Error completing animation:', err);
      setError('Animation completion failed.');
    }
  }, []);

  // Color settings handlers
  const handleColorChange = useCallback((face: keyof CubeColors, color: string) => {
    try {
      setCubeColors(prev => ({
        ...prev,
        [face]: color
      }));
      setError(null); // Clear any errors when color change succeeds
    } catch (err) {
      console.error('Error changing color:', err);
      setError('Failed to update cube colors.');
    }
  }, []);
  
  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts
      if (algorithmChangeTimeoutRef.current) {
        clearTimeout(algorithmChangeTimeoutRef.current);
      }
      
      // Cleanup any ongoing animations
      if (animationCleanupRef.current) {
        animationCleanupRef.current();
      }
    };
  }, []);
  
  // Register animation cleanup function
  const registerAnimationCleanup = useCallback((cleanupFn: () => void) => {
    animationCleanupRef.current = cleanupFn;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '20px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AlgorithmSelector 
          onAlgorithmSelect={handleAlgorithmSelect}
          selectedAlgorithm={selectedAlgorithm}
        />
        
        <ColorSettings
          colors={cubeColors}
          onColorChange={handleColorChange}
          disabled={isAnimating}
        />
      </div>
      
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1>Rubik's Cube Algorithm Visualizer</h1>
          {error && (
            <div style={{ 
              color: '#d32f2f', 
              backgroundColor: '#ffebee', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              marginTop: '10px',
              fontSize: '14px',
              border: '1px solid #ffcdd2'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <AlgorithmDisplay {...(selectedAlgorithm && { algorithm: selectedAlgorithm })} />
        </div>
        
        {selectedAlgorithm && (
          <div style={{ marginBottom: '20px' }}>
            <AnimationControls
              animationSpeed={animationSpeed}
              showArrows={showArrows}
              isAnimating={isAnimating}
              onSpeedChange={handleSpeedChange}
              onToggleArrows={handleToggleArrows}
              onReplay={handleReplay}
              disabled={!selectedAlgorithm}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          <div>🔵 <strong>UF</strong> - Edge Buffer (cyan)</div>
          <div>🟣 <strong>UFR_U</strong> - Corner Buffer (magenta)</div>
          <div>🟡 <strong>F, R</strong> - Regular highlights (yellow)</div>
        </div>
        
        {initialized && (
          <CubeVisualizer 
            key={animationKey} // Force re-render when animationKey changes (for replay)
            style={{ 
              width: '600px', 
              height: '600px', 
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
            cubeColors={cubeColors}
            highlightedStickers={highlightedStickers}
            highlightColor="#ffff00"
            bufferConfig={DEFAULT_BUFFER_CONFIG}
            {...(selectedAlgorithm && {
              algorithm: selectedAlgorithm,
              animationSpeed: animationSpeed,
              showArrowHelper: showArrows,
              showCycleConnections: showArrows,
              autoTriggerAnimation: true,
              onAnimationStart: handleAnimationStart,
              onAnimationComplete: handleAnimationComplete,
              onRegisterCleanup: registerAnimationCleanup
            })}
          />
        )}
      </div>
    </div>
  )
}

export default App
