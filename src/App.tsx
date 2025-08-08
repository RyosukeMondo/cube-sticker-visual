import { useState, useCallback, useEffect, useRef } from 'react'
import { CubeVisualizer } from './components/CubeVisualizer'
import { AlgorithmSelector } from './components/AlgorithmSelector'
import { AlgorithmDisplay } from './components/AlgorithmDisplay'
import { AnimationControls } from './components/AnimationControls'
import { ColorSettings } from './components/ColorSettings'
import { StickerSettings } from './components/StickerSettings'
import { ResponsiveLayout } from './components/ResponsiveLayout'
import { CollapsibleSection } from './components/CollapsibleSection'
import { useViewport } from './hooks/useViewport'
import type { Algorithm } from './types/Algorithm'
import type { CubeColors } from './types/CubeColors'
import { DEFAULT_CUBE_COLORS } from './types/CubeColors'
import { DEFAULT_BUFFER_CONFIG } from './utils/bufferHighlighting'
import './App.css'

function App() {
  const viewport = useViewport();
  
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
  
  // Sticker configuration state
  const [stickerSize, setStickerSize] = useState(0.45)
  const [stickerSpacing, setStickerSpacing] = useState(0.0)
  const [stickerThickness, setStickerThickness] = useState(0.05)
  const [stickerTransparency, setStickerTransparency] = useState(1.0)
  const [stickerChamfer, setStickerChamfer] = useState(0.02)
  
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
      setError(null); // Clear any previous errors when color change succeeds
    } catch (err) {
      console.error('Error changing color:', err);
      setError('Failed to change cube color. Please try again.');
    }
  }, []);

  // Sticker control change handlers
  const handleStickerSizeChange = useCallback((size: number) => {
    try {
      setStickerSize(size);
      setError(null);
    } catch (err) {
      console.error('Error changing sticker size:', err);
      setError('Failed to change sticker size. Please try again.');
    }
  }, []);

  const handleStickerSpacingChange = useCallback((spacing: number) => {
    try {
      setStickerSpacing(spacing);
      setError(null);
    } catch (err) {
      console.error('Error changing sticker spacing:', err);
      setError('Failed to change sticker spacing. Please try again.');
    }
  }, []);

  const handleStickerThicknessChange = useCallback((thickness: number) => {
    try {
      setStickerThickness(thickness);
      setError(null);
    } catch (err) {
      console.error('Error changing sticker thickness:', err);
      setError('Failed to change sticker thickness. Please try again.');
    }
  }, []);

  const handleStickerTransparencyChange = useCallback((transparency: number) => {
    try {
      setStickerTransparency(transparency);
      setError(null);
    } catch (err) {
      console.error('Error changing sticker transparency:', err);
      setError('Failed to change sticker transparency. Please try again.');
    }
  }, []);

  const handleStickerChamferChange = useCallback((chamfer: number) => {
    try {
      setStickerChamfer(chamfer);
      setError(null);
    } catch (err) {
      console.error('Error changing sticker chamfer:', err);
      setError('Failed to change sticker chamfer. Please try again.');
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

  // Sidebar content for responsive layout
  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: viewport.isMobile ? '15px' : '20px' }}>
      <CollapsibleSection 
        title="Algorithm Browser" 
        defaultExpanded={true}
      >
        <AlgorithmSelector 
          onAlgorithmSelect={handleAlgorithmSelect}
          selectedAlgorithm={selectedAlgorithm}
        />
      </CollapsibleSection>
      
      <CollapsibleSection 
        title="Cube Colors" 
        defaultExpanded={false}
        disabled={isAnimating}
      >
        <ColorSettings
          colors={cubeColors}
          onColorChange={handleColorChange}
          disabled={isAnimating}
        />
      </CollapsibleSection>
      
      <CollapsibleSection 
        title="Sticker Size" 
        defaultExpanded={false}
        disabled={isAnimating}
      >
        <StickerSettings
          stickerSize={stickerSize}
          stickerSpacing={stickerSpacing}
          stickerThickness={stickerThickness}
          stickerTransparency={stickerTransparency}
          stickerChamfer={stickerChamfer}
          onStickerSizeChange={handleStickerSizeChange}
          onStickerSpacingChange={handleStickerSpacingChange}
          onStickerThicknessChange={handleStickerThicknessChange}
          onStickerTransparencyChange={handleStickerTransparencyChange}
          onStickerChamferChange={handleStickerChamferChange}
          disabled={isAnimating}
        />
      </CollapsibleSection>
    </div>
  );

  // Header content for responsive layout
  const headerContent = (
    <div>
      <h1 style={{ 
        margin: 0, 
        fontSize: viewport.isMobile ? '20px' : '24px',
        fontWeight: 'bold'
      }}>
        Rubik's Cube Algorithm Visualizer
      </h1>
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          backgroundColor: '#ffebee', 
          padding: '8px 12px', 
          borderRadius: '4px', 
          marginTop: '10px',
          fontSize: viewport.isMobile ? '12px' : '14px',
          border: '1px solid #ffcdd2'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );

  // Main content for responsive layout
  const mainContent = (
    <>
      {/* Top controls section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: viewport.isMobile ? '15px' : '20px',
        marginBottom: viewport.isMobile ? '20px' : '30px'
      }}>
        <AlgorithmDisplay {...(selectedAlgorithm && { algorithm: selectedAlgorithm })} />
        
        {selectedAlgorithm && (
          <AnimationControls
            animationSpeed={animationSpeed}
            showArrows={showArrows}
            isAnimating={isAnimating}
            onSpeedChange={handleSpeedChange}
            onToggleArrows={handleToggleArrows}
            onReplay={handleReplay}
            disabled={!selectedAlgorithm}
          />
        )}
        
        {!viewport.isMobile && (
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            textAlign: 'left',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ marginBottom: '4px' }}>🔵 <strong>UF</strong> - Edge Buffer (cyan)</div>
            <div style={{ marginBottom: '4px' }}>🟣 <strong>UFR_U</strong> - Corner Buffer (magenta)</div>
            <div>🟡 <strong>F, R</strong> - Regular highlights (yellow)</div>
          </div>
        )}
      </div>
      
      {/* Cube visualizer section */}
      {initialized && (
        <div style={{ 
          flex: 1,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: viewport.isMobile ? '400px' : '500px',
          width: '100%'
        }}>
          <CubeVisualizer 
            key={animationKey} // Force re-render when animationKey changes (for replay)
            cubeColors={cubeColors}
            highlightedStickers={highlightedStickers}
            highlightColor="#ffff00"
            bufferConfig={DEFAULT_BUFFER_CONFIG}
            stickerSize={stickerSize}
            stickerSpacing={stickerSpacing}
            stickerThickness={stickerThickness}
            stickerTransparency={stickerTransparency}
            stickerChamfer={stickerChamfer}
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
        </div>
      )}
    </>
  );

  return (
    <ResponsiveLayout
      sidebarContent={sidebarContent}
      mainContent={mainContent}
      headerContent={headerContent}
    />
  )
}

export default App
