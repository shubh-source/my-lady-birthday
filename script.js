/**
 * Happy Birthday, My Lady - Multi-Page Celebration Script
 * From: Her Best Friend across the miles
 * Theme: Editorial Linen & Dusty Rose Palette
 */

// ==========================================================================
// 1. Audio Synthesizer (Warm Music Box Bells)
// ==========================================================================
class RoyalSoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.melodyTimeouts = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', volume = 0.16) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.6, 'triangle', 0.18);
      }, idx * 110);
    });
  }

  playWhoosh() {
    this.init();
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playBirthdayMelody(loop = true, onEndCallback) {
    this.stopMelody();
    this.init();
    this.isPlayingMusic = true;
    sessionStorage.setItem('melodyActive', 'true');
    this.updateSoundWaveUI(true);

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23,
          G4 = 392.00, A4 = 440.00, Bb4 = 466.16,
          C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46;

    const song = [
      { note: C4, duration: 0.35, delay: 0 },
      { note: C4, duration: 0.25, delay: 400 },
      { note: D4, duration: 0.6, delay: 700 },
      { note: C4, duration: 0.6, delay: 1400 },
      { note: F4, duration: 0.6, delay: 2100 },
      { note: E4, duration: 1.0, delay: 2800 },

      { note: C4, duration: 0.35, delay: 4000 },
      { note: C4, duration: 0.25, delay: 4400 },
      { note: D4, duration: 0.6, delay: 4700 },
      { note: C4, duration: 0.6, delay: 5400 },
      { note: G4, duration: 0.6, delay: 6100 },
      { note: F4, duration: 1.0, delay: 6800 },

      { note: C4, duration: 0.35, delay: 8000 },
      { note: C4, duration: 0.25, delay: 8400 },
      { note: C5, duration: 0.7, delay: 8700 },
      { note: A4, duration: 0.7, delay: 9500 },
      { note: F4, duration: 0.6, delay: 10300 },
      { note: E4, duration: 0.6, delay: 11000 },
      { note: D4, duration: 1.0, delay: 11700 },

      { note: Bb4, duration: 0.35, delay: 13000 },
      { note: Bb4, duration: 0.25, delay: 13400 },
      { note: A4, duration: 0.7, delay: 13700 },
      { note: F4, duration: 0.7, delay: 14500 },
      { note: G4, duration: 0.7, delay: 15300 },
      { note: F4, duration: 1.5, delay: 16100 }
    ];

    song.forEach(item => {
      const tid = setTimeout(() => {
        if (!this.isPlayingMusic) return;
        this.playTone(item.note, item.duration, 'triangle', 0.18);
      }, item.delay);
      this.melodyTimeouts.push(tid);
    });

    const endTid = setTimeout(() => {
      if (!this.isPlayingMusic) return;
      if (loop) {
        // Subtle pause before seamless replay
        const loopTid = setTimeout(() => {
          if (this.isPlayingMusic) {
            this.playBirthdayMelody(true, onEndCallback);
          }
        }, 1500);
        this.melodyTimeouts.push(loopTid);
      } else {
        this.isPlayingMusic = false;
        this.updateSoundWaveUI(false);
        if (onEndCallback) onEndCallback();
      }
    }, 18000);
    this.melodyTimeouts.push(endTid);
  }

  stopMelody() {
    this.melodyTimeouts.forEach(clearTimeout);
    this.melodyTimeouts = [];
    this.isPlayingMusic = false;
    sessionStorage.setItem('melodyActive', 'false');
    this.updateSoundWaveUI(false);
  }

  updateSoundWaveUI(active) {
    const soundWave = document.getElementById('soundWave');
    if (soundWave) {
      if (active) {
        soundWave.classList.add('playing');
      } else {
        soundWave.classList.remove('playing');
      }
    }
  }
}

const royalAudio = new RoyalSoundEngine();

// ==========================================================================
// 2. Confetti Engine (Editorial Palette Match)
// ==========================================================================
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.themeColors = ['#a34e5c', '#e1ae8e', '#d3bd75', '#ebc8bb', '#8c9b7b', '#f4e8db'];

    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnBurst(x, y, count = 90) {
    if (!this.canvas || !this.ctx) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 3;
      this.particles.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 7 + 4,
        color: this.themeColors[Math.floor(Math.random() * this.themeColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        gravity: 0.17,
        opacity: 1,
        decay: Math.random() * 0.012 + 0.007,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  spawnFallingDOMPieces(count = 50) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.setAttribute('aria-hidden', 'true');
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = this.themeColors[i % this.themeColors.length];
      piece.style.borderRadius = i % 3 === 0 ? '50%' : '2px';
      piece.style.setProperty('--duration', (2.5 + Math.random() * 2) + 's');
      piece.style.setProperty('--drift', (Math.random() * 260 - 130) + 'px');
      piece.style.setProperty('--spin', (Math.random() * 800 - 400) + 'deg');
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      setTimeout(() => piece.remove(), 5000);
    }
  }
}

const confettiEngine = new ConfettiEngine();

// ==========================================================================
// 3. Cake Ceremony Initializer (Real Microphone Breath Blow + Tap Support)
// ==========================================================================
function initCakeCeremony() {
  const candles = document.querySelectorAll('.candle');
  const micBlowBtn = document.getElementById('micBlowBtn');
  const blowBtn = document.getElementById('blowCandlesBtn');
  const cutBtn = document.getElementById('cutCakeBtn');
  const resetBtn = document.getElementById('resetCakeBtn');
  const statusBanner = document.getElementById('cakeStatusBanner');
  const knife = document.getElementById('knifeElement');
  const slice = document.getElementById('cakeSlice');

  if (!candles.length || !blowBtn || !cutBtn) return;

  let candlesBlown = false;
  let cakeCut = false;
  let micStream = null;
  let micAudioCtx = null;
  let micAnimId = null;

  function stopMicDetection() {
    if (micAnimId) {
      cancelAnimationFrame(micAnimId);
      micAnimId = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (micAudioCtx && micAudioCtx.state !== 'closed') {
      micAudioCtx.close().catch(() => {});
      micAudioCtx = null;
    }
    if (micBlowBtn) {
      micBlowBtn.classList.remove('listening');
      if (!candlesBlown) {
        micBlowBtn.textContent = '🎙️ Blow with Mic (Real Breath)';
      }
    }
  }

  function triggerCandleExtinguish(blownByBreath = false) {
    if (candlesBlown) return;
    candlesBlown = true;
    stopMicDetection();

    candles.forEach(candle => candle.classList.add('blown-out'));
    royalAudio.playWhoosh();

    if (blowBtn) blowBtn.disabled = true;
    if (micBlowBtn) {
      micBlowBtn.disabled = true;
      micBlowBtn.textContent = '💨 Candles Blown!';
    }
    cutBtn.disabled = false;

    if (blownByBreath) {
      statusBanner.innerHTML = '🎉 <strong>Woohoo! You blew out the candles with your breath, My Lady!</strong> 🎂 Now cut the cake across the miles!';
    } else {
      statusBanner.innerHTML = '🎉 <strong>All candles blown! Cut the cake for My Lady!</strong> 🎂';
    }

    royalAudio.playChime();
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 120);
    confettiEngine.spawnFallingDOMPieces(45);
  }

  // Individual candle clicks
  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      if (!candle.classList.contains('blown-out')) {
        candle.classList.add('blown-out');
        royalAudio.playWhoosh();
        confettiEngine.spawnBurst(
          candle.getBoundingClientRect().left + 10,
          candle.getBoundingClientRect().top,
          20
        );
        checkAllCandles();
      }
    });
  });

  function checkAllCandles() {
    const allBlown = Array.from(candles).every(c => c.classList.contains('blown-out'));
    if (allBlown && !candlesBlown) {
      triggerCandleExtinguish(false);
    }
  }

  // Tap to Blow button
  blowBtn.addEventListener('click', () => {
    triggerCandleExtinguish(false);
  });

  // Real Microphone Blow Detection
  if (micBlowBtn) {
    micBlowBtn.addEventListener('click', () => {
      if (candlesBlown) return;

      // If already active, toggle off
      if (micBlowBtn.classList.contains('listening')) {
        stopMicDetection();
        statusBanner.innerHTML = '🕯️ Microphone stopped. You can tap "Blow with Mic" or "Tap to Blow" anytime!';
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusBanner.innerHTML = '⚠️ Microphone is not supported on this browser. Please use "Tap to Blow"!';
        return;
      }

      statusBanner.innerHTML = '🎙️ <em>Requesting microphone access... Please tap "Allow"!</em>';

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micStream = stream;
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          micAudioCtx = new AudioCtx();
          const source = micAudioCtx.createMediaStreamSource(stream);
          const analyser = micAudioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.25;
          source.connect(analyser);

          micBlowBtn.classList.add('listening');
          micBlowBtn.textContent = '🌬️ Listening... Blow into mic now!';
          statusBanner.innerHTML = '🎙️ <strong>Microphone active! Blow gently onto your phone\'s microphone to extinguish the candles, My Lady! 🌬️</strong>';

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          let consecutiveBlowCount = 0;

          const checkBreath = () => {
            if (!micStream || candlesBlown) return;
            analyser.getByteFrequencyData(dataArray);

            // Blowing air into mic creates turbulent low-frequency vibration (bins 0-32) and high amplitude
            let lowSum = 0;
            let totalSum = 0;
            const lowRange = Math.min(32, bufferLength);

            for (let i = 0; i < bufferLength; i++) {
              totalSum += dataArray[i];
              if (i < lowRange) {
                lowSum += dataArray[i];
              }
            }

            const avgVolume = totalSum / bufferLength;
            const avgLow = lowSum / lowRange;

            // Blow detection threshold:
            // When blowing on phone mic, turbulence causes low freq energy and volume to jump
            if (avgLow > 45 || avgVolume > 35) {
              consecutiveBlowCount++;
              if (consecutiveBlowCount >= 2) {
                triggerCandleExtinguish(true);
                return;
              }
            } else {
              consecutiveBlowCount = Math.max(0, consecutiveBlowCount - 1);
            }

            micAnimId = requestAnimationFrame(checkBreath);
          };

          micAnimId = requestAnimationFrame(checkBreath);
        })
        .catch(err => {
          console.warn('Microphone permission or access error:', err);
          stopMicDetection();
          statusBanner.innerHTML = '💡 Microphone permission not granted. You can use <strong>"Tap to Blow"</strong> anytime!';
        });
    });
  }

  // Cut cake button
  cutBtn.addEventListener('click', () => {
    if (!candlesBlown || cakeCut) return;
    cakeCut = true;
    cutBtn.disabled = true;

    knife.classList.add('cutting');

    setTimeout(() => {
      knife.classList.remove('cutting');
      slice.classList.add('served');
      statusBanner.innerHTML = '♡ <strong>Happy Birthday, My Lady!</strong> Cake is served with sweetest love across the distance! ✨';
      royalAudio.playChime();
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 150);
      confettiEngine.spawnFallingDOMPieces(50);
    }, 650);
  });

  // Reset / Relight button
  resetBtn.addEventListener('click', () => {
    stopMicDetection();
    candles.forEach(c => c.classList.remove('blown-out'));
    candlesBlown = false;
    cakeCut = false;
    blowBtn.disabled = false;
    if (micBlowBtn) {
      micBlowBtn.disabled = false;
      micBlowBtn.textContent = '🎙️ Blow with Mic (Real Breath)';
      micBlowBtn.classList.remove('listening');
    }
    cutBtn.disabled = true;
    slice.classList.remove('served');
    statusBanner.innerHTML = '🕯️ The candles are glowing softly! Blow them out, My Lady!';
  });
}

// ==========================================================================
// 4. Virtual Gift Box Initializer
// ==========================================================================
function initGiftBox() {
  const giftBoxWrapper = document.getElementById('giftBoxWrapper');
  const giftBox = document.getElementById('giftBox');
  const hint = document.getElementById('giftTapHint');
  const couponsContainer = document.getElementById('couponsContainer');

  if (!giftBoxWrapper || !giftBox || !couponsContainer) return;

  giftBoxWrapper.addEventListener('click', () => {
    if (!giftBox.classList.contains('opened')) {
      giftBox.classList.add('opened');
      if (hint) hint.textContent = '🎁 The surprise is unboxed for My Lady ♡';
      couponsContainer.classList.add('visible');
      royalAudio.playChime();
      confettiEngine.spawnBurst(
        giftBoxWrapper.getBoundingClientRect().left + 80,
        giftBoxWrapper.getBoundingClientRect().top + 50,
        110
      );
      confettiEngine.spawnFallingDOMPieces(40);
    }
  });
}

// ==========================================================================
// 5. Gallery Initializer (Long-Distance Bestie Perspective for My Lady)
// ==========================================================================
const DEFAULT_POLAROIDS = [
  {
    title: 'Royalty in Every Step',
    caption: '"My stunning bestie My Lady looking flawless as always!"',
    author: '— Love you across the miles ✨',
    emoji: '👑',
    gradient: 'bg-blush-rose',
    isCustom: false
  },
  {
    title: 'Inside Jokes Across Cities',
    caption: '"No matter the distance, our inside jokes remain legendary 😂"',
    author: '— To My Lady, Your Soul Sister ♡',
    emoji: '👯‍♀️',
    gradient: 'bg-warm-sand',
    isCustom: false
  },
  {
    title: 'Hours on Video Calls',
    caption: '"Late-night calls, hot chai, and talking like distance does not exist."',
    author: '— Forever Connected ☕',
    emoji: '☕',
    gradient: 'bg-soft-terracotta',
    isCustom: false
  },
  {
    title: 'Birthday Queen Glow',
    caption: '"Another year of shining bright and being iconic, My Lady!"',
    author: '— Distance means nothing 🌟',
    emoji: '🌸',
    gradient: 'bg-linen-gold',
    isCustom: false
  }
];

function initGallery() {
  const grid = document.getElementById('polaroidGrid');
  const uploadInput = document.getElementById('photoUploadInput');
  const lightbox = document.getElementById('lightboxDialog');
  const lightboxBody = document.getElementById('lightboxBody');
  const lightboxClose = document.getElementById('lightboxCloseBtn');

  if (!grid) return;

  const savedPhotos = JSON.parse(localStorage.getItem('my_lady_photos') || '[]');

  function renderGallery() {
    grid.innerHTML = '';

    DEFAULT_POLAROIDS.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `polaroid-card ${index % 2 === 0 ? 'tilt-left' : 'tilt-right'}`;
      card.innerHTML = `
        <div class="tape-strip"></div>
        <div class="polaroid-img-wrapper">
          <div class="polaroid-placeholder ${item.gradient}">
            <span class="placeholder-emoji">${item.emoji}</span>
            <span class="placeholder-text">${item.title}</span>
          </div>
        </div>
        <div class="polaroid-caption">
          <p class="caption-text">${item.caption}</p>
          <span class="caption-author">${item.author}</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });

    savedPhotos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `polaroid-card ${index % 2 === 0 ? 'tilt-right' : 'tilt-left'}`;
      card.innerHTML = `
        <div class="tape-strip"></div>
        <div class="polaroid-img-wrapper">
          <img src="${item.dataUrl}" alt="Photo with My Lady" loading="lazy">
        </div>
        <div class="polaroid-caption">
          <p class="caption-text">"${item.caption}"</p>
          <span class="caption-author">— Cherished Memory with My Lady ♡</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (!lightbox || !lightboxBody) return;
    if (item.dataUrl) {
      lightboxBody.innerHTML = `
        <img src="${item.dataUrl}" style="width:100%; border-radius:10px; margin-bottom:1rem;" alt="Memory with My Lady">
        <h3 style="font-family:var(--font-serif); color:var(--ink); font-size:1.3rem;">${item.caption}</h3>
        <p style="color:var(--rose); font-size:0.88rem; margin-top:0.3rem;">Dedicated with love across the miles to My Lady ♡</p>
      `;
    } else {
      lightboxBody.innerHTML = `
        <div style="text-align:center; padding:1.5rem 0.5rem;">
          <div style="font-size:3.5rem; margin-bottom:0.8rem;">${item.emoji}</div>
          <h3 style="font-family:var(--font-serif); color:var(--ink); font-size:1.4rem; margin-bottom:0.4rem;">${item.title}</h3>
          <p style="font-family:var(--font-hand); font-size:1.8rem; color:var(--rose);">${item.caption}</p>
          <p style="color:var(--muted); font-size:0.85rem; margin-top:0.8rem;">${item.author}</p>
        </div>
      `;
    }
    lightbox.showModal();
  }

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  }

  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const caption = prompt('Add a cute title/caption for this photo with My Lady:') || 'A golden memory with My Lady!';
        const newPhoto = {
          dataUrl: event.target.result,
          caption: caption,
          timestamp: new Date().toISOString()
        };
        savedPhotos.unshift(newPhoto);
        try {
          localStorage.setItem('my_lady_photos', JSON.stringify(savedPhotos));
        } catch (err) {
          console.warn('Storage limit reached', err);
        }
        renderGallery();
        confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 70);
      };
      reader.readAsDataURL(file);
    });
  }

  renderGallery();
}

// ==========================================================================
// 6. Navbar, First-Tap Global Melody & Celebrate Button Triggers
// ==========================================================================
function initNavbarAndGlobals() {
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const celebrateBtn = document.getElementById('celebrate-button');

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (royalAudio.isPlayingMusic) {
        royalAudio.stopMelody();
      } else {
        royalAudio.playBirthdayMelody(true);
        confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 50);
      }
    });
  }

  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      confettiEngine.spawnFallingDOMPieces(65);
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
      royalAudio.playChime();
    });
  }

  // Activate melody on the very first click or tap anywhere on the display
  initGlobalTapMelody();
}

/**
 * Activates birthday melody on the very first click/tap anywhere on the screen
 */
function initGlobalTapMelody() {
  // If user explicitly paused/muted melody during this session, do not force-start
  if (sessionStorage.getItem('melodyActive') === 'false') {
    return;
  }

  let activated = false;

  const triggerMelodyOnFirstTap = (evt) => {
    if (activated) return;

    // If user clicked the music toggle button in the header, let that handler manage it
    if (evt && evt.target && evt.target.closest('#musicToggleBtn')) {
      return;
    }

    activated = true;

    // Start warm birthday music-box melody in loop
    royalAudio.playBirthdayMelody(true);

    // Clean up one-time listeners
    removeTriggerListeners();
  };

  const removeTriggerListeners = () => {
    const eventTypes = ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'];
    eventTypes.forEach(type => {
      window.removeEventListener(type, triggerMelodyOnFirstTap, true);
      document.removeEventListener(type, triggerMelodyOnFirstTap, true);
    });
  };

  const eventTypes = ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'];
  eventTypes.forEach(type => {
    window.addEventListener(type, triggerMelodyOnFirstTap, { capture: true, passive: true });
    document.addEventListener(type, triggerMelodyOnFirstTap, { capture: true, passive: true });
  });

  // If the browser already permits AudioContext without a new user gesture
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const probeCtx = new AudioContext();
      if (probeCtx.state === 'running') {
        probeCtx.close();
        royalAudio.playBirthdayMelody(true);
        activated = true;
        removeTriggerListeners();
      } else {
        probeCtx.close();
      }
    }
  } catch (err) {
    // Awaiting first tap
  }
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCakeCeremony();
  initGiftBox();
  initGallery();
  initNavbarAndGlobals();
});
