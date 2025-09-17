const startPage = document.getElementById("start-page");
const gamePage = document.getElementById("game-page");
const winPage = document.getElementById("win-page");
const startBtn = document.getElementById("start-btn");
const replayBtn = document.getElementById("replay-btn");
const finalTimeText = document.getElementById("final-time");
const timerEl = document.getElementById("timer");

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const tileSize = 30; // 20x20 grid on 600x600

// 🌀 Complex Maze (1=wall, 0=path)
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 1, y: 1 };
let goal = { x: 18, y: 18 };

let startTime, interval;

// 🎮 Draw Maze
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#333";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // Goal glow
  ctx.fillStyle = "lime";
  ctx.shadowColor = "lime";
  ctx.shadowBlur = 20;
  ctx.fillRect(goal.x * tileSize, goal.y * tileSize, tileSize, tileSize);

  // Player glow
  ctx.fillStyle = "cyan";
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(
    player.x * tileSize + tileSize / 2,
    player.y * tileSize + tileSize / 2,
    tileSize / 2.5,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// 🎯 Move Player
function movePlayer(dx, dy) {
  let newX = player.x + dx;
  let newY = player.y + dy;
  if (maze[newY][newX] === 0) {
    player.x = newX;
    player.y = newY;
    if (player.x === goal.x && player.y === goal.y) {
      winGame();
    }
  }
  drawMaze();
}

// ⏱ Timer
function startTimer() {
  startTime = Date.now();
  interval = setInterval(() => {
    let elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `Time: ${elapsed.toFixed(2)}s`;
  }, 100);
}

function stopTimer() {
  clearInterval(interval);
  return ((Date.now() - startTime) / 1000).toFixed(2);
}

// 🏆 Win
function winGame() {
  let time = stopTimer();
  gamePage.classList.remove("active");
  winPage.classList.add("active");
  finalTimeText.textContent = `You finished in ${time} seconds!`;
}

// 🎮 Keyboard Controls
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  if (e.key === "ArrowDown") movePlayer(0, 1);
  if (e.key === "ArrowLeft") movePlayer(-1, 0);
  if (e.key === "ArrowRight") movePlayer(1, 0);
});

// ▶ Start Game
startBtn.addEventListener("click", () => {
  startPage.classList.remove("active");
  gamePage.classList.add("active");
  player = { x: 1, y: 1 };
  drawMaze();
  startTimer();
});

// 🔁 Replay
replayBtn.addEventListener("click", () => {
  winPage.classList.remove("active");
  gamePage.classList.add("active");
  player = { x: 1, y: 1 };
  drawMaze();
  startTimer();
});


