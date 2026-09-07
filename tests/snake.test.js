const test = require("node:test");
const assert = require("node:assert/strict");
const Snake = require("../snake");

test("createGame starts a live 3-segment snake moving right with food placed", () => {
  const state = Snake.createGame(10, 10);
  assert.equal(state.snake.length, 3);
  assert.deepEqual(state.direction, { x: 1, y: 0 });
  assert.equal(state.alive, true);
  assert.equal(state.won, false);
  assert.equal(state.score, 0);
  assert.ok(state.food);
  assert.ok(state.food.x >= 0 && state.food.x < 10);
});

test("turn rejects a direct reversal but accepts a perpendicular turn", () => {
  const state = Snake.createGame(10, 10);
  const reversed = Snake.turn(state, "left");
  assert.deepEqual(reversed.pendingDirection, { x: 1, y: 0 }, "left is the opposite of the initial rightward direction");
  const turned = Snake.turn(state, "up");
  assert.deepEqual(turned.pendingDirection, { x: 0, y: -1 });
});

test("step moves the snake forward and drops the tail when no food is eaten", () => {
  const state = Snake.createGame(10, 10);
  state.food = { x: 0, y: 0 };
  const head = state.snake[0];
  const next = Snake.step(state);
  assert.equal(next.snake.length, 3);
  assert.deepEqual(next.snake[0], { x: head.x + 1, y: head.y });
  assert.equal(next.score, 0);
  assert.equal(next.alive, true);
});

test("step grows the snake and increments score when food is eaten", () => {
  const state = Snake.createGame(10, 10);
  const head = state.snake[0];
  state.food = { x: head.x + 1, y: head.y };
  const next = Snake.step(state, () => 0);
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, { x: head.x + 1, y: head.y });
});

test("step kills the snake on wall collision", () => {
  const state = Snake.createGame(5, 5);
  state.snake = [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }];
  state.direction = Snake.DIRECTIONS.right;
  state.pendingDirection = Snake.DIRECTIONS.right;
  state.food = { x: 0, y: 0 };
  const next = Snake.step(state);
  assert.equal(next.alive, false);
});

test("step kills the snake on self collision", () => {
  const state = Snake.createGame(10, 10);
  state.snake = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 2, y: 2 }];
  state.direction = Snake.DIRECTIONS.up;
  state.pendingDirection = { x: 0, y: 1 };
  state.food = { x: 9, y: 9 };
  const next = Snake.step(state);
  assert.equal(next.alive, false);
});

test("turn and step are no-ops once the game has ended", () => {
  const dead = { ...Snake.createGame(10, 10), alive: false };
  assert.deepEqual(Snake.step(dead), dead);
  assert.deepEqual(Snake.turn(dead, "up"), dead);
});

test("freeCells and placeFood never select an occupied cell", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
  const cells = Snake.freeCells(2, 2, snake);
  assert.equal(cells.length, 1);
  assert.deepEqual(cells[0], { x: 1, y: 1 });
  assert.deepEqual(Snake.placeFood(2, 2, snake), { x: 1, y: 1 });
});

test("placeFood returns null when the board is completely full", () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
  assert.equal(Snake.placeFood(2, 2, snake), null);
});
