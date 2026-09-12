(function () {
  const canvas = document.querySelector("#play-canvas");
  if (!canvas || !window.Snake) return;

  const ctx = canvas.getContext("2d");
  const scoreEl = document.querySelector("#play-score");
  const bestEl = document.querySelector("#play-best");
  const statusEl = document.querySelector("#play-status");
  const toggleButton = document.querySelector("#play-toggle");

  const GRID = 22;
  const CELL = canvas.width / GRID;
  const TICK_MS = 130;
  const BEST_KEY = "snake-best-score";

  function readBest() {
    try {
      return Number(window.localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch {
      /* best score just won't persist this session */
    }
  }

  let best = readBest();
  let state = window.Snake.createGame(GRID, GRID);
  let timer = null;
  let running = false;

  function paint() {
    const styles = getComputedStyle(document.documentElement);
    ctx.fillStyle = styles.getPropertyValue("--paper").trim() || "#f7f5ef";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.food) {
      ctx.fillStyle = styles.getPropertyValue("--rust").trim() || "#b93d24";
      ctx.fillRect(state.food.x * CELL + 2, state.food.y * CELL + 2, CELL - 4, CELL - 4);
    }

    ctx.fillStyle = styles.getPropertyValue("--ink").trim() || "#171b20";
    state.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? (styles.getPropertyValue("--blue").trim() || "#0759c7") : (styles.getPropertyValue("--ink").trim() || "#171b20");
      ctx.fillRect(segment.x * CELL + 1, segment.y * CELL + 1, CELL - 2, CELL - 2);
    });

    scoreEl.textContent = String(state.score);
    bestEl.textContent = String(Math.max(best, state.score));
  }

  function announce(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    running = false;
  }

  function endRound() {
    stop();
    if (state.score > best) {
      best = state.score;
      writeBest(best);
      announce(`New best score: ${best}. Press Start to play again.`);
    } else {
      announce(`Game over. Score ${state.score}. Press Start to play again.`);
    }
    toggleButton.textContent = "Start";
    paint();
  }

  function tick() {
    state = window.Snake.step(state);
    if (!state.alive) return endRound();
    if (state.won) {
      stop();
      announce(`You filled the board! Final score ${state.score}.`);
      toggleButton.textContent = "Start";
      return paint();
    }
    paint();
  }

  function start() {
    if (running) stop();
    state = window.Snake.createGame(GRID, GRID);
    running = true;
    toggleButton.textContent = "Restart";
    announce("Go. Arrow keys or WASD to steer.");
    paint();
    timer = setInterval(tick, TICK_MS);
  }

  function steer(directionName) {
    if (!running) start();
    state = window.Snake.turn(state, directionName);
  }

  const ARROW_DIRECTIONS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  const WASD_DIRECTIONS = { w: "up", s: "down", a: "left", d: "right" };

  document.addEventListener("keydown", (event) => {
    if (document.querySelector("#resume-dialog")?.open) return;
    const direction = ARROW_DIRECTIONS[event.key] || WASD_DIRECTIONS[event.key.toLowerCase()];
    if (direction) {
      event.preventDefault();
      steer(direction);
      return;
    }
    if (!running && event.target === document.body && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      start();
    }
  });

  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => steer(button.dataset.direction));
  });

  toggleButton?.addEventListener("click", start);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      stop();
      toggleButton.textContent = "Start";
      announce("Round ended while this tab was in the background. Press Start to play again.");
    }
  });

  bestEl.textContent = String(best);
  paint();
})();
