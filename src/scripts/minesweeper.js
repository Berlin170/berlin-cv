// Minesweeper — classic 9x9, 10 mines.

const ROWS = 9, COLS = 9, MINES = 10;

let grid = [];          // {mine, opened, flag, n}
let started = false;
let dead = false;
let timer = 0;
let timerHandle = null;
let flagCount = 0;

function pad(n) { return String(n).padStart(3, "0"); }

function newGame() {
  grid = [];
  started = false;
  dead = false;
  timer = 0;
  flagCount = 0;
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push({ mine: false, opened: false, flag: false, n: 0 });
    grid.push(row);
  }
  render();
  setReset("🙂");
  setMines();
  setTimer();
}

function placeMines(safeR, safeC) {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    if (grid[r][c].mine) continue;
    grid[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) continue;
        if (grid[nr][nc].mine) n++;
      }
      grid[r][c].n = n;
    }
  }
}

function flood(r, c) {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
  const cell = grid[r][c];
  if (cell.opened || cell.flag || cell.mine) return;
  cell.opened = true;
  if (cell.n === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      flood(r + dr, c + dc);
    }
  }
}

function open(r, c) {
  if (dead) return;
  const cell = grid[r][c];
  if (cell.opened || cell.flag) return;
  if (!started) {
    placeMines(r, c);
    started = true;
    timerHandle = setInterval(() => { timer = Math.min(999, timer + 1); setTimer(); }, 1000);
  }
  if (cell.mine) {
    cell.opened = true;
    dead = true;
    clearInterval(timerHandle);
    setReset("💀");
    grid.forEach(row => row.forEach(c => { if (c.mine) c.opened = true; }));
    render();
    return;
  }
  flood(r, c);
  render();
  checkWin();
}

function flag(r, c) {
  if (dead) return;
  const cell = grid[r][c];
  if (cell.opened) return;
  cell.flag = !cell.flag;
  flagCount += cell.flag ? 1 : -1;
  setMines();
  render();
}

function checkWin() {
  let safe = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!grid[r][c].mine && grid[r][c].opened) safe++;
  }
  if (safe === ROWS * COLS - MINES) {
    dead = true;
    clearInterval(timerHandle);
    setReset("😎");
  }
}

function setReset(emoji) {
  const b = document.getElementById("ms-reset");
  if (b) b.textContent = emoji;
}
function setMines() {
  const el = document.getElementById("ms-mines");
  if (el) el.textContent = pad(Math.max(0, MINES - flagCount));
}
function setTimer() {
  const el = document.getElementById("ms-time");
  if (el) el.textContent = pad(timer);
}

function render() {
  const host = document.getElementById("ms-board");
  if (!host) return;
  host.style.gridTemplateColumns = `repeat(${COLS}, 18px)`;
  host.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      const el = document.createElement("div");
      el.className = "mine-cell";
      if (cell.opened) {
        el.classList.add("opened");
        if (cell.mine) {
          el.classList.add("bomb");
          el.textContent = "💣";
        } else if (cell.n > 0) {
          el.classList.add(`mc-${cell.n}`);
          el.textContent = String(cell.n);
        }
      } else if (cell.flag) {
        el.classList.add("flagged");
        el.textContent = "⚑";
      }
      el.addEventListener("click", () => open(r, c));
      el.addEventListener("contextmenu", (e) => { e.preventDefault(); flag(r, c); });
      host.appendChild(el);
    }
  }
}

export function initMinesweeper() {
  const reset = document.getElementById("ms-reset");
  if (!reset) return; // window not present
  reset.addEventListener("click", newGame);
  newGame();
}
