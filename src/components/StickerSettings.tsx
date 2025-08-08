import React from 'react';
import './StickerSettings.css';

interface StickerSettingsProps {
  stickerSize: number;        // Sticker size (0.1 - 0.8)
  stickerSpacing: number;     // Distance between stickers (0.0 - 3.0)
  stickerThickness: number;   // Sticker thickness (0.01 - 0.1)
  stickerTransparency: number; // Transparency level (0.0 - 1.0)
  stickerChamfer: number;     // Chamfer/bevel amount (0.0 - 0.1)
  onStickerSizeChange: (size: number) => void;
  onStickerSpacingChange: (spacing: number) => void;
  onStickerThicknessChange: (thickness: number) => void;
  onStickerTransparencyChange: (transparency: number) => void;
  onStickerChamferChange: (chamfer: number) => void;
  disabled?: boolean;
}

export const StickerSettings: React.FC<StickerSettingsProps> = ({
  stickerSize,
  stickerSpacing,
  stickerThickness,
  stickerTransparency,
  stickerChamfer,
  onStickerSizeChange,
  onStickerSpacingChange,
  onStickerThicknessChange,
  onStickerTransparencyChange,
  onStickerChamferChange,
  disabled = false
}) => {
  // Event handlers for each control
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(event.target.value);
    onStickerSizeChange(newSize);
  };

  const handleSpacingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpacing = parseFloat(event.target.value);
    onStickerSpacingChange(newSpacing);
  };

  const handleThicknessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newThickness = parseFloat(event.target.value);
    onStickerThicknessChange(newThickness);
  };

  const handleTransparencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTransparency = parseFloat(event.target.value);
    onStickerTransparencyChange(newTransparency);
  };

  const handleChamferChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChamfer = parseFloat(event.target.value);
    onStickerChamferChange(newChamfer);
  };

  const resetToDefaults = () => {
    onStickerSizeChange(0.45);        // Default size
    onStickerSpacingChange(0.0);      // Default spacing (no gap)
    onStickerThicknessChange(0.05);   // Default thickness
    onStickerTransparencyChange(1.0); // Default fully opaque
    onStickerChamferChange(0.02);     // Default chamfer amount
  };

  // Convert values to percentages for display
  const sizePercentage = Math.round(stickerSize * 100);
  const spacingPercentage = Math.round(stickerSpacing * 100);
  const thicknessPercentage = Math.round(stickerThickness * 100);
  const transparencyPercentage = Math.round(stickerTransparency * 100);
  const chamferPercentage = Math.round(stickerChamfer * 100);

  return (
    <div className="sticker-settings">
      <div className="sticker-settings__header">
        <h3 className="sticker-settings__title">Sticker Controls</h3>
        <button
          className="sticker-settings__reset-btn"
          onClick={resetToDefaults}
          disabled={disabled}
          title="Reset all settings to defaults"
        >
          Reset All
        </button>
      </div>
      
      <div className="sticker-settings__controls">
        {/* Size Control */}
        <div className="sticker-setting">
          <label className="sticker-setting__label" htmlFor="sticker-size-slider">
            Size: {sizePercentage}%
          </label>
          <div className="sticker-setting__slider-group">
            <span className="sticker-setting__min-label">Small</span>
            <input
              id="sticker-size-slider"
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={stickerSize}
              onChange={handleSizeChange}
              disabled={disabled}
              className="sticker-setting__slider"
              title={`Sticker size: ${sizePercentage}%`}
            />
            <span className="sticker-setting__max-label">Large</span>
          </div>
        </div>

        {/* Spacing Control */}
        <div className="sticker-setting">
          <label className="sticker-setting__label" htmlFor="sticker-spacing-slider">
            Spacing: {spacingPercentage}%
          </label>
          <div className="sticker-setting__slider-group">
            <span className="sticker-setting__min-label">None</span>
            <input
              id="sticker-spacing-slider"
              type="range"
              min="0.0"
              max="3.0"
              step="0.05"
              value={stickerSpacing}
              onChange={handleSpacingChange}
              disabled={disabled}
              className="sticker-setting__slider"
              title={`Sticker spacing: ${spacingPercentage}%`}
            />
            <span className="sticker-setting__max-label">Extreme</span>
          </div>
        </div>

        {/* Thickness Control */}
        <div className="sticker-setting">
          <label className="sticker-setting__label" htmlFor="sticker-thickness-slider">
            Thickness: {thicknessPercentage}%
          </label>
          <div className="sticker-setting__slider-group">
            <span className="sticker-setting__min-label">Thin</span>
            <input
              id="sticker-thickness-slider"
              type="range"
              min="0.01"
              max="0.1"
              step="0.005"
              value={stickerThickness}
              onChange={handleThicknessChange}
              disabled={disabled}
              className="sticker-setting__slider"
              title={`Sticker thickness: ${thicknessPercentage}%`}
            />
            <span className="sticker-setting__max-label">Thick</span>
          </div>
        </div>

        {/* Transparency Control */}
        <div className="sticker-setting">
          <label className="sticker-setting__label" htmlFor="sticker-transparency-slider">
            Opacity: {transparencyPercentage}%
          </label>
          <div className="sticker-setting__slider-group">
            <span className="sticker-setting__min-label">Clear</span>
            <input
              id="sticker-transparency-slider"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={stickerTransparency}
              onChange={handleTransparencyChange}
              disabled={disabled}
              className="sticker-setting__slider"
              title={`Sticker opacity: ${transparencyPercentage}%`}
            />
            <span className="sticker-setting__max-label">Solid</span>
          </div>
        </div>

        {/* Chamfer Control */}
        <div className="sticker-setting">
          <label className="sticker-setting__label" htmlFor="sticker-chamfer-slider">
            Chamfer: {chamferPercentage}%
          </label>
          <div className="sticker-setting__slider-group">
            <span className="sticker-setting__min-label">Sharp</span>
            <input
              id="sticker-chamfer-slider"
              type="range"
              min="0.0"
              max="0.1"
              step="0.005"
              value={stickerChamfer}
              onChange={handleChamferChange}
              disabled={disabled}
              className="sticker-setting__slider"
              title={`Sticker chamfer: ${chamferPercentage}%`}
            />
            <span className="sticker-setting__max-label">Rounded</span>
          </div>
        </div>
      </div>
      
      <div className="sticker-settings__info">
        <p className="sticker-settings__description">
          Adjust sticker appearance: size, spacing between stickers, thickness, transparency, and chamfer (面取り). 
          Changes apply immediately to the visualization.
        </p>
      </div>
    </div>
  );
};
