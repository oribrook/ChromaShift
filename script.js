/**
 * ChromaShift Game - Hebrew Version
 * A color-based puzzle game where players flood fill the board to capture all tiles.
 */

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
    settings: 'chromashift-settings'
  },
  // Pre-defined board layouts (20 boards)
  predefinedBoards: [
    // Board 1
    [
      [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE, COLOR_RED],
      [COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_PURPLE, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW],
      [COLOR_GREEN, COLOR_PURPLE, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_GREEN],
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_BLUE, COLOR_PURPLE],
      [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE, COLOR_RED]
    ],
    // Board 2
    [
      [COLOR_BLUE, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_RED],
      [COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE],
      [COLOR_RED, COLOR_GREEN, COLOR_PURPLE, COLOR_YELLOW, COLOR_BLUE, COLOR_GREEN],
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_PURPLE, COLOR_YELLOW],
      [COLOR_BLUE, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_BLUE]
    ],
    // Board 3
    [
      [COLOR_GREEN, COLOR_GREEN, COLOR_YELLOW, COLOR_BLUE, COLOR_PURPLE, COLOR_RED],
      [COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_GREEN, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_GREEN],
      [COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW],
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_PURPLE],
      [COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_GREEN]
    ],
    // Board 4
    [
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_PURPLE],
      [COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED],
      [COLOR_GREEN, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE, COLOR_GREEN],
      [COLOR_BLUE, COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE],
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW]
    ],
    // Board 5
    [
      [COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW],
      [COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_GREEN],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE],
      [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_GREEN, COLOR_RED],
      [COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE]
    ],
    // Board 6
    [
      [COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED],
      [COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_GREEN, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_RED, COLOR_PURPLE, COLOR_GREEN],
      [COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW],
      [COLOR_RED, COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_GREEN, COLOR_RED]
    ],
    // Board 7
    [
      [COLOR_BLUE, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_GREEN, COLOR_BLUE],
      [COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_GREEN],
      [COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED],
      [COLOR_YELLOW, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_YELLOW],
      [COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_PURPLE, COLOR_YELLOW, COLOR_RED, COLOR_GREEN, COLOR_BLUE]
    ],
    // Board 8
    [
      [COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW],
      [COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_BLUE],
      [COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_GREEN],
      [COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED],
      [COLOR_PURPLE, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE]
    ],
    // Board 9
    [
      [COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_GREEN],
      [COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE],
      [COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED],
      [COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW],
      [COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_GREEN]
    ],
    // Board 10
    [
      [COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_PURPLE, COLOR_YELLOW],
      [COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_PURPLE],
      [COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_GREEN],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_RED],
      [COLOR_BLUE, COLOR_PURPLE, COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_YELLOW, COLOR_BLUE, COLOR_PURPLE, COLOR_GREEN, COLOR_RED, COLOR_YELLOW]
    ],
    // Board 11
    [
      [COLOR_RED, COLOR_RED, COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN],
      [COLOR_RED, COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE, COLOR_RED],
      [COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_RED],
      [COLOR_YELLOW, COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_RED, COLOR_BLUE],
      [COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_RED, COLOR_BLUE, COLOR_BLUE]
    ],
    // Board 12
    [
      [COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_RED, COLOR_RED],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_RED, COLOR_RED, COLOR_BLUE],
      [COLOR_GREEN, COLOR_GREEN, COLOR_RED, COLOR_RED, COLOR_BLUE, COLOR_BLUE],
      [COLOR_GREEN, COLOR_RED, COLOR_RED, COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW],
      [COLOR_RED, COLOR_RED, COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW, COLOR_YELLOW],
      [COLOR_RED, COLOR_BLUE, COLOR_BLUE, COLOR_YELLOW, COLOR_YELLOW, COLOR_PURPLE]
    ],
    // Board 13
    [
      [COLOR_YELLOW, COLOR_YELLOW, COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_BLUE],
      [COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_BLUE, COLOR_BLUE],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_BLUE, COLOR_BLUE, COLOR_RED],
      [COLOR_GREEN, COLOR_GREEN, COLOR_BLUE, COLOR_BLUE, COLOR_RED, COLOR_RED],
      [COLOR_GREEN, COLOR_BLUE, COLOR_BLUE, COLOR_RED, COLOR_RED, COLOR_YELLOW]
    ],
    // Board 14
    [
      [COLOR_BLUE, COLOR_BLUE, COLOR_RED, COLOR_RED, COLOR_PURPLE, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_RED, COLOR_RED, COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN],
      [COLOR_RED, COLOR_RED, COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN],
      [COLOR_RED, COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_YELLOW],
      [COLOR_PURPLE, COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_YELLOW, COLOR_YELLOW],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_GREEN, COLOR_YELLOW, COLOR_YELLOW, COLOR_BLUE]
    ],
    // Board 15
    [
      [COLOR_GREEN, COLOR_BLUE, COLOR_RED, COLOR_RED, COLOR_YELLOW, COLOR_PURPLE],
      [COLOR_RED, COLOR_GREEN, COLOR_GREEN, COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE],
      [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_RED],
      [COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_RED, COLOR_YELLOW],
      [COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_RED, COLOR_YELLOW, COLOR_PURPLE]
    ],
    // Board 16
    [
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_RED, COLOR_RED, COLOR_GREEN],
      [COLOR_RED, COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_RED],
      [COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_PURPLE, COLOR_RED, COLOR_BLUE],
      [COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_PURPLE],
      [COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_PURPLE, COLOR_YELLOW],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_GREEN, COLOR_RED, COLOR_GREEN]
    ],
    // Board 17
    [
      [COLOR_GREEN, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_BLUE, COLOR_RED],
      [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_PURPLE],
      [COLOR_YELLOW, COLOR_PURPLE, COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_YELLOW],
      [COLOR_RED, COLOR_GREEN, COLOR_PURPLE, COLOR_BLUE, COLOR_YELLOW, COLOR_BLUE],
      [COLOR_PURPLE, COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_PURPLE, COLOR_GREEN],
      [COLOR_RED, COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_BLUE, COLOR_PURPLE]
    ],
    // Board 18
    [
      [COLOR_PURPLE, COLOR_RED, COLOR_YELLOW, COLOR_BLUE, COLOR_GREEN, COLOR_YELLOW],
      [COLOR_GREEN, COLOR_PURPLE, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_BLUE],
      [COLOR_RED, COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW, COLOR_GREEN],
      [COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_PURPLE, COLOR_RED],
      [COLOR_GREEN, COLOR_RED, COLOR_BLUE, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW]
    ],
    // Board 19
    [
      [COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_BLUE],
      [COLOR_GREEN, COLOR_RED, COLOR_YELLOW, COLOR_RED, COLOR_BLUE, COLOR_YELLOW],
      [COLOR_BLUE, COLOR_GREEN, COLOR_PURPLE, COLOR_GREEN, COLOR_YELLOW, COLOR_RED],
      [COLOR_YELLOW, COLOR_BLUE, COLOR_RED, COLOR_PURPLE, COLOR_RED, COLOR_GREEN],
      [COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_GREEN, COLOR_BLUE],
      [COLOR_PURPLE, COLOR_RED, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_YELLOW]
    ],
    // Board 20
    [
      [COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE],
      [COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_RED],
      [COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_GREEN],
      [COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW],
      [COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE],
      [COLOR_BLUE, COLOR_YELLOW, COLOR_RED, COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE]
    ]
  ]
};

// Game state
const GameState = {
  board: [],           // Color of each tile
  owned: [],           // Tracking owned tiles
  moveCount: 0,        // Current move counter
  boardSize: GameConfig.boardSize,
  bestScores: {},      // Best scores for each board level
  activeTiles: 0,      // Count of owned tiles (for animation purposes)
  gameActive: false,   // Whether a game is in progress
  initialColor: '',    // Store the initial color to handle the same-color bug
  currentLevel: 1,     // Current level (1-20)

  // Load saved settings and scores
  init() {
    // Load best scores from local storage
    const savedScores = localStorage.getItem(GameConfig.storage.bestScores);
    if (savedScores) {
      this.bestScores = JSON.parse(savedScores);
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
  randomBoardBtn: null, // Will be created later
  levelDisplay: null,   // Will be created later
  prevLevelBtn: null,   // Will be created later
  nextLevelBtn: null,   // Will be created later
  instructionsModal: document.getElementById('instructions'),
  closeInstructionsBtn: document.getElementById('closeInstructions'),
  winModal: document.getElementById('winModal'),
  finalMovesEl: document.getElementById('finalMoves'),
  playAgainBtn: document.getElementById('playAgainBtn'),

  // Initialize UI event listeners
  init() {
    // Create level navigation UI
    this.createLevelNavigation();
    
    // Create random board button
    this.createRandomBoardButton();
    
    this.newGameBtn.addEventListener('click', () => Game.startNewGame());
    this.helpBtn.addEventListener('click', () => this.showInstructions());
    this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
    this.playAgainBtn.addEventListener('click', () => {
      this.hideWinModal();
      Game.startNewGame();
    });
    
    // Remove board size select as we now have a fixed size
    const boardSizeSelect = document.getElementById('boardSizeSelect');
    if (boardSizeSelect) {
      boardSizeSelect.remove();
    }
    
    // Add resize listener for mobile responsiveness
    window.addEventListener('resize', this.handleResize.bind(this));
  },
  
  // Create level navigation UI
  createLevelNavigation() {
    const controlsDiv = document.querySelector('.controls');
    
    // Create level display
    this.levelDisplay = document.createElement('div');
    this.levelDisplay.id = 'levelDisplay';
    this.levelDisplay.className = 'level-display';
    this.levelDisplay.innerHTML = `שלב: <span>1</span> / 20`;
    
    // Create navigation buttons
    this.prevLevelBtn = document.createElement('button');
    this.prevLevelBtn.id = 'prevLevelBtn';
    this.prevLevelBtn.textContent = 'הקודם';
    this.prevLevelBtn.addEventListener('click', () => {
      if (GameState.currentLevel > 1) {
        GameState.currentLevel--;
        GameState.saveSettings();
        this.updateLevelDisplay();
        Game.startNewGame();
      }
    });
    
    this.nextLevelBtn = document.createElement('button');
    this.nextLevelBtn.id = 'nextLevelBtn';
    this.nextLevelBtn.textContent = 'הבא';
    this.nextLevelBtn.addEventListener('click', () => {
      if (GameState.currentLevel < 20) {
        GameState.currentLevel++;
        GameState.saveSettings();
        this.updateLevelDisplay();
        Game.startNewGame();
      }
    });
    
    // Create level navigation container
    const levelNav = document.createElement('div');
    levelNav.className = 'level-navigation';
    levelNav.appendChild(this.prevLevelBtn);
    levelNav.appendChild(this.levelDisplay);
    levelNav.appendChild(this.nextLevelBtn);
    
    // Add to controls before existing elements
    controlsDiv.insertBefore(levelNav, controlsDiv.firstChild);
  },
  
  // Create random board button
  createRandomBoardButton() {
    this.randomBoardBtn = document.createElement('button');
    this.randomBoardBtn.id = 'randomBoardBtn';
    this.randomBoardBtn.textContent = 'לוח אקראי';
    this.randomBoardBtn.addEventListener('click', () => {
      GameState.currentLevel = 0; // 0 indicates random board
      GameState.saveSettings();
      this.updateLevelDisplay();
      Game.startNewGame(true); // true indicates random board
    });
    
    // Add to controls
    const controlsDiv = document.querySelector('.controls');
    controlsDiv.appendChild(this.randomBoardBtn);
  },
  
  // Update level display
  updateLevelDisplay() {
    if (GameState.currentLevel === 0) {
      this.levelDisplay.innerHTML = `לוח אקראי`;
    } else {
      this.levelDisplay.innerHTML = `שלב: <span>${GameState.currentLevel}</span> / 20`;
    }
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
    UI.updateLevelDisplay();
    this.startNewGame();
    
    // Show instructions on first visit
    if (!localStorage.getItem('chromashift-visited')) {
      UI.showInstructions();
      localStorage.setItem('chromashift-visited', 'true');
    }
  },

  // Start a new game
  startNewGame(randomBoard = false) {
    GameState.reset();
    this.createBoard(randomBoard);
    UI.updateMoveCounter();
    UI.updateBestScore();
  },

  // Create the game board
  createBoard(randomBoard = false) {
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;
    
    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;

    // Determine if we're using a predefined board or creating a random one
    if (!randomBoard && GameState.currentLevel > 0) {
      // Use predefined board (index is level - 1)
      const boardIndex = GameState.currentLevel - 1;
      const predefinedBoard = GameConfig.predefinedBoards[boardIndex];
      
      for (let y = 0; y < boardSize; y++) {
        GameState.board[y] = [];
        for (let x = 0; x < boardSize; x++) {
          // Get color from predefined board
          const color = predefinedBoard[y][x];
          GameState.board[y][x] = color;

          // Create a tile element
          this.createTileElement(x, y, color, tileSize);
        }
      }
    } else {
      // Create random board
      for (let y = 0; y < boardSize; y++) {
        GameState.board[y] = [];
        for (let x = 0; x < boardSize; x++) {
          // Randomly select a color
          const colorIndex = Math.floor(Math.random() * GameConfig.colors.length);
          const color = GameConfig.colors[colorIndex].hex;
          GameState.board[y][x] = color;

          // Create a tile element
          this.createTileElement(x, y, color, tileSize);
        }
      }
    }

    // The top-right tile is owned by default (fixing corner direction)
    GameState.owned[0][boardSize - 1] = true;
    GameState.activeTiles = 1;
    // Store initial color to fix the same-color bug
    GameState.initialColor = GameState.board[0][boardSize - 1];
    this.updateBoard();
  },
  
  // Create a single tile element
  createTileElement(x, y, color, tileSize) {
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
      
      // Only save best score for predefined levels, not random boards
      let isNewRecord = false;
      if (GameState.currentLevel > 0) {
        isNewRecord = GameState.updateBestScore(GameState.currentLevel, GameState.moveCount);
        UI.updateBestScore();
      }
      
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