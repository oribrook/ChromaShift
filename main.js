/**
 * ChromaShift Game - Main Entry Point
 * Initializes the game and sets up global references with safety measures
 */

import { Game } from './game.js';

// Add global error handler
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
  
  // Create an error display for the user
  const errorDisplay = document.createElement('div');
  errorDisplay.style.position = 'fixed';
  errorDisplay.style.top = '0';
  errorDisplay.style.left = '0';
  errorDisplay.style.width = '100%';
  errorDisplay.style.padding = '20px';
  errorDisplay.style.backgroundColor = '#f8d7da';
  errorDisplay.style.color = '#721c24';
  errorDisplay.style.textAlign = 'center';
  errorDisplay.style.zIndex = '9999';
  errorDisplay.innerHTML = `<p>An error occurred: ${event.error?.message || 'Unknown error'}</p>
                           <button id="reloadBtn" style="padding: 5px 10px;">Reload Page</button>`;
  
  document.body.prepend(errorDisplay);
  
  document.getElementById('reloadBtn').addEventListener('click', function() {
    location.reload();
  });
});

// Create safety timeout to prevent infinite loading
let initTimeout = setTimeout(() => {
  console.error('Game initialization timed out - possible infinite loop');
  const loadingMessage = document.createElement('div');
  loadingMessage.innerHTML = '<h2>Game is taking too long to load</h2><p>Please reload the page.</p>';
  loadingMessage.style.textAlign = 'center';
  loadingMessage.style.marginTop = '50px';
  document.body.appendChild(loadingMessage);
}, 5000);

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, waiting for elements...');
  
  // Check if critical elements exist before initializing
  const checkElementsAndInit = () => {
    const criticalElements = [
      'gameBoard', 'colorPicker', 'moveCounter', 'bestScore'
    ];
    
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
      console.warn(`Waiting for elements: ${missingElements.join(', ')}`);
      setTimeout(checkElementsAndInit, 100);
      return;
    }
    
    console.log('All critical elements found, initializing game...');
    try {
      Game.init();
      console.log('Game initialized successfully');
      clearTimeout(initTimeout); // Clear the safety timeout
    } catch (error) {
      console.error('Error during game initialization:', error);
      clearTimeout(initTimeout); // Clear the safety timeout
      
      // Display user-friendly error
      const errorMessage = document.createElement('div');
      errorMessage.style.textAlign = 'center';
      errorMessage.style.marginTop = '50px';
      errorMessage.innerHTML = '<h2>Unable to start game</h2>' +
        '<p>Please try refreshing the page.</p>' +
        `<p>Error details: ${error.message}</p>`;
      document.body.innerHTML = '';
      document.body.appendChild(errorMessage);
    }
  };
  
  // Start checking for elements
  checkElementsAndInit();
});

// Debug helpers - use window.debugGame.* in console to troubleshoot
window.debugGame = {
  inspect: function() {
    return {
      gameState: window.GameState ? {
        boardSize: window.GameState.boardSize,
        currentLevel: window.GameState.currentLevel,
        moveCount: window.GameState.moveCount,
        gameActive: window.GameState.gameActive,
        board: window.GameState.board,
        owned: window.GameState.owned
      } : 'GameState not found',
      
      domElements: {
        gameBoard: !!document.getElementById('gameBoard'),
        colorPicker: !!document.getElementById('colorPicker'),
        moveCounter: !!document.getElementById('moveCounter'),
        bestScore: !!document.getElementById('bestScore')
      },
      
      moduleStatus: {
        game: !!window.Game,
        ui: !!window.UI
      }
    };
  },
  
  fix: function() {
    console.log('Attempting to fix common issues...');
    
    // Fix possible UI issues
    if (window.UI && window.UI.boardEl && !window.UI.boardEl.innerHTML) {
      console.log('Attempting to refresh the board...');
      if (window.Game && window.Game.createBoard) {
        window.Game.createBoard();
        console.log('Board refreshed');
      }
    }
    
    return 'Fix attempt completed';
  },
  
  restart: function() {
    location.reload();
  }
};

console.log('Debug tools available. Use window.debugGame.inspect() to see game state.');