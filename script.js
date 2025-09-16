// ==================== PAGE HANDLING ====================
const pages = {
  start: document.getElementById("start-page"),
  username: document.getElementById("username-page"),
  level: document.getElementById("level-page"),
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
  if (username) showPage("level");
});
document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    startGame(btn.dataset.level);
  });
});
document.getElementById("replay-btn").addEventListener("click", () => showPage("level"));
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

// ==================== DEMO MAZES ====================
const mazes = {
  easy: [
    [1,1,0,0,0],
    [0,1,0,1,1],
    [0,1,1,1,0],
    [0,0,0,1,0],
    [0,0,0,1,1]
  ],
  medium: [
    [1,1,0,0,0,0,0],
    [0,1,1,1,0,1,0],
    [0,0,0,1,0,1,0],
    [0,1,0,1,1,1,0],
    [0,1,0,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,0,0,0,0,1,1]
  ],
  hard: [
    [1,1,0,0,0,0,0,0,0],
    [0,1,0,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,0,1,0],
    [0,0,0,0,0,1,0,1,0],
    [1,1,1,1,0,1,0,1,0],
    [1,0,0,1,0,1,0,1,0],
    [1,1,0,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1]
  ]
};

// ==================== GAME LOOP ====================
function startGame(level) {
  maze = mazes[level];
  cellSize = canvas.width / maze.length;

  // Find start (top-left 1) and goal (bottom-right 1)
  mage = { x: 0, y: 0 };
  goal = { x: maze.length - 1, y: maze.length - 1 };

  timer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer += 0.1;
    document.getElementById("timer").innerText = `Time: ${timer.toFixed(2)}s`;
  }, 100);

  showPage("game");
  drawMaze();
}

// Draw maze + mage + goal
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // Mage
  const mageImg = new Image();
  mageImg.src = "assets/mage.png";
  ctx.drawImage(mageImg, mage.x * cellSize, mage.y * cellSize, cellSize, cellSize);

  // Goal
  const goalImg = new Image();
  goalImg.src = "assets/goal.png";
  ctx.drawImage(goalImg, goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
}

// ==================== MOVEMENT ====================
window.addEventListener("keydown", (e) => {
  let newX = mage.x;
  let newY = mage.y;

  if (e.key === "ArrowUp") newY--;
  if (e.key === "ArrowDown") newY++;
  if (e.key === "ArrowLeft") newX--;
  if (e.key === "ArrowRight") newX++;

  if (maze[newY] && maze[newY][newX] === 1) {
    mage.x = newX;
    mage.y = newY;
  }

  drawMaze();

  if (mage.x === goal.x && mage.y === goal.y) {
    gameComplete();
  }
});

// ==================== GAME COMPLETE ====================
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy, limit } 
  from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function gameComplete() {
  clearInterval(timerInterval);

  // Save score to Firestore
  const db = window.db;
  const ref = doc(db, "leaderboard", username);
  const snap = await getDoc(ref);

  if (!snap.exists() || timer < snap.data().bestTime) {
    await setDoc(ref, {
      username: username,
      bestTime: timer
    });
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
    li.innerText = `${rank}. ${data.username} — ${data.bestTime.toFixed(2)}s`;
    leaderboardList.appendChild(li);
    rank++;
  });
}

