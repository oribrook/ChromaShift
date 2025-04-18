const SoundManager = {
  context: null,
  masterVolume: 0.7,
  sounds: {},

  init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.context.destination);
      this.loadSounds();
      this.createVolumeToggle();
      return true;
    } catch {
      return false;
    }
  },

  loadSounds() {
    this.createConquestSounds();
    this.createErrorSound();
    this.createWinSound();
    this.createButtonSound();
  },

  createConquestSounds() {
    this.sounds.smallConquest = {
      play: (count = 2) => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440 + (count * 30);
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.context.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.context.currentTime + 0.4);
      }
    };

    this.sounds.mediumConquest = {
      play: (count = 4) => {
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const gain = this.context.createGain();
        osc1.type = 'triangle';
        osc1.frequency.value = 520 + (count * 25);
        osc2.type = 'sine';
        osc2.frequency.value = 260 + (count * 30);
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

    this.sounds.largeConquest = {
      play: (count = 7) => {
        const notes = [440, 550, 660].map(n => n + (count * 20));
        const gain = this.context.createGain();
        const convolver = this.context.createConvolver();
        this.createReverbImpulse(convolver, 2, 0.8);
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 1.2);
        gain.connect(convolver);
        convolver.connect(this.masterGain);
        notes.forEach((freq, i) => {
          const osc = this.context.createOscillator();
          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          osc.start();
          osc.stop(this.context.currentTime + 1.3);
        });
      }
    };
  },

  createReverbImpulse(convolverNode, duration, decay) {
    const rate = this.context.sampleRate;
    const length = rate * duration;
    const impulse = this.context.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        const n = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      }
    }
    convolverNode.buffer = impulse;
  },

  createErrorSound() {
    this.sounds.error = {
      play: () => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.context.currentTime + 0.2);
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

  createWinSound() {
    this.sounds.win = {
      play: () => {
        [330, 392, 523, 659, 784].forEach((freq, i) => {
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

  createButtonSound() {
    this.sounds.click = {
      play: () => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
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

  playConquestSound(count) {
    if (count <= 1) return;
    if (count >= 7) this.sounds.largeConquest.play(count);
    else if (count >= 4) this.sounds.mediumConquest.play(count);
    else this.sounds.smallConquest.play(count);
  },

  playErrorSound() { this.sounds.error.play(); },
  playWinSound() { this.sounds.win.play(); },
  playButtonSound() { this.sounds.click.play(); },

  toggleSound() {
    this.masterGain.gain.value = this.masterGain.gain.value > 0 ? 0 : this.masterVolume;
    return this.masterGain.gain.value > 0;
  },

  createVolumeToggle() {
    if (document.getElementById('soundToggleBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'soundToggleBtn';
    btn.className = 'sound-toggle';
    btn.innerHTML = '<span>🔊</span>';
    btn.title = 'הפעל/כבה צלילים';
    btn.onclick = () => {
      const on = this.toggleSound();
      btn.innerHTML = on ? '<span>🔊</span>' : '<span>🔇</span>';
      if (on) this.playButtonSound();
    };
    const header = document.querySelector('header');
    if (header) header.appendChild(btn);
  },

  addSoundToButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.addEventListener('click', () => this.playButtonSound()));
  }
};

export function enhanceGameWithSound() {
  if (!window.Game) return setTimeout(() => enhanceGameWithSound(), 1000);
  if (!SoundManager.init()) return;
  const Game = window.Game;
  const originalFloodFill = Game.floodFill;
  Game.floodFill = function (color) {
    const before = GameState.activeTiles;
    const result = originalFloodFill.call(this, color);
    SoundManager.playConquestSound(GameState.activeTiles - before);
    return result;
  };
  const originalTileClick = Game.handleTileClick;
  Game.handleTileClick = function (x, y) {
    if (GameState.owned[y][x] || !this.getNeighbors(x, y).some(([nx, ny]) => GameState.owned[ny][nx])) {
      SoundManager.playErrorSound();
      return;
    }
    originalTileClick.call(this, x, y);
  };
  const originalCheckWin = Game.checkWin;
  Game.checkWin = function () {
    if (GameState.owned.flat().every(v => v) && GameState.gameActive) SoundManager.playWinSound();
    originalCheckWin.call(this);
  };
  SoundManager.addSoundToButtons();
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        const btns = node.tagName === 'BUTTON' ? [node] : [...(node.querySelectorAll?.('button') || [])];
        btns.forEach(b => b.addEventListener('click', () => SoundManager.playButtonSound()));
      }
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => SoundManager.playButtonSound(), 1000);
  return SoundManager;
}

function initAudioContext() {
  if (window.audioContextInitialized) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    window.audioContextInitialized = true;
    document.getElementById('audio-init-message')?.remove();
  } catch {}
}

function setupAudioInitialization() {
  if (!document.getElementById('audio-init-message')) {
    const msg = document.createElement('div');
    msg.id = 'audio-init-message';
    msg.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:white;padding:10px 20px;border-radius:5px;z-index:1000;cursor:pointer;font-family:Heebo,sans-serif;direction:rtl';
    msg.textContent = 'לחץ כאן להפעלת צלילי המשחק';
    msg.onclick = function () {
      initAudioContext();
      this.remove();
    };
    document.body.appendChild(msg);
  }
  ['click', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, initAudioContext, { once: true }));
}

document.addEventListener('DOMContentLoaded', () => {
  setupAudioInitialization();
  setTimeout(() => {
    if (typeof Game !== 'undefined') window.Game = Game;
  }, 300);
});
