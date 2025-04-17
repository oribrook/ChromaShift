/**
 * ChromaShift Game - Configuration
 * Contains game constants, settings, and configuration
 */

// Import constants from the constants file
import { 
  COLOR_RED, 
  COLOR_BLUE, 
  COLOR_YELLOW, 
  COLOR_GREEN, 
  COLOR_PURPLE,
  DIFFICULTY_LEVELS,
  GRADE_THRESHOLDS,
  GRADE_DISPLAY,
  GRADE_COLORS,
  STORAGE_KEYS
} from './constants.js';

// Game configuration
const GameConfig = {
  
  // Color palette using imported constants
  colors: [
    { hex: COLOR_RED, name: 'אדום' },    // Red
    { hex: COLOR_BLUE, name: 'כחול' },    // Blue
    { hex: COLOR_YELLOW, name: 'צהוב' },    // Yellow
    { hex: COLOR_GREEN, name: 'ירוק' },    // Green
    { hex: COLOR_PURPLE, name: 'סגול' }     // Purple
  ],
  boardSize: 6, // Fixed board size to 6x6
  
  // Grading settings
  grading: {
    thresholds: GRADE_THRESHOLDS,
    display: GRADE_DISPLAY,
    colors: GRADE_COLORS
  },
  
  // Dynamic tile size based on screen size
  get tileSize() {
    // Responsive tile sizing
    return window.innerWidth < 600 ? 45 : 60;
  },
  
  // Local storage keys
  storage: STORAGE_KEYS
};

export { 
  GameConfig,
  DIFFICULTY_LEVELS
};