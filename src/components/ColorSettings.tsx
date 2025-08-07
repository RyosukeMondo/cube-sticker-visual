import React from 'react';
import type { CubeColors } from '../types/CubeColors';
import './ColorSettings.css';

interface ColorSettingsProps {
  colors: CubeColors;
  onColorChange: (face: keyof CubeColors, color: string) => void;
  disabled?: boolean;
}

const FACE_LABELS = {
  U: 'Up (White)',
  D: 'Down (Yellow)', 
  F: 'Front (Red)',
  B: 'Back (Orange)',
  L: 'Left (Blue)',
  R: 'Right (Green)'
} as const;

export const ColorSettings: React.FC<ColorSettingsProps> = ({
  colors,
  onColorChange,
  disabled = false
}) => {
  const handleColorChange = (face: keyof CubeColors, event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    onColorChange(face, newColor);
  };

  const resetToDefaults = () => {
    onColorChange('U', '#ffffff'); // White
    onColorChange('D', '#ffff00'); // Yellow
    onColorChange('F', '#ff0000'); // Red
    onColorChange('B', '#ff8000'); // Orange
    onColorChange('L', '#0000ff'); // Blue
    onColorChange('R', '#00ff00'); // Green
  };

  return (
    <div className="color-settings">
      <div className="color-settings__header">
        <h3 className="color-settings__title">Cube Colors</h3>
        <button
          className="color-settings__reset-btn"
          onClick={resetToDefaults}
          disabled={disabled}
          title="Reset to default colors"
        >
          Reset
        </button>
      </div>
      
      <div className="color-settings__grid">
        {(Object.keys(FACE_LABELS) as Array<keyof CubeColors>).map((face) => (
          <div key={face} className="color-setting">
            <label className="color-setting__label" htmlFor={`color-${face}`}>
              {FACE_LABELS[face]}
            </label>
            <div className="color-setting__input-group">
              <input
                id={`color-${face}`}
                type="color"
                value={colors[face]}
                onChange={(e) => handleColorChange(face, e)}
                disabled={disabled}
                className="color-setting__picker"
                title={`Select color for ${FACE_LABELS[face]} face`}
              />
              <div 
                className="color-setting__preview"
                style={{ backgroundColor: colors[face] }}
                title={`Current color: ${colors[face]}`}
              />
              <input
                type="text"
                value={colors[face]}
                onChange={(e) => handleColorChange(face, e)}
                disabled={disabled}
                className="color-setting__hex"
                placeholder="#ffffff"
                pattern="^#[0-9A-Fa-f]{6}$"
                title="Hex color code"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="color-settings__info">
        <p className="color-settings__description">
          Customize the colors of each cube face. Changes apply immediately to the 3D visualization.
        </p>
      </div>
    </div>
  );
};
