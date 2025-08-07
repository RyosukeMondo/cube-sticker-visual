import { useState } from 'react'
import { CubeVisualizer } from './components/CubeVisualizer'
import { AlgorithmSelector } from './components/AlgorithmSelector'
import type { Algorithm } from './types/Algorithm'
import { DEFAULT_CUBE_COLORS } from './types/CubeColors'
import { DEFAULT_BUFFER_CONFIG } from './utils/bufferHighlighting'
import './App.css'

function App() {
  const [initialized] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | undefined>()
  const [highlightedStickers] = useState(['F', 'R']) // Demo highlighting (non-buffer stickers)

  const handleAlgorithmSelect = (algorithm: Algorithm) => {
    setSelectedAlgorithm(algorithm);
    console.log('Selected algorithm:', algorithm);
  };

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
          {selectedAlgorithm ? (
            <div>
              <p><strong>Selected Algorithm:</strong> {selectedAlgorithm.id} ({selectedAlgorithm.type})</p>
              <p><strong>Notation:</strong> {selectedAlgorithm.notation}</p>
              <p><strong>Buffer:</strong> {selectedAlgorithm.bufferPieces.join(', ')}</p>
            </div>
          ) : (
            <p>Select an algorithm from the browser to visualize it</p>
          )}
        </div>
        
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          <div>🔵 <strong>UF</strong> - Edge Buffer (cyan)</div>
          <div>🟣 <strong>UFR_U</strong> - Corner Buffer (magenta)</div>
          <div>🟡 <strong>F, R</strong> - Regular highlights (yellow)</div>
        </div>
        
        {initialized && (
          <CubeVisualizer 
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
          />
        )}
      </div>
    </div>
  )
}

export default App
