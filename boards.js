/**
 * ChromaShift Game - Difficulty-Based Board Generator
 * This system creates boards with gradual difficulty progression
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
  1: { name: "קל מאוד", adjacencyFactor: 0.85, colorCount: 3 },     // Very Easy
  2: { name: "קל", adjacencyFactor: 0.80, colorCount: 3 },          // Easy
  3: { name: "קל", adjacencyFactor: 0.75, colorCount: 4 },          // Easy
  4: { name: "קל-בינוני", adjacencyFactor: 0.70, colorCount: 4 },   // Easy-Medium
  5: { name: "קל-בינוני", adjacencyFactor: 0.65, colorCount: 5 },   // Easy-Medium
  6: { name: "בינוני", adjacencyFactor: 0.60, colorCount: 5 },      // Medium
  7: { name: "בינוני", adjacencyFactor: 0.55, colorCount: 5 },      // Medium
  8: { name: "בינוני", adjacencyFactor: 0.50, colorCount: 5 },      // Medium
  9: { name: "בינוני-קשה", adjacencyFactor: 0.45, colorCount: 5 },  // Medium-Hard
  10: { name: "בינוני-קשה", adjacencyFactor: 0.40, colorCount: 5 }, // Medium-Hard
  11: { name: "קשה", adjacencyFactor: 0.35, colorCount: 5 },        // Hard
  12: { name: "קשה", adjacencyFactor: 0.30, colorCount: 5 },        // Hard
  13: { name: "קשה", adjacencyFactor: 0.25, colorCount: 5 },        // Hard
  14: { name: "קשה מאוד", adjacencyFactor: 0.20, colorCount: 5 },   // Very Hard
  15: { name: "קשה מאוד", adjacencyFactor: 0.15, colorCount: 5 },   // Very Hard
  16: { name: "קשה מאוד", adjacencyFactor: 0.10, colorCount: 5 },   // Very Hard
  17: { name: "מומחה", adjacencyFactor: 0.05, colorCount: 5 },      // Expert
  18: { name: "מומחה", adjacencyFactor: 0.03, colorCount: 5 },      // Expert
  19: { name: "מומחה", adjacencyFactor: 0.02, colorCount: 5 },      // Expert
  20: { name: "אלוף", adjacencyFactor: 0.01, colorCount: 5 }        // Master
};

/**
 * Generates a board with controlled difficulty
 * @param {number} size - Board size (width/height)
 * @param {number} difficulty - Difficulty level (1-20)
 * @param {number} seed - Random seed (optional)
 * @returns {Array} Generated board
 */
function generateBoard(size = 6, difficulty = 1, seed = null) {
  // difficulty = 20; // TEST
  // Get difficulty parameters
  const { adjacencyFactor, colorCount } = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[1];
  
  // Select colors for this board
  const boardColors = COLORS.slice(0, colorCount);
  
  // Create empty board
  const board = Array(size).fill().map(() => Array(size));
  
  // Fill board with weighted random colors
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (y === 0 && x === 0) {
        // Start position - random color
        board[y][x] = boardColors[Math.floor(Math.random() * boardColors.length)];
        continue;
      }
      
      // Get adjacent filled cells
      const adjacentColors = {};
      if (x > 0 && board[y][x-1]) {
        adjacentColors[board[y][x-1]] = (adjacentColors[board[y][x-1]] || 0) + 1;
      }
      if (y > 0 && board[y-1][x]) {
        adjacentColors[board[y-1][x]] = (adjacentColors[board[y-1][x]] || 0) + 1;
      }
      
      // Weighted color selection based on adjacency
      if (Object.keys(adjacentColors).length > 0 && Math.random() < adjacencyFactor) {
        // Choose from adjacent colors with weight
        let totalWeight = 0;
        for (const color in adjacentColors) {
          totalWeight += adjacentColors[color];
        }
        
        let randomWeight = Math.random() * totalWeight;
        for (const color in adjacentColors) {
          randomWeight -= adjacentColors[color];
          if (randomWeight <= 0) {
            board[y][x] = color;
            break;
          }
        }
      } else {
        // Choose random color
        board[y][x] = boardColors[Math.floor(Math.random() * boardColors.length)];
      }
    }
  }
  
  // Validate board isn't too easy/hard for the target difficulty
  const analysis = analyzeBoard(board);
  const expectedRegions = difficultyToExpectedRegions(difficulty);
  
  // If the generated board is too far from expected difficulty, retry
  if (Math.abs(analysis.regions - expectedRegions) > 5) {
    return generateBoard(size, difficulty, seed);
  }
  
  return board;
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

// Generate a complete set of boards for all difficulty levels
function generateGameBoards() {
  const boards = [];
  
  for (let level = 1; level <= 20; level++) {
    boards.push(generateBoard(6, level));
  }
  
  return boards;
}

// Example usage
// const generatedBoards = generateGameBoards();
// console.log(generatedBoards);

export { generateBoard, analyzeBoard, DIFFICULTY_LEVELS, COLORS };