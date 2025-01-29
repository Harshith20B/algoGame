const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-button");
const scoresList = document.getElementById("scores-list");
const timerDisplay = document.getElementById("timer");

let maze, player, timer, startTime;
const cellSize = 40;
const rows = 10;
const cols = 10;
const scores = []; // Array to store scores (completion times)

const colors = {
  wall: '#3c4748',      // Dark color for walls
  path: '#208cdc',      // Blue color for player path
  visited: '#cae9ea',    // Light cyan for visited cells
  current: '#1d1d1d',    // Dark color for the current cell
  backtrack: '#e74c3c',  // Red for backtracking
};

class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.generateMaze();
  }

  generateMaze() {
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        visited: false,
        walls: [true, true, true, true], // Top, Right, Bottom, Left
      }))
    );

    const stack = [];
    const startCell = [0, 0];
    stack.push(startCell);

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const cell = grid[x][y];
      if (!cell.visited) {
        cell.visited = true;
        const neighbors = this.getUnvisitedNeighbors(grid, x, y);

        neighbors.forEach(([nx, ny, direction]) => {
          const neighbor = grid[nx][ny];
          cell.walls[direction] = false;
          neighbor.walls[(direction + 2) % 4] = false;
          stack.push([nx, ny]);
        });
      }
    }
    return grid;
  }

  getUnvisitedNeighbors(grid, x, y) {
    const neighbors = [];
    if (x > 0 && !grid[x - 1][y].visited) neighbors.push([x - 1, y, 0]); // Top
    if (y < cols - 1 && !grid[x][y + 1].visited) neighbors.push([x, y + 1, 1]); // Right
    if (x < rows - 1 && !grid[x + 1][y].visited) neighbors.push([x + 1, y, 2]); // Bottom
    if (y > 0 && !grid[x][y - 1].visited) neighbors.push([x, y - 1, 3]); // Left
    return neighbors.sort(() => Math.random() - 0.5); // Shuffle for randomness
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        const px = y * cellSize;
        const py = x * cellSize;

        ctx.strokeStyle = colors.wall;
        ctx.lineWidth = 2;
        if (cell.walls[0]) ctx.strokeRect(px, py, cellSize, 1); // Top
        if (cell.walls[1]) ctx.strokeRect(px + cellSize, py, 1, cellSize); // Right
        if (cell.walls[2]) ctx.strokeRect(px, py + cellSize, cellSize, 1); // Bottom
        if (cell.walls[3]) ctx.strokeRect(px, py, 1, cellSize); // Left
      });
    });
  }
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.path = [];
  }

  move(dx, dy) {
    const cell = maze.grid[this.x][this.y];
    if (dx === -1 && !cell.walls[0]) this.x--;
    if (dy === 1 && !cell.walls[1]) this.y++;
    if (dx === 1 && !cell.walls[2]) this.x++;
    if (dy === -1 && !cell.walls[3]) this.y--;
    this.path.push([this.x, this.y]);
    this.draw();
    if (this.x === rows - 1 && this.y === cols - 1) this.finish();
  }

  draw() {
    maze.draw();
    this.path.forEach(([px, py]) => {
      ctx.fillStyle = colors.path;
      ctx.fillRect(px * cellSize + 5, py * cellSize + 5, cellSize - 10, cellSize - 10);
    });
    ctx.fillStyle = colors.current;
    ctx.fillRect(this.y * cellSize + 5, this.x * cellSize + 5, cellSize - 10, cellSize - 10);
  }

  finish() {
    clearInterval(timer);
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    scores.push(timeTaken);
    scores.sort((a, b) => a - b);
    this.updateScores();
    alert(`You finished the maze in ${timeTaken} seconds!`);
  }

  updateScores() {
    scoresList.innerHTML = scores.map((score) => `<li>${score}s</li>`).join("");
  }
}

function startGame() {
  maze = new Maze(rows, cols);
  player = new Player();
  maze.draw();
  player.draw();
  startTime = Date.now();
  timer = setInterval(() => {
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.innerText = `Time: ${elapsedTime}s`;
  }, 100);
}

startButton.addEventListener("click", startGame);
window.addEventListener("keydown", (e) => {
  if (!player) return;
  if (e.key === "ArrowUp" || e.key === "w") player.move(-1, 0);
  if (e.key === "ArrowRight" || e.key === "d") player.move(0, 1);
  if (e.key === "ArrowDown" || e.key === "s") player.move(1, 0);
  if (e.key === "ArrowLeft" || e.key === "a") player.move(0, -1);
});