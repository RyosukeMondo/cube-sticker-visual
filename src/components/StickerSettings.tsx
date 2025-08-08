import React from 'react';
import './StickerSettings.css';

interface StickerSettingsProps {
  stickerSize: number;
  onStickerSizeChange: (size: number) => void;
  disabled?: boolean;
}

export const StickerSettings: React.FC<StickerSettingsProps> = ({
  stickerSize,
  onStickerSizeChange,
  disabled = false
}) => {
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(event.target.value);
    onStickerSizeChange(newSize);
  };

  const resetToDefault = () => {
    onStickerSizeChange(0.45); // Default sticker size
  };

  // Convert size to percentage for display (0.3 = 30%, 0.6 = 60%, etc.)
  const sizePercentage = Math.round(stickerSize * 100);

  return (
    <div className="sticker-settings">
      <div className="sticker-settings__header">
        <h3 className="sticker-settings__title">Sticker Size</h3>
        <button
          className="sticker-settings__reset-btn"
          onClick={resetToDefault}
          disabled={disabled}
          title="Reset to default size"
        >
          Reset
        </button>
      </div>
      
      <div className="sticker-settings__control">
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
          <div className="sticker-setting__value">
            <input
              type="number"
              min="0.2"
              max="0.8"
              step="0.05"
              value={stickerSize}
              onChange={handleSizeChange}
              disabled={disabled}
              className="sticker-setting__number"
              title="Exact size value"
            />
          </div>
        </div>
      </div>
      
      <div className="sticker-settings__info">
        <p className="sticker-settings__description">
          Adjust the size of the 3D sticker cubes. Changes apply immediately to the visualization.
        </p>
      </div>
    </div>
  );
};
