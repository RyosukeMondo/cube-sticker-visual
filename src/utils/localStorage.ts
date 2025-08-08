import React from 'react';
import type { CubeColors } from '../types/CubeColors';

// Local storage keys
const STORAGE_KEYS = {
  CUBE_COLORS: 'cube-visualizer-colors',
  STICKER_SETTINGS: 'cube-visualizer-sticker-settings',
} as const;

// Sticker settings interface
export interface StickerSettings {
  size: number;
  spacing: number;
  thickness: number;
  transparency: number;
  chamfer: number;
}

/**
 * Local storage utility class for managing cube visualizer settings
 * Follows SRP by handling only storage operations
 */
export class LocalStorageManager {
  /**
   * Save cube colors to local storage
   * @param colors - Cube colors configuration
   */
  static saveCubeColors(colors: CubeColors): void {
    try {
      const serialized = JSON.stringify(colors);
      localStorage.setItem(STORAGE_KEYS.CUBE_COLORS, serialized);
    } catch (error) {
      console.warn('Failed to save cube colors to local storage:', error);
    }
  }

  /**
   * Load cube colors from local storage
   * @param defaultColors - Default colors to use if none saved
   * @returns Saved colors or default colors
   */
  static loadCubeColors(defaultColors: CubeColors): CubeColors {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUBE_COLORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that all required color properties exist
        if (this.isValidCubeColors(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load cube colors from local storage:', error);
    }
    return defaultColors;
  }

  /**
   * Save sticker settings to local storage
   * @param settings - Sticker configuration settings
   */
  static saveStickerSettings(settings: StickerSettings): void {
    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(STORAGE_KEYS.STICKER_SETTINGS, serialized);
    } catch (error) {
      console.warn('Failed to save sticker settings to local storage:', error);
    }
  }

  /**
   * Load sticker settings from local storage
   * @param defaultSettings - Default settings to use if none saved
   * @returns Saved settings or default settings
   */
  static loadStickerSettings(defaultSettings: StickerSettings): StickerSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STICKER_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that all required setting properties exist
        if (this.isValidStickerSettings(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load sticker settings from local storage:', error);
    }
    return defaultSettings;
  }

  /**
   * Clear all saved settings from local storage
   */
  static clearAllSettings(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CUBE_COLORS);
      localStorage.removeItem(STORAGE_KEYS.STICKER_SETTINGS);
    } catch (error) {
      console.warn('Failed to clear settings from local storage:', error);
    }
  }

  /**
   * Check if local storage is available
   * @returns True if local storage is supported and available
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate cube colors object structure
   * @param colors - Object to validate
   * @returns True if valid cube colors object
   */
  private static isValidCubeColors(colors: unknown): colors is CubeColors {
    if (!colors || typeof colors !== 'object' || colors === null) {
      return false;
    }
    
    const colorObj = colors as Record<string, unknown>;
    return (
      typeof colorObj['U'] === 'string' &&
      typeof colorObj['D'] === 'string' &&
      typeof colorObj['F'] === 'string' &&
      typeof colorObj['B'] === 'string' &&
      typeof colorObj['L'] === 'string' &&
      typeof colorObj['R'] === 'string'
    );
  }

  /**
   * Validate sticker settings object structure
   * @param settings - Object to validate
   * @returns True if valid sticker settings object
   */
  private static isValidStickerSettings(settings: unknown): settings is StickerSettings {
    if (!settings || typeof settings !== 'object' || settings === null) {
      return false;
    }
    
    const settingsObj = settings as Record<string, unknown>;
    return (
      typeof settingsObj['size'] === 'number' &&
      typeof settingsObj['spacing'] === 'number' &&
      typeof settingsObj['thickness'] === 'number' &&
      typeof settingsObj['transparency'] === 'number' &&
      typeof settingsObj['chamfer'] === 'number' &&
      settingsObj['size'] >= 0 &&
      settingsObj['spacing'] >= 0 &&
      settingsObj['thickness'] >= 0 &&
      settingsObj['transparency'] >= 0 &&
      settingsObj['transparency'] <= 1 &&
      settingsObj['chamfer'] >= 0
    );
  }
}

/**
 * Hook for managing cube colors with local storage persistence
 * @param defaultColors - Default cube colors
 * @returns Tuple of [colors, setColors] with automatic persistence
 */
export const usePersistentCubeColors = (defaultColors: CubeColors) => {
  const [colors, setColors] = React.useState<CubeColors>(() => 
    LocalStorageManager.loadCubeColors(defaultColors)
  );

  const updateColors = React.useCallback((newColors: CubeColors | ((prev: CubeColors) => CubeColors)) => {
    setColors(prev => {
      const updated = typeof newColors === 'function' ? newColors(prev) : newColors;
      LocalStorageManager.saveCubeColors(updated);
      return updated;
    });
  }, []);

  return [colors, updateColors] as const;
};

/**
 * Hook for managing sticker settings with local storage persistence
 * @param defaultSettings - Default sticker settings
 * @returns Tuple of [settings, setSettings] with automatic persistence
 */
export const usePersistentStickerSettings = (defaultSettings: StickerSettings) => {
  const [settings, setSettings] = React.useState<StickerSettings>(() =>
    LocalStorageManager.loadStickerSettings(defaultSettings)
  );

  const updateSettings = React.useCallback((newSettings: StickerSettings | ((prev: StickerSettings) => StickerSettings)) => {
    setSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      LocalStorageManager.saveStickerSettings(updated);
      return updated;
    });
  }, []);

  return [settings, updateSettings] as const;
};
