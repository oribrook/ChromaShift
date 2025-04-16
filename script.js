/**
 * ChromaShift Game - Hebrew Version
 * A color-based puzzle game where players flood fill the board to capture all tiles.
 */

// Import board generation functions from external file
import { generateBoard, analyzeBoard, DIFFICULTY_LEVELS, COLORS } from './boards.js';

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
    settings: 'chromashift-settings',
    completedLevels: 'chromashift-completed-levels' // Add storage key for completed levels
  }
};

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

// DOM elements and UI handling
const UI = {
  boardEl: document.getElementById('gameBoard'),
  pickerEl: document.getElementById('colorPicker'),
  moveEl: document.getElementById('moveCounter').querySelector('span'),
  bestScoreEl: document.getElementById('bestScore').querySelector('span'),
  newGameBtn: document.getElementById('newGameBtn'),
  helpBtn: document.getElementById('helpBtn'),
  scoreboardBtn: document.getElementById('scoreboardBtn'),
  scoreboardModal: document.getElementById('scoreboardModal'),
  scoreboardContent: document.getElementById('scoreboardContent'),
  closeScoreboardBtn: document.getElementById('closeScoreboard'),
  shareWhatsAppBtn: document.getElementById('shareWhatsApp'),
  shareInstagramBtn: document.getElementById('shareInstagram'),
  shareFacebookBtn: document.getElementById('shareFacebook'),
  randomBoardBtn: null, // Will be created later
  levelDisplay: null,   // Will be created later
  levelDifficulty: null, // Will be created for the difficulty label
  prevLevelBtn: null,   // Will be created later
  nextLevelBtn: null,   // Will be created later
  instructionsModal: document.getElementById('instructions'),
  closeInstructionsBtn: document.getElementById('closeInstructions'),
  winModal: document.getElementById('winModal'),
  finalMovesEl: document.getElementById('finalMoves'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  nextLevelBtn: null,  // Will be created for continue to next level

  // Initialize UI event listeners
  init() {
    // Create level navigation UI
    this.createLevelNavigation();

    // Create random board button
    this.createRandomBoardButton();

    // Setup the win modal with the Next Level button
    this.setupWinModal();

    this.newGameBtn.addEventListener('click', () => Game.startNewGame());
    this.helpBtn.addEventListener('click', () => this.showInstructions());
    this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
    
    // Add scoreboard event listeners
    this.scoreboardBtn.addEventListener('click', () => this.showScoreboard());
    this.closeScoreboardBtn.addEventListener('click', () => this.hideScoreboard());
    this.shareWhatsAppBtn.addEventListener('click', () => this.shareScores('whatsapp'));
    this.shareInstagramBtn.addEventListener('click', () => this.shareScores('instagram'));
    this.shareFacebookBtn.addEventListener('click', () => this.shareScores('facebook'));

    // Remove board size select as we now have a fixed size
    const boardSizeSelect = document.getElementById('boardSizeSelect');
    if (boardSizeSelect) {
      boardSizeSelect.remove();
    }

    // Add resize listener for mobile responsiveness
    window.addEventListener('resize', this.handleResize.bind(this));
  },

  // Set up the win modal with Next Level button
  setupWinModal() {
    // Clear the existing buttons
    const modalContent = this.winModal.querySelector('.modal-content');
    
    // Find the existing Play Again button and remove it
    if (this.playAgainBtn) {
      this.playAgainBtn.remove();
    }
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'win-buttons';
    
    // Create new Play Again button
    this.playAgainBtn = document.createElement('button');
    this.playAgainBtn.id = 'playAgainBtn';
    this.playAgainBtn.textContent = 'שחק שוב';
    this.playAgainBtn.addEventListener('click', () => {
      this.hideWinModal();
      Game.startNewGame();
    });
    
    // Create Continue to Next Level button
    this.continueNextLevelBtn = document.createElement('button');
    this.continueNextLevelBtn.id = 'continueNextLevelBtn';
    this.continueNextLevelBtn.textContent = 'המשך לשלב הבא';
    this.continueNextLevelBtn.addEventListener('click', () => {
      const nextLevel = GameState.getNextLevel();
      
      // Check if the next level is unlocked
      if (GameState.isLevelUnlocked(nextLevel)) {
        GameState.currentLevel = nextLevel;
        GameState.saveSettings();
        this.updateLevelDisplay();
        this.hideWinModal();
        Game.startNewGame();
      } else {
        // Alert if level is locked - but this shouldn't happen since we'll hide the button
        alert(`שלב ${nextLevel} עדיין נעול. סיים את השלב הקודם כדי לפתוח אותו.`);
      }
    });
    
    // Add buttons to container
    buttonsContainer.appendChild(this.playAgainBtn);
    buttonsContainer.appendChild(this.continueNextLevelBtn);
    
    // Add container to modal
    modalContent.appendChild(buttonsContainer);
  },

  // Create level navigation UI
  createLevelNavigation() {
    const controlsDiv = document.querySelector('.controls');

    // Create difficulty and level display container
    const levelContainer = document.createElement('div');
    levelContainer.className = 'level-container';

    // Create level display
    this.levelDisplay = document.createElement('div');
    this.levelDisplay.id = 'levelDisplay';
    this.levelDisplay.className = 'level-display';
    this.levelDisplay.innerHTML = `שלב: <span>1</span> / 20`;

    // Create difficulty display
    this.levelDifficulty = document.createElement('div');
    this.levelDifficulty.id = 'levelDifficulty';
    this.levelDifficulty.className = 'level-difficulty';
    
    // Get the difficulty for level 1
    const difficultyText = DIFFICULTY_LEVELS[1].name || "קל מאוד";
    this.levelDifficulty.textContent = difficultyText;
    
    // Add level display and difficulty to container
    levelContainer.appendChild(this.levelDisplay);
    levelContainer.appendChild(this.levelDifficulty);

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
      const nextLevel = GameState.currentLevel + 1;
      // Only allow going to the next level if it's unlocked
      if (nextLevel <= 20 && GameState.isLevelUnlocked(nextLevel)) {
        GameState.currentLevel = nextLevel;
        GameState.saveSettings();
        this.updateLevelDisplay();
        Game.startNewGame();
      } else if (nextLevel <= 20) {
        // Alert if level is locked
        alert(`שלב ${nextLevel} עדיין נעול. סיים את שלב ${GameState.currentLevel} כדי לפתוח אותו.`);
      }
    });

    // Create level navigation container
    const levelNav = document.createElement('div');
    levelNav.className = 'level-navigation';
    levelNav.appendChild(this.prevLevelBtn);
    levelNav.appendChild(levelContainer);
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
      this.levelDifficulty.textContent = "";
    } else {
      this.levelDisplay.innerHTML = `שלב: <span>${GameState.currentLevel}</span> / 20`;
      
      // Update the difficulty label
      const difficultyText = DIFFICULTY_LEVELS[GameState.currentLevel]?.name || "";
      this.levelDifficulty.textContent = difficultyText;
    }
    
    // Update button states based on level availability
    this.updateNavigationButtons();
  },
  
  // Update the navigation buttons based on level completion
  updateNavigationButtons() {
    // Next level button is disabled if the next level is locked
    const nextLevel = GameState.currentLevel + 1;
    if (nextLevel <= 20 && !GameState.isLevelUnlocked(nextLevel)) {
      this.nextLevelBtn.classList.add('disabled');
    } else {
      this.nextLevelBtn.classList.remove('disabled');
    }
  },

  // Update the Next Level button visibility in the win modal
  updateWinModalButtons() {
    if (!this.continueNextLevelBtn) return;
    
    // For random boards or final level, hide the next level button
    if (GameState.currentLevel === 0 || GameState.currentLevel >= 20) {
      this.continueNextLevelBtn.style.display = 'none';
    } else {
      const nextLevel = GameState.getNextLevel();
      // Show the button and update its text
      this.continueNextLevelBtn.style.display = 'block';
      this.continueNextLevelBtn.textContent = `המשך לשלב ${nextLevel}`;
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
    // Update next level button text and visibility
    this.updateWinModalButtons();
    this.winModal.classList.remove('hidden');
  },

  // Hide win modal
  hideWinModal() {
    this.winModal.classList.add('hidden');
  },
  
  // Show scoreboard modal
  showScoreboard() {
    // Generate scoreboard content
    const scores = GameState.getAllScores();
    let html = '<table class="scores-table"><thead><tr>' +
               '<th>שלב</th>' +
               '<th>רמת קושי</th>' +
               '<th>שיא אישי</th>' +
               '</tr></thead><tbody>';
    
    scores.forEach(item => {
      html += `<tr class="${!item.score ? 'not-played' : ''}">
                <td>${item.level}</td>
                <td>${item.difficulty}</td>
                <td>${item.score || '-'}</td>
              </tr>`;
    });
    
    html += '</tbody></table>';
    this.scoreboardContent.innerHTML = html;
    this.scoreboardModal.classList.remove('hidden');
    
    // If sound manager is available, play button sound
    if (window.SoundManager && window.SoundManager.playButtonSound) {
      window.SoundManager.playButtonSound();
    }
  },

  // Hide scoreboard modal
  hideScoreboard() {
    this.scoreboardModal.classList.add('hidden');
  },

  // Share scores to social platforms
  shareScores(platform) {
    // If sound manager is available and has share sound, play it
    if (window.SoundManager && window.SoundManager.sounds && window.SoundManager.sounds.share) {
      window.SoundManager.sounds.share.play();
    } else if (window.SoundManager && window.SoundManager.playButtonSound) {
      // Fallback to button sound if share sound isn't available
      window.SoundManager.playButtonSound();
    }
    
    // Create share text
    const scores = GameState.getAllScores();
    let shareText = "הישגים שלי במשחק כרומשיפט:\n\n";
    
    // Add scores that have been played
    const playedScores = scores.filter(score => score.score !== null);
    
    if (playedScores.length === 0) {
      shareText += "טרם השלמתי שלבים\n";
    } else {
      playedScores.forEach(item => {
        shareText += `שלב ${item.level} (${item.difficulty}): ${item.score} מהלכים\n`;
      });
    }
    
    shareText += "\nבואו לשחק: [כתובת האתר כאן]";
    
    // Share based on platform
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll copy to clipboard and alert
        navigator.clipboard.writeText(shareText).then(() => {
          alert('הטקסט הועתק ללוח. פתח את אינסטגרם ידנית והדבק את הטקסט בסטורי או בפוסט.');
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('לא ניתן להעתיק את הטקסט. נסה שיתוף בדרך אחרת.');
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
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

    // Determine the difficulty level for the board
    let difficultyLevel = GameState.currentLevel;
    if (randomBoard || GameState.currentLevel === 0) {
      // For random board mode, choose a random difficulty between 1-20
      difficultyLevel = Math.floor(Math.random() * 20) + 1;
    }

    // Generate the board using our dynamic board generator
    const generatedBoard = generateBoard(boardSize, difficultyLevel, GameState.currentSeed);

    // Add the generated board to the game state
    for (let y = 0; y < boardSize; y++) {
      GameState.board[y] = [];
      for (let x = 0; x < boardSize; x++) {
        const color = generatedBoard[y][x];
        GameState.board[y][x] = color;

        // Create a tile element
        this.createTileElement(x, y, color, tileSize);
      }
    }

    // The top-left tile is owned by default (RTL in Hebrew version means right-top)
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
    this.updateBoard();

    // Check if the player has won
    this.checkWin();
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
    
    this.updateBoard();
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

  // Flood fill algorithm (continued)
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

      // Only save best score for predefined levels, not random boards
      let isNewRecord = false;
      if (GameState.currentLevel > 0) {
        isNewRecord = GameState.updateBestScore(GameState.currentLevel, GameState.moveCount);
        
        // Mark the level as completed
        GameState.markLevelCompleted(GameState.currentLevel);
        
        // Update button states for level navigation
        UI.updateNavigationButtons();
        
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
  
  // Make Game object accessible globally for sound system
  window.Game = Game;
  window.GameState = GameState;
});

// Export the Game object for use by other modules
export { Game, GameState, UI };