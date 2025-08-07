import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnimationControls } from '../AnimationControls';

describe('AnimationControls', () => {
  const defaultProps = {
    animationSpeed: 1.0,
    showArrows: true,
    isAnimating: false,
    onSpeedChange: vi.fn(),
    onToggleArrows: vi.fn(),
    onReplay: vi.fn(),
    disabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders animation controls with correct initial state', () => {
    render(<AnimationControls {...defaultProps} />);
    
    expect(screen.getByText('Animation Controls')).toBeInTheDocument();
    expect(screen.getByLabelText(/Speed/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrows/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Playback/)).toBeInTheDocument();
  });

  it('displays correct speed selector value', () => {
    render(<AnimationControls {...defaultProps} animationSpeed={2.0} />);
    
    const speedSelector = screen.getByDisplayValue('2x');
    expect(speedSelector).toBeInTheDocument();
  });

  it('calls onSpeedChange when speed is changed', () => {
    const onSpeedChange = vi.fn();
    render(<AnimationControls {...defaultProps} onSpeedChange={onSpeedChange} />);
    
    const speedSelector = screen.getByLabelText(/Speed/);
    fireEvent.change(speedSelector, { target: { value: '0.5' } });
    
    expect(onSpeedChange).toHaveBeenCalledWith(0.5);
  });

  it('displays correct arrow visibility state', () => {
    render(<AnimationControls {...defaultProps} showArrows={true} />);
    
    const toggleButton = screen.getByLabelText(/Hide arrows/);
    expect(toggleButton).toHaveClass('active');
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('calls onToggleArrows when arrow toggle is clicked', () => {
    const onToggleArrows = vi.fn();
    render(<AnimationControls {...defaultProps} onToggleArrows={onToggleArrows} />);
    
    const toggleButton = screen.getByLabelText(/Hide arrows/);
    fireEvent.click(toggleButton);
    
    expect(onToggleArrows).toHaveBeenCalled();
  });

  it('displays correct replay button state when not animating', () => {
    render(<AnimationControls {...defaultProps} isAnimating={false} />);
    
    const replayButton = screen.getByLabelText(/Replay animation/);
    expect(replayButton).toBeInTheDocument();
    expect(screen.getByText('Replay')).toBeInTheDocument();
  });

  it('displays correct replay button state when animating', () => {
    render(<AnimationControls {...defaultProps} isAnimating={true} />);
    
    const replayButton = screen.getByLabelText(/Replay animation/);
    expect(replayButton).toHaveClass('animating');
    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });

  it('calls onReplay when replay button is clicked', () => {
    const onReplay = vi.fn();
    render(<AnimationControls {...defaultProps} onReplay={onReplay} />);
    
    const replayButton = screen.getByLabelText(/Replay animation/);
    fireEvent.click(replayButton);
    
    expect(onReplay).toHaveBeenCalled();
  });

  it('disables all controls when disabled prop is true', () => {
    render(<AnimationControls {...defaultProps} disabled={true} />);
    
    const speedSelector = screen.getByLabelText(/Speed/);
    const toggleButton = screen.getByLabelText(/arrows/);
    const replayButton = screen.getByLabelText(/Replay animation/);
    
    expect(speedSelector).toBeDisabled();
    expect(toggleButton).toBeDisabled();
    expect(replayButton).toBeDisabled();
  });

  it('shows correct status indicator when not animating', () => {
    render(<AnimationControls {...defaultProps} isAnimating={false} />);
    
    expect(screen.getByText('Animation Ready')).toBeInTheDocument();
    const statusIndicator = screen.getByText('Animation Ready').closest('.status-indicator');
    expect(statusIndicator).toHaveClass('idle');
  });

  it('shows correct status indicator when animating', () => {
    render(<AnimationControls {...defaultProps} isAnimating={true} />);
    
    expect(screen.getByText('Animation Playing')).toBeInTheDocument();
    const statusIndicator = screen.getByText('Animation Playing').closest('.status-indicator');
    expect(statusIndicator).toHaveClass('active');
  });

  it('displays speed indicator text correctly', () => {
    const { rerender } = render(<AnimationControls {...defaultProps} animationSpeed={0.5} />);
    expect(screen.getByText('Slower')).toBeInTheDocument();
    
    rerender(<AnimationControls {...defaultProps} animationSpeed={1.0} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
    
    rerender(<AnimationControls {...defaultProps} animationSpeed={2.0} />);
    expect(screen.getByText('Faster')).toBeInTheDocument();
  });

  it('validates speed options are available', () => {
    render(<AnimationControls {...defaultProps} />);
    
    const speedSelector = screen.getByLabelText(/Speed/);
    const options = speedSelector.querySelectorAll('option');
    
    expect(options).toHaveLength(7); // 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 3x
    expect(options[0]).toHaveValue('0.25');
    expect(options[3]).toHaveValue('1');
    expect(options[6]).toHaveValue('3');
  });
});
