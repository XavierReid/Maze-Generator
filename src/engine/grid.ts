import type { Cell, Grid } from './types';

export function createGrid(size: number): Grid {
  const grid: Grid = [];
  for (let row = 0; row < size; row++) {
    grid.push([]);
    for (let col = 0; col < size; col++) {
      grid[row].push({
        row,
        col,
        visited: false,
        walls: { top: true, bottom: true, left: true, right: true },
      });
    }
  }
  return grid;
}

export function removeWall(a: Cell, b: Cell): void {
  const dr = b.row - a.row;
  const dc = b.col - a.col;
  if (dr === -1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (dr === 1) {
    a.walls.bottom = false;
    b.walls.top = false;
  } else if (dc === -1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (dc === 1) {
    a.walls.right = false;
    b.walls.left = false;
  }
}

export function getNeighbors(grid: Grid, row: number, col: number): Cell[] {
  const size = grid.length;
  return (
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] as [number, number][]
  )
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => r >= 0 && c >= 0 && r < size && c < size)
    .map(([r, c]) => grid[r][c]);
}

export function canTraverse(a: Cell, b: Cell): boolean {
  const dr = b.row - a.row;
  const dc = b.col - a.col;
  if (dr === -1) return !a.walls.top;
  if (dr === 1) return !a.walls.bottom;
  if (dc === -1) return !a.walls.left;
  if (dc === 1) return !a.walls.right;
  return false;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
