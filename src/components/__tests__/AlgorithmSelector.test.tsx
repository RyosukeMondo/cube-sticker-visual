import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlgorithmSelector } from '../AlgorithmSelector';

// Mock the algorithm data
vi.mock('../../data/algorithms', () => ({
  ALGORITHM_DATA: {
    algorithms: [
      {
        id: 'UB-UR',
        type: 'edge',
        notation: '[R2 U\': [R2, S]]',
        stickerMappings: [],
        bufferPieces: ['UF']
      },
      {
        id: 'UFR-UBL',
        type: 'corner',
        notation: '[R U R\', D\']',
        stickerMappings: [],
        bufferPieces: ['UFR']
      }
    ],
    edgeCount: 1,
    cornerCount: 1
  }
}));

describe('AlgorithmSelector', () => {
  const mockOnAlgorithmSelect = vi.fn();

  beforeEach(() => {
    mockOnAlgorithmSelect.mockClear();
  });

  it('renders algorithm browser with correct counts', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    expect(screen.getByText('Algorithm Browser')).toBeInTheDocument();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
    expect(screen.getByText('Edge: 1')).toBeInTheDocument();
    expect(screen.getByText('Corner: 1')).toBeInTheDocument();
  });

  it('displays all algorithms by default', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    expect(screen.getByText('UB-UR')).toBeInTheDocument();
    expect(screen.getByText('UFR-UBL')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 algorithms')).toBeInTheDocument();
  });

  it('filters algorithms by category', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    // Click edge filter
    fireEvent.click(screen.getByText('Edge (1)'));
    expect(screen.getByText('UB-UR')).toBeInTheDocument();
    expect(screen.queryByText('UFR-UBL')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 algorithms')).toBeInTheDocument();
    
    // Click corner filter
    fireEvent.click(screen.getByText('Corner (1)'));
    expect(screen.queryByText('UB-UR')).not.toBeInTheDocument();
    expect(screen.getByText('UFR-UBL')).toBeInTheDocument();
  });

  it('searches algorithms by notation', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    const searchInput = screen.getByPlaceholderText(/Search algorithms/);
    fireEvent.change(searchInput, { target: { value: 'R2' } });
    
    expect(screen.getByText('UB-UR')).toBeInTheDocument();
    expect(screen.queryByText('UFR-UBL')).not.toBeInTheDocument();
  });

  it('calls onAlgorithmSelect when algorithm is clicked', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    fireEvent.click(screen.getByText('UB-UR'));
    
    expect(mockOnAlgorithmSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'UB-UR',
        type: 'edge'
      })
    );
  });

  it('clears search when clear button is clicked', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    const searchInput = screen.getByPlaceholderText(/Search algorithms/);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
  });

  it('shows no results message when search has no matches', () => {
    render(<AlgorithmSelector onAlgorithmSelect={mockOnAlgorithmSelect} />);
    
    const searchInput = screen.getByPlaceholderText(/Search algorithms/);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No algorithms found matching "nonexistent"')).toBeInTheDocument();
  });
});