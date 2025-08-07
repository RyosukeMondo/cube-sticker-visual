import React from 'react';
import './AnimationControls.css';

export interface AnimationControlsProps {
  animationSpeed: number;
  showArrows: boolean;
  isAnimating: boolean;
  onSpeedChange: (speed: number) => void;
  onToggleArrows: () => void;
  onReplay: () => void;
  disabled?: boolean;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  animationSpeed,
  showArrows,
  isAnimating,
  onSpeedChange,
  onToggleArrows,
  onReplay,
  disabled = false
}) => {
  const speedOptions = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 3.0, label: '3x' }
  ];

  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(event.target.value);
    onSpeedChange(newSpeed);
  };

  return (
    <div className={`animation-controls ${disabled ? 'disabled' : ''}`}>
      <div className="controls-header">
        <h4 className="controls-title">
          <span className="controls-icon">🎬</span>
          Animation Controls
        </h4>
      </div>

      <div className="controls-grid">
        {/* Speed Control */}
        <div className="control-group">
          <label className="control-label" htmlFor="animation-speed">
            <span className="label-icon">⚡</span>
            Speed
          </label>
          <select
            id="animation-speed"
            className="speed-selector"
            value={animationSpeed}
            onChange={handleSpeedChange}
            disabled={disabled}
          >
            {speedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="speed-indicator">
            {animationSpeed < 1 ? 'Slower' : animationSpeed > 1 ? 'Faster' : 'Normal'}
          </span>
        </div>

        {/* Arrow Visibility Toggle */}
        <div className="control-group">
          <label className="control-label">
            <span className="label-icon">👁️</span>
            Arrows
          </label>
          <button
            className={`toggle-button ${showArrows ? 'active' : 'inactive'}`}
            onClick={onToggleArrows}
            disabled={disabled}
            aria-label={showArrows ? 'Hide arrows' : 'Show arrows'}
          >
            <span className="toggle-icon">
              {showArrows ? '🏹' : '🚫'}
            </span>
            <span className="toggle-text">
              {showArrows ? 'Visible' : 'Hidden'}
            </span>
          </button>
        </div>

        {/* Replay Button */}
        <div className="control-group">
          <label className="control-label">
            <span className="label-icon">🔄</span>
            Playback
          </label>
          <button
            className={`replay-button ${isAnimating ? 'animating' : ''}`}
            onClick={onReplay}
            disabled={disabled}
            aria-label="Replay animation"
          >
            <span className="replay-icon">
              {isAnimating ? '⏸️' : '▶️'}
            </span>
            <span className="replay-text">
              {isAnimating ? 'Playing...' : 'Replay'}
            </span>
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="animation-status">
        <div className={`status-indicator ${isAnimating ? 'active' : 'idle'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {isAnimating ? 'Animation Playing' : 'Animation Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
