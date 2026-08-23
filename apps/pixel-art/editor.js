// ===== State =====
const GRID_SIZE = 16;
let currentColor = '#000000';
let currentTool = 'pen'; // pen, eraser, fill
let isDrawing = false;
let showGrid = true;
let history = [];
let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#ffffff'));

// ===== Color Palette =====
const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff6b6b', '#51cf66', '#339af0', '#ffd43b',
  '#845ef7', '#ff922b', '#20c997', '#e64980'
];

// ===== DOM Elements =====
const gridContainer = document.getElementById('grid-container');
const colorGrid = document.getElementById('grid');
const colorPicker = document.getElementById('color-picker');
const colorPreview = document.getElementById('color-preview');
const penBtn = document.getElementById('pen-btn');
const eraserBtn = document.getElementById('eraser-btn');
const fillBtn = document.getElementById('fill-btn');
const undoBtn = document.getElementById('undo-btn');
const clearBtn = document.getElementById('clear-btn');
const gridToggleBtn = document.getElementById('grid-toggle-btn');
const saveBtn = document.getElementById('save-btn');

// ===== Initialize =====
function init() {
  createGrid();
  createPalette();
  updateColorPreview();
  setupEventListeners();
}

// ===== Create Grid =====
function createGrid() {
  gridContainer.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.backgroundColor = grid[r][c];
      gridContainer.appendChild(cell);
    }
  }
}

// ===== Create Palette =====
function createPalette() {
  const colorGridEl = document.getElementById('color-grid');
  colorGridEl.innerHTML = '';

  COLORS.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.backgroundColor = color;
    btn.dataset.color = color;
    if (color === currentColor) btn.classList.add('active');
    colorGridEl.appendChild(btn);
  });
}

// ===== Update Color Preview =====
function updateColorPreview() {
  colorPreview.style.backgroundColor = currentColor;
  colorPicker.value = currentColor;
}

// ===== Save History =====
function saveHistory() {
  history.push(grid.map(row => [...row]));
  if (history.length > 50) history.shift(); // Limit history
}

// ===== Undo =====
function undo() {
  if (history.length === 0) return;
  grid = history.pop();
  renderGrid();
}

// ===== Render Grid =====
function renderGrid() {
  const cells = gridContainer.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    cell.style.backgroundColor = grid[r][c];
  });
}

// ===== Set Pixel =====
function setPixel(r, c, color) {
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;
  grid[r][c] = color;
  const cell = gridContainer.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  if (cell) cell.style.backgroundColor = color;
}

// ===== Fill Tool =====
function fill(startR, startC, newColor) {
  const targetColor = grid[startR][startC];
  if (targetColor === newColor) return;

  const stack = [[startR, startC]];
  const visited = new Set();

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
    if (grid[r][c] !== targetColor) continue;

    visited.add(key);
    grid[r][c] = newColor;

    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }

  renderGrid();
}

// ===== Clear Grid =====
function clearGrid() {
  saveHistory();
  grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#ffffff'));
  renderGrid();
}

// ===== Save as PNG =====
function savePNG() {
  const scale = parseInt(document.querySelector('input[name="scale"]:checked').value);
  const canvas = document.createElement('canvas');
  const size = GRID_SIZE * scale;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Draw pixels
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }

  // Download
  const link = document.createElement('a');
  link.download = `pixel-art-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
  // Grid interactions
  gridContainer.addEventListener('mousedown', (e) => {
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;

    isDrawing = true;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    if (currentTool === 'fill') {
      saveHistory();
      fill(r, c, currentColor);
    } else {
      saveHistory();
      const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
      setPixel(r, c, color);
    }
  });

  gridContainer.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentTool === 'fill') return;
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;

    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
    setPixel(r, c, color);
  });

  document.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  // Touch support
  gridContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!cell || !cell.classList.contains('grid-cell')) return;

    isDrawing = true;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    if (currentTool === 'fill') {
      saveHistory();
      fill(r, c, currentColor);
    } else {
      saveHistory();
      const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
      setPixel(r, c, color);
    }
  });

  gridContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing || currentTool === 'fill') return;

    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!cell || !cell.classList.contains('grid-cell')) return;

    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
    setPixel(r, c, color);
  });

  gridContainer.addEventListener('touchend', () => {
    isDrawing = false;
  });

  // Color palette
  document.getElementById('color-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;

    currentColor = btn.dataset.color;
    updateColorPreview();

    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // Color picker
  colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    updateColorPreview();
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  });

  // Tool buttons
  penBtn.addEventListener('click', () => setTool('pen'));
  eraserBtn.addEventListener('click', () => setTool('eraser'));
  fillBtn.addEventListener('click', () => setTool('fill'));

  // Undo
  undoBtn.addEventListener('click', undo);

  // Clear
  clearBtn.addEventListener('click', clearGrid);

  // Grid toggle
  gridToggleBtn.addEventListener('click', () => {
    showGrid = !showGrid;
    gridContainer.classList.toggle('no-grid', !showGrid);
    gridToggleBtn.classList.toggle('active', showGrid);
  });

  // Save
  saveBtn.addEventListener('click', savePNG);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  });
}

// ===== Set Tool =====
function setTool(tool) {
  currentTool = tool;
  penBtn.classList.toggle('active', tool === 'pen');
  eraserBtn.classList.toggle('active', tool === 'eraser');
  fillBtn.classList.toggle('active', tool === 'fill');
}

// ===== Start =====
init();
