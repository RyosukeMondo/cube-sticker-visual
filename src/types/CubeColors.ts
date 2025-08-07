export interface CubeColors {
  U: string; // Up face (white)
  D: string; // Down face (yellow)
  F: string; // Front face (red)
  B: string; // Back face (orange)
  L: string; // Left face (blue)
  R: string; // Right face (green)
}

export const DEFAULT_CUBE_COLORS: CubeColors = {
  U: '#ffffff', // White
  D: '#ffff00', // Yellow
  F: '#ff0000', // Red
  B: '#ff8000', // Orange
  L: '#0000ff', // Blue
  R: '#00ff00', // Green
};

export interface StickerState {
  id: string;
  color: string;
  highlighted: boolean;
  highlightColor?: string;
}