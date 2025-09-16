// ==================== PAGE HANDLING ====================
const pages = {
  start: document.getElementById("start-page"),
  username: document.getElementById("username-page"),
  game: document.getElementById("game-page"),
  leaderboard: document.getElementById("leaderboard-page"),
};

function showPage(name) {
  Object.values(pages).forEach(p => p.classList.remove("active"));
  pages[name].classList.add("active");
}

// Buttons
document.getElementById("start-btn").addEventListener("click", () => showPage("username"));
document.getElementById("play-btn").addEventListener("click", () => {
  username = document.getElementById("username-input").value.trim();
  if (username) startGame();
});
document.getElementById("replay-btn").addEventListener("click", startGame);
document.getElementById("exit-btn").addEventListener("click", () => showPage("start"));

// ==================== GAME VARIABLES ====================
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let username = "";
let timer = 0;
let timerInterval = null;

let maze = [];
let cellSize = 40;
let mage = { x: 0, y: 0 };
let goal = { x: 0, y: 0 };

// ==================== HARD MAZE 20x20 (more complex) ====================
maze = [
 [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
 [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
 [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
 [1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
 [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
 [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
 [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
 [1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
 [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
 [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
 [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
 [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ==================== PRELOAD IMAGES ====================
const mageImg = new Image();
mageImg.src = "assets/mage.png";

const goalImg = new Image();
goalImg.src = "assets/goal.png";

// ==================== GAME LOOP ====================
function startGame() {
  cellSize = canvas.width / maze.length;

  mage = { x: 0, y: 0 };
  goal = { x: maze[0].length - 1, y: maze.length - 1 };

  timer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer += 0.1;
    document.getElementById("timer").innerText = `Time: ${timer.toFixed(2)}s`;
  }, 100);

  showPage("game");
  drawMaze();
}

// ==================== DRAW MAZE ====================
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

      if (maze[y][x] === 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw Mage & Goal each frame (glowy)
  drawGlowyCircle(mageImg, mage.x, mage.y, "cyan");
  drawGlowyCircle(goalImg, goal.x, goal.y, "gold");
}

// Draw round glowy image
function drawGlowyCircle(img, x, y, glowColor) {
  const centerX = x * cellSize + cellSize / 2;
  const centerY = y * cellSize + cellSize / 2;
  const radius = cellSize / 2 - 2;

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x * cellSize, y * cellSize, cellSize, cellSize);
  ctx.restore();
}

// ==================== MOVEMENT ====================
function moveMage(dx, dy) {
  const newX = mage.x + dx;
  const newY = mage.y + dy;
  if (maze[newY] && maze[newY][newX] === 1) {
    mage.x = newX;
    mage.y = newY;
    drawMaze();
    if (mage.x === goal.x && mage.y === goal.y) gameComplete();
  }
}

// Keyboard controls
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") moveMage(0, -1);
  if (e.key === "ArrowDown") moveMage(0, 1);
  if (e.key === "ArrowLeft") moveMage(-1, 0);
  if (e.key === "ArrowRight") moveMage(1, 0);
});

// ==================== MOBILE CONTROLS ====================
document.getElementById("up-btn").addEventListener("click", () => moveMage(0, -1));
document.getElementById("down-btn").addEventListener("click", () => moveMage(0, 1));
document.getElementById("left-btn").addEventListener("click", () => moveMage(-1, 0));
document.getElementById("right-btn").addEventListener("click", () => moveMage(1, 0));

// ==================== GAME COMPLETE ====================
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy, limit } 
  from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function gameComplete() {
  clearInterval(timerInterval);

  const db = window.db;
  const ref = doc(db, "leaderboard", username);
  const snap = await getDoc(ref);

  if (!snap.exists() || timer < snap.data().bestTime) {
    await setDoc(ref, { username: username, bestTime: timer }, { merge: true });
  }

  loadLeaderboard();
  showPage("leaderboard");
}

// ==================== LEADERBOARD ====================
async function loadLeaderboard() {
  const db = window.db;
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  const q = query(collection(db, "leaderboard"), orderBy("bestTime", "asc"), limit(20));
  const querySnapshot = await getDocs(q);

  let rank = 1;
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `<span>${rank}. ${data.username}</span> — <span>${data.bestTime.toFixed(2)}s</span>`;
    leaderboardList.appendChild(li);
    rank++;
  });
}

