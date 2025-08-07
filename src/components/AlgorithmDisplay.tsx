import React from 'react';
import type { Algorithm } from '../types/Algorithm';
import './AlgorithmDisplay.css';

interface AlgorithmDisplayProps {
  algorithm?: Algorithm;
  className?: string;
}

export const AlgorithmDisplay: React.FC<AlgorithmDisplayProps> = ({
  algorithm,
  className = ''
}) => {
  if (!algorithm) {
    return (
      <div className={`algorithm-display empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Algorithm Selected</h3>
          <p>Select an algorithm from the browser to view its details and visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`algorithm-display ${className}`}>
      <div className="algorithm-header">
        <div className="algorithm-title">
          <span className={`algorithm-type-indicator ${algorithm.type}`}>
            {algorithm.type === 'edge' ? '🔷' : '🔶'}
          </span>
          <div className="title-content">
            <h3 className="algorithm-id">{algorithm.id}</h3>
            <span className={`algorithm-type-badge ${algorithm.type}`}>
              {algorithm.type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="algorithm-content">
        <div className="notation-section">
          <label className="section-label">Algorithm Notation</label>
          <div className="notation-display">
            <code className="notation-text">{algorithm.notation}</code>
          </div>
        </div>

        <div className="metadata-section">
          <div className="metadata-grid">
            <div className="metadata-item">
              <label className="metadata-label">Type</label>
              <div className={`metadata-value type-${algorithm.type}`}>
                <span className="type-icon">
                  {algorithm.type === 'edge' ? '🔷' : '🔶'}
                </span>
                {algorithm.type === 'edge' ? 'Edge Algorithm' : 'Corner Algorithm'}
              </div>
            </div>

            <div className="metadata-item">
              <label className="metadata-label">Buffer Pieces</label>
              <div className="metadata-value buffer-pieces">
                {algorithm.bufferPieces.map((buffer, index) => (
                  <span key={buffer} className="buffer-piece">
                    {buffer}
                    {index < algorithm.bufferPieces.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>

            <div className="metadata-item">
              <label className="metadata-label">Sticker Mappings</label>
              <div className="metadata-value">
                {algorithm.stickerMappings.length} mapping{algorithm.stickerMappings.length !== 1 ? 's' : ''}
              </div>
            </div>

            {algorithm.description && (
              <div className="metadata-item description">
                <label className="metadata-label">Description</label>
                <div className="metadata-value">
                  {algorithm.description}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mappings-section">
          <label className="section-label">
            Sticker Mappings
            <span className="mappings-count">({algorithm.stickerMappings.length})</span>
          </label>
          <div className="mappings-list">
            {algorithm.stickerMappings.map((mapping) => (
              <div key={`${mapping.source}-${mapping.target}`} className="mapping-item">
                <span className="mapping-source">{mapping.source}</span>
                <span className="mapping-arrow">→</span>
                <span className="mapping-target">{mapping.target}</span>
                {mapping.cyclePosition !== undefined && (
                  <span className="cycle-position">
                    (cycle {mapping.cyclePosition + 1})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};