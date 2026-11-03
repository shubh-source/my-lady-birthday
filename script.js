/**
 * Happy Birthday, My Lady - Warm Editorial Celebration Script
 * Theme: Editorial Linen & Dusty Rose Palette
 * Features:
 * - Canvas & DOM Confetti Engine in warm editorial tones
 * - Web Audio API Synthesizer (Happy Birthday Melody + Sound Effects)
 * - Interactive Birthday Cake (Candle blow with smoke, cake slicing, served slice)
 * - 3D Gift Box Unboxing with 4 VIP passes
 * - Photo Memories Gallery with Custom Photo Upload & LocalStorage
 * - Interactive Wishing Wall with Persistent Sticky Notes
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

  // Play a single bell / chime note
  playTone(freq, duration, type = 'sine', volume = 0.16) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm music box envelope
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Celebratory Chime
  playChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.6, 'triangle', 0.18);
      }, idx * 110);
    });
  }

  // Soft candle blow whoosh
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

  // Happy Birthday Melody
  playBirthdayMelody(onEndCallback) {
    this.stopMelody();
    this.init();
    this.isPlayingMusic = true;

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
        this.playTone(item.note, item.duration, 'triangle', 0.2);
      }, item.delay);
      this.melodyTimeouts.push(tid);
    });

    const endTid = setTimeout(() => {
      this.isPlayingMusic = false;
      if (onEndCallback) onEndCallback();
    }, 18000);
    this.melodyTimeouts.push(endTid);
  }

  stopMelody() {
    this.melodyTimeouts.forEach(clearTimeout);
    this.melodyTimeouts = [];
    this.isPlayingMusic = false;
  }
}

const royalAudio = new RoyalSoundEngine();

// ==========================================================================
// 2. Confetti Engine (Editorial Palette Match)
// Palette: ['#a34e5c', '#e1ae8e', '#d3bd75', '#ebc8bb', '#8c9b7b', '#f4e8db']
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

  // DOM Falling Confetti (Matching User's snippet behavior)
  spawnFallingDOMPieces(count = 55) {
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
// 3. Interactive Cake Ceremony Controller
// ==========================================================================
function initCakeCeremony() {
  const candles = document.querySelectorAll('.candle');
  const blowBtn = document.getElementById('blowCandlesBtn');
  const cutBtn = document.getElementById('cutCakeBtn');
  const resetBtn = document.getElementById('resetCakeBtn');
  const statusBanner = document.getElementById('cakeStatusBanner');
  const knife = document.getElementById('knifeElement');
  const slice = document.getElementById('cakeSlice');
  const playMelodyBtn = document.getElementById('playMelodyBtn');

  let candlesBlown = false;
  let cakeCut = false;

  // Individual Candle Click
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
      candlesBlown = true;
      blowBtn.disabled = true;
      cutBtn.disabled = false;
      statusBanner.innerHTML = '✨ Wonderful wish made! Now, cut the cake for <strong>My Lady</strong>! 🍰';
      royalAudio.playChime();
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 90);
      confettiEngine.spawnFallingDOMPieces(35);
    }
  }

  // Blow All Button
  blowBtn.addEventListener('click', () => {
    candles.forEach(candle => candle.classList.add('blown-out'));
    royalAudio.playWhoosh();
    candlesBlown = true;
    blowBtn.disabled = true;
    cutBtn.disabled = false;
    statusBanner.innerHTML = '🎉 All candles blown! Now cut the cake for <strong>My Lady</strong>! 🎂';
    royalAudio.playChime();
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 120);
    confettiEngine.spawnFallingDOMPieces(45);
  });

  // Cut Cake Button
  cutBtn.addEventListener('click', () => {
    if (!candlesBlown || cakeCut) return;
    cakeCut = true;
    cutBtn.disabled = true;

    knife.classList.add('cutting');

    setTimeout(() => {
      knife.classList.remove('cutting');
      slice.classList.add('served');
      statusBanner.innerHTML = '♡ <strong>Happy Birthday, My Lady!</strong> Cake is served with sweetest love! ✨';
      royalAudio.playChime();
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 150);
      confettiEngine.spawnFallingDOMPieces(50);
    }, 650);
  });

  // Relight / Reset
  resetBtn.addEventListener('click', () => {
    candles.forEach(c => c.classList.remove('blown-out'));
    candlesBlown = false;
    cakeCut = false;
    blowBtn.disabled = false;
    cutBtn.disabled = true;
    slice.classList.remove('served');
    statusBanner.innerHTML = '🕯️ The candles are glowing softly! Blow them out, My Lady!';
  });

  // Melody button
  playMelodyBtn.addEventListener('click', () => {
    if (royalAudio.isPlayingMusic) {
      royalAudio.stopMelody();
      playMelodyBtn.textContent = '▶ Play Melody';
    } else {
      playMelodyBtn.textContent = '⏸ Pause Melody';
      royalAudio.playBirthdayMelody(() => {
        playMelodyBtn.textContent = '▶ Play Melody';
      });
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 60);
    }
  });
}

// ==========================================================================
// 4. Virtual Gift Box Unboxing
// ==========================================================================
function initGiftBox() {
  const giftBoxWrapper = document.getElementById('giftBoxWrapper');
  const giftBox = document.getElementById('giftBox');
  const hint = document.getElementById('giftTapHint');
  const couponsContainer = document.getElementById('couponsContainer');

  giftBoxWrapper.addEventListener('click', () => {
    if (!giftBox.classList.contains('opened')) {
      giftBox.classList.add('opened');
      hint.textContent = '🎁 The surprise is unboxed for My Lady ♡';
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
// 5. Photo Memories Gallery & Custom Upload with LocalStorage
// ==========================================================================
const DEFAULT_POLAROIDS = [
  {
    title: 'Royalty in Every Step',
    caption: '"Candid perfection, as always!"',
    author: '— To My Lady ✨',
    emoji: '👑',
    gradient: 'bg-blush-rose',
    isCustom: false
  },
  {
    title: 'The Bestie Laugh',
    caption: '"Inside jokes nobody else understands 😂"',
    author: '— To My Lady ♡',
    emoji: '👯‍♀️',
    gradient: 'bg-warm-sand',
    isCustom: false
  },
  {
    title: 'Sunset & Coffee Dates',
    caption: '"Chai, conversations, and endless dreams."',
    author: '— To My Lady 🥂',
    emoji: '☕',
    gradient: 'bg-soft-terracotta',
    isCustom: false
  },
  {
    title: 'Birthday Glow',
    caption: '"Another year of shining bright and staying iconic!"',
    author: '— For My Lady 🌟',
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
          <img src="${item.dataUrl}" alt="Photo of My Lady" loading="lazy">
        </div>
        <div class="polaroid-caption">
          <p class="caption-text">"${item.caption}"</p>
          <span class="caption-author">— Cherished Memory of My Lady ♡</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (item.dataUrl) {
      lightboxBody.innerHTML = `
        <img src="${item.dataUrl}" style="width:100%; border-radius:10px; margin-bottom:1rem;" alt="Memory of My Lady">
        <h3 style="font-family:var(--font-serif); color:var(--ink); font-size:1.3rem;">${item.caption}</h3>
        <p style="color:var(--rose); font-size:0.88rem; margin-top:0.3rem;">Dedicated with love to My Lady ♡</p>
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

  lightboxClose.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const caption = prompt('Add a cute title/caption for this photo of My Lady:') || 'A golden memory with My Lady!';
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

  renderGallery();
}

// ==========================================================================
// 6. Wishing Wall with Persistent LocalStorage
// ==========================================================================
const DEFAULT_WISHES = [
  {
    author: "Your Bestie's Boyfriend",
    emoji: "👑",
    message: "Happy Birthday, My Lady! Thank you for being the most incredible best friend to my favourite girl and for always bringing so much joy into our lives!",
    color: "note-paper-1",
    date: "Today"
  },
  {
    author: "Your Soul Sister / Bestie",
    emoji: "♡",
    message: "To My Lady: My forever partner in crime, therapist, and soulmate! Words will never be enough to say how much I adore you. Slay your day, queen!",
    color: "note-paper-2",
    date: "Today"
  },
  {
    author: "The Squad",
    emoji: "🥂",
    message: "Cheers to My Lady! Wishing you an unforgettable year packed with laughter, adventures, delicious food, and unmatched glamour!",
    color: "note-paper-3",
    date: "Today"
  },
  {
    author: "A Well-Wisher of Your Grace",
    emoji: "✨",
    message: "My Lady, your smile lights up every room. May this birthday bring you everything your wonderful heart has ever wished for!",
    color: "note-paper-4",
    date: "Today"
  }
];

function initWishingWall() {
  const board = document.getElementById('wallBoard');
  const form = document.getElementById('wishForm');
  const authorInput = document.getElementById('authorInput');
  const emojiSelect = document.getElementById('emojiSelect');
  const messageInput = document.getElementById('messageInput');

  const colorClasses = ['note-paper-1', 'note-paper-2', 'note-paper-3', 'note-paper-4', 'note-paper-5'];
  let customWishes = JSON.parse(localStorage.getItem('my_lady_wishes') || '[]');

  function renderWishes() {
    board.innerHTML = '';
    const allWishes = [...customWishes, ...DEFAULT_WISHES];

    allWishes.forEach(w => {
      const note = document.createElement('div');
      note.className = `wish-note ${w.color}`;
      note.innerHTML = `
        <div class="note-pin"></div>
        <div class="note-header">
          <span class="note-author">${escapeHtml(w.author)}</span>
          <span class="note-emoji">${w.emoji}</span>
        </div>
        <p class="note-message">"${escapeHtml(w.message)}"</p>
        <span class="note-date">— To My Lady (${escapeHtml(w.date)})</span>
      `;
      board.appendChild(note);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const author = authorInput.value.trim();
    const emoji = emojiSelect.value;
    const message = messageInput.value.trim();

    if (!author || !message) return;

    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
    const newWish = {
      author: author,
      emoji: emoji,
      message: message,
      color: randomColor,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };

    customWishes.unshift(newWish);
    localStorage.setItem('my_lady_wishes', JSON.stringify(customWishes));

    renderWishes();
    form.reset();

    royalAudio.playChime();
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight * 0.7, 80);
    confettiEngine.spawnFallingDOMPieces(30);
  });

  renderWishes();
}

// ==========================================================================
// 7. Navbar & Celebrate Button Triggers
// ==========================================================================
function initNavbarAndGlobals() {
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const soundWave = document.getElementById('soundWave');
  const celebrateBtn = document.getElementById('celebrate-button');

  musicToggleBtn.addEventListener('click', () => {
    if (royalAudio.isPlayingMusic) {
      royalAudio.stopMelody();
      soundWave.classList.remove('playing');
    } else {
      royalAudio.playBirthdayMelody(() => {
        soundWave.classList.remove('playing');
      });
      soundWave.classList.add('playing');
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 60);
    }
  });

  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      confettiEngine.spawnFallingDOMPieces(65);
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
      royalAudio.playChime();
    });
  }

  // Initial gentle welcome burst
  window.addEventListener('load', () => {
    setTimeout(() => {
      confettiEngine.spawnFallingDOMPieces(30);
    }, 400);
  });
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCakeCeremony();
  initGiftBox();
  initGallery();
  initWishingWall();
  initNavbarAndGlobals();
});
