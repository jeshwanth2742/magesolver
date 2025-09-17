const TILE_SIZE = 9;
let mazeMatrix;
let player = { row: 0, col: 0 };
let exit = { row: 60, col: 60 };

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Pages
const startPage = document.getElementById("start-page");
const gamePage = document.getElementById("game-page");
const winPage = document.getElementById("win-page");

// Buttons
const startBtn = document.getElementById("start-btn");
const exitBtn = document.getElementById("exit-to-start");
const replayBtn = document.getElementById("replay-btn");
const backBtn = document.getElementById("back-btn");

// HUD
const timerEl = document.getElementById("timer");
const coordsEl = document.getElementById("coords");
const finalTimeEl = document.getElementById("final-time");

let startTime, timerInterval;

// Load maze JSON
fetch("maze_matrix_61x61.json")
  .then(res => res.json())
  .then(data => {
    mazeMatrix = data;
  });

// Navigation between pages
function showPage(page) {
  [startPage, gamePage, winPage].forEach(p => p.classList.remove("active"));
  page.classList.add("active");
}

// Reset player
function resetGame() {
  player = { row: 0, col: 0 };
  startTime = null;
  timerEl.textContent = "Time: 0.00s";
  coordsEl.textContent = "";
  clearInterval(timerInterval);
  drawPlayer();
}

// Draw maze
function drawMaze() {
  ctx.fillStyle = "#cfcfcf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < mazeMatrix.length; r++) {
    for (let c = 0; c < mazeMatrix[r].length; c++) {
      if (mazeMatrix[r][c] === 1) {
        ctx.fillStyle = "#000";
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // White dot
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          c * TILE_SIZE + TILE_SIZE / 2,
          r * TILE_SIZE + TILE_SIZE / 2,
          1.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Exit marker
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.arc(
    exit.col * TILE_SIZE + TILE_SIZE / 2,
    exit.row * TILE_SIZE + TILE_SIZE / 2,
    4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Draw player
function drawPlayer() {
  if (!mazeMatrix) return;
  drawMaze();
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.arc(
    player.col * TILE_SIZE + TILE_SIZE / 2,
    player.row * TILE_SIZE + TILE_SIZE / 2,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  coordsEl.textContent = `(${player.row}, ${player.col})`;
}

// Timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    let elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `Time: ${elapsed.toFixed(2)}s`;
  }, 100);
}

// Movement
function movePlayer(dr, dc) {
  let newRow = player.row + dr;
  let newCol = player.col + dc;

  if (
    newRow >= 0 &&
    newRow < mazeMatrix.length &&
    newCol >= 0 &&
    newCol < mazeMatrix[0].length &&
    mazeMatrix[newRow][newCol] === 0
  ) {
    player.row = newRow;
    player.col = newCol;
    drawPlayer();

    // Start timer at first move
    if (!startTime) startTimer();

    // Win condition
    if (player.row === exit.row && player.col === exit.col) {
      clearInterval(timerInterval);
      let elapsed = (Date.now() - startTime) / 1000;
      finalTimeEl.textContent = `Your Time: ${elapsed.toFixed(2)}s`;
      showPage(winPage);
    }
  }
}

// Controls (keyboard)
document.addEventListener("keydown", (e) => {
  if (!gamePage.classList.contains("active")) return;

  if (e.key === "ArrowUp" || e.key === "w") movePlayer(-1, 0);
  if (e.key === "ArrowDown" || e.key === "s") movePlayer(1, 0);
  if (e.key === "ArrowLeft" || e.key === "a") movePlayer(0, -1);
  if (e.key === "ArrowRight" || e.key === "d") movePlayer(0, 1);
});

// Mobile arrows
document.getElementById("up-btn").onclick = () => movePlayer(-1, 0);
document.getElementById("down-btn").onclick = () => movePlayer(1, 0);
document.getElementById("left-btn").onclick = () => movePlayer(0, -1);
document.getElementById("right-btn").onclick = () => movePlayer(0, 1);

// Page buttons
startBtn.onclick = () => {
  resetGame();
  showPage(gamePage);
};
exitBtn.onclick = () => {
  resetGame();
  showPage(startPage);
};
replayBtn.onclick = () => {
  resetGame();
  showPage(gamePage);
};
backBtn.onclick = () => {
  resetGame();
  showPage(startPage);
};


