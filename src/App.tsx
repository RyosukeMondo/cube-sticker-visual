import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import './App.css'

function TestCube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function App() {
  const [initialized] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1>Rubik's Cube Algorithm Visualizer</h1>
      <p>Project Setup Complete - React Three Fiber Test</p>
      {initialized && (
        <Canvas style={{ width: '400px', height: '400px', border: '1px solid #ccc' }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <TestCube />
        </Canvas>
      )}
    </div>
  )
}

export default App
