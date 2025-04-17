/**
 * ChromaShift Game - Configuration
 * Contains game constants, settings, and configuration
 */

// Import board generation functions from external file
import { DIFFICULTY_LEVELS, COLORS } from './boards.js';

// Global color variables
const COLOR_RED = '#e74c3c';
const COLOR_BLUE = '#3498db';
const COLOR_YELLOW = '#f1c40f';
const COLOR_GREEN = '#2ecc71';
const COLOR_PURPLE = '#9b59b6';

// Game configuration
const GameConfig = {
  
  // Color palette using global vars
  colors: [
    { hex: COLOR_RED, name: 'אדום' },    // Red
    { hex: COLOR_BLUE, name: 'כחול' },    // Blue
    { hex: COLOR_YELLOW, name: 'צהוב' },    // Yellow
    { hex: COLOR_GREEN, name: 'ירוק' },    // Green
    { hex: COLOR_PURPLE, name: 'סגול' }     // Purple
  ],
  boardSize: 6, // Fixed board size to 6x6
  // Dynamic tile size based on screen size
  get tileSize() {
    // Responsive tile sizing
    return window.innerWidth < 600 ? 45 : 60;
  },
  // Local storage keys
  storage: {
    bestScores: 'chromashift-best-scores',
    settings: 'chromashift-settings',
    completedLevels: 'chromashift-completed-levels' // Add storage key for completed levels
  }
};

export { 
  GameConfig,
  COLOR_RED, 
  COLOR_BLUE, 
  COLOR_YELLOW, 
  COLOR_GREEN, 
  COLOR_PURPLE,
  DIFFICULTY_LEVELS,
  COLORS
};