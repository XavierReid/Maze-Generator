import type { Grid, GenerateStep } from '../types';
import { removeWall, shuffle } from '../grid';
import { UnionFind } from '../utils/UnionFind';

type Wall = {
  row: number;
  col: number;
  neighborRow: number;
  neighborCol: number;
};

/**
 * Randomized Kruskal's maze generator.
 * Shuffles all interior walls and removes each one if it connects two
 * distinct regions, merging them via Union-Find. Continues until all
 * cells are in one region. Produces a highly uniform maze that appears
 * to fill in everywhere at once rather than growing from a single point.
 */
export function* kruskals(grid: Grid): Generator<GenerateStep, void, unknown> {
  const size = grid.length;
  const uf = new UnionFind(size * size);

  // Collect all interior walls (each shared wall represented once)
  const walls: Wall[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Right wall (shared with col+1)
      if (col + 1 < size) {
        walls.push({ row, col, neighborRow: row, neighborCol: col + 1 });
      }
      // Bottom wall (shared with row+1)
      if (row + 1 < size) {
        walls.push({ row, col, neighborRow: row + 1, neighborCol: col });
      }
    }
  }

  // Process walls in random order
  for (const wall of shuffle(walls)) {
    const { row, col, neighborRow, neighborCol } = wall;
    const idA = row * size + col;
    const idB = neighborRow * size + neighborCol;

    if (!uf.connected(idA, idB)) {
      uf.union(idA, idB);
      removeWall(grid[row][col], grid[neighborRow][neighborCol]);

      // Mark both cells visited for the renderer
      grid[row][col].visited = true;
      grid[neighborRow][neighborCol].visited = true;

      // Yield the cell where the wall was removed as the "active" cell
      yield { phase: 'carving', row, col };
    }
  }

  yield { phase: 'done' };
}
