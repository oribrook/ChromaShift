/**
 * Game Enhancements Module
 * 
 * This file imports and initializes all game enhancements
 * such as sound effects and any other future features.
 */

// Import sound enhancement from sounds.js
import { enhanceGameWithSound } from './sounds.js';

// Function to initialize all enhancements
function initializeEnhancements() {
  console.log("Initializing game enhancements...");
  
  // Initialize sound system
  const soundManager = enhanceGameWithSound();
  
  if (soundManager) {
    console.log("Sound system successfully initialized");
    window.SoundManager = soundManager; // Make available globally if needed
  } else {
    console.error("Failed to initialize sound system");
  }
}

// Run initialization when the DOM is fully loaded and Game object is available
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a short moment to ensure Game is fully initialized
    setTimeout(initializeEnhancements, 500);
  });
} else {
  // DOM already loaded, wait a moment and then initialize
  setTimeout(initializeEnhancements, 500);
}

export { initializeEnhancements };