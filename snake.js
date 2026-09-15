(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Snake = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const DIRECTIONS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

  function freeCells(width, height, snake) {
    const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
    const cells = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!occupied.has(`${x},${y}`)) cells.push({ x, y });
      }
    }
    return cells;
  }

  function placeFood(width, height, snake, random = Math.random) {
    const cells = freeCells(width, height, snake);
    if (!cells.length) return null;
    return cells[Math.floor(random() * cells.length)];
  }

  function createGame(width = 22, height = 22) {
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);
    const snake = [{ x: startX, y: startY }, { x: startX - 1, y: startY }, { x: startX - 2, y: startY }];
    return {
      width,
      height,
      snake,
      direction: DIRECTIONS.right,
      pendingDirection: DIRECTIONS.right,
      food: placeFood(width, height, snake),
      score: 0,
      alive: true,
      won: false
    };
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function turn(state, directionName) {
    const requested = DIRECTIONS[directionName];
    if (!requested || !state.alive || state.won || isOpposite(requested, state.direction)) return state;
    return { ...state, pendingDirection: requested };
  }

  function step(state, random = Math.random) {
    if (!state.alive || state.won) return state;
    const direction = state.pendingDirection;
    const head = state.snake[0];
    const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
    const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= state.width || nextHead.y >= state.height;
    const ateFood = Boolean(state.food) && nextHead.x === state.food.x && nextHead.y === state.food.y;
    const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);
    const hitSelf = collisionBody.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);
    if (hitWall || hitSelf) return { ...state, direction, alive: false };

    const body = ateFood ? state.snake : state.snake.slice(0, -1);
    const nextSnake = [nextHead, ...body];
    if (!ateFood) return { ...state, snake: nextSnake, direction };

    const nextFood = placeFood(state.width, state.height, nextSnake, random);
    return { ...state, snake: nextSnake, direction, food: nextFood, score: state.score + 1, won: nextFood === null };
  }

  return { DIRECTIONS, createGame, turn, step, placeFood, freeCells };
});
