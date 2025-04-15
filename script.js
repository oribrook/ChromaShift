/**
 * ChromaShift Game - Hebrew Version
 * A color-based puzzle game where players flood fill the board to capture all tiles.
 */

// Game configuration
const GameConfig = {
  // Default color palette - can be extended or customized
  colors: [
    { hex: '#e74c3c', name: 'אדום' },    // Red
    { hex: '#3498db', name: 'כחול' },    // Blue
    { hex: '#f1c40f', name: 'צהוב' },    // Yellow
    { hex: '#2ecc71', name: 'ירוק' },    // Green
    { hex: '#9b59b6', name: 'סגול' }     // Purple
  ],
  defaultBoardSize: 5,
  // Dynamic tile size based on screen size
  get tileSize() {
    // Responsive tile sizing
    return window.innerWidth < 600 ? 45 : 60;
  },
  // Local storage keys
  storage: {
    bestScores: 'chromashift-best-scores',
    settings: 'chromashift-settings'
  }
};

// Game state
const GameState = {
  board: [],           // Color of each tile
  owned: [],           // Tracking owned tiles
  moveCount: 0,        // Current move counter
  boardSize: GameConfig.defaultBoardSize,
  bestScores: {},      // Best scores for each board size
  activeTiles: 0,      // Count of owned tiles (for animation purposes)
  gameActive: false,   // Whether a game is in progress
  initialColor: '',    // Store the initial color to handle the same-color bug

  // Load saved settings and scores
  init() {
    // Load best scores from local storage
    const savedScores = localStorage.getItem(GameConfig.storage.bestScores);
    if (savedScores) {
      this.bestScores = JSON.parse(savedScores);
    }

    // Load saved settings
    const savedSettings = localStorage.getItem(GameConfig.storage.settings);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.boardSize) {
        this.boardSize = settings.boardSize;
        document.getElementById('boardSizeSelect').value = settings.boardSize;
      }
    }
  },

  // Save settings
  saveSettings() {
    const settings = {
      boardSize: this.boardSize
    };
    localStorage.setItem(GameConfig.storage.settings, JSON.stringify(settings));
  },

  // Update and save best score
  updateBestScore(size, moves) {
    const current = this.bestScores[size] || Infinity;
    if (moves < current) {
      this.bestScores[size] = moves;
      localStorage.setItem(GameConfig.storage.bestScores, JSON.stringify(this.bestScores));
      return true; // New record
    }
    return false;
  },

  // Get current best score for display
  getBestScore() {
    return this.bestScores[this.boardSize] || '-';
  },

  // Reset for a new game
  reset() {
    this.board = [];
    this.owned = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
    this.moveCount = 0;
    this.activeTiles = 0;
    this.gameActive = true;
    this.initialColor = '';
  }
};

// DOM elements and UI handling
const UI = {
  boardEl: document.getElementById('gameBoard'),
  pickerEl: document.getElementById('colorPicker'),
  moveEl: document.getElementById('moveCounter').querySelector('span'),
  bestScoreEl: document.getElementById('bestScore').querySelector('span'),
  newGameBtn: document.getElementById('newGameBtn'),
  helpBtn: document.getElementById('helpBtn'),
  boardSizeSelect: document.getElementById('boardSizeSelect'),
  instructionsModal: document.getElementById('instructions'),
  closeInstructionsBtn: document.getElementById('closeInstructions'),
  winModal: document.getElementById('winModal'),
  finalMovesEl: document.getElementById('finalMoves'),
  playAgainBtn: document.getElementById('playAgainBtn'),

  // Initialize UI event listeners
  init() {
    this.newGameBtn.addEventListener('click', () => Game.startNewGame());
    this.helpBtn.addEventListener('click', () => this.showInstructions());
    this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
    this.playAgainBtn.addEventListener('click', () => {
      this.hideWinModal();
      Game.startNewGame();
    });
    this.boardSizeSelect.addEventListener('change', (e) => {
      GameState.boardSize = parseInt(e.target.value);
      GameState.saveSettings();
      Game.startNewGame();
    });
    
    // Add resize listener for mobile responsiveness
    window.addEventListener('resize', this.handleResize.bind(this));
  },
  
  // Handle window resize for mobile responsiveness
  handleResize() {
    const tileSize = GameConfig.tileSize;
    document.querySelectorAll('.tile').forEach(tile => {
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
    });
    
    // Update the board grid
    this.boardEl.style.gridTemplateColumns = `repeat(${GameState.boardSize}, ${tileSize}px)`;
  },

  // Update move counter display
  updateMoveCounter() {
    this.moveEl.textContent = GameState.moveCount;
  },

  // Update best score display
  updateBestScore() {
    this.bestScoreEl.textContent = GameState.getBestScore();
  },

  // Create the color picker buttons
  createColorPicker() {
    this.pickerEl.innerHTML = '';
    
    GameConfig.colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-btn';
      btn.style.backgroundColor = color.hex;
      btn.title = color.name;
      btn.setAttribute('aria-label', color.name);
      btn.dataset.color = color.hex;
      
      btn.addEventListener('click', () => {
        if (GameState.gameActive) {
          Game.handleColorPick(color.hex);
        }
      });
      
      this.pickerEl.appendChild(btn);
    });
  },

  // Show instructions modal
  showInstructions() {
    this.instructionsModal.classList.remove('hidden');
  },

  // Hide instructions modal
  hideInstructions() {
    this.instructionsModal.classList.add('hidden');
  },

  // Show win modal
  showWinModal(moves) {
    this.finalMovesEl.textContent = moves;
    this.winModal.classList.remove('hidden');
  },

  // Hide win modal
  hideWinModal() {
    this.winModal.classList.add('hidden');
  }
};

// Game logic
const Game = {
  // Initialize the game
  init() {
    GameState.init();
    UI.init();
    UI.createColorPicker();
    this.startNewGame();
    
    // Show instructions on first visit
    if (!localStorage.getItem('chromashift-visited')) {
      UI.showInstructions();
      localStorage.setItem('chromashift-visited', 'true');
    }
  },

  // Start a new game
  startNewGame() {
    GameState.reset();
    this.createBoard();
    UI.updateMoveCounter();
    UI.updateBestScore();
  },

  // Create the game board
  createBoard() {
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;
    
    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;

    for (let y = 0; y < boardSize; y++) {
      GameState.board[y] = [];
      for (let x = 0; x < boardSize; x++) {
        // Randomly select a color
        const colorIndex = Math.floor(Math.random() * GameConfig.colors.length);
        const color = GameConfig.colors[colorIndex].hex;
        GameState.board[y][x] = color;

        // Create a tile element
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundColor = color;
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.dataset.x = x;
        tile.dataset.y = y;
        
        // Add click event to surrounding tiles for faster progress
        tile.addEventListener('click', () => this.handleTileClick(x, y));
        
        UI.boardEl.appendChild(tile);
      }
    }

    // The top-right tile is owned by default (fixing corner direction)
    GameState.owned[0][boardSize - 1] = true;
    GameState.activeTiles = 1;
    // Store initial color to fix the same-color bug
    GameState.initialColor = GameState.board[0][boardSize - 1];
    this.updateBoard();
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

  // Update the visual representation of the board
  updateBoard() {
    document.querySelectorAll('.tile').forEach(tile => {
      const x = parseInt(tile.dataset.x);
      const y = parseInt(tile.dataset.y);
      
      tile.style.backgroundColor = GameState.board[y][x];
      
      if (GameState.owned[y][x]) {
        tile.classList.add('owned');
      } else {
        tile.classList.remove('owned');
        tile.classList.remove('newly-owned');
      }
    });
  },

  // Handle color selection
  handleColorPick(newColor) {
    // Fix the bug: if this is the first move and it's the same as initial color
    // We need to allow it to proceed
    const startingPositionY = 0;
    const startingPositionX = GameState.boardSize - 1; // Right side (RTL)
    
    if (GameState.moveCount === 0 && newColor === GameState.initialColor) {
      // On first move with same color, we need to check if there are adjacent tiles
      // with the same color that should be captured
      const neighbors = this.getNeighbors(startingPositionX, startingPositionY);
      let hasExpansion = false;
      
      for (const [nx, ny] of neighbors) {
        if (GameState.board[ny][nx] === newColor) {
          hasExpansion = true;
          GameState.owned[ny][nx] = true;
          GameState.activeTiles++;
          
          // Find the tile element and add the animation class
          const tileEl = document.querySelector(`.tile[data-x="${nx}"][data-y="${ny}"]`);
          if (tileEl) {
            tileEl.classList.add('newly-owned');
            setTimeout(() => {
              tileEl.classList.remove('newly-owned');
            }, 500);
          }
        }
      }
      
      if (hasExpansion) {
        GameState.moveCount++;
        UI.updateMoveCounter();
        this.updateBoard();
        this.checkWin();
      }
      
      return; // Skip the rest of the function for first move with same color
    }
    
    const startColor = GameState.board[startingPositionY][startingPositionX];
    if (startColor === newColor && !this.canExpandWithColor(newColor)) return; // No change if same color and can't expand

    // Increase move counter and update display
    GameState.moveCount++;
    UI.updateMoveCounter();

    // Apply flood fill with the new color
    this.floodFill(newColor);
    this.updateBoard();
    
    // Check if the player has won
    this.checkWin();
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

  // Flood fill algorithm
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
    while (changed) {
      changed = false;
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          if (!owned[y][x]) {
            // Check if any neighboring tile is owned and has the same color
            const neighbors = this.getNeighbors(x, y);
            for (const [nx, ny] of neighbors) {
              if (owned[ny][nx] && board[y][x] === newColor) {
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
                
                changed = true;
                break;
              }
            }
          }
        }
      }
    }
    
    // If no new tiles were claimed, no need to update the board
    return GameState.activeTiles > previousActiveTiles;
  },

  // Get neighboring tile coordinates
  getNeighbors(x, y) {
    const { boardSize } = GameState;
    return [
      [x-1, y],
      [x+1, y],
      [x, y-1],
      [x, y+1]
    ].filter(([nx, ny]) =>
      nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize
    );
  },

  // Check if the player has won
  checkWin() {
    const allOwned = GameState.owned.flat().every(v => v);
    
    if (allOwned) {
      GameState.gameActive = false;
      const isNewRecord = GameState.updateBestScore(GameState.boardSize, GameState.moveCount);
      UI.updateBestScore();
      
      // Short delay before showing win modal for better UX
      setTimeout(() => {
        UI.showWinModal(GameState.moveCount);
      }, 300);
    }
  }
};

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});