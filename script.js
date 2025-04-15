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
    tileSize: 60,
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
      
      UI.boardEl.innerHTML = '';
      UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${GameConfig.tileSize}px)`;
  
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
          tile.dataset.x = x;
          tile.dataset.y = y;
          UI.boardEl.appendChild(tile);
        }
      }
  
      // The top-left tile is owned by default
      GameState.owned[0][0] = true;
      GameState.activeTiles = 1;
      this.updateBoard();
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
      const startColor = GameState.board[0][0];
      if (startColor === newColor) return; // No change if same color
  
      // Increase move counter and update display
      GameState.moveCount++;
      UI.updateMoveCounter();
  
      // Apply flood fill with the new color
      this.floodFill(newColor);
      this.updateBoard();
      
      // Check if the player has won
      this.checkWin();
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