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
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0.85;
    this.isPlayingMusic = false;

    // Track Catalog
    this.tracks = {
      musicBox: {
        id: 'musicBox',
        name: 'Music Box (Waltz)',
        icon: '🎵',
        desc: 'Vintage Swiss music box with sparkling crystal tines & waltz',
        src: 'public/birthday_melody.mp3'
      },
      acousticPiano: {
        id: 'acousticPiano',
        name: 'Acoustic Piano & Strings',
        icon: '🎹',
        desc: 'Emotional, soulful acoustic piano with orchestral strings',
        src: 'public/birthday_acoustic.mp3'
      },
      custom: {
        id: 'custom',
        name: 'Custom Song',
        icon: '✨',
        desc: 'Your uploaded song playing across the celebration',
        src: null
      }
    };

    // Current Track ID from SessionStorage or default
    this.currentTrackId = sessionStorage.getItem('melodyTrackId') || 'musicBox';

    // Check if custom audio was previously saved in localStorage
    try {
      const savedCustom = localStorage.getItem('customMelodyDataUrl');
      const savedName = localStorage.getItem('customMelodyName');
      if (savedCustom) {
        this.tracks.custom.src = savedCustom;
        if (savedName) this.tracks.custom.name = savedName;
      }
    } catch (e) {}

    this.applyTrackSource();

    // Preserve continuous playback position across page transitions
    const savedTime = parseFloat(sessionStorage.getItem('melodyTime') || '0');
    if (savedTime && !isNaN(savedTime)) {
      this.audio.currentTime = savedTime;
    }

    // Save currentTime before unloading page
    window.addEventListener('beforeunload', () => {
      if (this.isPlayingMusic && this.audio.currentTime) {
        sessionStorage.setItem('melodyTime', this.audio.currentTime.toString());
      }
    });

    // Web Audio Context for SFX (chimes, whoosh)
    this.ctx = null;
  }

  initWebAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  applyTrackSource() {
    const track = this.tracks[this.currentTrackId] || this.tracks.musicBox;
    if (track.src && !this.audio.src.endsWith(track.src)) {
      const wasPlaying = this.isPlayingMusic;
      this.audio.src = track.src;
      this.audio.load();
      if (wasPlaying) {
        this.audio.play().catch(() => {});
      }
    }
  }

  setTrack(trackId) {
    if (!this.tracks[trackId]) return;
    this.currentTrackId = trackId;
    sessionStorage.setItem('melodyTrackId', trackId);
    this.applyTrackSource();
    if (this.isPlayingMusic) {
      this.audio.play().catch(() => {});
    }
    this.updateSoundWaveUI(this.isPlayingMusic);
    this.updateLabelUI();
    this.updatePopoverActiveUI();
  }

  setCustomTrack(dataUrl, fileName) {
    this.tracks.custom.src = dataUrl;
    this.tracks.custom.name = fileName ? `Custom: ${fileName.slice(0, 18)}` : 'Custom Song';
    try {
      localStorage.setItem('customMelodyDataUrl', dataUrl);
      localStorage.setItem('customMelodyName', this.tracks.custom.name);
    } catch (e) {}
    this.setTrack('custom');
    this.playBirthdayMelody(true);
  }

  playBirthdayMelody(loop = true) {
    this.initWebAudio();
    this.audio.loop = loop;
    this.applyTrackSource();

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.isPlayingMusic = true;
          sessionStorage.setItem('melodyActive', 'true');
          this.updateSoundWaveUI(true);
          this.updateLabelUI();
          this.updatePopoverActiveUI();
        })
        .catch(err => {
          console.warn('Audio playback waiting for user gesture:', err);
        });
    }
  }

  stopMelody() {
    this.audio.pause();
    this.isPlayingMusic = false;
    sessionStorage.setItem('melodyActive', 'false');
    this.updateSoundWaveUI(false);
    this.updateLabelUI();
  }

  updateSoundWaveUI(active) {
    const soundWave = document.getElementById('soundWave');
    if (soundWave) {
      if (active) soundWave.classList.add('playing');
      else soundWave.classList.remove('playing');
    }
  }

  updateLabelUI() {
    const musicIcon = document.getElementById('musicIcon');
    const musicLabel = document.querySelector('.music-label');
    const track = this.tracks[this.currentTrackId] || this.tracks.musicBox;
    if (musicIcon) musicIcon.textContent = track.icon;
    if (musicLabel) musicLabel.textContent = this.isPlayingMusic ? track.name.split(' ')[0] : 'Melody';
  }

  updatePopoverActiveUI() {
    document.querySelectorAll('.melody-track-card').forEach(card => {
      if (card.dataset.track === this.currentTrackId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // Realistic Sparkle Chime (Web Audio for candles, celebrations)
  playChime() {
    this.initWebAudio();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.65);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.65);
        } catch (e) {}
      }, idx * 95);
    });
  }

  // Soft whoosh (Web Audio for blow, slice)
  playWhoosh() {
    this.initWebAudio();
    if (!this.ctx) return;
    try {
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
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
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
  const cakeDisplay = document.getElementById('cakeDisplay');
  const cakePlate = document.getElementById('cakePlate');
  const servedSlice = document.getElementById('servedSlice');

  if (!candles.length || !blowBtn || !cutBtn) return;

  let candlesBlown = false;
  let cakeCut = false;
  let micStream = null;
  let micAudioCtx = null;
  let micAnimId = null;
  const blowMeterWrap = document.getElementById('blowMeterWrap');
  const blowMeterBar = document.getElementById('blowMeterBar');

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
    if (blowMeterWrap) {
      blowMeterWrap.style.display = 'none';
    }
    if (blowMeterBar) {
      blowMeterBar.style.width = '0%';
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

  // Real Microphone Blow Detection with High-Frequency Sensitivity & Anti-Voice Filtering
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
          analyser.smoothingTimeConstant = 0.2;
          source.connect(analyser);

          micBlowBtn.classList.add('listening');
          micBlowBtn.textContent = '🌬️ Listening... Blow into mic now!';
          statusBanner.innerHTML = '🎙️ <strong>Microphone active! Blow directly onto your phone\'s mic to extinguish the candles, My Lady! 🌬️</strong>';

          if (blowMeterWrap) {
            blowMeterWrap.style.display = 'flex';
          }
          if (blowMeterBar) {
            blowMeterBar.style.width = '0%';
          }

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          let blowScore = 0;

          const checkBreath = () => {
            if (!micStream || candlesBlown) return;
            analyser.getByteFrequencyData(dataArray);

            // Bins 0-7 represent low-frequency wind turbulence (0 to ~550Hz)
            let lowSum = 0;
            let maxLow = 0;
            const lowRange = Math.min(8, bufferLength);

            for (let i = 0; i < lowRange; i++) {
              lowSum += dataArray[i];
              if (dataArray[i] > maxLow) {
                maxLow = dataArray[i];
              }
            }

            // Total volume
            let totalSum = 0;
            for (let i = 0; i < bufferLength; i++) {
              totalSum += dataArray[i];
            }

            const avgVolume = totalSum / bufferLength;
            const avgLow = lowSum / lowRange;

            // Strict blow filter:
            // 1. avgLow >= 85 (strong aerodynamic wind turbulence)
            // 2. maxLow >= 130 (physical pressure hit on the microphone diaphragm)
            // 3. avgVolume >= 38 (real sound energy present)
            // Normal speaking or slight ambient room noise will NOT satisfy these 3 simultaneous thresholds.
            const isDeliberateBlow = (avgLow >= 85 && maxLow >= 130 && avgVolume >= 38);

            if (isDeliberateBlow) {
              blowScore += 8; // increases steadily during a real blow
            } else {
              blowScore = Math.max(0, blowScore - 5); // decays quickly if just speaking or background noise
            }

            const pct = Math.min(100, Math.round(blowScore));
            if (blowMeterBar) {
              blowMeterBar.style.width = pct + '%';
            }

            // Requires continuous, intentional blow for ~0.25 seconds to hit 100%
            if (blowScore >= 100) {
              triggerCandleExtinguish(true);
              return;
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
    royalAudio.playWhoosh();

    setTimeout(() => {
      knife.classList.remove('cutting');
      if (cakeDisplay) cakeDisplay.classList.add('cake-is-cut');
      if (cakePlate) cakePlate.classList.add('cake-is-cut');
      statusBanner.innerHTML = '♡ <strong>Happy Birthday, My Lady!</strong> Cake is cut & served with sweetest love across the distance! ✨';
      royalAudio.playChime();
      confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2.5, 150);
      confettiEngine.spawnFallingDOMPieces(50);
    }, 750);
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
    if (cakeDisplay) cakeDisplay.classList.remove('cake-is-cut');
    if (cakePlate) cakePlate.classList.remove('cake-is-cut');
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
// 5. Gallery Initializer (Real Photos & Videos from Public Folder for My Lady)
// ==========================================================================
const DEFAULT_POLAROIDS = [
  {
    image: 'public/pics/1.jpeg',
    title: 'Queen of Elegance',
    caption: 'My stunning bestie looking effortless, radiant, and graceful as always!',
    author: '— Love you across the miles ✨',
    isCustom: false
  },
  {
    image: 'public/pics/2.jpeg',
    title: 'Pure Sunshine & Grace',
    caption: 'That sweet smile that brightens up every single day across the distance.',
    author: '— Forever my favorite person ♡',
    isCustom: false
  },
  {
    image: 'public/pics/3.jpeg',
    title: 'Unbreakable Bestie Bond',
    caption: 'No matter how many miles separate us, our souls are always side by side.',
    author: '— Soul sisters forever 👯‍♀️',
    isCustom: false
  },
  {
    image: 'public/pics/4.jpeg',
    title: 'Precious Moments',
    caption: 'Every memory with you is wrapped in warmth, laughter, and pure joy.',
    author: '— Cherishing you always 🌸',
    isCustom: false
  },
  {
    image: 'public/pics/6.jpeg',
    title: 'Birthday Royalty',
    caption: 'Another year of you being iconic, inspiring, and completely irreplaceable.',
    author: '— Celebrating My Lady 👑',
    isCustom: false
  },
  {
    image: 'public/pics/7.jpeg',
    title: 'Heartfelt Sisterhood',
    caption: 'Sharing every thought, every dream, and knowing our bond never fades.',
    author: '— Distance means nothing ✨',
    isCustom: false
  },
  {
    image: 'public/pics/8.jpeg',
    title: 'Forever My Safe Haven',
    caption: 'Thank you for being the sweetest, kindest, and most loyal bestie in the world.',
    author: '— With infinite love, Your Bestie ♡',
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

    // Render User Custom Uploads first
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

    // Render Real Photos from Public Folder
    DEFAULT_POLAROIDS.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `polaroid-card ${(index + savedPhotos.length) % 2 === 0 ? 'tilt-left' : 'tilt-right'}`;
      card.innerHTML = `
        <div class="tape-strip"></div>
        <div class="polaroid-img-wrapper">
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='assests/pics/${item.image.split('/').pop()}'">
        </div>
        <div class="polaroid-caption">
          <p class="caption-text">"${item.caption}"</p>
          <span class="caption-author">${item.author}</span>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (!lightbox || !lightboxBody) return;
    const imgSrc = item.dataUrl || item.image;
    if (imgSrc) {
      lightboxBody.innerHTML = `
        <img src="${imgSrc}" style="width:100%; max-height:70vh; object-fit:contain; border-radius:12px; margin-bottom:1.2rem; box-shadow:0 10px 30px rgba(0,0,0,0.15);" alt="${item.title || 'Memory with My Lady'}">
        <h3 style="font-family:var(--font-serif); color:var(--ink); font-size:1.35rem; margin-bottom:0.35rem;">${item.title || 'Cherished Memory'}</h3>
        <p style="font-family:var(--font-hand); font-size:1.6rem; color:var(--rose);">${item.caption}</p>
        <p style="color:var(--muted); font-size:0.85rem; margin-top:0.4rem;">${item.author || '— To My Lady, with all my love ♡'}</p>
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

  // Inject track selector button and popover modal if music button is present
  if (musicToggleBtn) {
    // If not already wrapped in .music-pill-group, wrap it
    if (!musicToggleBtn.parentElement.classList.contains('music-pill-group')) {
      const parent = musicToggleBtn.parentElement;
      const pillGroup = document.createElement('div');
      pillGroup.className = 'music-pill-group';
      parent.insertBefore(pillGroup, musicToggleBtn);
      pillGroup.appendChild(musicToggleBtn);

      const menuBtn = document.createElement('button');
      menuBtn.id = 'musicMenuBtn';
      menuBtn.className = 'btn-music-menu';
      menuBtn.title = 'Choose Melody Track / Upload Song';
      menuBtn.setAttribute('aria-label', 'Choose Melody Track');
      menuBtn.innerHTML = '▾';
      pillGroup.appendChild(menuBtn);

      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMelodyPopover();
      });
    }

    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (royalAudio.isPlayingMusic) {
        royalAudio.stopMelody();
      } else {
        royalAudio.playBirthdayMelody(true);
        confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, 50);
      }
    });

    // Update label to reflect active track
    royalAudio.updateLabelUI();
  }

  // Ensure Melody Popover exists in DOM
  createMelodyPopoverDOM();

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
 * Creates the modal popover for switching tracks or uploading custom audio
 */
function createMelodyPopoverDOM() {
  if (document.getElementById('melodyPopoverOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'melodyPopoverOverlay';
  overlay.className = 'melody-popover-overlay';
  overlay.innerHTML = `
    <div class="melody-popover-card" role="dialog" aria-modal="true" aria-label="Choose Birthday Melody">
      <div class="melody-popover-header">
        <h3 class="melody-popover-title">Choose Birthday Melody 🎶</h3>
        <button class="melody-popover-close" id="closeMelodyPopover" aria-label="Close">✕</button>
      </div>
      <div class="melody-track-list">
        <div class="melody-track-card" data-track="musicBox">
          <div class="track-icon">🎵</div>
          <div class="track-info">
            <div class="track-title">
              <span>Vintage Swiss Music Box (Waltz)</span>
              <span class="badge-active">Active</span>
            </div>
            <div class="track-desc">Sparkling crystal bell chimes & sweet waltz accompaniment</div>
          </div>
        </div>

        <div class="melody-track-card" data-track="acousticPiano">
          <div class="track-icon">🎹</div>
          <div class="track-info">
            <div class="track-title">
              <span>Dreamy Acoustic Piano & Strings</span>
              <span class="badge-active">Active</span>
            </div>
            <div class="track-desc">Soulful, heartfelt acoustic piano with orchestral strings</div>
          </div>
        </div>

        <div class="melody-track-card" data-track="custom">
          <div class="track-icon">✨</div>
          <div class="track-info">
            <div class="track-title">
              <span>Upload Custom Song (MP3)</span>
              <span class="badge-active">Active</span>
            </div>
            <div class="track-desc" id="customTrackDesc">Choose any song of your choice from your phone or PC</div>
          </div>
        </div>
      </div>
      <input type="file" id="customMelodyFileInput" accept="audio/*" style="display:none;">
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMelodyPopover();
  });
  const closeBtn = overlay.querySelector('#closeMelodyPopover');
  if (closeBtn) closeBtn.addEventListener('click', closeMelodyPopover);

  // Track selection
  overlay.querySelectorAll('.melody-track-card').forEach(card => {
    card.addEventListener('click', () => {
      const trackId = card.dataset.track;
      if (trackId === 'custom') {
        const fileInput = document.getElementById('customMelodyFileInput');
        if (fileInput) fileInput.click();
      } else {
        royalAudio.setTrack(trackId);
        royalAudio.playBirthdayMelody(true);
        confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
        closeMelodyPopover();
      }
    });
  });

  // Custom audio file chooser handler
  const customFileInput = document.getElementById('customMelodyFileInput');
  if (customFileInput) {
    customFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        royalAudio.setCustomTrack(dataUrl, file.name);
        const descEl = document.getElementById('customTrackDesc');
        if (descEl) descEl.textContent = `Playing: ${file.name}`;
        confettiEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
        closeMelodyPopover();
      };
      reader.readAsDataURL(file);
    });
  }

  royalAudio.updatePopoverActiveUI();
}

function openMelodyPopover() {
  const overlay = document.getElementById('melodyPopoverOverlay');
  if (overlay) {
    royalAudio.updatePopoverActiveUI();
    overlay.classList.add('visible');
  }
}

function closeMelodyPopover() {
  const overlay = document.getElementById('melodyPopoverOverlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
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

    // If user clicked the music toggle or menu button in the header, let that handler manage it
    if (evt && evt.target && (evt.target.closest('#musicToggleBtn') || evt.target.closest('#musicMenuBtn') || evt.target.closest('#melodyPopoverOverlay'))) {
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
// 7. Smooth Page Transitions (Fluid Navigation Between Chapters)
// ==========================================================================
function initPageTransitions() {
  document.body.classList.add('page-entering');
  setTimeout(() => {
    document.body.classList.remove('page-entering');
  }, 450);

  // Restore page visibility if user navigates via browser back/forward (bfcache)
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-transitioning');
  });

  // Intercept clicks on links for smooth page gliding
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Ignore anchors, external links, mailto, tel, downloads, or special clicks
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      anchor.target === '_blank' ||
      anchor.hasAttribute('download') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    // Check if the link points to a page on the same site
    const targetUrl = new URL(anchor.href, window.location.href);
    const isSameSite = targetUrl.origin === window.location.origin;

    if (!isSameSite) return;

    // Smooth transition
    e.preventDefault();
    document.body.classList.add('page-transitioning');

    setTimeout(() => {
      window.location.href = anchor.href;
    }, 240);
  });
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initCakeCeremony();
  initGiftBox();
  initGallery();
  initNavbarAndGlobals();
});
