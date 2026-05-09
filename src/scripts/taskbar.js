import { isMinimized, toggleMinimize, openWindow } from "./window-manager.js";

const ICON_MAP = {
  about:       "/assets/icons/computer.svg",
  experience:  "/assets/icons/briefcase.svg",
  projects:    "/assets/icons/folder.svg",
  skills:      "/assets/icons/toolbox.svg",
  contact:     "/assets/icons/mail.svg",
  minesweeper: "/assets/icons/minesweeper.svg",
  recycle:     "/assets/icons/recycle.svg"
};

function tickClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  el.textContent = `${hh}:${mm}`;
}

function ensureTaskbarBtn(id, label) {
  const host = document.getElementById("taskbar-windows");
  if (!host) return null;
  let btn = host.querySelector(`[data-tb="${id}"]`);
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "taskbar-btn";
    btn.dataset.tb = id;
    const img = document.createElement("img");
    img.src = ICON_MAP[id] || "";
    img.alt = "";
    const span = document.createElement("span");
    span.textContent = label;
    btn.appendChild(img);
    btn.appendChild(span);
    btn.addEventListener("click", () => {
      if (isMinimized(id)) {
        toggleMinimize(id);
      } else {
        // If active → minimize; else focus
        if (btn.classList.contains("active")) {
          toggleMinimize(id);
        } else {
          openWindow(id);
        }
      }
    });
    host.appendChild(btn);
  }
  return btn;
}

function setActiveBtn(activeId) {
  document.querySelectorAll(".taskbar-btn").forEach(b => {
    if (b.dataset.tb === activeId) b.classList.add("active");
    else b.classList.remove("active");
  });
}

function removeBtn(id) {
  const host = document.getElementById("taskbar-windows");
  host?.querySelector(`[data-tb="${id}"]`)?.remove();
}

export function initTaskbar() {
  tickClock();
  setInterval(tickClock, 30 * 1000);

  document.addEventListener("win:open", (e) => {
    const { id, label } = e.detail;
    ensureTaskbarBtn(id, label);
    setActiveBtn(id);
  });
  document.addEventListener("win:focus", (e) => {
    setActiveBtn(e.detail.id);
  });
  document.addEventListener("win:close", (e) => {
    removeBtn(e.detail.id);
    setActiveBtn(null);
  });

  // Start menu
  const startBtn = document.getElementById("start-btn");
  const startMenu = document.getElementById("start-menu");
  startBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    startMenu?.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!startMenu) return;
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.remove("open");
    }
  });
  startMenu?.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      startMenu.classList.remove("open");
      const id = li.dataset.icon;
      const ext = li.dataset.external;
      if (ext) { window.open(ext, "_blank", "noopener,noreferrer"); return; }
      if (id === "resume") {
        const a = document.createElement("a");
        a.href = "/Rafiq-Ahmed-CV.pdf";
        a.download = "Rafiq-Ahmed-CV.pdf";
        a.click();
        return;
      }
      if (id) openWindow(id);
    });
  });
}
