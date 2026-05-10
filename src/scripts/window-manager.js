// Window manager: open / close / minimize / drag / z-index / focus.
// Vanilla JS, no framework.

const state = {
  zTop: 10,
  active: null,
  cascade: 0,
  open: new Set()
};

const TASKBAR_HEIGHT = 36;
const CASCADE_STEP = 30;

function bringToFront(win) {
  state.zTop += 1;
  win.style.zIndex = String(state.zTop);
  document.querySelectorAll(".win").forEach(w => w.classList.add("inactive"));
  win.classList.remove("inactive");
  state.active = win.dataset.icon;
  document.dispatchEvent(new CustomEvent("win:focus", { detail: { id: win.dataset.icon } }));
}

function placeWindow(win) {
  if (win.dataset.placed === "1") return;
  const w = win.offsetWidth || 600;
  const h = win.offsetHeight || 400;
  const baseX = Math.max(140, Math.floor((window.innerWidth - w) / 2) - 80);
  const baseY = Math.max(30, Math.floor((window.innerHeight - h - TASKBAR_HEIGHT) / 2) - 60);
  const offset = state.cascade * CASCADE_STEP;
  let x = baseX + offset;
  let y = baseY + offset;
  const maxX = window.innerWidth - w - 20;
  const maxY = window.innerHeight - h - TASKBAR_HEIGHT - 20;
  if (x > maxX) x = baseX + (offset % 240);
  if (y > maxY) y = baseY + (offset % 160);
  win.style.left = x + "px";
  win.style.top = y + "px";
  win.dataset.placed = "1";
  state.cascade += 1;
}

export function openWindow(id) {
  const win = document.querySelector(`.win[data-icon="${id}"]`);
  if (!win) return;

  if (state.open.has(id)) {
    win.classList.remove("minimized");
    bringToFront(win);
    return;
  }

  win.classList.add("open");
  placeWindow(win);
  bringToFront(win);
  state.open.add(id);
  document.dispatchEvent(new CustomEvent("win:open", {
    detail: { id, label: win.dataset.label || id, icon: win.dataset.iconImg || "" }
  }));
}

export function closeWindow(id) {
  const win = document.querySelector(`.win[data-icon="${id}"]`);
  if (!win) return;
  win.classList.remove("open", "minimized");
  state.open.delete(id);
  if (state.active === id) state.active = null;
  document.dispatchEvent(new CustomEvent("win:close", { detail: { id } }));
}

export function toggleMinimize(id) {
  const win = document.querySelector(`.win[data-icon="${id}"]`);
  if (!win || !state.open.has(id)) return;
  if (win.classList.contains("minimized")) {
    win.classList.remove("minimized");
    bringToFront(win);
  } else {
    win.classList.add("minimized");
    if (state.active === id) state.active = null;
    document.dispatchEvent(new CustomEvent("win:focus", { detail: { id: null } }));
  }
}

export function isOpen(id) { return state.open.has(id); }
export function isMinimized(id) {
  const win = document.querySelector(`.win[data-icon="${id}"]`);
  return win ? win.classList.contains("minimized") : false;
}

function attachDrag(win) {
  const bar = win.querySelector(".title-bar");
  if (!bar) return;
  let startX = 0, startY = 0, origX = 0, origY = 0, dragging = false;

  const onDown = (e) => {
    if (e.target.closest("button")) return;
    const pt = e.touches ? e.touches[0] : e;
    dragging = true;
    startX = pt.clientX;
    startY = pt.clientY;
    const rect = win.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    bringToFront(win);
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    let nx = origX + (pt.clientX - startX);
    let ny = origY + (pt.clientY - startY);
    const w = win.offsetWidth, h = win.offsetHeight;
    const minX = -w + 60;
    const maxX = window.innerWidth - 60;
    const minY = 0;
    const maxY = window.innerHeight - TASKBAR_HEIGHT - 24;
    nx = Math.max(minX, Math.min(maxX, nx));
    ny = Math.max(minY, Math.min(maxY, ny));
    win.style.left = nx + "px";
    win.style.top = ny + "px";
  };
  const onUp = () => { dragging = false; };

  bar.addEventListener("mousedown", onDown);
  bar.addEventListener("touchstart", onDown, { passive: false });
  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("mouseup", onUp);
  document.addEventListener("touchend", onUp);
}

function attachWindowControls(win) {
  const id = win.dataset.icon;
  const closeBtn = win.querySelector('[aria-label="Close"]');
  const minBtn = win.querySelector('[aria-label="Minimize"]');
  const maxBtn = win.querySelector('[aria-label="Maximize"]');
  if (closeBtn) closeBtn.addEventListener("click", () => closeWindow(id));
  if (minBtn) minBtn.addEventListener("click", () => toggleMinimize(id));
  if (maxBtn) maxBtn.addEventListener("click", () => {
    win.classList.toggle("maximized");
    if (win.classList.contains("maximized")) {
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevTop = win.style.top;
      win.dataset.prevW = win.style.width;
      win.dataset.prevH = win.style.height;
      win.style.left = "0";
      win.style.top = "0";
      win.style.width = "100vw";
      win.style.height = (window.innerHeight - TASKBAR_HEIGHT) + "px";
    } else {
      win.style.left = win.dataset.prevLeft || "";
      win.style.top = win.dataset.prevTop || "";
      win.style.width = win.dataset.prevW || "";
      win.style.height = win.dataset.prevH || "";
    }
  });

  win.addEventListener("mousedown", () => {
    if (state.active !== id) bringToFront(win);
  });
}

export function initWindows() {
  document.querySelectorAll(".win").forEach(win => {
    win.classList.add("inactive");
    attachDrag(win);
    attachWindowControls(win);
  });

  document.querySelectorAll(".desktop-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
      handleIconActivate(icon.dataset.icon);
    });
  });

  document.getElementById("desktop")?.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.active) closeWindow(state.active);
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());
}

function handleIconActivate(id) {
  if (id === "resume") {
    const a = document.createElement("a");
    a.href = "/Rafiq-Ahmed-CV.pdf";
    a.download = "Rafiq-Ahmed-CV.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  if (id === "recycle") {
    openWindow("recycle");
    return;
  }
  openWindow(id);
}

export function initBootScreen() {
  if (sessionStorage.getItem("booted")) return;
  sessionStorage.setItem("booted", "1");

  const boot = document.getElementById("boot-screen");
  if (!boot) return;

  boot.style.display = "flex";
  const fill = document.getElementById("boot-bar-fill");
  const status = document.getElementById("boot-status");

  const messages = [
    "Initializing Berlin Portfolio OS...",
    "Loading community experience...",
    "Mounting Web3 modules...",
    "Starting desktop environment...",
    "Welcome."
  ];

  let step = 0;
  const interval = setInterval(() => {
    step++;
    const pct = Math.min(100, step * 22);
    if (fill) fill.style.width = pct + "%";
    if (status && messages[step]) status.textContent = messages[step];
    if (step >= 4) {
      clearInterval(interval);
      setTimeout(() => {
        boot.style.transition = "opacity 0.8s ease";
        boot.style.opacity = "0";
        setTimeout(() => { boot.style.display = "none"; }, 800);
      }, 600);
    }
  }, 600);
}
