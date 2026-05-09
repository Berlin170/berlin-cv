// Sound system: real Win98 startup/logoff WAVs + Web Audio synthesized clicks.
// User can mute via taskbar speaker icon. Persists in localStorage.

const KEY = "berlin98:sound";

const state = {
  enabled: localStorage.getItem(KEY) !== "off",
  ctx: null,
  unlocked: false,
  startupPlayed: false
};

function ensureCtx() {
  if (!state.ctx && typeof AudioContext !== "undefined") {
    state.ctx = new AudioContext();
  }
  return state.ctx;
}

function unlock() {
  if (state.unlocked) return;
  const ctx = ensureCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  state.unlocked = true;
  // Startup chord is opt-in only — play it via Start menu "Restart" or similar.
  // Auto-playing on first interaction was too loud / intrusive.
}

// Manual trigger for the iconic Win98 startup chord (e.g. wired to a button)
export function playStartup() {
  if (!state.enabled) return;
  playFile("/assets/sounds/startup.wav");
}

function playFile(src) {
  if (!state.enabled) return;
  const a = new Audio(src);
  a.volume = 0.5;
  a.play().catch(() => {});
}

// Synthesize a short click — Win98-ish "tick"
function tick() {
  if (!state.enabled) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 1200;
  g.gain.value = 0.06;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  o.stop(ctx.currentTime + 0.05);
}

// Two-tone descending — closing a window
function closeBlip() {
  if (!state.enabled) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  [880, 440].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime + i * 0.06;
    o.start(t0);
    g.gain.setValueAtTime(0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    o.stop(t0 + 0.09);
  });
}

// Ascending two-tone — opening
function openBlip() {
  if (!state.enabled) return;
  const ctx = ensureCtx();
  if (!ctx) return;
  [660, 880].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime + i * 0.05;
    o.start(t0);
    g.gain.setValueAtTime(0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    o.stop(t0 + 0.09);
  });
}

function toggleSound() {
  state.enabled = !state.enabled;
  localStorage.setItem(KEY, state.enabled ? "on" : "off");
  updateSoundIcon();
  if (state.enabled) tick();
}

function updateSoundIcon() {
  const btn = document.getElementById("sound-toggle");
  if (!btn) return;
  btn.textContent = state.enabled ? "🔊" : "🔇";
  btn.title = state.enabled ? "Sound: on (click to mute)" : "Sound: muted (click to unmute)";
}

export function initSound() {
  updateSoundIcon();

  document.getElementById("sound-toggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  // First user gesture unlocks audio + plays Win98 startup chord
  const onFirstInteract = () => {
    unlock();
    document.removeEventListener("click", onFirstInteract);
    document.removeEventListener("keydown", onFirstInteract);
  };
  document.addEventListener("click", onFirstInteract, { once: false });
  document.addEventListener("keydown", onFirstInteract, { once: false });

  // Hook into window events
  document.addEventListener("win:open", openBlip);
  document.addEventListener("win:close", closeBlip);

  // Click feedback on desktop icons + start menu items + taskbar buttons
  document.querySelectorAll(".desktop-icon, .start-list li:not(.divider), .taskbar-btn, #start-btn").forEach(el => {
    el.addEventListener("click", tick);
  });
}
