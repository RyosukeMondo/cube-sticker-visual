import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ColorSettings } from '../ColorSettings';
import type { CubeColors } from '../../types/CubeColors';

const mockColors: CubeColors = {
  U: '#ffffff',
  D: '#ffff00',
  F: '#ff0000',
  B: '#ff8000',
  L: '#0000ff',
  R: '#00ff00'
};

describe('ColorSettings', () => {
  it('renders all face color controls', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    // Check that all face labels are present
    expect(screen.getByText('Up (White)')).toBeInTheDocument();
    expect(screen.getByText('Down (Yellow)')).toBeInTheDocument();
    expect(screen.getByText('Front (Red)')).toBeInTheDocument();
    expect(screen.getByText('Back (Orange)')).toBeInTheDocument();
    expect(screen.getByText('Left (Blue)')).toBeInTheDocument();
    expect(screen.getByText('Right (Green)')).toBeInTheDocument();
  });

  it('displays current color values correctly', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    // Check that color pickers have correct values using more specific selectors
    const upColorPicker = screen.getByTitle('Select color for Up (White) face');
    const downColorPicker = screen.getByTitle('Select color for Down (Yellow) face');
    const frontColorPicker = screen.getByTitle('Select color for Front (Red) face');
    
    expect(upColorPicker).toHaveValue('#ffffff');
    expect(downColorPicker).toHaveValue('#ffff00');
    expect(frontColorPicker).toHaveValue('#ff0000');
  });

  it('calls onColorChange when color picker value changes', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    const upColorPicker = screen.getByTitle('Select color for Up (White) face');
    fireEvent.change(upColorPicker, { target: { value: '#ff0000' } });

    expect(mockOnColorChange).toHaveBeenCalledWith('U', '#ff0000');
  });

  it('calls onColorChange when hex input value changes', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    const hexInputs = screen.getAllByTitle('Hex color code');
    fireEvent.change(hexInputs[0], { target: { value: '#123456' } });

    expect(mockOnColorChange).toHaveBeenCalledWith('U', '#123456');
  });

  it('resets colors to defaults when reset button is clicked', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Should call onColorChange for each face with default colors
    expect(mockOnColorChange).toHaveBeenCalledTimes(6);
    expect(mockOnColorChange).toHaveBeenCalledWith('U', '#ffffff');
    expect(mockOnColorChange).toHaveBeenCalledWith('D', '#ffff00');
    expect(mockOnColorChange).toHaveBeenCalledWith('F', '#ff0000');
    expect(mockOnColorChange).toHaveBeenCalledWith('B', '#ff8000');
    expect(mockOnColorChange).toHaveBeenCalledWith('L', '#0000ff');
    expect(mockOnColorChange).toHaveBeenCalledWith('R', '#00ff00');
  });

  it('disables all controls when disabled prop is true', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
        disabled={true}
      />
    );

    // Check that color pickers are disabled
    const colorPickers = screen.getAllByTitle(/Select color for .* face/);
    colorPickers.forEach(picker => {
      expect(picker).toBeDisabled();
    });

    // Check that hex inputs are disabled
    const hexInputs = screen.getAllByTitle('Hex color code');
    hexInputs.forEach(input => {
      expect(input).toBeDisabled();
    });

    // Check that reset button is disabled
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDisabled();
  });

  it('shows color preview with correct background colors', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    const previews = document.querySelectorAll('.color-setting__preview');
    
    expect(previews[0]).toHaveStyle('background-color: rgb(255, 255, 255)'); // #ffffff
    expect(previews[1]).toHaveStyle('background-color: rgb(255, 255, 0)');   // #ffff00
    expect(previews[2]).toHaveStyle('background-color: rgb(255, 0, 0)');     // #ff0000
  });

  it('renders title and description correctly', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    expect(screen.getByText('Cube Colors')).toBeInTheDocument();
    expect(screen.getByText(/Customize the colors of each cube face/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const mockOnColorChange = vi.fn();
    
    render(
      <ColorSettings
        colors={mockColors}
        onColorChange={mockOnColorChange}
      />
    );

    // Check that color pickers have proper titles
    expect(screen.getByTitle('Select color for Up (White) face')).toBeInTheDocument();
    expect(screen.getByTitle('Select color for Down (Yellow) face')).toBeInTheDocument();
    
    // Check that reset button has title attribute
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toHaveAttribute('title', 'Reset to default colors');
  });
});
