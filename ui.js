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
    moveEl: document.getElementById('moveCounter').querySelector('.stat-value'),
    bestScoreEl: document.getElementById('bestScore').querySelector('.stat-value'),
    newGameBtn: document.getElementById('newGameBtn'),
    helpBtn: document.getElementById('helpBtn'),
    scoreboardBtn: document.getElementById('scoreboardBtn'),
    scoreboardModal: document.getElementById('scoreboardModal'),
    scoreboardContent: document.getElementById('scoreboardContent'),
    closeScoreboardBtn: document.getElementById('closeScoreboard'),
    closeScoreboardXBtn: document.getElementById('closeScoreboardX'),
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
    closeInstructionsXBtn: document.getElementById('closeInstructionsX'),
    winModal: document.getElementById('winModal'),
    closeWinModalXBtn: document.getElementById('closeWinModalX'),
    finalMovesEl: document.getElementById('finalMoves'),
    finalGradeEl: null,   // Will be created for displaying grade
    optimalMovesEl: null, // Will be created for displaying optimal moves
    optimalMovesDisplayEl: null, // New element for displaying optimal moves during gameplay
    playAgainBtn: document.getElementById('playAgainBtn'),
    nextLevelBtn: null,  // Will be created for continue to next level
    exceededMoveLimitModal: null, // New modal for exceeded move limit

    // Initialize UI event listeners
    init(Game) {
        // Store reference to Game logic
        this.Game = Game;

        // Create level navigation UI
        this.createLevelNavigation();

        // Create random board button
        this.createRandomBoardButton();

        // Create optimal moves display
        this.createOptimalMovesDisplay();

        // Setup the win modal with the Next Level button and grade display
        this.setupWinModal();

        // Create the exceeded move limit modal
        this.createExceededMoveLimitModal();

        this.newGameBtn.addEventListener('click', () => this.Game.startNewGame());
        this.helpBtn.addEventListener('click', () => this.showInstructions());
        this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
        if (this.closeInstructionsXBtn) {
            this.closeInstructionsXBtn.addEventListener('click', () => this.hideInstructions());
        }

        if (this.closeWinModalXBtn) {
            this.closeWinModalXBtn.addEventListener('click', () => this.hideWinModal());
        }

        // Add scoreboard event listeners
        this.scoreboardBtn.addEventListener('click', () => this.showScoreboard());
        this.closeScoreboardBtn.addEventListener('click', () => this.hideScoreboard());
        if (this.closeScoreboardXBtn) {
            this.closeScoreboardXBtn.addEventListener('click', () => this.hideScoreboard());
        }
        this.shareWhatsAppBtn.addEventListener('click', () => this.shareScores('whatsapp'));
        this.shareInstagramBtn.addEventListener('click', () => this.shareScores('instagram'));
        this.shareFacebookBtn.addEventListener('click', () => this.shareScores('facebook'));

        // Add resize listener for mobile responsiveness
        window.addEventListener('resize', this.handleResize.bind(this));
    },

    // Create optimal moves display
    createOptimalMovesDisplay() {
        // Create container for optimal moves display
        const movesContainer = document.getElementById('moveCounter').parentNode;

        // Create optimal moves display element
        this.optimalMovesDisplayEl = document.createElement('div');
        this.optimalMovesDisplayEl.id = 'optimalMovesDisplay';
        this.optimalMovesDisplayEl.className = 'stat-card';

        const label = document.createElement('span');
        label.className = 'stat-label';
        label.textContent = 'פתרון ממוצע';

        const value = document.createElement('span');
        value.className = 'stat-value';
        value.textContent = '-';

        this.optimalMovesDisplayEl.appendChild(label);
        this.optimalMovesDisplayEl.appendChild(value);

        // Add to container after move counter
        movesContainer.appendChild(this.optimalMovesDisplayEl);
    },

    // Update optimal moves display
    updateOptimalMovesDisplay() {
        if (!this.optimalMovesDisplayEl) return;

        const optimalMovesValueEl = this.optimalMovesDisplayEl.querySelector('.stat-value');
        if (optimalMovesValueEl) {
            optimalMovesValueEl.textContent = GameState.optimalMoves || '-';
        }
    },

    // Create exceeded move limit modal
    createExceededMoveLimitModal() {
        // Create the modal element
        this.exceededMoveLimitModal = document.createElement('div');
        this.exceededMoveLimitModal.id = 'exceededMoveLimitModal';
        this.exceededMoveLimitModal.className = 'modal hidden';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        this.exceededMoveLimitModal.appendChild(modalBackdrop);

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';

        const header = document.createElement('h2');
        header.textContent = 'יותר מדי מהלכים';
        modalHeader.appendChild(header);

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.setAttribute('aria-label', 'סגור');
        closeButton.textContent = '✕';
        closeButton.addEventListener('click', () => this.hideExceededMoveLimitModal());
        modalHeader.appendChild(closeButton);

        modalContent.appendChild(modalHeader);

        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        // Add message
        const message = document.createElement('p');
        message.id = 'exceededMoveLimitMessage';
        message.textContent = 'ביצעת יותר מדי מהלכים. נסה שוב כדי להשלים את השלב בפחות מהלכים.';
        modalBody.appendChild(message);

        // Add optimal moves display
        const optimalMovesInfo = document.createElement('p');
        optimalMovesInfo.id = 'exceededOptimalMoves';
        optimalMovesInfo.textContent = 'מספר מהלכים ממוצע: ';
        modalBody.appendChild(optimalMovesInfo);

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'exceeded-buttons';

        // Create retry button (same board)
        const retryButton = document.createElement('button');
        retryButton.id = 'retryExceededBtn';
        retryButton.className = 'btn btn-primary';
        retryButton.textContent = 'נסה שוב אותו לוח';
        retryButton.addEventListener('click', () => {
            this.hideExceededMoveLimitModal();
            this.Game.replayCurrentBoard();
        });
        buttonsContainer.appendChild(retryButton);

        // Create new board button
        const newBoardButton = document.createElement('button');
        newBoardButton.id = 'newBoardExceededBtn';
        newBoardButton.className = 'btn btn-accent';
        newBoardButton.textContent = 'לוח חדש';
        newBoardButton.addEventListener('click', () => {
            this.hideExceededMoveLimitModal();
            this.Game.startNewGame({ reuseSeed: false });
        });
        buttonsContainer.appendChild(newBoardButton);

        // Add buttons to modal body
        modalBody.appendChild(buttonsContainer);
        modalContent.appendChild(modalBody);

        // Add content to modal
        this.exceededMoveLimitModal.appendChild(modalContent);

        // Add modal to document
        document.body.appendChild(this.exceededMoveLimitModal);
    },

    // Show exceeded move limit modal
    showExceededMoveLimitModal(moveCount, optimalMoves) {
        if (!this.exceededMoveLimitModal) return;

        // Update message with move count
        const messageEl = document.getElementById('exceededMoveLimitMessage');
        if (messageEl) {
            messageEl.textContent = `ביצעת ${moveCount} מהלכים, יותר מ-4 מהלכים מעל המינימום הנדרש. יש לנסות שוב כדי לעבור לשלב הבא.`;
        }

        // Update optimal moves info
        const optimalMovesEl = document.getElementById('exceededOptimalMoves');
        if (optimalMovesEl) {
            optimalMovesEl.textContent = `מספר מהלכים ממוצע: ${optimalMoves} (מותר עד ${optimalMoves + 4} מהלכים)`;
        }

        // Show the modal
        this.exceededMoveLimitModal.classList.remove('hidden');
    },

    // Hide exceeded move limit modal
    hideExceededMoveLimitModal() {
        if (this.exceededMoveLimitModal) {
            this.exceededMoveLimitModal.classList.add('hidden');
        }
    },

    // Set up the win modal with Next Level button and grade display
    setupWinModal() {
        // Get the modal body
        const modalBody = this.winModal.querySelector('.modal-body');
        const winStats = modalBody.querySelector('.win-stats');

        // Create grade display element
        this.finalGradeEl = document.createElement('div');
        this.finalGradeEl.id = 'finalGrade';
        this.finalGradeEl.className = 'final-grade';

        // Create grade text element
        const gradeText = document.createElement('div');
        gradeText.className = 'grade-text';
        this.finalGradeEl.appendChild(gradeText);

        // Create star rating
        const starsContainer = document.createElement('div');
        starsContainer.className = 'grade-stars';
        this.finalGradeEl.appendChild(starsContainer);

        // Create optimal moves element
        this.optimalMovesEl = document.createElement('div');
        this.optimalMovesEl.id = 'optimalMoves';
        this.optimalMovesEl.className = 'optimal-moves';

        // Add elements to win stats
        winStats.appendChild(this.finalGradeEl);
        winStats.appendChild(this.optimalMovesEl);

        // Get footer for buttons
        const buttonsContainer = this.winModal.querySelector('.win-buttons');

        // Create new Play Again button (same board)
        this.playAgainBtn = document.createElement('button');
        this.playAgainBtn.id = 'playAgainBtn';
        this.playAgainBtn.className = 'btn btn-primary';
        this.playAgainBtn.textContent = 'שחק שוב אותו לוח';
        this.playAgainBtn.addEventListener('click', () => {
            this.hideWinModal();
            // Call the replayCurrentBoard function to replay the same board
            this.Game.replayCurrentBoard();
        });

        // Create New Random Board button
        this.newRandomBoardBtn = document.createElement('button');
        this.newRandomBoardBtn.id = 'newRandomBoardBtn';
        this.newRandomBoardBtn.className = 'btn btn-accent';
        this.newRandomBoardBtn.textContent = 'לוח חדש';
        this.newRandomBoardBtn.addEventListener('click', () => {
            this.hideWinModal();
            this.Game.startNewGame({ reuseSeed: false });
        });

        // Create Continue to Next Level button
        this.continueNextLevelBtn = document.createElement('button');
        this.continueNextLevelBtn.id = 'continueNextLevelBtn';
        this.continueNextLevelBtn.className = 'btn btn-success';
        this.continueNextLevelBtn.textContent = 'המשך לשלב הבא';
        this.continueNextLevelBtn.addEventListener('click', () => {
            const nextLevel = GameState.getNextLevel();

            // Check if the next level is unlocked
            if (GameState.isLevelUnlocked(nextLevel)) {
                GameState.currentLevel = nextLevel;
                GameState.saveSettings();
                this.updateLevelDisplay();
                this.hideWinModal();
                this.Game.startNewGame({ reuseSeed: false });
            } else {
                // Alert if level is locked - but this shouldn't happen since we'll hide the button
                alert(`שלב ${nextLevel} עדיין נעול. סיים את השלב הקודם כדי לפתוח אותו.`);
            }
        });

        // Add buttons to container
        buttonsContainer.appendChild(this.playAgainBtn);
        buttonsContainer.appendChild(this.newRandomBoardBtn);
        buttonsContainer.appendChild(this.continueNextLevelBtn);
    },

    // Create level navigation UI
    createLevelNavigation() {
        const levelNavContainer = document.querySelector('.level-navigation-container');

        // Create level navigation component
        const levelNav = document.createElement('div');
        levelNav.className = 'level-navigation';

        // Create previous level button
        this.prevLevelBtn = document.createElement('button');
        this.prevLevelBtn.id = 'prevLevelBtn';
        this.prevLevelBtn.className = 'nav-btn';
        this.prevLevelBtn.innerHTML = '&#10094;';
        this.prevLevelBtn.setAttribute('aria-label', 'השלב הקודם');
        this.prevLevelBtn.addEventListener('click', () => {
            if (GameState.currentLevel > 1) {
                GameState.currentLevel--;
                GameState.saveSettings();
                this.updateLevelDisplay();
                this.Game.startNewGame();
            }
        });

        // Create level info container
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info';

        // Create level display
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.id = 'levelDisplay';
        this.levelDisplay.className = 'level-display';
        this.levelDisplay.innerHTML = `שלב <span>1</span> / 20`;

        // Create difficulty display
        this.levelDifficulty = document.createElement('div');
        this.levelDifficulty.id = 'levelDifficulty';
        this.levelDifficulty.className = 'level-difficulty';

        // Get the difficulty for level 1
        const difficultyText = GameConfig.DIFFICULTY_LEVELS && GameConfig.DIFFICULTY_LEVELS[1]?.name || "קל מאוד";
        this.levelDifficulty.textContent = difficultyText;

        // Add level display and difficulty to container
        levelInfo.appendChild(this.levelDisplay);
        levelInfo.appendChild(this.levelDifficulty);

        // Create next level button
        this.nextLevelBtn = document.createElement('button');
        this.nextLevelBtn.id = 'nextLevelBtn';
        this.nextLevelBtn.className = 'nav-btn';
        this.nextLevelBtn.innerHTML = '&#10095;';
        this.nextLevelBtn.setAttribute('aria-label', 'השלב הבא');
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

        // Add components to level navigation
        levelNav.appendChild(this.prevLevelBtn);
        levelNav.appendChild(levelInfo);
        levelNav.appendChild(this.nextLevelBtn);

        // Add to container
        levelNavContainer.appendChild(levelNav);
    },

    // Create random board button
    createRandomBoardButton() {
        this.randomBoardBtn = document.createElement('button');
        this.randomBoardBtn.id = 'randomBoardBtn';
        this.randomBoardBtn.className = 'btn btn-accent';
        this.randomBoardBtn.textContent = 'לוח אקראי';
        this.randomBoardBtn.addEventListener('click', () => {
            GameState.currentLevel = 0; // 0 indicates random board
            GameState.saveSettings();
            this.updateLevelDisplay();
            this.Game.startNewGame({ randomBoard: true }); // true indicates random board
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
            this.levelDisplay.innerHTML = `שלב <span>${GameState.currentLevel}</span> / 20`;

            // Update the difficulty label
            const difficultyText = GameConfig.DIFFICULTY_LEVELS && GameConfig.DIFFICULTY_LEVELS[GameState.currentLevel]?.name || "";
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
            const exceededMoveLimit = GameState.moveCount > (GameState.optimalMoves + 4);

            // Only show the next level button if not exceeded move limit
            if (exceededMoveLimit) {
                this.continueNextLevelBtn.style.display = 'none';
            } else {
                // Show the button and update its text
                this.continueNextLevelBtn.style.display = 'block';
                this.continueNextLevelBtn.textContent = `המשך לשלב ${nextLevel}`;
            }
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

        // Adjust layout based on orientation
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
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

    // Create star rating component
    createStarRating(grade, container, animate = false) {
        // Clear existing content
        container.innerHTML = '';

        // Create star container
        const starContainer = document.createElement('div');
        starContainer.className = `star-rating ${animate ? 'animate' : ''}`;

        // Determine how many stars to show based on grade
        let starCount = 0;
        switch (grade) {
            case 'PERFECT': starCount = 5; break;
            case 'GREAT': starCount = 4; break;
            case 'GOOD': starCount = 3; break;
            case 'OK': starCount = 2; break;
            default: starCount = 1; // FAIL
        }

        // Create stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = `star ${i >= starCount ? 'inactive' : ''}`;
            star.style.setProperty('--star-index', i);
            starContainer.appendChild(star);
        }

        // Add to container
        container.appendChild(starContainer);
        return starContainer;
    },

    // Show win modal with grade information
    showWinModal(moves, gradeInfo, optimalMoves) {
        this.finalMovesEl.textContent = moves;

        // Update grade display
        if (this.finalGradeEl && gradeInfo) {
            // Reset classes
            this.finalGradeEl.className = 'final-grade';
            this.finalGradeEl.classList.add(`grade-${gradeInfo.grade.toLowerCase()}`);

            // Create grade text element
            const gradeTextEl = this.finalGradeEl.querySelector('.grade-text');
            if (gradeTextEl) {
                gradeTextEl.textContent = gradeInfo.displayText;
            }

            // Create star rating
            const starsEl = this.finalGradeEl.querySelector('.grade-stars');
            if (starsEl) {
                this.createStarRating(gradeInfo.grade, starsEl, true);
            }
        }

        // Update optimal moves display
        if (this.optimalMovesEl && optimalMoves) {
            this.optimalMovesEl.textContent = `מספר מהלכים : ${optimalMoves}`;

            // Add comparison with player's moves
            const difference = moves - optimalMoves;
            if (difference === 0) {
                this.optimalMovesEl.innerHTML += ' (מושלם!)';
            } else {
                // this.optimalMovesEl.innerHTML += ` (${difference}+ מהמינימום)`;
                const temp = difference > 0 ? "יותר" : "פחות";
                this.optimalMovesEl.innerHTML += ` שזה ${Math.abs(difference)} ${temp}  מהממוצע`;
            }
        }

        // Check if player exceeded move limit and update next level button visibility
        const exceededMoveLimit = moves > (optimalMoves + 4);
        if (exceededMoveLimit) {
            // If moves exceeded limit, display a message about it
            const exceededMessage = document.createElement('div');
            exceededMessage.className = 'exceeded-message';
            exceededMessage.textContent = 'ביצעת יותר מ-4 מהלכים מעל המינימום הנדרש. יש לשחק שוב כדי לעבור לשלב הבא.';
            this.optimalMovesEl.after(exceededMessage);
        }

        // Update next level button text and visibility
        this.updateWinModalButtons();
        this.winModal.classList.remove('hidden');
    },

    // Hide win modal
    hideWinModal() {
        this.winModal.classList.add('hidden');

        // Remove any exceeded message that might have been added
        const exceededMessage = this.winModal.querySelector('.exceeded-message');
        if (exceededMessage) {
            exceededMessage.remove();
        }
    },

    // Show scoreboard modal with grades
    showScoreboard() {
        // Generate scoreboard content
        const scores = GameState.getAllScores();

        // Create table structure
        const table = document.createElement('table');
        table.className = 'scores-table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = [
            { text: 'שלב', class: 'level-header' },
            { text: 'רמת קושי', class: 'difficulty-header' },
            { text: 'שיא אישי', class: 'score-header' },
            { text: 'ציון', class: 'grade-header' },
            { text: 'ממוצע', class: 'optimal-header' }
        ];

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.text;
            if (header.class) th.className = header.class;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');

        scores.forEach(item => {
            const row = document.createElement('tr');
            if (!item.score) row.classList.add('not-played');
            if (item.grade) row.classList.add(`grade-${item.grade.toLowerCase()}`);

            // Level cell
            const levelCell = document.createElement('td');
            levelCell.className = 'level-cell';
            levelCell.textContent = item.level;
            row.appendChild(levelCell);

            // Difficulty cell
            const difficultyCell = document.createElement('td');
            difficultyCell.textContent = item.difficulty;
            row.appendChild(difficultyCell);

            // Score cell
            const scoreCell = document.createElement('td');
            scoreCell.textContent = item.score || '-';
            row.appendChild(scoreCell);

            // Grade cell with stars
            const gradeCell = document.createElement('td');

            if (item.grade) {
                // Create star container div
                const starsContainer = document.createElement('div');
                starsContainer.className = 'grade-stars-cell';

                // Determine star count based on grade
                let starCount = 0;
                switch (item.grade) {
                    case 'PERFECT': starCount = 5; break;
                    case 'GREAT': starCount = 4; break;
                    case 'GOOD': starCount = 3; break;
                    case 'OK': starCount = 2; break;
                    default: starCount = 1; // FAIL
                }

                // Add stars
                for (let i = 0; i < 5; i++) {
                    const star = document.createElement('div');
                    star.className = `grade-star ${i >= starCount ? 'inactive' : ''}`;
                    starsContainer.appendChild(star);
                }

                gradeCell.appendChild(starsContainer);
            } else {
                gradeCell.textContent = '-';
            }

            row.appendChild(gradeCell);

            // Optimal moves cell
            const optimalCell = document.createElement('td');
            optimalCell.textContent = item.optimal || '-';
            row.appendChild(optimalCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Clear and add to scoreboard content
        this.scoreboardContent.innerHTML = '';
        this.scoreboardContent.appendChild(table);

        // Show modal
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
                // Add grade stars to share text
                let gradeStars = '';
                if (item.grade) {
                    switch (item.grade) {
                        case 'PERFECT': gradeStars = '⭐⭐⭐⭐⭐'; break;
                        case 'GREAT': gradeStars = '⭐⭐⭐⭐'; break;
                        case 'GOOD': gradeStars = '⭐⭐⭐'; break;
                        case 'OK': gradeStars = '⭐⭐'; break;
                        default: gradeStars = '⭐';
                    }
                }

                shareText += `שלב ${item.level} (${item.difficulty}): ${item.score} מהלכים ${gradeStars}\n`;
            });

            // Add summary statistics
            const perfectCount = playedScores.filter(s => s.grade === 'PERFECT').length;
            if (perfectCount > 0) {
                shareText += `\nסיימתי ${perfectCount} שלבים בציון מושלם! 🏆\n`;
            }
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