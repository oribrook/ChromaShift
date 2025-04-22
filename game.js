import { GameConfig } from './config.js';
import { GameState } from './state.js';
import { UI } from './ui.js';
import { generateBoard } from './boards.js';

const Game = {
  init() {
    GameState.init();
    UI.init(this);
    UI.createColorPicker();
    UI.updateLevelDisplay();
    this.startNewGame();

    if (!localStorage.getItem('chromashift-visited')) {
      UI.showInstructions();
      localStorage.setItem('chromashift-visited', 'true');
    }
    
    window.Game = this;
    window.GameState = GameState;
    
    this.cleanupInterval = setInterval(() => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => this.cleanupMemory());
      } else {
        setTimeout(() => this.cleanupMemory(), 0);
      }
    }, 60000);
  },

  startNewGame(options = {}) {
    const defaultOptions = {
      randomBoard: false, 
      reuseSeed: false,
      keepLevel: true,
      useSavedBoard: false
    };
    
    const { randomBoard, reuseSeed, keepLevel, useSavedBoard } = { ...defaultOptions, ...options };
    
    // Reset game state with reuseSeed parameter
    GameState.reset(reuseSeed);
    
    // If we have saved board data and should use it (either through reuseSeed or useSavedBoard)
    if ((reuseSeed || useSavedBoard) && GameState.savedBoardData) {
      this.createBoardFromSaved();
    } else {
      // Create a new board
      this.createBoard(randomBoard);
      
      // Save the board for future replay
      GameState.saveBoardData();
    }
    
    UI.updateMoveCounter();
    UI.updateBestScore();
    UI.updateOptimalMovesDisplay();
    
    this.cleanupMemory();
  },

  replayCurrentBoard() {
    // Use the saved board data directly (no need to regenerate with seed)
    this.startNewGame({ reuseSeed: true, useSavedBoard: true });
  },

  createBoardFromSaved() {
    if (!GameState.savedBoardData) {
      console.warn("No saved board data found, creating new board instead");
      this.createBoard(false);
      return;
    }
    
    console.log("Creating board from saved data");
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;
    
    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;
    
    // Use deep copy to avoid reference issues
    GameState.board = JSON.parse(JSON.stringify(GameState.savedBoardData.board));
    GameState.setOptimalSolution(
      GameState.savedBoardData.optimalSolution,
      GameState.savedBoardData.optimalMoves
    );
    
    // Create tile elements in the UI
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = GameState.board[y][x];
        UI.createTileElement(x, y, color, tileSize);
      }
    }
    
    // Reset owned state and set starting tile
    GameState.owned = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    const startX = boardSize - 1;
    const startY = 0;
    GameState.owned[startY][startX] = true;
    GameState.activeTiles = 1;
    
    GameState.initialColor = GameState.board[startY][startX];
    UI.updateBoard();
    
    // Debug logging
    if (window.location.hash === '#debug') {
      // Debug code if needed
    }
    
    this.cleanupMemory();
  },

  createBoard(randomBoard = false) {
    const { boardSize } = GameState;
    const tileSize = GameConfig.tileSize;

    UI.boardEl.innerHTML = '';
    UI.boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize}px)`;

    let difficultyLevel = GameState.currentLevel;
    if (randomBoard || GameState.currentLevel === 0) {
      difficultyLevel = Math.floor(Math.random() * 20) + 1;
    }

    const generatedBoardData = generateBoard(boardSize, difficultyLevel, GameState.currentSeed);
    const generatedBoard = generatedBoardData.board;
    
    GameState.setOptimalSolution(
      generatedBoardData.optimalSolution,
      generatedBoardData.optimalMoves
    );
    
    // Save board data for replay
    GameState.savedBoardData = {
      board: JSON.parse(JSON.stringify(generatedBoard)),
      optimalSolution: [...generatedBoardData.optimalSolution],
      optimalMoves: generatedBoardData.optimalMoves,
      level: GameState.currentLevel,
      seed: GameState.currentSeed
    };

    for (let y = 0; y < boardSize; y++) {
      GameState.board[y] = [];
      for (let x = 0; x < boardSize; x++) {
        const color = generatedBoard[y][x];
        GameState.board[y][x] = color;

        UI.createTileElement(x, y, color, tileSize);
      }
    }

    const startX = boardSize - 1;
    const startY = 0;
    GameState.owned[startY][startX] = true;
    GameState.activeTiles = 1;

    GameState.initialColor = GameState.board[startY][startX];
    UI.updateBoard();
    
    // Debug logging
    if (window.location.hash === '#debug') {
      // Debug code if needed
    }
    
    this.cleanupMemory();
  },

  handleTileClick(x, y) {
    if (!GameState.gameActive) return;

    if (GameState.owned[y][x]) return;

    const neighbors = this.getNeighbors(x, y);
    const isAdjacent = neighbors.some(([nx, ny]) => GameState.owned[ny][nx]);

    if (isAdjacent) {
      const newColor = GameState.board[y][x];
      this.handleColorPick(newColor);
    }
  },

  handleColorPick(newColor) {
    const startingPositionY = 0;
    const startingPositionX = GameState.boardSize - 1;

    if (GameState.moveCount === 0) {
      const initialColor = GameState.initialColor;
      
      if (newColor === initialColor) {
        this.firstMoveFloodFill(newColor);
        GameState.moveCount++;
        UI.updateMoveCounter();
        this.checkWin();
        return;
      }
    }

    const startColor = GameState.board[startingPositionY][startingPositionX];
    if (startColor === newColor && !this.canExpandWithColor(newColor)) return;

    GameState.moveCount++;
    UI.updateMoveCounter();

    this.floodFill(newColor);
    UI.updateBoard();

    const moveLimit = GameState.optimalMoves + 4;
    if (GameState.moveCount > moveLimit) {
      this.handleExceededMoveLimit();
      return;
    }

    this.checkWin();
  },
  
  handleExceededMoveLimit() {
    GameState.gameActive = false;
    setTimeout(() => {
      UI.showExceededMoveLimitModal(GameState.moveCount, GameState.optimalMoves);
    }, 300);
  },

  firstMoveFloodFill(color) {
    const { boardSize, board } = GameState;
    const startX = boardSize - 1;
    const startY = 0;
    
    const visited = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    
    const tilesToAnimate = [];
    
    let safetyCounter = 0;
    const MAX_SAFETY_LIMIT = boardSize * boardSize * 2;
    
    let currentIndex = 0;
    while (currentIndex < queue.length && safetyCounter < MAX_SAFETY_LIMIT) {
      safetyCounter++;
      
      const [x, y] = queue[currentIndex++];
      
      GameState.owned[y][x] = true;
      GameState.activeTiles++;
      
      if (!(x === startX && y === startY)) {
        tilesToAnimate.push([x, y]);
      }
      
      const neighbors = this.getNeighbors(x, y);
      
      for (const [nx, ny] of neighbors) {
        if (!visited[ny][nx] && board[ny][nx] === color) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }
    
    if (safetyCounter >= MAX_SAFETY_LIMIT) {
      // Safety limit reached, handle if needed
    }
    
    UI.updateBoard();
    
    const ANIMATION_THRESHOLD = 20;
    const shouldAnimate = tilesToAnimate.length <= ANIMATION_THRESHOLD;
    
    if (shouldAnimate && tilesToAnimate.length > 0) {
      tilesToAnimate.forEach(([x, y], index) => {
        setTimeout(() => {
          const tileEl = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
          if (tileEl) {
            tileEl.classList.add('newly-owned');
            setTimeout(() => {
              tileEl.classList.remove('newly-owned');
            }, 500);
          }
        }, Math.min(index * 30, 1000));
      });
    }
  },

  canExpandWithColor(color) {
    const { boardSize, owned, board } = GameState;

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (!owned[y][x]) {
          const neighbors = this.getNeighbors(x, y);
          for (const [nx, ny] of neighbors) {
            if (owned[ny][nx] && board[y][x] === color) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },

  floodFill(newColor) {
    const { board, owned, boardSize } = GameState;
    const previousActiveTiles = GameState.activeTiles;
    
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (owned[y][x]) {
          board[y][x] = newColor;
        }
      }
    }
    
    const tilesToClaim = [];
    const visitedTiles = new Set();
    let safetyCounter = 0;
    const MAX_SAFETY_LIMIT = boardSize * boardSize * 2;
    
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (owned[y][x]) continue;
        
        if (board[y][x] === newColor) {
          const neighbors = this.getNeighbors(x, y);
          for (const [nx, ny] of neighbors) {
            if (owned[ny][nx]) {
              tilesToClaim.push([x, y]);
              visitedTiles.add(`${x},${y}`);
              break;
            }
          }
        }
      }
    }
    
    let currentIndex = 0;
    while (currentIndex < tilesToClaim.length && safetyCounter < MAX_SAFETY_LIMIT) {
      safetyCounter++;
      
      const [x, y] = tilesToClaim[currentIndex++];
      owned[y][x] = true;
      GameState.activeTiles++;
      
      const neighbors = this.getNeighbors(x, y);
      for (const [nx, ny] of neighbors) {
        const key = `${nx},${ny}`;
        if (visitedTiles.has(key) || owned[ny][nx]) continue;
        
        if (board[ny][nx] === newColor) {
          tilesToClaim.push([nx, ny]);
          visitedTiles.add(key);
        }
      }
    }
    
    if (safetyCounter >= MAX_SAFETY_LIMIT) {
      // Safety limit reached, handle if needed
    }
    
    const ANIMATION_THRESHOLD = 20;
    const shouldAnimate = tilesToClaim.length > 0 && tilesToClaim.length <= ANIMATION_THRESHOLD;
    
    setTimeout(() => {
      UI.updateBoard();
      
      if (shouldAnimate) {
        tilesToClaim.forEach(([x, y], index) => {
          const tileEl = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
          if (tileEl) {
            setTimeout(() => {
              tileEl.classList.add('newly-owned');
              setTimeout(() => {
                tileEl.classList.remove('newly-owned');
              }, 500);
            }, index * 30);
          }
        });
      }
    }, 0);
    
    return GameState.activeTiles > previousActiveTiles;
  },

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

  checkWin() {
    const allOwned = GameState.owned.flat().every(v => v);

    if (allOwned) {
      GameState.gameActive = false;

      const gradeInfo = GameState.getGrade();
      
      let isNewRecord = false;
      if (GameState.currentLevel > 0) {
        isNewRecord = GameState.updateBestScore(GameState.currentLevel, GameState.moveCount);
        
        const exceededMoveLimit = GameState.moveCount > (GameState.optimalMoves + 4);
        if (!exceededMoveLimit) {
          GameState.markLevelCompleted(GameState.currentLevel);
          UI.updateNavigationButtons();
        }
        
        UI.updateBestScore();
      }

      setTimeout(() => {
        UI.showWinModal(GameState.moveCount, gradeInfo, GameState.optimalMoves);
      }, 300);
      
      this.cleanupMemory();
    }
  },
  
  cleanupMemory() {
    const animatedTiles = document.querySelectorAll('.newly-owned');
    if (animatedTiles.length > 0) {
      animatedTiles.forEach(tile => tile.classList.remove('newly-owned'));
    }
    
    const buttons = document.querySelectorAll('button');
    
    // Modified: Only clear savedBoardData when game is not active and we're not in win state
    // This ensures we keep the board data for replay after a win
    if (!GameState.gameActive && !document.querySelector('#winModal:not(.hidden)')) {
      // GameState.savedBoardData = null;
      // We actually want to keep the board data for replay
    }
    
    const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
    if (visibleModals.length > 0) {
      if (!GameState.gameActive) {
        visibleModals.forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    }
    
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Garbage collection failed, ignore
      }
    }
    
    return true;
  }
};

export { Game };