/**
 * ChromaShift Game - Constants Module
 * Central location for all game constants to avoid circular dependencies
 */

// Color constants
const COLOR_RED = '#e74c3c';
const COLOR_BLUE = '#3498db';
const COLOR_YELLOW = '#f1c40f';
const COLOR_GREEN = '#2ecc71';
const COLOR_PURPLE = '#9b59b6';
const COLORS = [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE];

// Difficulty parameters
const DIFFICULTY_LEVELS = {
  1: { name: "קל מאוד", adjacencyFactor: 0.85, colorCount: 3, targetMoves: 4 },     // Very Easy
  2: { name: "קל", adjacencyFactor: 0.80, colorCount: 3, targetMoves: 5 },          // Easy
  3: { name: "קל", adjacencyFactor: 0.75, colorCount: 4, targetMoves: 5 },          // Easy
  4: { name: "קל-בינוני", adjacencyFactor: 0.70, colorCount: 4, targetMoves: 6 },   // Easy-Medium
  5: { name: "קל-בינוני", adjacencyFactor: 0.65, colorCount: 5, targetMoves: 6 },   // Easy-Medium
  6: { name: "בינוני", adjacencyFactor: 0.60, colorCount: 5, targetMoves: 7 },      // Medium
  7: { name: "בינוני", adjacencyFactor: 0.55, colorCount: 5, targetMoves: 8 },      // Medium
  8: { name: "בינוני", adjacencyFactor: 0.50, colorCount: 5, targetMoves: 9 },      // Medium
  9: { name: "בינוני-קשה", adjacencyFactor: 0.45, colorCount: 5, targetMoves: 10 },  // Medium-Hard
  10: { name: "בינוני-קשה", adjacencyFactor: 0.40, colorCount: 5, targetMoves: 11 }, // Medium-Hard
  11: { name: "קשה", adjacencyFactor: 0.35, colorCount: 5, targetMoves: 12 },        // Hard
  12: { name: "קשה", adjacencyFactor: 0.30, colorCount: 5, targetMoves: 13 },        // Hard
  13: { name: "קשה", adjacencyFactor: 0.25, colorCount: 5, targetMoves: 14 },        // Hard
  14: { name: "קשה מאוד", adjacencyFactor: 0.20, colorCount: 5, targetMoves: 15 },   // Very Hard
  15: { name: "קשה מאוד", adjacencyFactor: 0.15, colorCount: 5, targetMoves: 16 },   // Very Hard
  16: { name: "קשה מאוד", adjacencyFactor: 0.10, colorCount: 5, targetMoves: 17 },   // Very Hard
  17: { name: "מומחה", adjacencyFactor: 0.05, colorCount: 5, targetMoves: 18 },      // Expert
  18: { name: "מומחה", adjacencyFactor: 0.03, colorCount: 5, targetMoves: 19 },      // Expert
  19: { name: "מומחה", adjacencyFactor: 0.02, colorCount: 5, targetMoves: 20 },      // Expert
  20: { name: "אלוף", adjacencyFactor: 0.01, colorCount: 5, targetMoves: 22 }        // Master
};

// Grade thresholds for scoring player performance
const GRADE_THRESHOLDS = {
  PERFECT: 0,   // Exactly matching the optimal solution
  GREAT: 1,     // Optimal + 1 move
  GOOD: 2,      // Optimal + 2 moves
  OK: 3,        // Optimal + 3 moves
  // Anything more is considered "Try Again"
};

// Grade display text
const GRADE_DISPLAY = {
  PERFECT: "מושלם!",    // Perfect!
  GREAT: "מצוין!",      // Great!
  GOOD: "טוב",          // Good
  OK: "סביר",           // OK
  FAIL: "נסה שוב"       // Try Again
};

// Grade color mapping
const GRADE_COLORS = {
  PERFECT: '#FFD700', // Gold
  GREAT: '#4CAF50',   // Green
  GOOD: '#2196F3',    // Blue
  OK: '#FF9800',      // Orange
  FAIL: '#F44336'     // Red
};

// Default storage keys
const STORAGE_KEYS = {
  bestScores: 'chromashift-best-scores',
  bestGrades: 'chromashift-best-grades',
  settings: 'chromashift-settings',
  completedLevels: 'chromashift-completed-levels'
};

export {
  // Colors
  COLOR_RED,
  COLOR_BLUE,
  COLOR_YELLOW,
  COLOR_GREEN,
  COLOR_PURPLE,
  COLORS,
  
  // Difficulty and grading
  DIFFICULTY_LEVELS,
  GRADE_THRESHOLDS,
  GRADE_DISPLAY,
  GRADE_COLORS,
  
  // Storage
  STORAGE_KEYS
};