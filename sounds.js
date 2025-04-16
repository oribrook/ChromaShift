/**
 * Sound Manager for ChromaShift
 * Handles all game sound effects with volume control and scaling effects
 */

// Sound Manager
const SoundManager = {
  // Audio context for Web Audio API
  context: null,
  // Master volume control
  masterVolume: 0.7,
  // Sound effects container
  sounds: {},
  
  // Initialize the sound system
  init() {
    try {
      // Create audio context with fallback
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master volume control
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.context.destination);
      
      // Load sound effects
      this.loadSounds();
      
      // Add volume toggle button
      this.createVolumeToggle();
      
      console.log('Sound system initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing sound system:', error);
      return false;
    }
  },
  
  // Load all required sound effects
  loadSounds() {
    // Success sounds for different tile conquest counts
    this.createConquestSounds();
    
    // Error sound
    this.createErrorSound();
    
    // Game win fanfare
    this.createWinSound();
    
    // Button click sound
    this.createButtonSound();
  },
  
  // Create set of conquest sounds for different tile amounts
  createConquestSounds() {
    // Small conquest (2-3 tiles)
    this.sounds.smallConquest = {
      play: (count = 2) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        
        // Higher pitch for more tiles
        oscillator.type = 'sine';
        oscillator.frequency.value = 440 + (count * 30);
        
        // Quick attack, medium decay
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.context.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.4);
      }
    };
    
    // Medium conquest (4-6 tiles)
    this.sounds.mediumConquest = {
      play: (count = 4) => {
        // Create a more complex sound with two oscillators
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const gain = this.context.createGain();
        
        // Brighter sound with frequency based on count
        osc1.type = 'triangle';
        osc1.frequency.value = 520 + (count * 25);
        
        osc2.type = 'sine';
        osc2.frequency.value = 260 + (count * 30);
        
        // More dynamic envelope
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.context.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.6);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.context.currentTime + 0.7);
        osc2.stop(this.context.currentTime + 0.7);
      }
    };
    
    // Large conquest (7+ tiles)
    this.sounds.largeConquest = {
      play: (count = 7) => {
        // Create a rich harmonic sound with chord progression
        const notes = [
          440 + (count * 20),  // Root note
          550 + (count * 20),  // Major third
          660 + (count * 20)   // Perfect fifth
        ];
        
        const oscillators = [];
        const gain = this.context.createGain();
        
        // Create oscillators for each note
        notes.forEach((freq, i) => {
          const osc = this.context.createOscillator();
          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          oscillators.push(osc);
        });
        
        // Add a bit of reverb effect
        const convolver = this.context.createConvolver();
        this.createReverbImpulse(convolver, 2, 0.8);
        
        // More sustained envelope with longer decay
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 1.2);
        
        gain.connect(convolver);
        convolver.connect(this.masterGain);
        
        // Start and stop all oscillators
        oscillators.forEach(osc => {
          osc.start();
          osc.stop(this.context.currentTime + 1.3);
        });
      }
    };
  },
  
  // Create simple impulse response for reverb
  createReverbImpulse(convolverNode, duration, decay) {
    const rate = this.context.sampleRate;
    const length = rate * duration;
    const impulse = this.context.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = i / length;
        // Exponential decay
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      }
    }
    
    convolverNode.buffer = impulse;
  },
  
  // Create error sound for invalid moves
  createErrorSound() {
    this.sounds.error = {
      play: () => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        // Low frequency, descending pitch
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.context.currentTime + 0.2);
        
        // Short sharp sound
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, this.context.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.3);
      }
    };
  },
  
  // Create win sound fanfare
  createWinSound() {
    this.sounds.win = {
      play: () => {
        // Create a celebratory fanfare
        const notes = [
          330, 392, 523, 659, 784
        ];
        
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = i % 2 ? 'triangle' : 'square';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.context.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, this.context.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.5);
          }, i * 100);
        });
      }
    };
  },
  
  // Create button click sound
  createButtonSound() {
    this.sounds.click = {
      play: () => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        // Short click sound
        osc.type = 'sine';
        osc.frequency.value = 880;
        
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.context.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.1);
      }
    };
  },
  
  // Play the appropriate conquest sound based on tile count
  playConquestSound(tileCount) {
    // Don't play for single tile conquests
    if (tileCount <= 1) return;
    
    // Choose appropriate sound based on count
    if (tileCount >= 7) {
      this.sounds.largeConquest.play(tileCount);
    } else if (tileCount >= 4) {
      this.sounds.mediumConquest.play(tileCount);
    } else {
      this.sounds.smallConquest.play(tileCount);
    }
  },
  
  // Play error sound
  playErrorSound() {
    this.sounds.error.play();
  },
  
  // Play win sound
  playWinSound() {
    this.sounds.win.play();
  },
  
  // Play button click sound
  playButtonSound() {
    this.sounds.click.play();
  },
  
  // Toggle sound on/off
  toggleSound() {
    if (this.masterGain.gain.value > 0) {
      this.masterGain.gain.value = 0;
      return false;
    } else {
      this.masterGain.gain.value = this.masterVolume;
      return true;
    }
  },
  
  // Create volume toggle button
  createVolumeToggle() {
    // Check if the button already exists
    if (document.getElementById('soundToggleBtn')) {
      return;
    }
    
    const soundBtn = document.createElement('button');
    soundBtn.id = 'soundToggleBtn';
    soundBtn.className = 'sound-toggle';
    soundBtn.innerHTML = '<span>🔊</span>';
    soundBtn.title = 'הפעל/כבה צלילים';
    
    soundBtn.addEventListener('click', () => {
      const soundOn = this.toggleSound();
      soundBtn.innerHTML = soundOn ? '<span>🔊</span>' : '<span>🔇</span>';
      // Play a sound when turning on
      if (soundOn) {
        this.playButtonSound();
      }
    });
    
    // Add the button to the header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(soundBtn);
    }
  },
  
  // Add sound effects to existing buttons without cloning
  addSoundToButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      // Add sound effect without removing existing event listeners
      btn.addEventListener('click', () => {
        SoundManager.playButtonSound();
      });
    });
  }
};

// Function to enhance the Game object with sound capabilities
export function enhanceGameWithSound() {
  // Make sure Game object exists
  if (typeof window.Game === 'undefined') {
    console.error('Game object not found. Sound enhancement failed.');
    
    // Set a retry attempt
    setTimeout(() => {
      if (typeof window.Game !== 'undefined') {
        console.log('Game object now available, retrying sound enhancement');
        enhanceGameWithSound();
      }
    }, 1000);
    
    return null;
  }
  
  // Initialize sound system
  const initialized = SoundManager.init();
  if (!initialized) {
    console.error('Sound system initialization failed.');
    return null;
  }
  
  // Get reference to the Game object
  const Game = window.Game;
  
  // Reference to the original floodFill method
  const originalFloodFill = Game.floodFill;
  
  // Override the floodFill method to track tile gains
  Game.floodFill = function(newColor) {
    const previousActiveTiles = GameState.activeTiles;
    
    // Call the original method
    const result = originalFloodFill.call(this, newColor);
    
    // Calculate how many tiles were gained
    const tilesGained = GameState.activeTiles - previousActiveTiles;
    
    // Play appropriate sound based on tile count
    SoundManager.playConquestSound(tilesGained);
    
    return result;
  };
  
  // Add sound to tile click
  const originalHandleTileClick = Game.handleTileClick;
  Game.handleTileClick = function(x, y) {
    // Check if this is an invalid click (already owned tile)
    if (GameState.owned[y][x]) {
      SoundManager.playErrorSound();
      return;
    }
    
    // Check if this tile is adjacent to any owned tile
    const neighbors = this.getNeighbors(x, y);
    const isAdjacent = neighbors.some(([nx, ny]) => GameState.owned[ny][nx]);
    
    if (!isAdjacent) {
      SoundManager.playErrorSound();
      return;
    }
    
    // Call original handler
    originalHandleTileClick.call(this, x, y);
  };
  
  // Add sound to win condition
  const originalCheckWin = Game.checkWin;
  Game.checkWin = function() {
    const allOwned = GameState.owned.flat().every(v => v);
    
    if (allOwned && GameState.gameActive) {
      // Play win sound
      SoundManager.playWinSound();
    }
    
    // Call original handler
    originalCheckWin.call(this);
  };
  
  // Use the new method to add sounds to buttons without breaking functionality
  const addButtonSounds = () => {
    SoundManager.addSoundToButtons();
    
    // Set up an observer to add sounds to new buttons as they're created
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              // Look for buttons within the added node
              const buttons = node.querySelectorAll ? node.querySelectorAll('button') : [];
              if (node.tagName === 'BUTTON') buttons.push(node);
              
              if (buttons.length) {
                // Add sound to each button
                buttons.forEach(btn => {
                  btn.addEventListener('click', () => {
                    SoundManager.playButtonSound();
                  });
                });
              }
            }
          });
        }
      });
    });
    
    // Start observing the document with configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  };
  
  // Add button sounds
  addButtonSounds();
  
  // Play a sound to confirm sound is working
  setTimeout(() => {
    // Play a quick sound to confirm audio is working
    SoundManager.playButtonSound();
  }, 1000);
  
  // Return SoundManager for possible external use
  return SoundManager;
}

// Make the audio initialization code available globally
function initAudioContext() {
  // Check if we already have an audio context
  if (window.audioContextInitialized) return;
  
  try {
    // Create temporary audio context just to unlock audio
    const tempContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create and play a silent buffer to unlock the audio
    const buffer = tempContext.createBuffer(1, 1, 22050);
    const source = tempContext.createBufferSource();
    source.buffer = buffer;
    source.connect(tempContext.destination);
    source.start(0);
    
    // Mark audio as initialized
    window.audioContextInitialized = true;
    
    console.log("Audio context initialized successfully");
    
    // Remove the initialization message if it exists
    const initMessage = document.getElementById('audio-init-message');
    if (initMessage) {
      initMessage.remove();
    }
  } catch (e) {
    console.error("Error initializing audio context:", e);
  }
}

// Add audio initialization on user interaction
function setupAudioInitialization() {
  // Create the message if it doesn't exist
  if (!document.getElementById('audio-init-message')) {
    const message = document.createElement('div');
    message.id = 'audio-init-message';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(0,0,0,0.7)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    message.style.cursor = 'pointer';
    message.textContent = 'לחץ כאן להפעלת צלילי המשחק';
    message.style.fontFamily = 'Heebo, sans-serif';
    message.style.direction = 'rtl';
    
    // Add click handler to the message
    message.addEventListener('click', function() {
      initAudioContext();
      this.remove();
    });
    
    // Add to document
    document.body.appendChild(message);
  }
  
  // Initialize audio on any user interaction with the page
  const userInteractionEvents = ['click', 'touchstart', 'keydown'];
  userInteractionEvents.forEach(event => {
    document.addEventListener(event, initAudioContext, { once: true });
  });
}

// Expose the Game object to the window for access by the sound system
document.addEventListener('DOMContentLoaded', () => {
  // Run setup for audio initialization
  setupAudioInitialization();
  
  // Wait for Game to be initialized, then expose it to the window
  setTimeout(() => {
    if (typeof Game !== 'undefined') {
      window.Game = Game;
    }
  }, 300);
});