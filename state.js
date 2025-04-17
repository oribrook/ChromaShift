/**
 * ChromaShift Game - State Management
 * Handles game state, scoring, and persistence
 */

import { GameConfig, DIFFICULTY_LEVELS } from './config.js';

// Game state
const GameState = {
  board: [],           // Color of each tile
  owned: [],           // Tracking owned tiles
  moveCount: 0,        // Current move counter
  boardSize: GameConfig.boardSize,
  bestScores: {},      // Best scores for each board level
  completedLevels: {}, // Track which levels have been completed
  activeTiles: 0,      // Count of owned tiles (for animation purposes)
  gameActive: false,   // Whether a game is in progress
  initialColor: '',    // Store the initial color to handle the same-color bug
  currentLevel: 1,     // Current level (1-20)
  currentSeed: null,   // Current random seed for board generation

  // Load saved settings and scores
  init() {
    // Load best scores from local storage
    const savedScores = localStorage.getItem(GameConfig.storage.bestScores);
    if (savedScores) {
      this.bestScores = JSON.parse(savedScores);
    }

    // Load completed levels from local storage
    const savedCompletedLevels = localStorage.getItem(GameConfig.storage.completedLevels);
    if (savedCompletedLevels) {
      this.completedLevels = JSON.parse(savedCompletedLevels);
    }

    // Load saved level
    const savedSettings = localStorage.getItem(GameConfig.storage.settings);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.currentLevel) {
        this.currentLevel = settings.currentLevel;
      }
    }
  },

  // Save settings
  saveSettings() {
    const settings = {
      currentLevel: this.currentLevel
    };
    localStorage.setItem(GameConfig.storage.settings, JSON.stringify(settings));
  },

  // Check if level is unlocked
  isLevelUnlocked(level) {
    // Level 1 is always unlocked
    if (level === 1) return true;
    
    // Random board is always unlocked
    if (level === 0) return true;
    
    // For other levels, check if the previous level was completed
    const prevLevel = level - 1;
    return this.isLevelCompleted(prevLevel);
  },

  // Mark level as completed
  markLevelCompleted(level) {
    this.completedLevels[level] = true;
    localStorage.setItem(GameConfig.storage.completedLevels, JSON.stringify(this.completedLevels));
  },

  // Check if level is completed
  isLevelCompleted(level) {
    return this.completedLevels[level] === true;
  },

  // Get next level number
  getNextLevel() {
    // If current level is 0 (random) or already at max, return 1
    if (this.currentLevel === 0 || this.currentLevel >= 20) return 1;
    return this.currentLevel + 1;
  },

  // Update and save best score
  updateBestScore(level, moves) {
    const scoreKey = `level_${level}`;
    const current = this.bestScores[scoreKey] || Infinity;
    if (moves < current) {
      this.bestScores[scoreKey] = moves;
      localStorage.setItem(GameConfig.storage.bestScores, JSON.stringify(this.bestScores));
      return true; // New record
    }
    return false;
  },

  // Get current best score for display
  getBestScore() {
    const scoreKey = `level_${this.currentLevel}`;
    return this.bestScores[scoreKey] || '-';
  },

  // Get all scores for scoreboard
  getAllScores() {
    const scores = [];
    for (let level = 1; level <= 20; level++) {
      const scoreKey = `level_${level}`;
      const score = this.bestScores[scoreKey] || null;
      scores.push({
        level,
        score,
        difficulty: DIFFICULTY_LEVELS[level]?.name || ""
      });
    }
    return scores;
  },

  // Reset for a new game
  reset() {
    this.board = [];
    this.owned = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
    this.moveCount = 0;
    this.activeTiles = 0;
    this.gameActive = true;
    this.initialColor = '';
    
    // Generate a new random seed for board generation
    this.currentSeed = Math.floor(Math.random() * 10000);
  }
};

export { GameState };