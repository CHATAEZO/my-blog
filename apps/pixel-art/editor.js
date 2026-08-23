// ===== State =====
const GRID_SIZE = 16;
let currentColor = '#000000';
let currentTool = 'pen';
let isDrawing = false;
let history = [];
let grid = [];

// ===== Colors =====
const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff6b6b', '#51cf66', '#339af0', '#ffd43b',
  '#845ef7', '#ff922b', '#20c997', '#e64980'
];

// ===== Init Grid =====
function initGrid() {
  grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = '#ffffff';
    }
  }
}

// ===== Build UI =====
function buildUI() {
  // Build grid
  const container = document.getElementById('grid-container');
  container.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.id = `cell-${r}-${c}`;
      cell.style.backgroundColor = '#ffffff';
      container.appendChild(cell);
    }
  }

  // Build palette
  const palette = document.getElementById('color-grid');
  palette.innerHTML = '';

  COLORS.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.backgroundColor = color;
    btn.setAttribute('data-color', color);
    if (color === currentColor) btn.classList.add('active');
    palette.appendChild(btn);
  });

  // Update preview
  updateColorPreview();
}

// ===== Update Color Preview =====
function updateColorPreview() {
  const preview = document.getElementById('color-preview');
  const picker = document.getElementById('color-picker');
  if (preview) preview.style.backgroundColor = currentColor;
  if (picker) picker.value = currentColor;
}

// ===== Save History =====
function saveHistory() {
  const snapshot = grid.map(row => [...row]);
  history.push(snapshot);
  if (history.length > 50) history.shift();
}

// ===== Undo =====
function undo() {
  if (history.length === 0) return;
  grid = history.pop();
  refreshGrid();
}

// ===== Refresh Grid Display =====
function refreshGrid() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (cell) cell.style.backgroundColor = grid[r][c];
    }
  }
}

// ===== Paint Cell =====
function paintCell(r, c) {
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;

  const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
  grid[r][c] = color;

  const cell = document.getElementById(`cell-${r}-${c}`);
  if (cell) cell.style.backgroundColor = color;
}

// ===== Fill Tool =====
function floodFill(startR, startC) {
  const targetColor = grid[startR][startC];
  const newColor = currentColor;

  if (targetColor === newColor) return;

  const stack = [[startR, startC]];
  const visited = {};

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;

    if (visited[key]) continue;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
    if (grid[r][c] !== targetColor) continue;

    visited[key] = true;
    grid[r][c] = newColor;

    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell) cell.style.backgroundColor = newColor;

    stack.push([r - 1, c]);
    stack.push([r + 1, c]);
    stack.push([r, c - 1]);
    stack.push([r, c + 1]);
  }
}

// ===== Clear Grid =====
function clearGrid() {
  saveHistory();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = '#ffffff';
    }
  }
  refreshGrid();
}

// ===== Save PNG =====
function savePNG() {
  const radios = document.querySelectorAll('input[name="scale"]');
  let scale = 1;
  radios.forEach(r => { if (r.checked) scale = parseInt(r.value); });

  const canvas = document.createElement('canvas');
  const size = GRID_SIZE * scale;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }

  const link = document.createElement('a');
  link.download = `pixel-art-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== Get Cell From Point =====
function getCellFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (el && el.classList.contains('grid-cell')) {
    const id = el.id; // cell-R-C
    const parts = id.split('-');
    return { r: parseInt(parts[1]), c: parseInt(parts[2]) };
  }
  return null;
}

// ===== Setup Events =====
function setupEvents() {
  const container = document.getElementById('grid-container');

  // === MOUSE EVENTS ===
  container.addEventListener('mousedown', function(e) {
    e.preventDefault();
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    isDrawing = true;
    saveHistory();

    if (currentTool === 'fill') {
      floodFill(cell.r, cell.c);
    } else {
      paintCell(cell.r, cell.c);
    }
  });

  container.addEventListener('mousemove', function(e) {
    e.preventDefault();
    if (!isDrawing) return;
    if (currentTool === 'fill') return;

    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) paintCell(cell.r, cell.c);
  });

  document.addEventListener('mouseup', function() {
    isDrawing = false;
  });

  // === TOUCH EVENTS ===
  container.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;

    isDrawing = true;
    saveHistory();

    if (currentTool === 'fill') {
      floodFill(cell.r, cell.c);
    } else {
      paintCell(cell.r, cell.c);
    }
  }, { passive: false });

  container.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!isDrawing) return;
    if (currentTool === 'fill') return;

    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (cell) paintCell(cell.r, cell.c);
  }, { passive: false });

  container.addEventListener('touchend', function(e) {
    e.preventDefault();
    isDrawing = false;
  }, { passive: false });

  // === COLOR PALETTE ===
  document.getElementById('color-grid').addEventListener('click', function(e) {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;

    currentColor = btn.getAttribute('data-color');
    updateColorPreview();

    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // === COLOR PICKER ===
  document.getElementById('color-picker').addEventListener('input', function(e) {
    currentColor = e.target.value;
    updateColorPreview();
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  });

  // === TOOL BUTTONS ===
  document.getElementById('pen-btn').addEventListener('click', function() {
    setTool('pen');
  });

  document.getElementById('eraser-btn').addEventListener('click', function() {
    setTool('eraser');
  });

  document.getElementById('fill-btn').addEventListener('click', function() {
    setTool('fill');
  });

  // === UNDO ===
  document.getElementById('undo-btn').addEventListener('click', undo);

  // === CLEAR ===
  document.getElementById('clear-btn').addEventListener('click', clearGrid);

  // === GRID TOGGLE ===
  document.getElementById('grid-toggle-btn').addEventListener('click', function() {
    const container = document.getElementById('grid-container');
    container.classList.toggle('no-grid');
    this.classList.toggle('active');
  });

  // === SAVE ===
  document.getElementById('save-btn').addEventListener('click', savePNG);

  // === KEYBOARD ===
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  });
}

// ===== Set Tool =====
function setTool(tool) {
  currentTool = tool;
  document.getElementById('pen-btn').classList.toggle('active', tool === 'pen');
  document.getElementById('eraser-btn').classList.toggle('active', tool === 'eraser');
  document.getElementById('fill-btn').classList.toggle('active', tool === 'fill');
}

// ===== START =====
initGrid();
buildUI();
setupEvents();

console.log('Pixel Art Editor loaded!');
