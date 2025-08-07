import React, { useState, useMemo } from 'react';
import type { Algorithm } from '../types/Algorithm';
import { ALGORITHM_DATA } from '../data/algorithms';
import './AlgorithmSelector.css';

// Helper component to highlight search terms
const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="search-highlight">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

interface AlgorithmSelectorProps {
  onAlgorithmSelect: (algorithm: Algorithm) => void;
  selectedAlgorithm?: Algorithm | undefined;
}

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  onAlgorithmSelect,
  selectedAlgorithm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'edge' | 'corner'>('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter algorithms based on search term and category
  const filteredAlgorithms = useMemo(() => {
    let filtered = ALGORITHM_DATA.algorithms;

    // Apply category filter first (more efficient)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(algo => algo.type === categoryFilter);
    }

    // Apply search filter with optimized search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // For efficiency with large datasets, use more targeted search
      filtered = filtered.filter(algo => {
        // Search in notation (primary search field)
        if (algo.notation.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in algorithm ID
        if (algo.id.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in description if it exists
        if (algo.description && algo.description.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in buffer pieces
        if (algo.bufferPieces.some(buffer => 
          buffer.toLowerCase().includes(searchLower)
        )) {
          return true;
        }
        
        return false;
      });
    }

    // Sort results for better UX - exact matches first, then by type, then by ID
    return filtered.sort((a, b) => {
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const aExactMatch = a.id.toLowerCase() === searchLower || a.notation.toLowerCase() === searchLower;
        const bExactMatch = b.id.toLowerCase() === searchLower || b.notation.toLowerCase() === searchLower;
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
      }
      
      // Sort by type (edge first, then corner)
      if (a.type !== b.type) {
        return a.type === 'edge' ? -1 : 1;
      }
      
      // Sort by ID within same type
      return a.id.localeCompare(b.id);
    });
  }, [searchTerm, categoryFilter]);

  const handleAlgorithmClick = (algorithm: Algorithm, index?: number) => {
    onAlgorithmSelect(algorithm);
    if (index !== undefined) {
      setSelectedIndex(index);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1); // Reset selection when search changes
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredAlgorithms.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredAlgorithms.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredAlgorithms.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredAlgorithms.length) {
          handleAlgorithmClick(filteredAlgorithms[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchTerm('');
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="algorithm-selector">
      <div className="selector-header">
        <h3>Algorithm Browser</h3>
        <div className="algorithm-counts">
          <span>Total: {ALGORITHM_DATA.algorithms.length}</span>
          <span>Edge: {ALGORITHM_DATA.edgeCount}</span>
          <span>Corner: {ALGORITHM_DATA.cornerCount}</span>
        </div>
      </div>

      <div className="search-controls">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search algorithms by notation, ID, or buffer pieces..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedIndex(-1);
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="category-filters">
          <button
            className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All ({ALGORITHM_DATA.algorithms.length})
          </button>
          <button
            className={`filter-btn ${categoryFilter === 'edge' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('edge')}
          >
            Edge ({ALGORITHM_DATA.edgeCount})
          </button>
          <button
            className={`filter-btn ${categoryFilter === 'corner' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('corner')}
          >
            Corner ({ALGORITHM_DATA.cornerCount})
          </button>
        </div>
      </div>

      <div className="algorithm-list">
        <div className="list-header">
          <span>Showing {filteredAlgorithms.length} algorithms</span>
          {searchTerm && (
            <span className="search-info">
              {filteredAlgorithms.length === 0 ? 'No matches found' : 
               `${filteredAlgorithms.length} of ${ALGORITHM_DATA.algorithms.length} algorithms`}
            </span>
          )}
        </div>
        
        <div className="algorithm-items">
          {filteredAlgorithms.length === 0 ? (
            <div className="no-results">
              {searchTerm ? 
                `No algorithms found matching "${searchTerm}"` : 
                'No algorithms available'
              }
            </div>
          ) : (
            filteredAlgorithms.map((algorithm, index) => (
              <div
                key={algorithm.id}
                className={`algorithm-item ${
                  selectedAlgorithm?.id === algorithm.id ? 'selected' : ''
                } ${
                  selectedIndex === index ? 'keyboard-selected' : ''
                }`}
                onClick={() => handleAlgorithmClick(algorithm, index)}
              >
                <div className="algorithm-header">
                  <span className={`algorithm-type ${algorithm.type}`}>
                    {algorithm.type.toUpperCase()}
                  </span>
                  <span className="algorithm-id">{algorithm.id}</span>
                </div>
                <div className="algorithm-notation">
                  {searchTerm ? (
                    <HighlightedText text={algorithm.notation} highlight={searchTerm} />
                  ) : (
                    algorithm.notation
                  )}
                </div>
                {algorithm.description && (
                  <div className="algorithm-description">
                    {algorithm.description}
                  </div>
                )}
                <div className="algorithm-buffer">
                  Buffer: {algorithm.bufferPieces.join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};