// ===== Game State =====
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let won = false;
let keepPlaying = false;

// ===== DOM Elements =====
const gridEl = document.getElementById('grid');
const tileContainer = document.getElementById('tile-container');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const newGameBtn = document.getElementById('new-game-btn');
const overlay = document.getElementById('game-overlay');
const overlayMessage = document.getElementById('overlay-message');
const overlayBtn = document.getElementById('overlay-btn');

// ===== Initialize =====
function init() {
  // Create grid cells
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    gridEl.appendChild(cell);
  }

  // Load best score
  bestScore = parseInt(localStorage.getItem('2048-best') || '0');
  bestScoreEl.textContent = bestScore;

  // Event listeners
  newGameBtn.addEventListener('click', newGame);
  overlayBtn.addEventListener('click', newGame);
  document.addEventListener('keydown', handleKeydown);

  // Touch support
  let touchStartX, touchStartY;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) return;

    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }

    touchStartX = null;
    touchStartY = null;
  });

  // Start game
  newGame();
}

// ===== New Game =====
function newGame() {
  grid = Array(4).fill(null).map(() => Array(4).fill(0));
  score = 0;
  gameOver = false;
  won = false;
  keepPlaying = false;

  scoreEl.textContent = '0';
  overlay.classList.remove('active');

  addRandomTile();
  addRandomTile();
  renderTiles();
}

// ===== Add Random Tile =====
function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }

  if (emptyCells.length === 0) return;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// ===== Render Tiles =====
function renderTiles(mergedPositions = [], newTilePos = null) {
  tileContainer.innerHTML = '';

  const containerRect = tileContainer.getBoundingClientRect();
  const cellSize = (containerRect.width - 36) / 4; // 3 gaps * 12px
  const gap = 12;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const value = grid[r][c];
      if (value === 0) continue;

      const tile = document.createElement('div');
      const tileClass = value <= 2048 ? `tile-${value}` : 'tile-super';
      tile.className = `tile ${tileClass}`;

      // Position
      const left = c * (cellSize + gap);
      const top = r * (cellSize + gap);
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
      tile.style.width = `${cellSize}px`;
      tile.style.height = `${cellSize}px`;

      // Font size based on digits
      const digits = String(value).length;
      if (digits <= 2) tile.style.fontSize = `${cellSize * 0.45}px`;
      else if (digits === 3) tile.style.fontSize = `${cellSize * 0.35}px`;
      else tile.style.fontSize = `${cellSize * 0.28}px`;

      tile.textContent = value;

      // Animations
      if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
        tile.classList.add('tile-new');
      }
      if (mergedPositions.some(p => p.r === r && p.c === c)) {
        tile.classList.add('tile-merged');
      }

      tileContainer.appendChild(tile);
    }
  }
}

// ===== Handle Keydown =====
function handleKeydown(e) {
  if (gameOver && !keepPlaying) return;

  const keyMap = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right'
  };

  const direction = keyMap[e.key];
  if (direction) {
    e.preventDefault();
    move(direction);
  }
}

// ===== Move =====
function move(direction) {
  if (gameOver && !keepPlaying) return;

  const previousGrid = grid.map(row => [...row]);
  const mergedPositions = [];

  if (direction === 'up' || direction === 'down') {
    for (let c = 0; c < 4; c++) {
      const column = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const { result, merges } = slideAndMerge(direction === 'up' ? column : column.reverse());
      const final = direction === 'up' ? result : result.reverse();

      for (let r = 0; r < 4; r++) {
        grid[r][c] = final[r];
        if (merges.includes(r) && final[r] !== 0) {
          mergedPositions.push({ r, c });
        }
      }
    }
  } else {
    for (let r = 0; r < 4; r++) {
      const row = [...grid[r]];
      const { result, merges } = slideAndMerge(direction === 'left' ? row : row.reverse());
      const final = direction === 'left' ? result : result.reverse();

      grid[r] = final;
      merges.forEach(m => {
        if (final[m] !== 0) {
          mergedPositions.push({ r, c: m });
        }
      });
    }
  }

  // Check if grid changed
  const changed = grid.some((row, r) => row.some((cell, c) => cell !== previousGrid[r][c]));

  if (changed) {
    const newTilePos = addNewTile();
    renderTiles(mergedPositions, newTilePos);
    updateScore();

    if (!keepPlaying && checkWin()) {
      showOverlay('🎉 2048!', '계속 하기');
      won = true;
      keepPlaying = true;
    } else if (checkGameOver()) {
      gameOver = true;
      showOverlay('게임 오버!', '다시 하기');
    }
  }
}

// ===== Slide and Merge =====
function slideAndMerge(line) {
  // Remove zeros
  let filtered = line.filter(v => v !== 0);
  const merges = [];
  const result = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      result.push(filtered[i] * 2);
      score += filtered[i] * 2;
      merges.push(result.length - 1);
      i++; // Skip next
    } else {
      result.push(filtered[i]);
    }
  }

  // Pad with zeros
  while (result.length < 4) result.push(0);

  return { result, merges };
}

// ===== Add New Tile =====
function addNewTile() {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }

  if (emptyCells.length === 0) return null;

  const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[pos.r][pos.c] = Math.random() < 0.9 ? 2 : 4;
  return pos;
}

// ===== Update Score =====
function updateScore() {
  scoreEl.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
    localStorage.setItem('2048-best', bestScore);
  }
}

// ===== Check Win =====
function checkWin() {
  return grid.some(row => row.some(cell => cell === 2048));
}

// ===== Check Game Over =====
function checkGameOver() {
  // Check for empty cells
  if (grid.some(row => row.some(cell => cell === 0))) return false;

  // Check for possible merges
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (c < 3 && val === grid[r][c + 1]) return false;
      if (r < 3 && val === grid[r + 1][c]) return false;
    }
  }

  return true;
}

// ===== Show Overlay =====
function showOverlay(message, btnText) {
  overlayMessage.textContent = message;
  overlayBtn.textContent = btnText;
  overlay.classList.add('active');
}

// ===== Start =====
init();
