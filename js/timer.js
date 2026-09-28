/**
 * FitPulse Gym Rest Timer
 * Provides audio/vibration cues, visual countdown, and non-blocking background timing.
 */

class RestTimer {
  constructor() {
    this.remainingSeconds = 0;
    this.totalSeconds = 60;
    this.intervalId = null;
    this.isRunning = false;
    this.audioCtx = null;
    this.container = null;
  }

  init() {
    this.createTimerUI();
    this.bindEvents();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playBeep(freq = 880, duration = 0.15, type = 'sine') {
    const settings = window.StorageManager ? window.StorageManager.getSettings() : { soundEnabled: true };
    if (!settings.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  vibrate(pattern = [200, 100, 200]) {
    const settings = window.StorageManager ? window.StorageManager.getSettings() : { vibrateEnabled: true };
    if (settings.vibrateEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  createTimerUI() {
    if (document.getElementById('floating-rest-timer')) return;

    const div = document.createElement('div');
    div.id = 'floating-rest-timer';
    div.className = 'rest-timer-widget hidden';
    div.innerHTML = `
      <div class="rest-timer-inner">
        <div class="timer-progress-ring-wrap">
          <svg class="timer-ring" width="56" height="56">
            <circle class="timer-ring-bg" cx="28" cy="28" r="24" />
            <circle class="timer-ring-bar" cx="28" cy="28" r="24" />
          </svg>
          <span class="timer-display" id="timer-display-text">01:00</span>
        </div>
        <div class="timer-info">
          <div class="timer-label">Rest Timer</div>
          <div class="timer-quick-actions">
            <button type="button" class="btn-timer-chip" data-add="-15">-15s</button>
            <button type="button" class="btn-timer-chip" data-add="30">+30s</button>
            <button type="button" class="btn-timer-chip" data-add="60">+1m</button>
          </div>
        </div>
        <div class="timer-controls">
          <button type="button" class="btn-icon" id="btn-timer-toggle" title="Pause / Resume" aria-label="Pause or Resume Timer">
            <svg id="timer-icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="2"/>
              <rect x="14" y="4" width="4" height="16" rx="2"/>
            </svg>
            <svg id="timer-icon-play" class="hidden" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          <button type="button" class="btn-icon btn-danger-ghost" id="btn-timer-close" title="Dismiss Timer" aria-label="Dismiss Timer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    this.container = div;
  }

  bindEvents() {
    const toggleBtn = document.getElementById('btn-timer-toggle');
    const closeBtn = document.getElementById('btn-timer-close');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (this.isRunning) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.stop();
      });
    }

    if (this.container) {
      this.container.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const delta = parseInt(e.currentTarget.getAttribute('data-add'), 10);
          this.adjustTime(delta);
        });
      });
    }
  }

  start(seconds = 60) {
    this.stop();
    this.totalSeconds = Math.max(5, seconds);
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = true;

    if (this.container) {
      this.container.classList.remove('hidden');
    }

    this.updateUI();
    this.playBeep(520, 0.1); // Start cue

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  adjustTime(delta) {
    this.remainingSeconds = Math.max(0, this.remainingSeconds + delta);
    this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
    this.updateUI();
    if (this.remainingSeconds === 0) {
      this.finish();
    }
  }

  tick() {
    if (!this.isRunning) return;

    this.remainingSeconds--;

    // Warning beeps on last 3, 2, 1 seconds
    if (this.remainingSeconds === 3 || this.remainingSeconds === 2 || this.remainingSeconds === 1) {
      this.playBeep(700, 0.1);
      this.vibrate([100]);
    }

    if (this.remainingSeconds <= 0) {
      this.finish();
      return;
    }

    this.updateUI();
  }

  finish() {
    this.remainingSeconds = 0;
    this.updateUI();
    this.stopIntervalOnly();

    // Final celebration completion beeps and vibration
    this.playBeep(1046, 0.2, 'triangle'); // C6
    setTimeout(() => this.playBeep(1318, 0.35, 'triangle'), 180); // E6
    this.vibrate([300, 150, 300, 150, 400]);

    if (this.container) {
      this.container.classList.add('timer-complete');
      setTimeout(() => {
        if (this.container) {
          this.container.classList.remove('timer-complete');
          this.stop();
        }
      }, 4000);
    }
  }

  pause() {
    this.isRunning = false;
    this.stopIntervalOnly();
    this.updateControlsUI();
  }

  resume() {
    if (this.remainingSeconds <= 0) return;
    this.isRunning = true;
    this.updateControlsUI();
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stopIntervalOnly() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  stop() {
    this.stopIntervalOnly();
    this.isRunning = false;
    this.remainingSeconds = 0;
    if (this.container) {
      this.container.classList.add('hidden');
    }
    this.updateControlsUI();
  }

  updateControlsUI() {
    const pauseIcon = document.getElementById('timer-icon-pause');
    const playIcon = document.getElementById('timer-icon-play');
    if (pauseIcon && playIcon) {
      if (this.isRunning) {
        pauseIcon.classList.remove('hidden');
        playIcon.classList.add('hidden');
      } else {
        pauseIcon.classList.add('hidden');
        playIcon.classList.remove('hidden');
      }
    }
  }

  updateUI() {
    const textEl = document.getElementById('timer-display-text');
    if (textEl) {
      const mins = Math.floor(this.remainingSeconds / 60);
      const secs = this.remainingSeconds % 60;
      textEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const ringBar = this.container ? this.container.querySelector('.timer-ring-bar') : null;
    if (ringBar && this.totalSeconds > 0) {
      const radius = 24;
      const circumference = 2 * Math.PI * radius;
      const percent = this.remainingSeconds / this.totalSeconds;
      const offset = circumference * (1 - percent);
      ringBar.style.strokeDasharray = `${circumference}`;
      ringBar.style.strokeDashoffset = `${offset}`;
    }

    this.updateControlsUI();
  }
}

window.RestTimer = new RestTimer();
