/* =========================
   Maze game (no Firebase)
   - Uses provided 20x20 matrix (0 = path, 1 = wall)
   - Preloads mage + goal PNGs, draws them round + glowing
   - Mobile arrows enabled
   - Accurate timer
   ========================= */

const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game-page');
const winPage = document.getElementById('win-page');
const startBtn = document.getElementById('start-btn');
const replayBtn = document.getElementById('replay-btn');
const backBtn = document.getElementById('back-btn');
const exitBtn = document.getElementById('exit-to-start');
const finalTimeText = document.getElementById('final-time');
const timerEl = document.getElementById('timer');
const coordsEl = document.getElementById('coords');

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Keep canvas square and crisp
function setCanvasSize(px = 600) {
  canvas.width = px;
  canvas.height = px;
}
setCanvasSize(600);

/* --------------------------
   Your provided maze (20x20)
   0 = path, 1 = wall
   -------------------------- */
const maze = [
[0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[0,1,1,1,0,1,0,0,0,1,1,0,0,0,1,1,1,1,1,1],
[0,0,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,1,1,1],
[1,1,0,1,0,0,0,1,0,0,0,0,1,1,1,0,1,1,1,1],
[1,1,0,1,1,1,0,1,1,1,1,0,0,0,1,0,1,1,1,1],
[1,1,0,0,0,1,0,0,0,1,1,1,1,0,1,0,1,1,1,1],
[1,1,1,1,0,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1],
[1,1,1,1,0,0,0,1,0,1,0,1,1,1,1,0,0,0,0,1],
[1,1,1,1,1,1,0,1,0,1,0,0,0,0,0,1,1,1,0,1],
[1,0,0,0,0,1,0,1,0,1,1,1,1,1,0,1,0,0,0,1],
[1,0,1,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,1,1],
[1,0,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
[1,1,0,1,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1],
[1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
[1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,1],
[1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1],
[1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
[1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1],
[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
];

// grid / coords
const GRID = maze.length;
let cellSize = canvas.width / GRID;

// Player start and goal (ensure they are on 0 cells)
let player = { x: 0, y: 0 };
let goal = { x: GRID - 1, y: GRID - 1 };

// make sure start and goal are on paths; if not, find nearest path cell
function ensureStartGoal() {
  if (maze[player.y][player.x] !== 0) {
    outer: for (let y=0;y<GRID;y++){
      for (let x=0;x<GRID;x++){
        if (maze[y][x]===0) { player = {x,y}; break outer; }
      }
    }
  }
  if (maze[goal.y][goal.x] !== 0) {
    outer2: for (let y=GRID-1;y>=0;y--){
      for (let x=GRID-1;x>=0;x--){
        if (maze[y][x]===0) { goal = {x,y}; break outer2; }
      }
    }
  }
}
ensureStartGoal();

/* =======================
   Preload images
   ======================= */
const mageImg = new Image();
mageImg.src = 'assets/mage.png';
let mageLoaded = false;
mageImg.onload = () => { mageLoaded = true; drawMaze(); };

const goalImg = new Image();
goalImg.src = 'assets/goal.png';
let goalLoaded = false;
goalImg.onload = () => { goalLoaded = true; drawMaze(); };

/* =======================
   Timer
   ======================= */
let startTime = 0;
let timerInterval = null;
function startTimer() {
  startTime = Date.now();
  timerEl.textContent = 'Time: 0.00s';
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `Time: ${elapsed.toFixed(2)}s`;
  }, 80);
}
function stopTimer() {
  clearInterval(timerInterval);
  return ((Date.now() - startTime) / 1000).toFixed(2);
}

/* =======================
   Drawing helpers
   ======================= */
function drawMaze() {
  // recompute size if canvas resized or grid changed
  cellSize = canvas.width / GRID;

  // background
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw paths (light) and walls (dark)
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = '#1f1f23'; // wall
        ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#f7f7f7'; // path
        ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      }
    }
  }

  // grid lines (subtle)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let i=0;i<=GRID;i++){
    // vertical
    ctx.beginPath(); ctx.moveTo(i*cellSize,0); ctx.lineTo(i*cellSize,canvas.height); ctx.stroke();
    // horizontal
    ctx.beginPath(); ctx.moveTo(0,i*cellSize); ctx.lineTo(canvas.width,i*cellSize); ctx.stroke();
  }

  // draw goal (image or fallback) with glow
  if (goalLoaded) drawGlowyImage(goalImg, goal.x, goal.y, 'gold');
  else drawGlowyFallback(goal.x, goal.y, 'gold', 'G');

  // draw player (mage)
  if (mageLoaded) drawGlowyImage(mageImg, player.x, player.y, 'cyan');
  else drawGlowyFallback(player.x, player.y, 'cyan', 'M');

  // coords for debug
  coordsEl.textContent = `x:${player.x}, y:${player.y}`;
}

// draw an image clipped to circle with shadow glow
function drawGlowyImage(img, cellX, cellY, glowColor) {
  const cx = cellX * cellSize + cellSize/2;
  const cy = cellY * cellSize + cellSize/2;
  const r = Math.max(cellSize*0.4, 4);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.closePath();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = glowColor;
  ctx.fill(); // glow base
  ctx.clip();

  // draw image to fill the square cell (the clip is circular)
  ctx.drawImage(img, cellX*cellSize, cellY*cellSize, cellSize, cellSize);
  ctx.restore();

  // optional ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

// fallback circular draw (if image not loaded)
function drawGlowyFallback(cellX, cellY, glowColor, label='') {
  const cx = cellX * cellSize + cellSize/2;
  const cy = cellY * cellSize + cellSize/2;
  const r = Math.max(cellSize*0.38, 4);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.closePath();

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = glowColor;
  ctx.fill();

  ctx.restore();

  // label
  if (label) {
    ctx.fillStyle = '#001';
    ctx.font = `${Math.max(12, r)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
  }
}

/* =======================
   Movement & collision
   ======================= */
function canMoveTo(x,y) {
  return x >= 0 && x < GRID && y >= 0 && y < GRID && maze[y][x] === 0;
}

function movePlayer(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!canMoveTo(nx, ny)) return;
  player.x = nx; player.y = ny;
  drawMaze();
  // check win
  if (player.x === goal.x && player.y === goal.y) {
    const final = stopTimer();
    showWin(final);
  }
}

/* Keyboard */
window.addEventListener('keydown', (e) => {
  if (gamePage.classList.contains('active')) {
    if (e.key === 'ArrowUp') movePlayer(0,-1);
    if (e.key === 'ArrowDown') movePlayer(0,1);
    if (e.key === 'ArrowLeft') movePlayer(-1,0);
    if (e.key === 'ArrowRight') movePlayer(1,0);
  }
});

/* Mobile buttons */
document.getElementById('up-btn').addEventListener('touchstart', (e)=>{ e.preventDefault(); movePlayer(0,-1); });
document.getElementById('down-btn').addEventListener('touchstart', (e)=>{ e.preventDefault(); movePlayer(0,1); });
document.getElementById('left-btn').addEventListener('touchstart', (e)=>{ e.preventDefault(); movePlayer(-1,0); });
document.getElementById('right-btn').addEventListener('touchstart', (e)=>{ e.preventDefault(); movePlayer(1,0); });

/* Also allow mouse clicks for mobile testing */
['up-btn','down-btn','left-btn','right-btn'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('click', (ev)=>{ ev.preventDefault(); if (id==='up-btn') movePlayer(0,-1);
    if (id==='down-btn') movePlayer(0,1); if (id==='left-btn') movePlayer(-1,0); if (id==='right-btn') movePlayer(1,0);
  });
});

/* =======================
   Flow controls
   ======================= */
startBtn.addEventListener('click', ()=> {
  startPage.classList.remove('active');
  winPage.classList.remove('active');
  gamePage.classList.add('active');

  // reset positions
  ensureStartGoal();
  drawMaze();
  startTimer();
});

replayBtn.addEventListener('click', ()=> {
  // start new game immediately
  winPage.classList.remove('active');
  gamePage.classList.add('active');
  ensureStartGoal();
  drawMaze();
  startTimer();
});

backBtn.addEventListener('click', ()=> {
  winPage.classList.remove('active');
  startPage.classList.add('active');
});

exitBtn.addEventListener('click', ()=> {
  // go to menu
  gamePage.classList.remove('active');
  startPage.classList.add('active');
  clearInterval(timerInterval);
});

function showWin(timeStr) {
  gamePage.classList.remove('active');
  finalTimeText.textContent = `You finished in ${timeStr} seconds!`;
  winPage.classList.add('active');
}

/* initial draw */
drawMaze();


