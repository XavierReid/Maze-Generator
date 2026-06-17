import type { Grid } from '../engine/types';

// ── Palette ──────────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#0d0d10',
  wall: '#e2e8f0',
  cellDefault: '#0d0d10',
  cellVisited: '#1a1a2e',
  cellCurrent: '#7c3aed',
  cellBacktrack: '#1e1b4b',
  solveVisited: '#1e3a2f',
  solvePath: '#10b981',
  solvePathGlow: '#6ee7b7',
  startCell: '#3b82f6',
  endCell: '#ef4444',
};

const WALL_WIDTH = 1.5;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fillCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  s: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(col * s, row * s, s, s);
}

function drawWalls(
  ctx: CanvasRenderingContext2D,
  cell: Grid[number][number],
  s: number,
  color: string,
): void {
  const x = cell.col * s;
  const y = cell.row * s;
  ctx.strokeStyle = color;
  ctx.lineWidth = WALL_WIDTH;

  ctx.beginPath();
  if (cell.walls.top) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y);
  }
  if (cell.walls.bottom) {
    ctx.moveTo(x, y + s);
    ctx.lineTo(x + s, y + s);
  }
  if (cell.walls.left) {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + s);
  }
  if (cell.walls.right) {
    ctx.moveTo(x + s, y);
    ctx.lineTo(x + s, y + s);
  }
  ctx.stroke();
}

// ── Full scene render ────────────────────────────────────────────────────────

export type RenderState = {
  grid: Grid;
  currentCell: [number, number] | null;
  solvePath: [number, number][];
  solveVisited: Set<string>;
  phase: string;
};

export function renderMaze(
  canvas: HTMLCanvasElement,
  state: RenderState,
): void {
  const { grid, currentCell, solvePath, solveVisited, phase } = state;
  const size = grid.length;
  const s = canvas.width / size;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const solvePathSet = new Set(solvePath.map(([r, c]) => `${r},${c}`));

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      const cellKey = `${row},${col}`;
      const isCurrent =
        currentCell !== null &&
        currentCell[0] === row &&
        currentCell[1] === col;

      // Determine fill color
      let bg = COLORS.cellDefault;

      if (phase === 'generating' || phase === 'generated') {
        if (isCurrent) bg = COLORS.cellCurrent;
        else if (cell.visited) bg = COLORS.cellVisited;
      }

      if (phase === 'solving' || phase === 'solved') {
        if (solvePathSet.has(cellKey)) bg = COLORS.solvePath;
        else if (solveVisited.has(cellKey)) bg = COLORS.solveVisited;
        else if (isCurrent) bg = COLORS.cellCurrent;
        else if (cell.visited) bg = COLORS.cellVisited;
      }

      fillCell(ctx, col, row, s, bg);
      drawWalls(ctx, cell, s, COLORS.wall);
    }
  }

  // Start / end markers
  const endRow = size - 1;
  const endCol = size - 1;
  const markerPad = s * 0.25;

  // Start — blue dot
  ctx.fillStyle = COLORS.startCell;
  ctx.beginPath();
  ctx.arc(
    0 * s + s / 2,
    0 * s + s / 2,
    s / 2 - markerPad,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // End — red dot
  ctx.fillStyle = COLORS.endCell;
  ctx.beginPath();
  ctx.arc(
    endCol * s + s / 2,
    endRow * s + s / 2,
    s / 2 - markerPad,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Solve path dots
  if (solvePath.length > 0) {
    ctx.fillStyle = COLORS.solvePathGlow;
    for (const [r, c] of solvePath) {
      ctx.beginPath();
      ctx.arc(c * s + s / 2, r * s + s / 2, s / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
