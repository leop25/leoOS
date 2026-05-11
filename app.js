const windows = new Map();
let zIndex = 60;
let clockClicks = 0;
let typedBuffer = "";
let toastTimer;
let activeDragCleanup;

const desktop = document.querySelector("#desktop");
const boot = document.querySelector("#boot");
const toast = document.querySelector("#toast");
const eggList = document.querySelector("#egg-list");
const terminalOutput = document.querySelector("#terminal-output");
const terminalForm = document.querySelector("#terminal-form");
const terminalCommand = document.querySelector("#terminal-command");
const menuClock = document.querySelector("#menu-clock");

document.querySelectorAll("[data-window]").forEach((windowNode) => {
  windows.set(windowNode.dataset.window, windowNode);
  windowNode.addEventListener("pointerdown", () => bringToFront(windowNode.dataset.window));
});

window.addEventListener("load", () => {
  setTimeout(() => boot.classList.add("is-hidden"), 1150);
  updateClock();
  setInterval(updateClock, 1000);
});

document.querySelectorAll("[data-open]").forEach((control) => {
  control.addEventListener("click", () => openWindow(control.dataset.open));
});

document.querySelectorAll("[data-close]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.stopPropagation();
    windows.get(control.dataset.close).hidden = true;
  });
});

document.querySelectorAll("[data-zoom]").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.stopPropagation();
    const win = windows.get(control.dataset.zoom);
    win.classList.toggle("is-zoomed");
    bringToFront(control.dataset.zoom);
  });
});

document.querySelector("[data-special='invert']").addEventListener("click", () => {
  desktop.classList.toggle("is-inverted");
  addEgg("Special menu toggled monochrome inversion.");
  notify("Special: screen inversion toggled.");
});

menuClock.addEventListener("click", () => {
  clockClicks += 1;
  if (clockClicks === 3) {
    desktop.classList.add("is-watch-mode");
    addEgg("Clock bezel mode unlocked.");
    notify("Watch mode mounted.");
  }
});

document.querySelectorAll(".title-bar").forEach((bar) => {
  bar.addEventListener("pointerdown", startDrag);
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => filterProjects(button));
});

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = terminalCommand.value.trim();
  if (!raw) return;
  terminalCommand.value = "";
  runCommand(raw);
});

document.addEventListener("keydown", (event) => {
  trackKonami(event.key);
  if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && document.activeElement !== terminalCommand) {
    typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-24);
    checkTypedEggs();
  }
});

function openWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.hidden = false;
  bringToFront(id);
  if (id === "terminal") {
    setTimeout(() => terminalCommand.focus(), 0);
  }
}

function bringToFront(id) {
  const win = windows.get(id);
  if (!win) return;
  document.querySelectorAll(".window").forEach((node) => node.classList.remove("active"));
  win.classList.add("active");
  win.style.zIndex = String(++zIndex);
}

function startDrag(event) {
  const win = event.currentTarget.closest(".window");
  if (!win || window.matchMedia("(max-width: 900px)").matches) return;
  if (event.target.matches("button")) return;
  if (event.button !== 0 || !event.isPrimary) return;

  activeDragCleanup?.();
  bringToFront(win.dataset.window);
  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;
  const originalLeft = win.offsetLeft;
  const originalTop = win.offsetTop;
  const bar = event.currentTarget;
  const pointerId = event.pointerId;

  try {
    bar.setPointerCapture(pointerId);
  } catch {
    // Global listeners below still cover the drag in browsers without capture.
  }

  const move = (moveEvent) => {
    if (moveEvent.pointerId !== pointerId) return;
    const nextLeft = clamp(originalLeft + moveEvent.clientX - startX, 8, window.innerWidth - 140);
    const nextTop = clamp(originalTop + moveEvent.clientY - startY, 34, window.innerHeight - 80);
    win.style.left = `${nextLeft}px`;
    win.style.top = `${nextTop}px`;
  };

  const cleanup = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    window.removeEventListener("blur", cleanup);
    try {
      if (bar.hasPointerCapture(pointerId)) {
        bar.releasePointerCapture(pointerId);
      }
    } catch {
      // Capture can already be gone after pointer cancellation.
    }
    if (activeDragCleanup === cleanup) {
      activeDragCleanup = undefined;
    }
  };

  const stop = (stopEvent) => {
    if (stopEvent.pointerId !== pointerId) return;
    cleanup();
  };

  activeDragCleanup = cleanup;
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("blur", cleanup);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function updateClock() {
  const now = new Date();
  menuClock.textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function filterProjects(activeButton) {
  const filter = activeButton.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((button) => button.classList.remove("selected"));
  activeButton.classList.add("selected");
  document.querySelectorAll(".project-card").forEach((card) => {
    const visible = filter === "all" || card.dataset.kind.split(" ").includes(filter);
    card.classList.toggle("is-hidden", !visible);
  });
}

function runCommand(raw) {
  writeTerminal(`leo@pm-mac:~$ ${raw}`);
  const input = raw.toLowerCase();
  const [command, ...args] = input.split(/\s+/);

  const responses = {
    help:
      "Comandos: whoami, metrics, resume, projects, sources, interests, contact, hackatrouble, lookmate, open <window>, clear, sudo.",
    whoami:
      "Leonardo Penna de Lima - Senior Product Manager focado em produtos de IA, avaliação de LLMs, workflows agênticos e estratégia de produto.",
    metrics:
      "5M+ interações mensais de IA | -75% no tempo de análise de qualidade | -55% no tempo médio de resolução | 10x no volume de crédito.",
    resume:
      "Mercado Livre, iFood, Revelo, Sinch/Wavy. Formação: MBA USP/Esalq, Sistemas de Informação na ESPM, Ciência da Computação na UFSCar.",
    projects:
      "pessoal_website, ai-platform-qlearning, LookMate, Fila Digital, openai-telegram, chatgpt-telegram e projetos universitários em C++.",
    sources:
      "Fontes: LinkedIn, GitHub, Product Hunt, São Carlos em Rede, Medium, about.me e os dois PDFs enviados localmente.",
    interests:
      "Arquivos pessoais: programação, impressão 3D, fotografia, relógios e futebol.",
    contact: "Contato público: LinkedIn /in/leoplima e GitHub @leop25.",
    hackatrouble:
      "Hackatrouble 2020: Fila Digital, segundo lugar na categoria Negócios, criado para filas virtuais durante a pandemia.",
    lookmate:
      "LookMate: lançamento no Product Hunt de um concierge de moda com IA usando recomendações de outfits via GPT-4.",
    sudo: "Boa tentativa. Autoridade de produto exige alinhamento com stakeholders.",
  };

  if (command === "clear") {
    terminalOutput.innerHTML = "";
    return;
  }

  if (command === "open") {
    const target = args[0];
    if (windows.has(target)) {
      openWindow(target);
      writeTerminal(`Opened ${target}.`);
    } else {
      writeTerminal("Janela não encontrada. Tente about, resume, projects, clippings, terminal ou easter.");
    }
    return;
  }

  if (input === "claude" || input === "agent" || input === "agentic") {
    desktop.classList.add("is-agent-mode");
    addEgg("Agent mode enabled from terminal.");
    writeTerminal("Modo agente ativado. Ciclo de PoC comprimido.");
    return;
  }

  if (input === "doleo") {
    addEgg("Doleo passphrase accepted.");
    writeTerminal("Senha aceita. Dados privados de contato continuam desmontados.");
    return;
  }

  writeTerminal(responses[command] || `Command not found: ${raw}`);
}

function writeTerminal(text) {
  const line = document.createElement("p");
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function addEgg(message) {
  openWindow("easter");
  const existing = [...eggList.querySelectorAll("li")].some((item) => item.textContent === message);
  if (!existing) {
    const item = document.createElement("li");
    item.textContent = message;
    eggList.appendChild(item);
  }
}

const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiProgress = 0;

function trackKonami(key) {
  const expected = konami[konamiProgress];
  if (key === expected) {
    konamiProgress += 1;
    if (konamiProgress === konami.length) {
      konamiProgress = 0;
      document.body.classList.toggle("konami");
      addEgg("Código Konami aceito: contraste retrô reforçado.");
      notify("Konami aceito.");
    }
    return;
  }
  konamiProgress = key === konami[0] ? 1 : 0;
}

function checkTypedEggs() {
  const eggs = [
    ["claude", "Rastro de Claude Code detectado. Modo agente pronto."],
    ["leop25", "GitHub handle indexed."],
    ["lookmate", "Outfit recommender artifact recovered."],
    ["fila", "Fila Digital clipping recovered."],
    ["watch", "Arquivo de interesse em relógios aberto."],
  ];

  eggs.forEach(([needle, message]) => {
    if (typedBuffer.endsWith(needle)) {
      if (needle === "claude") desktop.classList.add("is-agent-mode");
      if (needle === "watch") desktop.classList.add("is-watch-mode");
      addEgg(message);
      notify(message);
      typedBuffer = "";
    }
  });
}
