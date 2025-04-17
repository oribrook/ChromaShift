/**
 * ChromaShift Game - UI Module
 * Handles all user interface elements, interactions, and rendering
 */

import { GameConfig } from './config.js';
import { GameState } from './state.js';

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
  init(Game) {
    // Store reference to Game logic
    this.Game = Game;

    // Create level navigation UI
    this.createLevelNavigation();

    // Create random board button
    this.createRandomBoardButton();

    // Setup the win modal with the Next Level button
    this.setupWinModal();

    this.newGameBtn.addEventListener('click', () => this.Game.startNewGame());
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
      this.Game.startNewGame();
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
        this.Game.startNewGame();
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
      // const difficultyText = GameConfig.DIFFICULTY_LEVELS[1]?.name || "קל מאוד";
      const difficultyText = GameConfig.DIFFICULTY_LEVELS && GameConfig.DIFFICULTY_LEVELS[1]?.name || "קל מאוד";
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
        this.Game.startNewGame();
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
        this.Game.startNewGame();
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
      this.Game.startNewGame(true); // true indicates random board
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
        // const difficultyText = GameConfig.DIFFICULTY_LEVELS[GameState.currentLevel]?.name || "";
        const difficultyText = GameConfig.DIFFICULTY_LEVELS && GameConfig.DIFFICULTY_LEVELS[1]?.name || "";
        
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
          this.Game.handleColorPick(color.hex);
        }
      });

      this.pickerEl.appendChild(btn);
    });
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
    tile.addEventListener('click', () => this.Game.handleTileClick(x, y));

    this.boardEl.appendChild(tile);
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

export { UI };