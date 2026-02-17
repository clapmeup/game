/* Combined: Snake + Tic Tac Toe (switchable). Author: GitHub Copilot (Raptor mini Preview) */
// ---------- Game switcher UI ----------
const switchSnakeBtn = document.getElementById('switch-snake');
const switchTttBtn = document.getElementById('switch-ttt');
const snakeContainer = document.getElementById('snakeContainer');
const tttContainer = document.getElementById('tttContainer');
const snakeScoreboard = document.getElementById('snakeScoreboard');
const tttScoreboard = document.getElementById('tttScoreboard');

let currentGame = 'snake';
function showGame(name) {
  currentGame = name;
  if (name === 'snake') {
    switchSnakeBtn.classList.add('active');
    switchTttBtn.classList.remove('active');
    snakeContainer.classList.remove('hidden');
    tttContainer.classList.add('hidden');
    snakeScoreboard.classList.remove('hidden');
    tttScoreboard.classList.add('hidden');
    pauseTtt();
  } else {
    switchSnakeBtn.classList.remove('active');
    switchTttBtn.classList.add('active');
    snakeContainer.classList.add('hidden');
    tttContainer.classList.remove('hidden');
    snakeScoreboard.classList.add('hidden');
    tttScoreboard.classList.remove('hidden');
    pauseSnake();
  }
}
switchSnakeBtn.addEventListener('click', () => showGame('snake'));
switchTttBtn.addEventListener('click', () => showGame('ttt'));

// ---------- SNAKE (original implementation) ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highScore');
const startPauseBtn = document.getElementById('startPause');
const restartBtn = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const messageEl = document.getElementById('message');
const speedSelect = document.getElementById('speed');
const wrapToggle = document.getElementById('wrapToggle');
const touchButtons = document.querySelectorAll('.touch-controls button');

const COLS = 20; const ROWS = 20;
let CELL = Math.floor(canvas.width / COLS);
let snake = [];
let dir = { x: 0, y: 0 };
let nextDir = { x: 0, y: 0 };
let food = null;
let running = false;
let score = 0;
let highScore = Number(localStorage.getItem('snakeHigh') || 0);
let wrap = false;
let speed = Number(speedSelect.value);
let updateInterval = 1000 / speed;
highEl.textContent = highScore;

function randPos() { return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
function placeFood() { let p; do { p = randPos(); } while (snake.some(s => s.x === p.x && s.y === p.y)); food = p; }
function resizeCanvas() {
  const wrapEl = document.querySelector('.game-wrap');
  const container = document.querySelector('.container');

  // sum heights of visible siblings (header, scoreboard, hint, footer, etc.)
  const siblings = Array.from(container.children).filter(n => n !== wrapEl && n.offsetParent !== null);
  const siblingsHeight = siblings.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);

  const containerStyle = getComputedStyle(container);
  const containerPadding = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);

  // breathing room so controls/overlay don't force scroll
  const breathing = 20;

  const availableHeight = Math.max(120, window.innerHeight - siblingsHeight - containerPadding - breathing);

  // pick size constrained by width, available height and original max (760)
  const size = Math.min(760, wrapEl.clientWidth, availableHeight);

  canvas.width = size;
  canvas.height = size;
  CELL = Math.floor(canvas.width / COLS);
  renderSnake();
}
window.addEventListener('resize', resizeCanvas);

function resetSnake() {
  snake = [ { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 } ];
  dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
  score = 0; placeFood(); updateScore(); running = false; overlay.classList.remove('hidden'); messageEl.textContent = 'Press Start'; startPauseBtn.textContent = 'Start';
}
function startSnake() { running = true; overlay.classList.add('hidden'); startPauseBtn.textContent = 'Pause'; }
function pauseSnake() { running = false; overlay.classList.remove('hidden'); messageEl.textContent = 'Paused'; startPauseBtn.textContent = 'Resume'; }
function gameOverSnake() { running = false; overlay.classList.remove('hidden'); messageEl.textContent = `Game over — score ${score}`; startPauseBtn.textContent = 'Start'; if (score > highScore) { highScore = score; localStorage.setItem('snakeHigh', String(highScore)); highEl.textContent = highScore; } }
function updateScore() { scoreEl.textContent = score; }

function updateSnake() {
  if (!(nextDir.x === -dir.x && nextDir.y === -dir.y)) dir = nextDir;
  if (dir.x === 0 && dir.y === 0) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (wrap) { head.x = (head.x + COLS) % COLS; head.y = (head.y + ROWS) % ROWS; }
  if (!wrap && (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS)) { gameOverSnake(); return; }
  if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOverSnake(); return; }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) { score++; updateScore(); placeFood(); } else { snake.pop(); }
}
function drawCell(x, y, fill) { ctx.fillStyle = fill; ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2); }
function renderSnake() {
  ctx.fillStyle = '#071023'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) { const x = i * CELL + 0.5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  if (food) drawCell(food.x, food.y, '#ff4d4d');
  snake.forEach((s, i) => { const intensity = Math.floor(200 - (i / snake.length) * 120); const color = i === 0 ? '#d8ff87' : `rgb(${intensity},${220 - i},${40})`; drawCell(s.x, s.y, color); });
}

function setDirection(dx, dy) { if (snake.length > 1 && dx === -dir.x && dy === -dir.y) return; nextDir = { x: dx, y: dy }; }
window.addEventListener('keydown', (e) => {
  if (currentGame === 'snake') {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDirection(0, -1);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDirection(0, 1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDirection(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDirection(1, 0);
    if (e.key === ' ') { e.preventDefault(); running ? pauseSnake() : startSnake(); }
  } else if (currentGame === 'ttt') {
    if (e.key === ' ' && !ttt.running) { tttReset('X'); }
  }
});
touchButtons.forEach(b => b.addEventListener('click', () => { const d = b.getAttribute('data-dir'); if (d === 'up') setDirection(0, -1); if (d === 'down') setDirection(0, 1); if (d === 'left') setDirection(-1, 0); if (d === 'right') setDirection(1, 0); }));
let touchStart = null; window.addEventListener('touchstart', (e) => { const t = e.touches[0]; touchStart = { x: t.clientX, y: t.clientY }; });
window.addEventListener('touchend', (e) => { if (!touchStart) return; const t = e.changedTouches[0]; const dx = t.clientX - touchStart.x; const dy = t.clientY - touchStart.y; if (Math.abs(dx) > Math.abs(dy)) { if (dx > 20) setDirection(1, 0); else if (dx < -20) setDirection(-1, 0); } else { if (dy > 20) setDirection(0, 1); else if (dy < -20) setDirection(0, -1); } touchStart = null; });
startPauseBtn.addEventListener('click', () => { running ? pauseSnake() : startSnake(); });
restartBtn.addEventListener('click', () => { resetSnake(); });
speedSelect.addEventListener('change', () => { speed = Number(speedSelect.value); updateInterval = 1000 / speed; });
wrapToggle.addEventListener('click', () => { wrap = !wrap; wrapToggle.textContent = `Wrap: ${wrap ? 'On' : 'Off'}`; });
let lastTime = 0; let accumulator = 0; function loop(ts) { requestAnimationFrame(loop); if (!lastTime) lastTime = ts; const delta = ts - lastTime; lastTime = ts; accumulator += delta; while (accumulator >= updateInterval) { if (running) updateSnake(); accumulator -= updateInterval; } renderSnake(); }

// ---------- TIC TAC TOE ----------
const tttBoardEl = document.getElementById('tttBoard');
const tttModeEl = document.getElementById('tttMode');
const tttDifficultyEl = document.getElementById('tttDifficulty');
const tttRestartBtn = document.getElementById('tttRestart');
const tttStatusEl = document.getElementById('tttStatus');
const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');

const ttt = {
  board: Array(9).fill(null),
  current: 'X',
  running: true,
  mode: '2p', // '2p' | 'aiX' | 'aiO'
  human: 'X', ai: 'O',
  scores: { X: Number(localStorage.getItem('tttX') || 0), O: Number(localStorage.getItem('tttO') || 0) }
};

function renderTtt() {
  ttt.board.forEach((v, i) => { const cell = tttBoardEl.children[i]; cell.textContent = v || ''; cell.classList.toggle('x', v === 'X'); cell.classList.toggle('o', v === 'O'); });
  if (!ttt.running) return; tttStatusEl.textContent = `Turn: ${ttt.current}`;
  xWinsEl.textContent = ttt.scores.X; oWinsEl.textContent = ttt.scores.O;
}

function checkWinner(board) {
  const lines = [ [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6] ];
  for (const [a,b,c] of lines) { if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]; }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function tttReset(start = 'X') {
  ttt.board.fill(null); ttt.current = start; ttt.running = true; ttt.mode = tttModeEl.value; ttt.human = ttt.mode === 'aiO' ? 'O' : 'X'; ttt.ai = ttt.human === 'X' ? 'O' : 'X'; renderTtt();
  if (ttt.mode !== '2p' && ttt.current === ttt.ai) aiMove();
}

function endTtt(winner) {
  ttt.running = false;
  if (winner === 'draw') { tttStatusEl.textContent = "It's a draw"; }
  else { tttStatusEl.textContent = `${winner} wins!`; ttt.scores[winner]++; localStorage.setItem(winner === 'X' ? 'tttX' : 'tttO', String(ttt.scores[winner])); }
  renderTtt();
}

function tttCellClick(e) {
  if (!ttt.running) return; const idx = Number(e.target.dataset.index); if (isNaN(idx) || ttt.board[idx]) return;
  ttt.board[idx] = ttt.current; const result = checkWinner(ttt.board);
  if (result) { endTtt(result); return; }
  ttt.current = ttt.current === 'X' ? 'O' : 'X'; renderTtt();
  if (ttt.mode !== '2p' && ttt.current === ttt.ai) aiMove();
}

tttBoardEl.addEventListener('click', tttCellClick);
tttRestartBtn.addEventListener('click', () => tttReset('X'));
tttModeEl.addEventListener('change', () => tttReset('X'));
if (typeof tttDifficultyEl !== 'undefined' && tttDifficultyEl) tttDifficultyEl.addEventListener('change', () => tttReset('X'));

// Minimax (adjustable — beatable)
function aiMove() {
  // Determine mistake rate from the difficulty selector
  const difficulty = (typeof tttDifficultyEl !== 'undefined' && tttDifficultyEl && tttDifficultyEl.value) || 'normal';
  const MISTAKE_RATES = { easy: 0.6, normal: 0.22, hard: 0.08, unbeatable: 0.0 };
  const MISTAKE_RATE = MISTAKE_RATES[difficulty] ?? 0.22;

  // gather minimax scores for every available move
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!ttt.board[i]) {
      ttt.board[i] = ttt.ai;
      const score = minimax(ttt.board, ttt.human).score;
      moves.push({ index: i, score });
      ttt.board[i] = null;
    }
  }

  if (moves.length === 0) return;

  // sort by score (higher is better for AI)
  moves.sort((a, b) => b.score - a.score);
  const bestScore = moves[0].score;

  let chosenIndex = null;
  if (Math.random() > MISTAKE_RATE) {
    // pick randomly among the best moves (keeps AI varied)
    const bestMoves = moves.filter(m => m.score === bestScore);
    chosenIndex = bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
  } else {
    // make a plausible mistake: prefer a drawing move (score === 0) if available,
    // otherwise pick a random non-best move so the AI stays beatable but realistic.
    const drawMoves = moves.filter(m => m.score === 0);
    const nonBest = moves.filter(m => m.score !== bestScore);
    if (drawMoves.length) chosenIndex = drawMoves[Math.floor(Math.random() * drawMoves.length)].index;
    else if (nonBest.length) chosenIndex = nonBest[Math.floor(Math.random() * nonBest.length)].index;
    else chosenIndex = moves[Math.floor(Math.random() * moves.length)].index;
  }

  if (chosenIndex != null) {
    ttt.board[chosenIndex] = ttt.ai;
    const res = checkWinner(ttt.board);
    if (res) { endTtt(res); return; }
    ttt.current = ttt.human; renderTtt();
  }
}

function minimax(board, player) {
  const winner = checkWinner(board);
  if (winner) {
    if (winner === 'draw') return { score: 0 };
    return { score: winner === ttt.ai ? 10 : -10 };
  }
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      const result = minimax(board, player === 'X' ? 'O' : 'X');
      moves.push({ index: i, score: result.score });
      board[i] = null;
    }
  }
  // choose best move for current player
  let bestMove = null;
  if (player === ttt.ai) {
    let bestScore = -Infinity; for (const m of moves) if (m.score > bestScore) { bestScore = m.score; bestMove = m; }
  } else {
    let bestScore = Infinity; for (const m of moves) if (m.score < bestScore) { bestScore = m.score; bestMove = m; }
  }
  return bestMove || { score: 0 };
}

function pauseTtt() { ttt.running = false; }


// ---------- initialize ----------
resizeCanvas(); resetSnake(); requestAnimationFrame(loop);
showGame('snake'); renderTtt(); tttReset('X');
