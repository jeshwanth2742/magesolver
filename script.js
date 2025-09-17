const TILE_SIZE = 9;
let mazeMatrix;
let player = { row: 0, col: 0 };
let exit = { row: 60, col: 60 };

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Images
const mageImg = new Image();
mageImg.src = "assets/mage.png";
const goalImg = new Image();
goalImg.src = "assets/goal.png";

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
    drawGame();
  });

// Page switching
function showPage(page) {
  [startPage, gamePage, winPage].forEach(p => p.classList.remove("active"));
  page.classList.add("active");
}

// Reset game state
function resetGame() {
  player = { row: 0, col: 0 };
  clearInterval(timerInterval);
  startTime = null;
  timerEl.textContent = "Time: 0.00s";
  coordsEl.textContent = "";
  drawGame();
}

// Timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    let elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `Time: ${elapsed.toFixed(2)}s`;
  }, 100);
}

// Draw Maze Grid
function drawMaze() {
  ctx.fillStyle = "#cfcfcf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  for (let r = 0; r < mazeMatrix.length; r++) {
    for (let c = 0; c < mazeMatrix[r].length; c++) {
      if (mazeMatrix[r][c] === 1) {
        ctx.fillStyle = "#000";
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Decorative white dot
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          c * TILE_SIZE + TILE_SIZE / 2,
          r * TILE_SIZE + TILE_SIZE / 2,
          1.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

// Draw player + exit
function drawGame() {
  if (!mazeMatrix) return;

  drawMaze();

  // Goal
  ctx.drawImage(
    goalImg,
    exit.col * TILE_SIZE,
    exit.row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );

  // Player
  ctx.drawImage(
    mageImg,
    player.col * TILE_SIZE,
    player.row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );

  coordsEl.textContent = `(${player.row}, ${player.col})`;
}

// Move
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
    drawGame();

    if (!startTime) startTimer();

    if (player.row === exit.row && player.col === exit.col) {
      clearInterval(timerInterval);
      let elapsed = (Date.now() - startTime) / 1000;
      finalTimeEl.textContent = `Your Time: ${elapsed.toFixed(2)}s`;
      showPage(winPage);
    }
  }
}

// Keyboard
document.addEventListener("keydown", (e) => {
  if (!gamePage.classList.contains("active")) return;

  if (e.key === "ArrowUp" || e.key === "w") movePlayer(-1, 0);
  if (e.key === "ArrowDown" || e.key === "s") movePlayer(1, 0);
  if (e.key === "ArrowLeft" || e.key === "a") movePlayer(0, -1);
  if (e.key === "ArrowRight" || e.key === "d") movePlayer(0, 1);
});

// Mobile buttons
document.getElementById("up-btn").onclick = () => movePlayer(-1, 0);
document.getElementById("down-btn").onclick = () => movePlayer(1, 0);
document.getElementById("left-btn").onclick = () => movePlayer(0, -1);
document.getElementById("right-btn").onclick = () => movePlayer(0, 1);

// Buttons
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

