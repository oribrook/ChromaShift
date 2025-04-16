/**
 * Audio Context Initialization Helper
 * 
 * Many browsers require a user interaction before allowing audio to play.
 * This script adds this functionality to the game's start screen.
 */

// Function to add audio initialization to the game
function setupAudioInitialization() {
    // Function to initialize audio context on user interaction
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
    
    // Add initialization message after a short delay
    setTimeout(() => {
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
    }, 1000);
    
    // Also initialize audio on any user interaction with the page
    const userInteractionEvents = ['click', 'touchstart', 'keydown'];
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, initAudioContext, { once: true });
    });
  }
  
  // Run setup when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAudioInitialization);
  } else {
    // DOM already loaded, run setup
    setupAudioInitialization();
  }