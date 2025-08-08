import React from 'react';
import './ArrowSettings.css';

export interface ArrowSettingsProps {
  magnification: number;
  lineThickness: number;
  coneSize: number;
  arrowColor: string;
  onMagnificationChange: (magnification: number) => void;
  onThicknessChange: (thickness: number) => void;
  onConeSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function ArrowSettings({
  magnification,
  lineThickness,
  coneSize,
  arrowColor,
  onMagnificationChange,
  onThicknessChange,
  onConeSizeChange,
  onColorChange,
  disabled = false
}: ArrowSettingsProps) {
  const handleMagnificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onMagnificationChange(parseFloat(event.target.value));
  };

  const handleThicknessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onThicknessChange(parseFloat(event.target.value));
  };

  const handleConeSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onConeSizeChange(parseFloat(event.target.value));
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(event.target.value);
  };

  const handleHexInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Validate hex color format
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(value);
    }
  };

  const resetToDefaults = () => {
    onMagnificationChange(1.0);
    onThicknessChange(0.05);
    onConeSizeChange(0.2);
    onColorChange('#ffff00');
  };

  return (
    <div className={`arrow-settings ${disabled ? 'disabled' : ''}`}>
      <div className="arrow-settings-header">
        <h3>Arrow Settings</h3>
        <button 
          className="reset-button"
          onClick={resetToDefaults}
          disabled={disabled}
          title="Reset to defaults"
        >
          Reset
        </button>
      </div>

      <div className="arrow-settings-content">
        {/* Arrow Magnification */}
        <div className="setting-group">
          <label htmlFor="magnification-slider">
            Arrow Size: {magnification.toFixed(1)}x
          </label>
          <input
            id="magnification-slider"
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={magnification}
            onChange={handleMagnificationChange}
            disabled={disabled}
            className="slider"
          />
          <div className="slider-labels">
            <span>Small (0.5x)</span>
            <span>Large (3.0x)</span>
          </div>
        </div>

        {/* Line Thickness */}
        <div className="setting-group">
          <label htmlFor="thickness-slider">
            Line Thickness: {lineThickness.toFixed(2)}
          </label>
          <input
            id="thickness-slider"
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={lineThickness}
            onChange={handleThicknessChange}
            disabled={disabled}
            className="slider"
          />
          <div className="slider-labels">
            <span>Thin (0.01)</span>
            <span>Thick (0.5)</span>
          </div>
        </div>

        {/* Cone Size */}
        <div className="setting-group">
          <label htmlFor="cone-slider">
            Arrow Head Size: {coneSize.toFixed(2)}
          </label>
          <input
            id="cone-slider"
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={coneSize}
            onChange={handleConeSizeChange}
            disabled={disabled}
            className="slider"
          />
          <div className="slider-labels">
            <span>Small (0.05)</span>
            <span>Large (0.5)</span>
          </div>
        </div>

        {/* Color Picker */}
        <div className="setting-group">
          <label htmlFor="color-picker">Arrow Color</label>
          <div className="color-input-group">
            <input
              id="color-picker"
              type="color"
              value={arrowColor}
              onChange={handleColorChange}
              disabled={disabled}
              className="color-picker"
            />
            <input
              type="text"
              value={arrowColor}
              onChange={handleHexInputChange}
              disabled={disabled}
              className="hex-input"
              placeholder="#ffff00"
              maxLength={7}
            />
          </div>
          <div className="color-preview" style={{ backgroundColor: arrowColor }}></div>
        </div>
      </div>
    </div>
  );
}
