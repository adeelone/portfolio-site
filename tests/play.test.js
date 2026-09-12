const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadPlayController() {
  const documentListeners = new Map();
  const buttonListeners = new Map();
  let createCount = 0;
  let lastTurn = null;

  const canvas = {
    width: 440,
    height: 440,
    getContext: () => ({ fillRect() {}, fillStyle: "" })
  };
  const score = { textContent: "" };
  const best = { textContent: "" };
  const status = { textContent: "" };
  const toggle = {
    textContent: "Start",
    addEventListener: (type, listener) => buttonListeners.set(type, listener)
  };
  const body = {};
  const elements = new Map([
    ["#play-canvas", canvas],
    ["#play-score", score],
    ["#play-best", best],
    ["#play-status", status],
    ["#play-toggle", toggle],
    ["#resume-dialog", null]
  ]);
  const document = {
    body,
    hidden: false,
    documentElement: {},
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: () => [],
    addEventListener: (type, listener) => documentListeners.set(type, listener)
  };
  const Snake = {
    createGame() {
      createCount += 1;
      return { snake: [{ x: 1, y: 1 }], food: { x: 2, y: 1 }, score: 0, alive: true, won: false };
    },
    step: (state) => state,
    turn(state, direction) {
      lastTurn = direction;
      return state;
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, "..", "play.js"), "utf8");
  vm.runInNewContext(source, {
    document,
    window: { Snake, localStorage: { getItem: () => null, setItem() {} } },
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    setInterval: () => 1,
    clearInterval() {}
  });

  return {
    body,
    document,
    status,
    toggle,
    click: () => buttonListeners.get("click")(),
    keydown: (event) => documentListeners.get("keydown")({ preventDefault() {}, ...event }),
    hide: () => {
      document.hidden = true;
      documentListeners.get("visibilitychange")();
    },
    createCount: () => createCount,
    lastTurn: () => lastTurn
  };
}

test("the game button starts and restarts a round", () => {
  const controller = loadPlayController();
  assert.equal(controller.createCount(), 1);
  controller.click();
  assert.equal(controller.toggle.textContent, "Restart");
  assert.equal(controller.createCount(), 2);
  controller.click();
  assert.equal(controller.toggle.textContent, "Restart");
  assert.equal(controller.createCount(), 3);
});

test("an arrow key starts the game in the requested direction", () => {
  const controller = loadPlayController();
  controller.keydown({ key: "ArrowUp", target: controller.body });
  assert.equal(controller.toggle.textContent, "Restart");
  assert.equal(controller.lastTurn(), "up");
});

test("global Enter handling does not hijack focused controls", () => {
  const controller = loadPlayController();
  controller.keydown({ key: "Enter", target: controller.toggle });
  assert.equal(controller.createCount(), 1);
  assert.equal(controller.toggle.textContent, "Start");
});

test("backgrounding an active round ends it with an accurate label", () => {
  const controller = loadPlayController();
  controller.click();
  controller.hide();
  assert.equal(controller.toggle.textContent, "Start");
  assert.match(controller.status.textContent, /Round ended/);
});
