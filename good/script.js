/* ========= DOM ========= */
const welcomeScreen = document.getElementById("welcomeScreen");
const loadingScreen = document.getElementById("loadingScreen");
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const screens = {
  welcome: welcomeScreen,
  loading: loadingScreen,
  mode: modeScreen,
  game: gameScreen,
  result: resultScreen
};

const themeToggleBtn = document.getElementById("themeToggle");
const welcomeStartBtn = document.getElementById("welcomeStartBtn");

const modeMainRow = document.getElementById("modeMainRow");
const multiBtn = document.getElementById("multiBtn");
const aiMainBtn = document.getElementById("aiMainBtn");
const aiDifficultyPanel = document.getElementById("aiDifficultyPanel");
const backBtn = document.getElementById("backBtn");

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const playAgainBtn = document.getElementById("playAgainBtn");
const quitBtn = document.getElementById("quitBtn");

const boardEl = document.getElementById("board");
const turnText = document.getElementById("turnText");
const turnIcon = document.getElementById("turnIcon");
const resultText = document.getElementById("resultText");
const a11yAnnounce = document.getElementById("a11yAnnounce");
const winLine = document.getElementById("winLine");
const winLineElement = document.getElementById("winLineElement");

const difficultyLabel = document.getElementById("difficultyLabel");
const loadingDifficulty = document.getElementById("loadingDifficulty");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");
const scoreX2El = document.getElementById("scoreX2");
const scoreO2El = document.getElementById("scoreO2");
const scoreD2El = document.getElementById("scoreD2");

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
let isFirstShow = true;
function show(screenKey) {
  if (isFirstShow) {
    isFirstShow = false;
    Object.values(screens).forEach(s => s.classList.remove("active", "fade-in", "fade-out"));
    screens[screenKey].classList.add("active", "fade-in");
    return;
  }
  
  Object.values(screens).forEach(s => {
    if (s.classList.contains("active")) {
      s.classList.remove("active", "fade-in");
      s.classList.add("fade-out");
    }
  });
  setTimeout(() => {
    Object.values(screens).forEach(s => s.classList.remove("fade-out"));
    screens[screenKey].classList.add("active", "fade-in");
  }, 150);
}

function announce(text) {
  if (!a11yAnnounce) return;
  a11yAnnounce.textContent = "";
  a11yAnnounce.textContent = text;
}

function toggleTheme() {
  document.body.dataset.theme =
    document.body.dataset.theme === "dark" ? "light" : "dark";
}

function updateScoreUI() {
  const prevX = parseInt(scoreXEl.textContent) || 0;
  const prevO = parseInt(scoreOEl.textContent) || 0;
  const prevD = parseInt(scoreDEl.textContent) || 0;
  
  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
  scoreDEl.textContent = score.D;
  scoreX2El.textContent = score.X;
  scoreO2El.textContent = score.O;
  scoreD2El.textContent = score.D;
  
  if (score.X > prevX) {
    const xCard = scoreXEl.closest(".score-card");
    const x2Parent = scoreX2El.closest(".score-item-result");
    if (xCard) xCard.classList.add("score-updated");
    if (x2Parent) x2Parent.classList.add("score-updated");
    setTimeout(() => {
      if (xCard) xCard.classList.remove("score-updated");
      if (x2Parent) x2Parent.classList.remove("score-updated");
    }, 400);
  }
  if (score.O > prevO) {
    const oCard = scoreOEl.closest(".score-card");
    const o2Parent = scoreO2El.closest(".score-item-result");
    if (oCard) oCard.classList.add("score-updated");
    if (o2Parent) o2Parent.classList.add("score-updated");
    setTimeout(() => {
      if (oCard) oCard.classList.remove("score-updated");
      if (o2Parent) o2Parent.classList.remove("score-updated");
    }, 400);
  }
  if (score.D > prevD) {
    const dCard = scoreDEl.closest(".score-card");
    const d2Parent = scoreD2El.closest(".score-item-result");
    if (dCard) dCard.classList.add("score-updated");
    if (d2Parent) d2Parent.classList.add("score-updated");
    setTimeout(() => {
      if (dCard) dCard.classList.remove("score-updated");
      if (d2Parent) d2Parent.classList.remove("score-updated");
    }, 400);
  }
}

function updateTurnText() {
  turnText.classList.add("turn-fade-out");
  setTimeout(() => {
    if (gameMode === "ai" && currentPlayer === "O") {
      turnText.textContent = "AI's Turn";
    } else {
      turnText.textContent = `${currentPlayer}'s Turn`;
    }
    turnText.classList.remove("turn-fade-out");
    turnText.classList.add("turn-fade-in");
    setTimeout(() => turnText.classList.remove("turn-fade-in"), 200);
  }, 150);
  
  // Update turn icon
  if (turnIcon) {
    turnIcon.textContent = currentPlayer === "X" ? "❌" : "⭕";
  }
  
  // Update score cards active state
  document.querySelectorAll(".score-card[data-player]").forEach(el => {
    const p = el.getAttribute("data-player");
    el.classList.toggle("active", p === currentPlayer && p !== "D");
  });
  
  announce(gameMode === "ai" && currentPlayer === "O" ? "AI's turn" : `${currentPlayer}'s turn`);
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
  
  // Wait for next frame to ensure DOM is updated
  requestAnimationFrame(() => {
    const boardRect = boardEl.getBoundingClientRect();
    const containerRect = boardEl.parentElement.getBoundingClientRect();
    
    // Get the first and last cell positions
    const firstCell = boardEl.children[winLineIndices[0]];
    const lastCell = boardEl.children[winLineIndices[2]];
    
    if (!firstCell || !lastCell) return;
    
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();
    
    // Calculate center points relative to the container
    const x1 = firstRect.left - containerRect.left + firstRect.width / 2;
    const y1 = firstRect.top - containerRect.top + firstRect.height / 2;
    const x2 = lastRect.left - containerRect.left + lastRect.width / 2;
    const y2 = lastRect.top - containerRect.top + lastRect.height / 2;
    
    // Set SVG dimensions to match container
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    winLine.setAttribute("width", containerWidth);
    winLine.setAttribute("height", containerHeight);
    winLine.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
    
    // Set line coordinates
    winLineElement.setAttribute("x1", x1);
    winLineElement.setAttribute("y1", y1);
    winLineElement.setAttribute("x2", x2);
    winLineElement.setAttribute("y2", y2);
    
    // Set line color based on winner
    const winner = board[winLineIndices[0]];
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      winner === "X" ? "--x" : "--o"
    ).trim();
    winLineElement.setAttribute("stroke", color);
    
    // Reset animation
    winLineElement.style.animation = "none";
    requestAnimationFrame(() => {
      winLineElement.style.animation = "";
      winLine.classList.add("visible");
    });
  });
}

function clearWinLine() {
  if (winLine) {
    winLine.classList.remove("visible");
  }
}

/* ========= Screens ========= */
function goToLoading() {
  show("loading");
  loadingDifficulty.textContent =
    gameMode === "ai" ? `AI Difficulty: ${aiLevel}` : "";
  
  const progressBar = document.getElementById("progressBar");
  if (progressBar) {
    progressBar.style.width = "0%";
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => show("mode"), 200);
      }
    }, 24);
  } else {
    setTimeout(() => show("mode"), 1200);
  }
}

function startGame(mode, difficulty = aiLevel) {
  gameMode = mode;
  aiLevel = difficulty;
  difficultyLabel.textContent =
    gameMode === "ai" ? `AI Difficulty: ${aiLevel}` : "";
  resetBoard();
  show("game");
  announce(`Game started. ${gameMode === "ai" ? `Vs AI, ${aiLevel}. ` : ""}${currentPlayer}'s turn.`);
  focusFirstEmptyCell();
}

function resetBoard() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  clearWinLine();

  if (boardEl.children.length > 0) {
    Array.from(boardEl.children).forEach((cell) => {
      cell.classList.add("cell-reset");
    });
    setTimeout(() => {
      createBoardCells();
    }, 300);
  } else {
    createBoardCells();
  }
}

function createBoardCells() {
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
    cell.onmouseenter = () => {
      if (!board[i] && !gameOver) {
        cell.classList.add("hover-preview");
        cell.setAttribute("data-preview", currentPlayer);
      }
    };
    cell.onmouseleave = () => {
      cell.classList.remove("hover-preview");
      cell.removeAttribute("data-preview");
    };
    cell.ontouchstart = () => {
      if (!board[i] && !gameOver) {
        cell.classList.add("hover-preview");
        cell.setAttribute("data-preview", currentPlayer);
      }
    };
    cell.ontouchend = () => {
      cell.classList.remove("hover-preview");
      cell.removeAttribute("data-preview");
    };
    boardEl.appendChild(cell);
  }
  updateTurnText();
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
  cell.classList.add(currentPlayer.toLowerCase(), "placed");
  cell.classList.remove("hover-preview");
  cell.removeAttribute("data-preview");
  cell.setAttribute("aria-label", `Cell ${index + 1}, ${currentPlayer}`);
  setTimeout(() => cell.classList.remove("placed"), 320);

  const win = getWinningLine(board);
  if (win) {
    score[currentPlayer]++;
    Array.from(boardEl.children).forEach(c => {
      c.classList.remove("hover-preview");
      c.removeAttribute("data-preview");
    });
    win.line.forEach(i => {
      const c = boardEl.children[i];
      c.classList.add("win", board[i].toLowerCase());
    });
    // Draw the winning line
    setTimeout(() => drawWinLine(win.line), 100);
    endGame(`${currentPlayer} Wins!`);
    return;
  }

  if (board.every(Boolean)) {
    score.D++;
    Array.from(boardEl.children).forEach(c => {
      c.classList.add("draw-cell");
      c.classList.remove("hover-preview");
      c.removeAttribute("data-preview");
    });
    endGame("It's a Draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();

  if (gameMode === "ai" && currentPlayer === "O") {
    turnText.textContent = "AI thinking...";
    turnText.classList.add("ai-thinking");
    setTimeout(() => {
      turnText.classList.remove("ai-thinking");
      aiMove();
    }, 400);
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
  
  // Get result elements
  const resultTrophy = document.getElementById("resultTrophy");
  const resultSubtitle = document.getElementById("resultSubtitle");
  
  // Reset classes
  resultText.classList.remove("x-wins", "o-wins", "draw");
  if (resultTrophy) resultTrophy.classList.remove("draw");
  
  // Set appropriate styling based on result
  if (text.includes("X")) {
    resultText.classList.add("x-wins");
    if (resultTrophy) resultTrophy.textContent = "🏆";
    if (resultSubtitle) resultSubtitle.textContent = "X dominated the board!";
    highlightWinnerCard("X");
  } else if (text.includes("O")) {
    resultText.classList.add("o-wins");
    if (resultTrophy) resultTrophy.textContent = "🏆";
    if (resultSubtitle) resultSubtitle.textContent = "O claimed victory!";
    highlightWinnerCard("O");
  } else {
    resultText.classList.add("draw");
    if (resultTrophy) {
      resultTrophy.textContent = "🤝";
      resultTrophy.classList.add("draw");
    }
    if (resultSubtitle) resultSubtitle.textContent = "A battle of equals!";
    highlightWinnerCard("D");
  }
  
  show("result");
  announce(text);
  playAgainBtn.focus();
}

function highlightWinnerCard(winner) {
  document.querySelectorAll(".stat-card").forEach(card => {
    card.classList.remove("winner");
  });
  const winnerCard = document.querySelector(`.stat-${winner.toLowerCase()}`);
  if (winnerCard) {
    winnerCard.classList.add("winner");
  }
}

function addRippleEffect(button, event) {
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function setupButtonRipples() {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      addRippleEffect(btn, e);
    });
  });
}

/* ========= Events ========= */
themeToggleBtn.onclick = toggleTheme;
welcomeStartBtn.onclick = goToLoading;

multiBtn.onclick = () => startGame("multi");

aiMainBtn.onclick = () => {
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
setupButtonRipples();

// Initialize welcome screen properly
setTimeout(() => {
  welcomeScreen.classList.add("fade-in");
}, 50);