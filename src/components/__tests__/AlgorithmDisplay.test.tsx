import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlgorithmDisplay } from '../AlgorithmDisplay';
import type { Algorithm } from '../../types/Algorithm';

const mockEdgeAlgorithm: Algorithm = {
  id: 'A',
  type: 'edge',
  notation: "R U' R' F R F'",
  stickerMappings: [
    { source: 'UF', target: 'UR', cyclePosition: 0 },
    { source: 'UR', target: 'UB', cyclePosition: 1 },
    { source: 'UB', target: 'UF', cyclePosition: 2 }
  ],
  description: 'Basic edge algorithm',
  bufferPieces: ['UF']
};

const mockCornerAlgorithm: Algorithm = {
  id: 'B',
  type: 'corner',
  notation: "R U R' U' R U R'",
  stickerMappings: [
    { source: 'UFR_U', target: 'UBL_U' },
    { source: 'UBL_U', target: 'UFR_U' }
  ],
  bufferPieces: ['UFR']
};

describe('AlgorithmDisplay', () => {
  it('renders empty state when no algorithm is provided', () => {
    render(<AlgorithmDisplay />);
    
    expect(screen.getByText('No Algorithm Selected')).toBeInTheDocument();
    expect(screen.getByText('Select an algorithm from the browser to view its details and visualization')).toBeInTheDocument();
  });

  it('renders edge algorithm correctly', () => {
    render(<AlgorithmDisplay algorithm={mockEdgeAlgorithm} />);
    
    // Check algorithm ID and type
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('EDGE')).toBeInTheDocument();
    expect(screen.getByText('Edge Algorithm')).toBeInTheDocument();
    
    // Check notation
    expect(screen.getByText("R U' R' F R F'")).toBeInTheDocument();
    
    // Check buffer pieces section exists
    expect(screen.getByText('Buffer Pieces')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText('Basic edge algorithm')).toBeInTheDocument();
    
    // Check sticker mappings count
    expect(screen.getByText('3 mappings')).toBeInTheDocument();
    
    // Check that mapping arrows exist
    expect(screen.getAllByText('→')).toHaveLength(3);
  });

  it('renders corner algorithm correctly', () => {
    render(<AlgorithmDisplay algorithm={mockCornerAlgorithm} />);
    
    // Check algorithm ID and type
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('CORNER')).toBeInTheDocument();
    expect(screen.getByText('Corner Algorithm')).toBeInTheDocument();
    
    // Check notation
    expect(screen.getByText("R U R' U' R U R'")).toBeInTheDocument();
    
    // Check buffer pieces
    expect(screen.getByText('UFR')).toBeInTheDocument();
    
    // Check sticker mappings count
    expect(screen.getByText('2 mappings')).toBeInTheDocument();
  });

  it('handles algorithm without description', () => {
    const algorithmWithoutDescription = { ...mockCornerAlgorithm };
    delete algorithmWithoutDescription.description;
    
    render(<AlgorithmDisplay algorithm={algorithmWithoutDescription} />);
    
    // Should not render description section
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('handles single mapping correctly', () => {
    const singleMappingAlgorithm: Algorithm = {
      ...mockEdgeAlgorithm,
      stickerMappings: [{ source: 'UF', target: 'UR' }]
    };
    
    render(<AlgorithmDisplay algorithm={singleMappingAlgorithm} />);
    
    // Check singular form
    expect(screen.getByText('1 mapping')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AlgorithmDisplay algorithm={mockEdgeAlgorithm} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('algorithm-display', 'custom-class');
  });

  it('renders cycle positions when available', () => {
    render(<AlgorithmDisplay algorithm={mockEdgeAlgorithm} />);
    
    // Check cycle position indicators
    expect(screen.getByText('(cycle 1)')).toBeInTheDocument();
    expect(screen.getByText('(cycle 2)')).toBeInTheDocument();
    expect(screen.getByText('(cycle 3)')).toBeInTheDocument();
  });

  it('handles multiple buffer pieces', () => {
    const multiBufferAlgorithm: Algorithm = {
      ...mockEdgeAlgorithm,
      bufferPieces: ['UF', 'UR', 'UB']
    };
    
    render(<AlgorithmDisplay algorithm={multiBufferAlgorithm} />);
    
    // Should display buffer pieces section
    expect(screen.getByText('Buffer Pieces')).toBeInTheDocument();
    
    // Check that buffer pieces container exists
    const bufferPiecesContainer = screen.getByText('Buffer Pieces').nextElementSibling;
    expect(bufferPiecesContainer).toBeInTheDocument();
  });
});