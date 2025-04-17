/**
 * ChromaShift Game - Difficulty-Based Board Generator
 * This system creates boards with gradual difficulty progression
 * and tracks optimal solutions for grading player performance
 */

// Import constants from the constants file
import { 
  COLORS, 
  DIFFICULTY_LEVELS, 
  GRADE_THRESHOLDS, 
  GRADE_DISPLAY 
} from './constants.js';

/**
 * Generates a board with controlled difficulty and known optimal solution
 * @param {number} size - Board size (width/height)
 * @param {number} difficulty - Difficulty level (1-20)
 * @param {number} seed - Random seed (optional)
 * @returns {Object} Generated board with solution data
 */
function generateBoard(size = 6, difficulty = 1, seed = null) {
  return generateBoardWithSolution(size, difficulty, seed);
}

/**
 * Generates a board using a solution-first approach
 * Creates a puzzle by working backwards from a solved state
 * @param {number} size - Board size (width/height)
 * @param {number} difficulty - Difficulty level (1-20)
 * @param {number} seed - Random seed (optional)
 * @returns {Object} Board data with solution information
 */
function generateBoardWithSolution(size = 6, difficulty = 1, seed = null) {
  // Get difficulty parameters
  const { adjacencyFactor, colorCount, targetMoves } = 
    DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[1];
  
  // Select colors for this board
  const boardColors = COLORS.slice(0, colorCount);
  
  // Create a fully solved board (all same color)
  let initialColor = boardColors[Math.floor(Math.random() * boardColors.length)];
  let board = Array(size).fill().map(() => Array(size).fill(initialColor));
  
  // Track ownership (Start with all owned)
  let owned = Array(size).fill().map(() => Array(size).fill(true));
  
  // Starting position (top-right for RTL)
  const startX = size - 1;
  const startY = 0;
  
  // Store optimal solution steps
  const solutionSteps = [];
  
  // Perform "unmoves" to create the puzzle
  const movesNeeded = targetMoves;
  
  for (let moveNum = 0; moveNum < movesNeeded; moveNum++) {
    // Choose a color different from the current one
    let availableColors = boardColors.filter(c => c !== initialColor);
    let newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // Store this step in the solution (in reverse order)
    solutionSteps.unshift(newColor);
    
    // Find tiles to "unown" - We create a disconnected region with this color
    let tilesToUnown = findTilesToUncolorForDifficulty(board, owned, newColor, 
      startX, startY, size, adjacencyFactor);
    
    // If we couldn't find enough tiles to uncolor, try another color
    if (tilesToUnown.length < 2) {
      moveNum--; // Try again with a different color
      continue;
    }
    
    // Apply the "unmove"
    for (const [x, y] of tilesToUnown) {
      // Change color and mark as unowned
      board[y][x] = newColor;
      owned[y][x] = false;
    }
    
    // The new color becomes the initialColor for the next iteration
    initialColor = newColor;
  }
  
  // Analyze the generated board
  const analysis = analyzeBoard(board);
  
  // Make sure starter tile is owned but all others aren't
  owned = Array(size).fill().map(() => Array(size).fill(false));
  owned[startY][startX] = true;
  
  // Create a flattened 2D array version of the board to return
  const result = {
    board,
    optimalSolution: solutionSteps,
    optimalMoves: solutionSteps.length,
    analysis
  };
  
  return result;
}

/**
 * Finds tiles to uncolor for a given move when generating the puzzle
 * @param {Array} board - Current board state
 * @param {Array} owned - Current ownership state
 * @param {string} newColor - Color to apply
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {number} size - Board size
 * @param {number} adjacencyFactor - Controls how connected the regions should be
 * @returns {Array} Array of [x,y] coordinates to uncolor
 */
function findTilesToUncolorForDifficulty(board, owned, newColor, startX, startY, size, adjacencyFactor) {
  // Find all owned tiles except the start position
  const candidates = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (owned[y][x] && !(x === startX && y === startY)) {
        candidates.push([x, y]);
      }
    }
  }
  
  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  
  // Select a subset of candidates to uncolor based on adjacency factor
  const tilesToUncolor = [];
  const targetCount = Math.ceil(candidates.length * (1 - adjacencyFactor));
  
  let currentCount = 0;
  while (currentCount < targetCount && candidates.length > 0) {
    const [x, y] = candidates.shift();
    tilesToUncolor.push([x, y]);
    currentCount++;
  }
  
  return tilesToUncolor;
}

/**
 * Maps difficulty level to expected number of color regions
 */
function difficultyToExpectedRegions(difficulty) {
  // Rough estimate: easier levels have fewer regions
  return Math.floor(3 + (difficulty * 0.8));
}

/**
 * Analyzes a board to determine its properties
 * @param {Array} board - The board to analyze
 * @returns {Object} Analysis results
 */
function analyzeBoard(board) {
  // Count regions of same color
  const visited = new Set();
  let regions = 0;
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        regions++;
        // Find all connected cells of same color
        const queue = [{x, y}];
        const color = board[y][x];
        visited.add(key);
        
        while (queue.length > 0) {
          const {x: cx, y: cy} = queue.shift();
          
          // Check adjacent cells
          const adjacentCells = [
            {x: cx-1, y: cy}, {x: cx+1, y: cy},
            {x: cx, y: cy-1}, {x: cx, y: cy+1}
          ];
          
          for (const cell of adjacentCells) {
            if (cell.x >= 0 && cell.x < board[0].length && 
                cell.y >= 0 && cell.y < board.length) {
              const newKey = `${cell.x},${cell.y}`;
              if (!visited.has(newKey) && board[cell.y][cell.x] === color) {
                visited.add(newKey);
                queue.push(cell);
              }
            }
          }
        }
      }
    }
  }
  
  // Determine estimated difficulty
  const estimatedDifficulty = regions > 20 ? "קשה מאוד" : 
                             regions > 15 ? "קשה" : 
                             regions > 10 ? "בינוני" : 
                             regions > 5 ? "קל" : "קל מאוד";
  
  return {
    regions,
    estimatedDifficulty
  };
}

/**
 * Calculate player grade based on move count compared to optimal solution
 * @param {number} moveCount - Player's move count
 * @param {number} optimalMoves - Optimal number of moves
 * @returns {Object} Grade information
 */
function calculateGrade(moveCount, optimalMoves) {
  const difference = moveCount - optimalMoves;
  
  let gradeKey = 'FAIL';
  if (difference <= GRADE_THRESHOLDS.PERFECT) {
    gradeKey = 'PERFECT';
  } else if (difference <= GRADE_THRESHOLDS.GREAT) {
    gradeKey = 'GREAT';
  } else if (difference <= GRADE_THRESHOLDS.GOOD) {
    gradeKey = 'GOOD';
  } else if (difference <= GRADE_THRESHOLDS.OK) {
    gradeKey = 'OK';
  }
  
  return {
    grade: gradeKey,
    displayText: GRADE_DISPLAY[gradeKey],
    difference: difference
  };
}

// Generate a complete set of boards for all difficulty levels
function generateGameBoards() {
  const boards = [];
  
  for (let level = 1; level <= 20; level++) {
    boards.push(generateBoard(6, level));
  }
  
  return boards;
}

export { 
  generateBoard, 
  generateBoardWithSolution, 
  analyzeBoard, 
  calculateGrade
};