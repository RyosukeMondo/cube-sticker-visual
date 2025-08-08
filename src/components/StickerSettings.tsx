import React from 'react';
import './StickerSettings.css';

interface StickerSettingsProps {
  stickerSize: number;        // Sticker size (0.1 - 0.8)
  stickerSpacing: number;     // Distance between stickers (0.0 - 3.0)
  stickerThickness: number;   // Sticker thickness (0.01 - 0.1)
  stickerTransparency: number; // Transparency level (0.0 - 1.0)
  stickerChamfer: number;     // Chamfer/bevel amount (0.0 - 0.1)
  showEdges: boolean;         // Show edge lines on stickers
  edgeThickness: number;      // Edge line thickness (1.0 - 5.0)
  edgeColor: string;          // Edge line color (hex)
  onStickerSizeChange: (size: number) => void;
  onStickerSpacingChange: (spacing: number) => void;
  onStickerThicknessChange: (thickness: number) => void;
  onStickerTransparencyChange: (transparency: number) => void;
  onStickerChamferChange: (chamfer: number) => void;
  onShowEdgesChange: (showEdges: boolean) => void;
  onEdgeThicknessChange: (edgeThickness: number) => void;
  onEdgeColorChange: (edgeColor: string) => void;
  disabled?: boolean;
}

export const StickerSettings: React.FC<StickerSettingsProps> = ({
  stickerSize,
  stickerSpacing,
  stickerThickness,
  stickerTransparency,
  stickerChamfer,
  showEdges,
  edgeThickness,
  edgeColor,
  onStickerSizeChange,
  onStickerSpacingChange,
  onStickerThicknessChange,
  onStickerTransparencyChange,
  onStickerChamferChange,
  onShowEdgesChange,
  onEdgeThicknessChange,
  onEdgeColorChange,
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

  const handleShowEdgesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newShowEdges = event.target.checked;
    onShowEdgesChange(newShowEdges);
  };

  const handleEdgeThicknessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEdgeThickness = parseFloat(event.target.value);
    onEdgeThicknessChange(newEdgeThickness);
  };

  const handleEdgeColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEdgeColor = event.target.value;
    onEdgeColorChange(newEdgeColor);
  };

  const resetToDefaults = () => {
    onStickerSizeChange(0.45);        // Default size
    onStickerSpacingChange(0.0);      // Default spacing (no gap)
    onStickerThicknessChange(0.05);   // Default thickness
    onStickerTransparencyChange(1.0); // Default fully opaque
    onStickerChamferChange(0.02);     // Default chamfer amount
    onShowEdgesChange(false);         // Default edge visibility
    onEdgeThicknessChange(2.0);       // Default edge thickness
    onEdgeColorChange('#000000');     // Default edge color
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

        {/* Edge Lines Section */}
        <div className="sticker-setting" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '15px', marginTop: '15px' }}>
          <div className="sticker-setting__checkbox-group">
            <input
              id="show-edges-checkbox"
              type="checkbox"
              checked={showEdges}
              onChange={handleShowEdgesChange}
              disabled={disabled}
              className="sticker-setting__checkbox"
            />
            <label className="sticker-setting__checkbox-label" htmlFor="show-edges-checkbox">
              Show Edge Lines
            </label>
          </div>
        </div>

        {/* Edge Thickness Control - only show when edges are enabled */}
        {showEdges && (
          <div className="sticker-setting">
            <label className="sticker-setting__label" htmlFor="edge-thickness-slider">
              Edge Thickness: {edgeThickness.toFixed(1)}
            </label>
            <div className="sticker-setting__slider-group">
              <span className="sticker-setting__min-label">Thin</span>
              <input
                id="edge-thickness-slider"
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={edgeThickness}
                onChange={handleEdgeThicknessChange}
                disabled={disabled}
                className="sticker-setting__slider"
                title={`Edge thickness: ${edgeThickness.toFixed(1)}`}
              />
              <span className="sticker-setting__max-label">Thick</span>
            </div>
          </div>
        )}

        {/* Edge Color Control - only show when edges are enabled */}
        {showEdges && (
          <div className="sticker-setting">
            <label className="sticker-setting__label" htmlFor="edge-color-picker">
              Edge Color
            </label>
            <div className="sticker-setting__color-group">
              <input
                id="edge-color-picker"
                type="color"
                value={edgeColor}
                onChange={handleEdgeColorChange}
                disabled={disabled}
                className="sticker-setting__color-picker"
                title={`Edge color: ${edgeColor}`}
              />
              <span className="sticker-setting__color-value">{edgeColor}</span>
            </div>
          </div>
        )}
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
