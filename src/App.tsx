import { useState, useCallback } from 'react'
import { CubeVisualizer } from './components/CubeVisualizer'
import { AlgorithmSelector } from './components/AlgorithmSelector'
import { AlgorithmDisplay } from './components/AlgorithmDisplay'
import { AnimationControls } from './components/AnimationControls'
import type { Algorithm } from './types/Algorithm'
import { DEFAULT_CUBE_COLORS } from './types/CubeColors'
import { DEFAULT_BUFFER_CONFIG } from './utils/bufferHighlighting'
import './App.css'

function App() {
  const [initialized] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | undefined>()
  const [highlightedStickers] = useState(['F', 'R']) // Demo highlighting (non-buffer stickers)
  
  // Animation control state
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [showArrows, setShowArrows] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationKey, setAnimationKey] = useState(0) // Used to trigger replay

  const handleAlgorithmSelect = (algorithm: Algorithm) => {
    setSelectedAlgorithm(algorithm);
    console.log('Selected algorithm:', algorithm);
  };

  // Animation control handlers
  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
  }, []);

  const handleToggleArrows = useCallback(() => {
    setShowArrows(prev => !prev);
  }, []);

  const handleReplay = useCallback(() => {
    if (selectedAlgorithm) {
      // Increment key to force re-render and restart animation
      setAnimationKey(prev => prev + 1);
      setIsAnimating(true);
    }
  }, [selectedAlgorithm]);

  const handleAnimationStart = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '20px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: '0 0 400px' }}>
        <AlgorithmSelector 
          onAlgorithmSelect={handleAlgorithmSelect}
          selectedAlgorithm={selectedAlgorithm}
        />
      </div>
      
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1>Rubik's Cube Algorithm Visualizer</h1>
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
            cubeColors={DEFAULT_CUBE_COLORS}
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
              onAnimationComplete: handleAnimationComplete
            })}
          />
        )}
      </div>
    </div>
  )
}

export default App
