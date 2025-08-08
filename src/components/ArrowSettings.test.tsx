import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrowSettings } from './ArrowSettings';

describe('ArrowSettings', () => {
  const defaultProps = {
    distanceFromCenter: 0.1,
    lineThickness: 0.02,
    coneSize: 0.2,
    arrowColor: '#ffff00',
    onDistanceChange: jest.fn(),
    onThicknessChange: jest.fn(),
    onConeSizeChange: jest.fn(),
    onColorChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all arrow setting controls', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    expect(screen.getByText('Arrow Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/Distance from Center/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Line Thickness/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrow Head Size/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrow Color/)).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('displays current values correctly', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    expect(screen.getByText('Distance from Center: 0.10')).toBeInTheDocument();
    expect(screen.getByText('Line Thickness: 0.020')).toBeInTheDocument();
    expect(screen.getByText('Arrow Head Size: 0.20')).toBeInTheDocument();
  });

  it('calls onDistanceChange when distance slider changes', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const distanceSlider = screen.getByLabelText(/Distance from Center/);
    fireEvent.change(distanceSlider, { target: { value: '0.25' } });
    
    expect(defaultProps.onDistanceChange).toHaveBeenCalledWith(0.25);
  });

  it('calls onThicknessChange when thickness slider changes', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const thicknessSlider = screen.getByLabelText(/Line Thickness/);
    fireEvent.change(thicknessSlider, { target: { value: '0.05' } });
    
    expect(defaultProps.onThicknessChange).toHaveBeenCalledWith(0.05);
  });

  it('calls onConeSizeChange when cone size slider changes', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const coneSizeSlider = screen.getByLabelText(/Arrow Head Size/);
    fireEvent.change(coneSizeSlider, { target: { value: '0.35' } });
    
    expect(defaultProps.onConeSizeChange).toHaveBeenCalledWith(0.35);
  });

  it('calls onColorChange when color picker changes', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const colorPicker = screen.getByDisplayValue('#ffff00');
    fireEvent.change(colorPicker, { target: { value: '#ff0000' } });
    
    expect(defaultProps.onColorChange).toHaveBeenCalledWith('#ff0000');
  });

  it('calls onColorChange when hex input changes with valid hex', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const hexInput = screen.getByDisplayValue('#ffff00');
    fireEvent.change(hexInput, { target: { value: '#00ff00' } });
    
    expect(defaultProps.onColorChange).toHaveBeenCalledWith('#00ff00');
  });

  it('does not call onColorChange when hex input has invalid format', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const hexInput = screen.getByDisplayValue('#ffff00');
    fireEvent.change(hexInput, { target: { value: 'invalid' } });
    
    expect(defaultProps.onColorChange).not.toHaveBeenCalled();
  });

  it('resets all values to defaults when reset button is clicked', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(defaultProps.onDistanceChange).toHaveBeenCalledWith(0.1);
    expect(defaultProps.onThicknessChange).toHaveBeenCalledWith(0.02);
    expect(defaultProps.onConeSizeChange).toHaveBeenCalledWith(0.2);
    expect(defaultProps.onColorChange).toHaveBeenCalledWith('#ffff00');
  });

  it('disables all controls when disabled prop is true', () => {
    render(<ArrowSettings {...defaultProps} disabled={true} />);
    
    const distanceSlider = screen.getByLabelText(/Distance from Center/);
    const thicknessSlider = screen.getByLabelText(/Line Thickness/);
    const coneSizeSlider = screen.getByLabelText(/Arrow Head Size/);
    const colorPicker = screen.getByDisplayValue('#ffff00');
    const resetButton = screen.getByText('Reset');
    
    expect(distanceSlider).toBeDisabled();
    expect(thicknessSlider).toBeDisabled();
    expect(coneSizeSlider).toBeDisabled();
    expect(colorPicker).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it('applies disabled class when disabled prop is true', () => {
    const { container } = render(<ArrowSettings {...defaultProps} disabled={true} />);
    
    const arrowSettings = container.querySelector('.arrow-settings');
    expect(arrowSettings).toHaveClass('disabled');
  });

  it('shows color preview with correct background color', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const colorPreview = document.querySelector('.color-preview');
    expect(colorPreview).toHaveStyle('background-color: rgb(255, 255, 0)');
  });

  it('has proper slider ranges and steps', () => {
    render(<ArrowSettings {...defaultProps} />);
    
    const distanceSlider = screen.getByLabelText(/Distance from Center/);
    const thicknessSlider = screen.getByLabelText(/Line Thickness/);
    const coneSizeSlider = screen.getByLabelText(/Arrow Head Size/);
    
    expect(distanceSlider).toHaveAttribute('min', '0.05');
    expect(distanceSlider).toHaveAttribute('max', '0.5');
    expect(distanceSlider).toHaveAttribute('step', '0.01');
    
    expect(thicknessSlider).toHaveAttribute('min', '0.005');
    expect(thicknessSlider).toHaveAttribute('max', '0.1');
    expect(thicknessSlider).toHaveAttribute('step', '0.005');
    
    expect(coneSizeSlider).toHaveAttribute('min', '0.05');
    expect(coneSizeSlider).toHaveAttribute('max', '0.5');
    expect(coneSizeSlider).toHaveAttribute('step', '0.05');
  });
});
