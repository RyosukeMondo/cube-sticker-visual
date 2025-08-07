import { useState } from 'react'
import { CubeVisualizer } from './components/CubeVisualizer'
import { DEFAULT_CUBE_COLORS } from './types/CubeColors'
import { DEFAULT_BUFFER_CONFIG } from './utils/bufferHighlighting'
import './App.css'

function App() {
  const [initialized] = useState(true)
  const [highlightedStickers] = useState(['F', 'R']) // Demo highlighting (non-buffer stickers)

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '20px' }}>
      <h1>Rubik's Cube Algorithm Visualizer</h1>
      <p>3D Cube with Buffer Piece Highlighting</p>
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
  )
}

export default App
