/**
 * ChromaShift Game - Game Module
 * Handles core game logic, board generation, and game flow
 */

import { GameConfig } from './config.js';
import { GameState } from './state.js';
import { UI } from './ui.js';
import { generateBoard } from './boards.js';

// Game logic
const Game = {
  // Initialize the game
  init() {
    GameState.init();
    UI.init(this); // Pass reference to Game itself
    UI.createColorPicker();
    UI.updateLevelDisplay();
    this.startNewGame();

    // Show instructions on first visit
    if (!localStorage.getItem('chromashift-visited')) {
      UI.showInstructions();
      localStorage.setItem('chromashift-visited', 'true');
    }
    
    // Make Game object accessible globally for sound system
    window.Game = this;
    window.GameState = GameState;
  },

  // Start a new game
  startNewGame(options = {}) {
    // Default options
    const defaultOptions = {
      randomBoard: false, 
      reuseSeed: false,
      keepLevel: true,
      useSavedBoard: false // New option to use saved board data
    };
    
    // Merge provided options with defaults
    const { randomBoard, reuseSeed, keepLevel, useSavedBoard } = { ...defaultOptions, ...options };
    
    // Reset game state, optionally keeping the current seed
    GameState.reset(reuseSeed);
    
    // Create the board
    if (useSavedBoard && GameState.savedBoardData) {
      // Use the exact saved board data rather than generating a new one
      this.createBoardFromSaved();
    } else {
      // Generate a new board
      this.createBoard(randomBoard);
    }
    
    UI.updateMoveCounter();
    UI.updateBestScore();
    
    // Display the optimal moves indicator
    UI.updateOptimalMovesDisplay();
  },

  // Replay the exact same board
  replayCurrentBoard() {
    // Use the saved board data and same seed
    this.startNewGame({ reuseSeed: true, useSavedBoard: true });
  },

  // Create a board from saved data
  createBoardFromSaved() {
    if (!GameState.savedBoardData) {
      console.error("No saved board data found, generating new board instead");
      this.createBoard(false);
      return;
    }
    
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;
    
    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;
    
    // Restore the board, owned tiles, and solution data from saved state
    GameState.board = JSON.parse(JSON.stringify(GameState.savedBoardData.board));
    GameState.setOptimalSolution(
      GameState.savedBoardData.optimalSolution,
      GameState.savedBoardData.optimalMoves
    );
    
    // Create the UI elements for the board
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = GameState.board[y][x];
        
        // Create a tile element
        UI.createTileElement(x, y, color, tileSize);
      }
    }
    
    // Reset ownership - only the top-right tile is owned by default
    GameState.owned = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    const startX = boardSize - 1; // Right side for RTL
    const startY = 0; // Top
    GameState.owned[startY][startX] = true;
    GameState.activeTiles = 1;
    
    // Store initial color to fix the same-color bug
    GameState.initialColor = GameState.board[startY][startX];
    UI.updateBoard();
    
    // Show optimal moves in debug mode (can be removed in production)
    if (window.location.hash === '#debug') {
      console.log('Replaying saved board');
      console.log('Optimal solution:', GameState.savedBoardData.optimalSolution);
      console.log('Optimal moves:', GameState.savedBoardData.optimalMoves);
      console.log('Current seed:', GameState.currentSeed);
    }
  },

  // Create the game board
  createBoard(randomBoard = false) {
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;

    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;

    // Determine the difficulty level for the board
    let difficultyLevel = GameState.currentLevel;
    if (randomBoard || GameState.currentLevel === 0) {
      // For random board mode, choose a random difficulty between 1-20
      difficultyLevel = Math.floor(Math.random() * 20) + 1;
    }

    // Generate the board using our solution-tracking board generator
    const generatedBoardData = generateBoard(boardSize, difficultyLevel, GameState.currentSeed);
    const generatedBoard = generatedBoardData.board;
    
    // Store optimal solution data in GameState
    GameState.setOptimalSolution(
      generatedBoardData.optimalSolution,
      generatedBoardData.optimalMoves
    );
    
    // Save the entire board data for potential replay
    GameState.savedBoardData = {
      board: JSON.parse(JSON.stringify(generatedBoard)),
      optimalSolution: [...generatedBoardData.optimalSolution],
      optimalMoves: generatedBoardData.optimalMoves
    };

    // Add the generated board to the game state
    for (let y = 0; y < boardSize; y++) {
      GameState.board[y] = [];
      for (let x = 0; x < boardSize; x++) {
        const color = generatedBoard[y][x];
        GameState.board[y][x] = color;

        // Create a tile element
        UI.createTileElement(x, y, color, tileSize);
      }
    }

    // The top-right tile is owned by default (RTL in Hebrew version)
    const startX = boardSize - 1; // Right side for RTL
    const startY = 0; // Top
    GameState.owned[startY][startX] = true;
    GameState.activeTiles = 1;

    // Store initial color to fix the same-color bug
    GameState.initialColor = GameState.board[startY][startX];
    UI.updateBoard();
    
    // Show optimal moves in debug mode (can be removed in production)
    if (window.location.hash === '#debug') {
      console.log('Optimal solution:', generatedBoardData.optimalSolution);
      console.log('Optimal moves:', generatedBoardData.optimalMoves);
      console.log('Current seed:', GameState.currentSeed);
    }
  },

  // Handle tile click (for surrounding tiles)
  handleTileClick(x, y) {
    if (!GameState.gameActive) return;

    // Only allow clicking on tiles that are adjacent to owned tiles but not owned yet
    if (GameState.owned[y][x]) return; // Already owned

    // Check if this tile is adjacent to any owned tile
    const neighbors = this.getNeighbors(x, y);
    const isAdjacent = neighbors.some(([nx, ny]) => GameState.owned[ny][nx]);

    if (isAdjacent) {
      // Valid click on adjacent tile - apply its color to all owned tiles
      const newColor = GameState.board[y][x];
      this.handleColorPick(newColor);
    }
  },

  // Handle color selection
  handleColorPick(newColor) {
    // Fix the bug: if this is the first move and it's the same as initial color
    // Handle it as a special case - all like-colored cells should be captured
    // not just immediate neighbors
    const startingPositionY = 0;
    const startingPositionX = GameState.boardSize - 1; // Right side (RTL)

    if (GameState.moveCount === 0) {
      const initialColor = GameState.initialColor;
      
      // On first move, we need to do a complete board scan to capture all
      // tiles of the same color that are connected, directly or indirectly
      if (newColor === initialColor) {
        // First move with same color - special flood fill
        this.firstMoveFloodFill(newColor);
        GameState.moveCount++;
        UI.updateMoveCounter();
        this.checkWin();
        return;
      }
    }

    // Regular color pick logic for non-first moves or first move with different color
    const startColor = GameState.board[startingPositionY][startingPositionX];
    if (startColor === newColor && !this.canExpandWithColor(newColor)) return; // No change if same color and can't expand

    // Increase move counter and update display
    GameState.moveCount++;
    UI.updateMoveCounter();

    // Apply flood fill with the new color
    this.floodFill(newColor);
    UI.updateBoard();

    // Check if the player has exceeded the move limit (4 more than optimal)
    const moveLimit = GameState.optimalMoves + 4;
    if (GameState.moveCount > moveLimit) {
      // Player has exceeded the move limit, stop the game
      this.handleExceededMoveLimit();
      return;
    }

    // Check if the player has won
    this.checkWin();
  },
  
  // Handle when player exceeds move limit
  handleExceededMoveLimit() {
    GameState.gameActive = false;
    // Show the exceeded move limit modal
    setTimeout(() => {
      UI.showExceededMoveLimitModal(GameState.moveCount, GameState.optimalMoves);
    }, 300);
  },

  // Special first-move flood fill that captures all connected tiles of the same color
  firstMoveFloodFill(color) {
    const { boardSize, board } = GameState;
    const startX = boardSize - 1; // Right side (RTL)
    const startY = 0;
    
    // Create a visited array to keep track of processed cells
    const visited = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    
    // Start flood fill from the initial position
    const stack = [[startX, startY]];
    visited[startY][startX] = true;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      // Mark current cell as owned
      GameState.owned[y][x] = true;
      GameState.activeTiles++;
      
      // Get neighbors
      const neighbors = this.getNeighbors(x, y);
      
      // Check all neighboring cells
      for (const [nx, ny] of neighbors) {
        // If not visited and has the same color, add to stack
        if (!visited[ny][nx] && board[ny][nx] === color) {
          visited[ny][nx] = true;
          stack.push([nx, ny]);
          
          // Animate the newly owned tile
          const tileEl = document.querySelector(`.tile[data-x="${nx}"][data-y="${ny}"]`);
          if (tileEl) {
            tileEl.classList.add('newly-owned');
            setTimeout(() => {
              tileEl.classList.remove('newly-owned');
            }, 500);
          }
        }
      }
    }
    
    UI.updateBoard();
  },

  // Check if expanding with a color would add new tiles
  canExpandWithColor(color) {
    const { boardSize, owned, board } = GameState;

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (!owned[y][x]) {
          // Check if any neighboring tile is owned
          const neighbors = this.getNeighbors(x, y);
          for (const [nx, ny] of neighbors) {
            if (owned[ny][nx] && board[y][x] === color) {
              return true; // Found at least one tile that would be acquired
            }
          }
        }
      }
    }

    return false; // No new tiles would be acquired
  },

  // Flood fill algorithm - FIXED to prevent infinite loops
  floodFill(newColor) {
    const { board, owned, boardSize } = GameState;
    const previousActiveTiles = GameState.activeTiles;

    // First change all owned tiles to the new color
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (owned[y][x]) {
          board[y][x] = newColor;
        }
      }
    }

    // Keep expanding until no more tiles can be claimed
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = boardSize * boardSize; // Safety limit
    
    while (changed && iterations < MAX_ITERATIONS) {
      changed = false;
      iterations++;
      
      // Track tiles to claim in this iteration to avoid modifying while iterating
      const tilesToClaim = [];
      
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          if (!owned[y][x]) {
            // Check if any neighboring tile is owned and has the same color
            const neighbors = this.getNeighbors(x, y);
            let shouldClaim = false;
            
            for (const [nx, ny] of neighbors) {
              if (owned[ny][nx] && board[y][x] === newColor) {
                shouldClaim = true;
                break;
              }
            }
            
            if (shouldClaim) {
              tilesToClaim.push([x, y]);
            }
          }
        }
      }
      
      // Apply changes after iteration
      if (tilesToClaim.length > 0) {
        changed = true;
        for (const [x, y] of tilesToClaim) {
          owned[y][x] = true;
          GameState.activeTiles++;
          
          // Find the tile element and add the animation class
          const tileEl = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
          if (tileEl) {
            tileEl.classList.add('newly-owned');
            // Remove the class after animation completes to allow retriggering
            setTimeout(() => {
              tileEl.classList.remove('newly-owned');
            }, 500);
          }
        }
      }
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.warn("Flood fill reached maximum iterations - possible infinite loop avoided");
    }

    // Return whether any new tiles were acquired
    return GameState.activeTiles > previousActiveTiles;
  },

  // Get neighboring tile coordinates
  getNeighbors(x, y) {
    const { boardSize } = GameState;
    return [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1]
    ].filter(([nx, ny]) =>
      nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize
    );
  },

  // Check if the player has won
  checkWin() {
    const allOwned = GameState.owned.flat().every(v => v);

    if (allOwned) {
      GameState.gameActive = false;

      // Get the player's grade
      const gradeInfo = GameState.getGrade();
      
      // Only save best score for predefined levels, not random boards
      let isNewRecord = false;
      if (GameState.currentLevel > 0) {
        isNewRecord = GameState.updateBestScore(GameState.currentLevel, GameState.moveCount);
        
        // Mark the level as completed if within the move limit
        const exceededMoveLimit = GameState.moveCount > (GameState.optimalMoves + 4);
        if (!exceededMoveLimit) {
          GameState.markLevelCompleted(GameState.currentLevel);
          // Update button states for level navigation
          UI.updateNavigationButtons();
        }
        
        UI.updateBestScore();
      }

      // Short delay before showing win modal for better UX
      setTimeout(() => {
        UI.showWinModal(GameState.moveCount, gradeInfo, GameState.optimalMoves);
      }, 300);
    }
  }
};

export { Game };