/**
 * Happy Birthday, My Lady - Royal Celebration Interactive Script
 * Features:
 * - Canvas Confetti & Fireworks Particle Engine
 * - Web Audio API Synthesizer (Happy Birthday Melody + Sound Effects)
 * - Interactive Cake Ceremony (Candle Blowing + Cake Slicing)
 * - Royal Wax-Sealed Letter Unfolding
 * - 3D Gift Box Surprise Unboxing with VIP Passes
 * - Photo Gallery with Upload & LocalStorage Persistence
 * - Interactive Wishing Wall with Persistent Sticky Notes
 */

// ==========================================================================
// 1. Audio Synthesizer (Zero External Dependencies)
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

  // Play a single musical tone with custom envelope
  playTone(freq, duration, type = 'sine', volume = 0.15) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm music box / bell envelope
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Celebratory Chime / Fanfare
  playChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.6, 'triangle', 0.2);
      }, idx * 120);
    });
  }

  // Candle blow out whoosh
  playWhoosh() {
    this.init();
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // Play "Happy Birthday to My Lady" Melody
  playBirthdayMelody(onEndCallback) {
    this.stopMelody();
    this.init();
    this.isPlayingMusic = true;

    // Note frequencies
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23,
          G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88,
          C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46;

    // Melodic structure of Happy Birthday
    const song = [
      { note: C4, duration: 0.35, delay: 0 },
      { note: C4, duration: 0.25, delay: 400 },
      { note: D4, duration: 0.6, delay: 700 },
      { note: C4, duration: 0.6, delay: 1400 },
      { note: F4, duration: 0.6, delay: 2100 },
      { note: E4, duration: 1.0, delay: 2800 },

      // Happy Birthday to you
      { note: C4, duration: 0.35, delay: 4000 },
      { note: C4, duration: 0.25, delay: 4400 },
      { note: D4, duration: 0.6, delay: 4700 },
      { note: C4, duration: 0.6, delay: 5400 },
      { note: G4, duration: 0.6, delay: 6100 },
      { note: F4, duration: 1.0, delay: 6800 },

      // Happy Birthday Dear My Lady
      { note: C4, duration: 0.35, delay: 8000 },
      { note: C4, duration: 0.25, delay: 8400 },
      { note: C5, duration: 0.7, delay: 8700 },
      { note: A4, duration: 0.7, delay: 9500 },
      { note: F4, duration: 0.6, delay: 10300 },
      { note: E4, duration: 0.6, delay: 11000 },
      { note: D4, duration: 1.0, delay: 11700 },

      // Happy Birthday to you (Grand finale)
      { note: Bb4, duration: 0.35, delay: 13000 },
      { note: Bb4, duration: 0.25, delay: 13400 },
      { note: A4, duration: 0.7, delay: 13700 },
      { note: F4, duration: 0.7, delay: 14500 },
      { note: G4, duration: 0.7, delay: 15300 },
      { note: F4, duration: 1.5, delay: 16100 }
    ];

    song.forEach(item => {
      const tid = setTimeout(() => {
        this.playTone(item.note, item.duration, 'triangle', 0.22);
      }, item.delay);
      this.melodyTimeouts.push(tid);
    });

    // Finished timeout
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
// 2. Fullscreen Confetti & Fireworks Engine
// ==========================================================================
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnBurst(x, y, count = 100) {
    const colors = [
      '#f5d061', '#ffd54f', '#ff758c', '#ff7eb3', 
      '#9b51e0', '#70a1ff', '#fff', '#e056fd'
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3;
      this.particles.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.18,
        opacity: 1,
        decay: Math.random() * 0.012 + 0.008,
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
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
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
}

const confettiEngine = new ConfettiEngine();

// ==========================================================================
// 3. Ambient Twinkling Stars
// ==========================================================================
function initBackgroundStars() {
  const container = document.getElementById('floatingStars');
  if (!container) return;
  const count = 45;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    const size = Math.random() * 3.5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    container.appendChild(star);
  }
}

// ==========================================================================
// 4. Interactive Cake Ceremony Controller
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
          25
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
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 120);
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
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 150);
  });

  // Cut Cake Button
  cutBtn.addEventListener('click', () => {
    if (!candlesBlown || cakeCut) return;
    cakeCut = true;
    cutBtn.disabled = true;

    // Animate knife
    knife.classList.add('cutting');

    setTimeout(() => {
      knife.classList.remove('cutting');
      slice.classList.add('served');
      statusBanner.innerHTML = '👑 <strong>Happy Birthday, My Lady!</strong> Cake is served with sweetest love! 💖✨';
      royalAudio.playChime();
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 200);
    }, 700);
  });

  // Relight / Reset
  resetBtn.addEventListener('click', () => {
    candles.forEach(c => c.classList.remove('blown-out'));
    candlesBlown = false;
    cakeCut = false;
    blowBtn.disabled = false;
    cutBtn.disabled = true;
    slice.classList.remove('served');
    statusBanner.innerHTML = '🕯️ Candles are glowing bright! Blow them out, My Lady!';
  });

  // Melody button
  playMelodyBtn.addEventListener('click', () => {
    if (royalAudio.isPlayingMusic) {
      royalAudio.stopMelody();
      playMelodyBtn.textContent = '▶️ Play "Happy Birthday My Lady"';
    } else {
      playMelodyBtn.textContent = '⏸️ Pause Melody';
      royalAudio.playBirthdayMelody(() => {
        playMelodyBtn.textContent = '▶️ Play "Happy Birthday My Lady"';
      });
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 80);
    }
  });
}

// ==========================================================================
// 5. Royal Letter Interaction
// ==========================================================================
function initRoyalLetter() {
  const envelope = document.getElementById('royalEnvelope');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const closeLetterBtn = document.getElementById('closeLetterBtn');

  waxSealBtn.addEventListener('click', () => {
    envelope.classList.add('open');
    royalAudio.playChime();
    confettiEngine.spawnBurst(
      waxSealBtn.getBoundingClientRect().left + 40,
      waxSealBtn.getBoundingClientRect().top + 40,
      80
    );
  });

  closeLetterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    envelope.classList.remove('open');
  });
}

// ==========================================================================
// 6. Virtual Gift Box Surprise Unboxing
// ==========================================================================
function initGiftBox() {
  const giftBoxWrapper = document.getElementById('giftBoxWrapper');
  const giftBox = document.getElementById('giftBox');
  const hint = document.getElementById('giftTapHint');
  const couponsContainer = document.getElementById('couponsContainer');

  giftBoxWrapper.addEventListener('click', () => {
    if (!giftBox.classList.contains('opened')) {
      giftBox.classList.add('opened');
      hint.textContent = '🎁 The surprise is unboxed for My Lady!';
      couponsContainer.classList.add('visible');
      royalAudio.playChime();
      confettiEngine.spawnBurst(
        giftBoxWrapper.getBoundingClientRect().left + 80,
        giftBoxWrapper.getBoundingClientRect().top + 50,
        140
      );
    }
  });
}

// ==========================================================================
// 7. Photo Memories Gallery & Custom Upload with LocalStorage
// ==========================================================================
const DEFAULT_POLAROIDS = [
  {
    title: 'Royalty in Every Step',
    caption: '"Candid perfection, as always!"',
    author: '— To My Lady ✨',
    emoji: '👑💃',
    gradient: 'gradient-rose',
    isCustom: false
  },
  {
    title: 'The Bestie Laugh',
    caption: '"Inside jokes nobody else understands 😂"',
    author: '— To My Lady 💖',
    emoji: '👯‍♀️✨',
    gradient: 'gradient-purple',
    isCustom: false
  },
  {
    title: 'Sunset & Coffee Dates',
    caption: '"Chai, conversations, and endless dreams."',
    author: '— To My Lady 🥂',
    emoji: '☕🌅',
    gradient: 'gradient-amber',
    isCustom: false
  },
  {
    title: 'Birthday Queen Glow',
    caption: '"Another year of shining bright and staying iconic!"',
    author: '— For My Lady 🌟',
    emoji: '🎂✨',
    gradient: 'gradient-pink',
    isCustom: false
  }
];

function initGallery() {
  const grid = document.getElementById('polaroidGrid');
  const uploadInput = document.getElementById('photoUploadInput');
  const lightbox = document.getElementById('lightboxDialog');
  const lightboxBody = document.getElementById('lightboxBody');
  const lightboxClose = document.getElementById('lightboxCloseBtn');

  // Load custom photos from localStorage
  const savedPhotos = JSON.parse(localStorage.getItem('my_lady_photos') || '[]');

  function renderGallery() {
    grid.innerHTML = '';

    // Render default cards
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

    // Render custom uploaded photos
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
          <span class="caption-author">— Cherished Memory of My Lady 💖</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (item.dataUrl) {
      lightboxBody.innerHTML = `
        <img src="${item.dataUrl}" style="width:100%; border-radius:12px; margin-bottom:1rem;" alt="Memory of My Lady">
        <h3 style="font-family:var(--font-royal); color:var(--gold-primary);">${item.caption}</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.4rem;">Dedicated with love to My Lady ✨</p>
      `;
    } else {
      lightboxBody.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem;">
          <div style="font-size:4rem; margin-bottom:1rem;">${item.emoji}</div>
          <h3 style="font-family:var(--font-royal); color:var(--gold-primary); margin-bottom:0.6rem;">${item.title}</h3>
          <p style="font-family:var(--font-hand); font-size:1.8rem; color:#fff;">${item.caption}</p>
          <p style="color:var(--rose-primary); font-size:0.9rem; margin-top:0.8rem;">${item.author}</p>
        </div>
      `;
    }
    lightbox.showModal();
  }

  lightboxClose.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  // Handle Photo Upload
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
// 8. Wishing Wall with Persistent LocalStorage
// ==========================================================================
const DEFAULT_WISHES = [
  {
    author: "Your Bestie's Boyfriend",
    emoji: "👑",
    message: "Happy Birthday, My Lady! Thank you for being the most incredible best friend to my favourite girl and for always bringing so much joy into our lives!",
    color: "note-yellow",
    date: "Today"
  },
  {
    author: "Your Soul Sister / Bestie",
    emoji: "💖",
    message: "To My Lady: My forever partner in crime, therapist, and soulmate! Words will never be enough to say how much I adore you. Slay your day, queen!",
    color: "note-pink",
    date: "Today"
  },
  {
    author: "The Squad",
    emoji: "🥂",
    message: "Cheers to My Lady! Wishing you an unforgettable year packed with laughter, adventures, delicious food, and unmatched glamour!",
    color: "note-purple",
    date: "Today"
  },
  {
    author: "A Secret Admirer of Your Grace",
    emoji: "🌟",
    message: "My Lady, your smile lights up every room. May this birthday bring you everything your wonderful heart has ever wished for!",
    color: "note-blue",
    date: "Today"
  }
];

function initWishingWall() {
  const board = document.getElementById('wallBoard');
  const form = document.getElementById('wishForm');
  const authorInput = document.getElementById('authorInput');
  const emojiSelect = document.getElementById('emojiSelect');
  const messageInput = document.getElementById('messageInput');

  const colorClasses = ['note-yellow', 'note-pink', 'note-purple', 'note-blue', 'note-green'];
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
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight * 0.7, 100);
  });

  renderWishes();
}

// ==========================================================================
// 9. Navbar Actions & Global Triggers
// ==========================================================================
function initNavbarAndGlobals() {
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const soundWave = document.getElementById('soundWave');
  const blastNavBtn = document.getElementById('blastConfettiNavBtn');

  musicToggleBtn.addEventListener('click', () => {
    if (royalAudio.isPlayingMusic) {
      royalAudio.stopMelody();
      soundWave.classList.remove('playing');
    } else {
      royalAudio.playBirthdayMelody(() => {
        soundWave.classList.remove('playing');
      });
      soundWave.classList.add('playing');
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 70);
    }
  });

  blastNavBtn.addEventListener('click', () => {
    confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 140);
    royalAudio.playChime();
  });

  // Welcome celebration burst on first interaction or initial load
  window.addEventListener('load', () => {
    setTimeout(() => {
      confettiEngine.spawnBurst(window.innerWidth / 2, 200, 60);
    }, 400);
  });
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundStars();
  initCakeCeremony();
  initRoyalLetter();
  initGiftBox();
  initGallery();
  initWishingWall();
  initNavbarAndGlobals();
});
