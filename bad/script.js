/* ========= DOM ========= */
const welcomeScreen = document.getElementById("welcomeScreen");
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const screens = {
  welcome: welcomeScreen,
  mode: modeScreen,
  game: gameScreen,
  result: resultScreen
};

const startBtn = document.getElementById("startBtn");

const modeMainRow = document.getElementById("modeMainRow");
const multiBtn = document.getElementById("multiBtn");
const aiBtn = document.getElementById("aiBtn");
const aiDifficultyPanel = document.getElementById("aiDifficultyPanel");
const backBtn = document.getElementById("backBtn");
const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const playAgainBtn = document.getElementById("playAgainBtn");
const quitBtn = document.getElementById("quitBtn");

const boardEl = document.getElementById("board");
const resultText = document.getElementById("resultText");
const a11yAnnounce = document.getElementById("a11yAnnounce");
const winLine = document.getElementById("winLine");
const winLineElement = document.getElementById("winLineElement");

const scoreX2El = document.getElementById("scoreX2");
const scoreO2El = document.getElementById("scoreO2");
const scoreD2El = document.getElementById("scoreD2");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

/* ========= State ========= */
let board = Array(9).fill(null);
let currentPlayer = "X";
let gameMode = "multi";
let aiLevel = "easy";
let gameOver = false;
let score = { X: 0, O: 0, D: 0 };

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ========= Helpers ========= */
function show(screenKey) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[screenKey].classList.add("active");
}

function announce(text) {
  if (!a11yAnnounce) return;
  a11yAnnounce.textContent = "";
  a11yAnnounce.textContent = text;
}

function updateScoreUI() {
  const x = String(score.X), o = String(score.O), d = String(score.D);
  if (scoreX2El) scoreX2El.textContent = x;
  if (scoreO2El) scoreO2El.textContent = o;
  if (scoreD2El) scoreD2El.textContent = d;
  if (scoreXEl) scoreXEl.textContent = x;
  if (scoreOEl) scoreOEl.textContent = o;
  if (scoreDEl) scoreDEl.textContent = d;
}

function getWinningLine(b) {
  for (const line of WIN_LINES) {
    const v = b[line[0]];
    if (v && b[line[1]] === v && b[line[2]] === v) return { line, player: v };
  }
  return null;
}

function drawWinLine(winLineIndices) {
  if (!winLine || !winLineElement || winLineIndices.length !== 3) return;
  
  requestAnimationFrame(() => {
    const boardRect = boardEl.getBoundingClientRect();
    const containerRect = boardEl.parentElement.getBoundingClientRect();
    
    const firstCell = boardEl.children[winLineIndices[0]];
    const lastCell = boardEl.children[winLineIndices[2]];
    
    if (!firstCell || !lastCell) return;
    
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();
    
    const x1 = firstRect.left - containerRect.left + firstRect.width / 2;
    const y1 = firstRect.top - containerRect.top + firstRect.height / 2;
    const x2 = lastRect.left - containerRect.left + lastRect.width / 2;
    const y2 = lastRect.top - containerRect.top + lastRect.height / 2;
    
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    winLine.setAttribute("width", containerWidth);
    winLine.setAttribute("height", containerHeight);
    winLine.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    
    winLineElement.setAttribute("x1", x1);
    winLineElement.setAttribute("y1", y1);
    winLineElement.setAttribute("x2", x2);
    winLineElement.setAttribute("y2", y2);
    
    const winner = board[winLineIndices[0]];
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      winner === "X" ? "--x" : "--o"
    ).trim();
    winLineElement.setAttribute("stroke", color);
    
    winLine.classList.add("visible");
  });
}

function clearWinLine() {
  if (winLine) {
    winLine.classList.remove("visible");
  }
}

/* ========= Screens ========= */
function startGame(mode, difficulty) {
  gameMode = mode;
  if (mode === "ai") aiLevel = difficulty || aiLevel;
  resetBoard();
  show("game");
  announce(`Game started. ${gameMode === "ai" ? `Vs AI (${aiLevel}). ` : ""}`);
  focusFirstEmptyCell();
}

function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  clearWinLine();

  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("data-index", String(i));
    cell.setAttribute("aria-label", `Cell ${i + 1}`);
    cell.onclick = () => makeMove(i);
    cell.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        makeMove(i);
      }
    };
    boardEl.appendChild(cell);
  }
}

function focusFirstEmptyCell() {
  const first = boardEl.querySelector(".cell");
  if (first) first.focus();
}

function makeMove(index) {
  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  const cell = boardEl.children[index];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.setAttribute("aria-label", `Cell ${index + 1}, ${currentPlayer}`);

  const win = getWinningLine(board);
  if (win) {
    score[currentPlayer]++;
    win.line.forEach(i => {
      const c = boardEl.children[i];
      c.classList.add("win", board[i].toLowerCase());
    });
    setTimeout(() => drawWinLine(win.line), 50);
    endGame(`${currentPlayer} Wins!`);
    return;
  }

  if (board.every(Boolean)) {
    score.D++;
    Array.from(boardEl.children).forEach(c => c.classList.add("draw-cell"));
    endGame("It's a Draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (gameMode === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 400);
  }
}

/* ========= AI ========= */
function aiMove() {
  let move;
  if (aiLevel === "easy") move = randomMove();
  else if (aiLevel === "medium") move = Math.random() < 0.5 ? randomMove() : bestMove();
  else move = bestMove();
  makeMove(move);
}

function randomMove() {
  const empty = board
    .map((v, i) => v === null ? i : null)
    .filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  let bestScore = -Infinity;
  let move;
  board.forEach((cell, i) => {
    if (!cell) {
      board[i] = "O";
      const s = minimax(board, false);
      board[i] = null;
      if (s > bestScore) { bestScore = s; move = i; }
    }
  });
  return move;
}

function minimax(b, isMax) {
  if (checkWinnerFor(b, "O")) return 10;
  if (checkWinnerFor(b, "X")) return -10;
  if (b.every(Boolean)) return 0;
  let best = isMax ? -Infinity : Infinity;
  b.forEach((cell, i) => {
    if (!cell) {
      b[i] = isMax ? "O" : "X";
      const s = minimax(b, !isMax);
      b[i] = null;
      best = isMax ? Math.max(s, best) : Math.min(s, best);
    }
  });
  return best;
}

function checkWinnerFor(b, p) {
  return WIN_LINES.some(line => line.every(i => b[i] === p));
}

function endGame(text) {
  gameOver = true;
  resultText.textContent = text;
  updateScoreUI();
  show("result");
  announce(text);
  playAgainBtn.focus();
}

/* ========= Events ========= */
startBtn.onclick = () => show("mode");

multiBtn.onclick = () => startGame("multi");
aiBtn.onclick = () => {
  modeMainRow.classList.add("hidden");
  aiDifficultyPanel.classList.remove("hidden");
};

backBtn.onclick = () => {
  aiDifficultyPanel.classList.add("hidden");
  modeMainRow.classList.remove("hidden");
};

easyBtn.onclick = () => startGame("ai", "easy");
mediumBtn.onclick = () => startGame("ai", "medium");
hardBtn.onclick = () => startGame("ai", "hard");

playAgainBtn.onclick = () => startGame(gameMode, aiLevel);
quitBtn.onclick = () => {
  score = { X: 0, O: 0, D: 0 };
  updateScoreUI();
  aiDifficultyPanel.classList.add("hidden");
  modeMainRow.classList.remove("hidden");
  show("mode");
};

updateScoreUI();
