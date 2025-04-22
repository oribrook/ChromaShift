/**
 * ChromaShift Game - State Management
 * Handles game state, scoring, grading, and persistence
 */

import { GameConfig, DIFFICULTY_LEVELS } from './config.js';
import { calculateGrade } from './boards.js';
// Import GRADE_THRESHOLDS from constants instead of boards
import { GRADE_THRESHOLDS } from './constants.js';

// Game state
const GameState = {
  board: [],           // Color of each tile
  owned: [],           // Tracking owned tiles
  moveCount: 0,        // Current move counter
  boardSize: GameConfig.boardSize,
  bestScores: {},      // Best scores for each board level
  bestGrades: {},      // Best grades for each board level
  completedLevels: {}, // Track which levels have been completed
  activeTiles: 0,      // Count of owned tiles (for animation purposes)
  gameActive: false,   // Whether a game is in progress
  initialColor: '',    // Store the initial color to handle the same-color bug
  currentLevel: 1,     // Current level (1-20)
  currentSeed: null,   // Current random seed for board generation
  lastSeed: null,      // Store the last seed for replay functionality
  optimalSolution: [], // Optimal solution steps for current board
  optimalMoves: 0,     // Optimal number of moves for current board
  savedBoardData: null, // Store complete board data for replay

  // Load saved settings and scores
  init() {
    // Load best scores from local storage
    const savedScores = localStorage.getItem(GameConfig.storage.bestScores);
    if (savedScores) {
      this.bestScores = JSON.parse(savedScores);
    }

    // Load best grades from local storage
    const savedGrades = localStorage.getItem(GameConfig.storage.bestGrades);
    if (savedGrades) {
      this.bestGrades = JSON.parse(savedGrades);
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
    
    // Load saved board data if available
    this.loadSavedBoardData();
    
    // Initialize seed if not set
    if (this.currentSeed === null) {
      this.currentSeed = Math.floor(Math.random() * 10000);
      this.lastSeed = this.currentSeed;
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

  // Set optimal solution data
  setOptimalSolution(solution, optimalMoves) {
    this.optimalSolution = solution || [];
    this.optimalMoves = optimalMoves || solution.length;
  },

  // Get player grade for current performance
  getGrade() {
    if (this.moveCount === 0 || this.optimalMoves === 0) return null;
    return calculateGrade(this.moveCount, this.optimalMoves);
  },

  // Check if player has exceeded move limit
  hasExceededMoveLimit() {
    if (this.optimalMoves === 0) return false;
    return this.moveCount > (this.optimalMoves + 4);
  },

  // Update and save best score and grade
  updateBestScore(level, moves) {
    const scoreKey = `level_${level}`;
    const current = this.bestScores[scoreKey] || Infinity;
    const isNewRecord = moves < current;
    
    if (isNewRecord) {
      this.bestScores[scoreKey] = moves;
      localStorage.setItem(GameConfig.storage.bestScores, JSON.stringify(this.bestScores));
      
      // Also update grade
      const grade = this.getGrade();
      if (grade) {
        this.bestGrades[scoreKey] = grade.grade;
        localStorage.setItem(GameConfig.storage.bestGrades, JSON.stringify(this.bestGrades));
      }
    }
    
    return isNewRecord;
  },

  // Get current best score for display
  getBestScore() {
    const scoreKey = `level_${this.currentLevel}`;
    return this.bestScores[scoreKey] || '-';
  },

  // Get current best grade for display
  getBestGrade() {
    const scoreKey = `level_${this.currentLevel}`;
    return this.bestGrades[scoreKey] || null;
  },

  // Get all scores and grades for scoreboard
  getAllScores() {
    const scores = [];
    for (let level = 1; level <= 20; level++) {
      const scoreKey = `level_${level}`;
      const score = this.bestScores[scoreKey] || null;
      const grade = this.bestGrades[scoreKey] || null;
      
      scores.push({
        level,
        score,
        grade,
        gradeDisplay: grade ? this.getGradeDisplay(grade) : null,
        difficulty: DIFFICULTY_LEVELS[level]?.name || "",
        optimal: level in DIFFICULTY_LEVELS ? DIFFICULTY_LEVELS[level].targetMoves : null
      });
    }
    return scores;
  },

  // Get display text for a grade
  getGradeDisplay(grade) {
    const gradeDisplayMap = {
      'PERFECT': 'מושלם!',  // Perfect!
      'GREAT': 'מצוין!',     // Great!
      'GOOD': 'טוב',         // Good
      'OK': 'סביר',          // OK
      'FAIL': 'נסה שוב'      // Try Again
    };
    
    return gradeDisplayMap[grade] || '';
  },

  // Save the complete board data for replay
  saveBoardData() {
    // Create a deep copy of the current board and solution
    const boardData = {
      board: JSON.parse(JSON.stringify(this.board)),
      optimalSolution: [...this.optimalSolution],
      optimalMoves: this.optimalMoves,
      level: this.currentLevel,
      seed: this.currentSeed
    };
    
    // Save to in-memory variable
    this.savedBoardData = boardData;
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem(GameConfig.storage.savedBoard, JSON.stringify(boardData));
    } catch (e) {
      console.warn('Failed to save board to localStorage:', e);
    }
    
    return boardData;
  },
  
  // Load saved board data from localStorage
  loadSavedBoardData() {
    try {
      const savedBoardStr = localStorage.getItem(GameConfig.storage.savedBoard);
      if (savedBoardStr) {
        this.savedBoardData = JSON.parse(savedBoardStr);
        console.log('Loaded saved board data from localStorage');
      }
    } catch (e) {
      console.warn('Failed to load saved board from localStorage:', e);
      this.savedBoardData = null;
    }
  },

  // Reset for a new game
  reset(reuseSeed = false) {
    const size = this.boardSize || 6; // Default to 6 if boardSize is undefined
    this.owned = Array(size).fill().map(() => Array(size).fill(false));
    this.moveCount = 0;
    this.activeTiles = 0;
    this.gameActive = true;
    this.initialColor = '';
    
    if (reuseSeed && this.savedBoardData) {
      // Reuse the saved board data
      console.log("Reusing saved board data");
      this.board = JSON.parse(JSON.stringify(this.savedBoardData.board));
      this.optimalSolution = [...this.savedBoardData.optimalSolution];
      this.optimalMoves = this.savedBoardData.optimalMoves;
      // Keep the current seed for logging purposes
      console.log("Reusing seed:", this.currentSeed);
    } else {
      // Create a new board
      this.board = [];
      this.optimalSolution = [];
      this.optimalMoves = 0;
      
      // Save the last seed first
      this.lastSeed = this.currentSeed;
      // Generate a new random seed for board generation
      this.currentSeed = Math.floor(Math.random() * 10000);
      
      // Clear saved board data when explicitly not reusing
      if (!reuseSeed) {
        this.savedBoardData = null;
        // Also clear from localStorage
        try {
          localStorage.removeItem(GameConfig.storage.savedBoard);
        } catch (e) {
          console.warn('Failed to clear saved board from localStorage:', e);
        }
      }
    }
  }
};

export { GameState };