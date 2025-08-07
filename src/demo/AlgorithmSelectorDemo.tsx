import React, { useState } from 'react';
import { AlgorithmSelector } from '../components/AlgorithmSelector';
import type { Algorithm } from '../types/Algorithm';

export const AlgorithmSelectorDemo: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | undefined>();

  const handleAlgorithmSelect = (algorithm: Algorithm) => {
    setSelectedAlgorithm(algorithm);
    console.log('Selected algorithm:', algorithm);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', height: '100vh' }}>
      <div style={{ flex: '0 0 400px', height: '100%' }}>
        <AlgorithmSelector 
          onAlgorithmSelect={handleAlgorithmSelect}
          selectedAlgorithm={selectedAlgorithm}
        />
      </div>
      
      <div style={{ flex: '1', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Selected Algorithm Details</h2>
        {selectedAlgorithm ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>ID:</strong> {selectedAlgorithm.id}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Type:</strong> <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px',
                background: selectedAlgorithm.type === 'edge' ? '#e3f2fd' : '#f3e5f5',
                color: selectedAlgorithm.type === 'edge' ? '#1976d2' : '#7b1fa2',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {selectedAlgorithm.type}
              </span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Notation:</strong> 
              <div style={{ 
                fontFamily: 'Courier New, monospace', 
                background: 'white', 
                padding: '8px', 
                borderRadius: '4px',
                marginTop: '4px',
                border: '1px solid #ddd'
              }}>
                {selectedAlgorithm.notation}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Buffer Pieces:</strong> {selectedAlgorithm.bufferPieces.join(', ')}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Sticker Mappings:</strong>
              <div style={{ marginTop: '8px' }}>
                {selectedAlgorithm.stickerMappings.map((mapping, index) => (
                  <div key={index} style={{ 
                    background: 'white', 
                    padding: '4px 8px', 
                    margin: '2px 0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}>
                    {mapping.source} → {mapping.target} 
                    {mapping.cyclePosition !== undefined && (
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        (cycle position: {mapping.cyclePosition})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {selectedAlgorithm.description && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Description:</strong> {selectedAlgorithm.description}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Select an algorithm from the browser to see its details here.
          </p>
        )}
      </div>
    </div>
  );
};