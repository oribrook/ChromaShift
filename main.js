/**
 * ChromaShift Game - Main Entry Point
 * Initializes the game and sets up global references
 */

import { Game } from './game.js';

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});