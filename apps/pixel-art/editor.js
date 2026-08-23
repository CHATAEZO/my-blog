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
let gridContainer, colorGridEl, colorPicker, colorPreview;
let penBtn, eraserBtn, fillBtn, undoBtn, clearBtn, gridToggleBtn, saveBtn;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  gridContainer = document.getElementById('grid-container');
  colorGridEl = document.getElementById('color-grid');
  colorPicker = document.getElementById('color-picker');
  colorPreview = document.getElementById('color-preview');
  penBtn = document.getElementById('pen-btn');
  eraserBtn = document.getElementById('eraser-btn');
  fillBtn = document.getElementById('fill-btn');
  undoBtn = document.getElementById('undo-btn');
  clearBtn = document.getElementById('clear-btn');
  gridToggleBtn = document.getElementById('grid-toggle-btn');
  saveBtn = document.getElementById('save-btn');

  createGrid();
  createPalette();
  updateColorPreview();
  setupEventListeners();
});

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
  if (history.length > 50) history.shift();
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

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }

  const link = document.createElement('a');
  link.download = `pixel-art-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== Get Cell from Event =====
function getCellFromEvent(e) {
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const element = document.elementFromPoint(clientX, clientY);
  if (element && element.classList.contains('grid-cell')) {
    return element;
  }
  return null;
}

// ===== Handle Draw Start =====
function handleDrawStart(e) {
  e.preventDefault();
  const cell = getCellFromEvent(e);
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
}

// ===== Handle Draw Move =====
function handleDrawMove(e) {
  e.preventDefault();
  if (!isDrawing || currentTool === 'fill') return;

  const cell = getCellFromEvent(e);
  if (!cell) return;

  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);
  const color = currentTool === 'eraser' ? '#ffffff' : currentColor;
  setPixel(r, c, color);
}

// ===== Handle Draw End =====
function handleDrawEnd(e) {
  e.preventDefault();
  isDrawing = false;
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
  // Mouse events
  gridContainer.addEventListener('mousedown', handleDrawStart);
  gridContainer.addEventListener('mousemove', handleDrawMove);
  document.addEventListener('mouseup', handleDrawEnd);

  // Touch events
  gridContainer.addEventListener('touchstart', handleDrawStart, { passive: false });
  gridContainer.addEventListener('touchmove', handleDrawMove, { passive: false });
  gridContainer.addEventListener('touchend', handleDrawEnd, { passive: false });
  gridContainer.addEventListener('touchcancel', handleDrawEnd, { passive: false });

  // Color palette
  colorGridEl.addEventListener('click', (e) => {
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
