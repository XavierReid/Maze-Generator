import type { Grid, GenerateStep } from '../types';
import { getNeighbors, removeWall } from '../grid';

const key = (r: number, c: number) => `${r},${c}`;

/**
 * Wilson's maze generator using loop-erased random walks.
 *
 * Algorithm:
 * 1. Add one random cell to the maze.
 * 2. Pick any unvisited cell — start a random walk.
 * 3. Walk randomly across the grid (ignoring walls, we're building them).
 * 4. If the walk revisits a cell already in the walk path, erase back to it (loop erasure).
 * 5. When the walk hits a maze cell, commit the entire path — carve walls along it.
 * 6. Repeat until all cells are in the maze.
 *
 * Produces a perfectly uniform spanning tree — every possible maze is equally likely.
 * Visually distinctive: random walks meander, erase, then snap into place.
 */
export function* wilsons(grid: Grid): Generator<GenerateStep, void, unknown> {
  const size = grid.length;
  const inMaze = new Set<string>();

  // Seed the maze with one random cell
  const seedRow = Math.floor(Math.random() * size);
  const seedCol = Math.floor(Math.random() * size);
  grid[seedRow][seedCol].visited = true;
  inMaze.add(key(seedRow, seedCol));

  // Build list of all unvisited cells
  const unvisited = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r !== seedRow || c !== seedCol) unvisited.add(key(r, c));
    }
  }

  while (unvisited.size > 0) {
    // Pick a random unvisited cell to start a new walk from
    const unvisitedArr = Array.from(unvisited);
    const startKey = unvisitedArr[Math.floor(Math.random() * unvisitedArr.length)];
    let [row, col] = startKey.split(',').map(Number) as [number, number];

    // Walk path and a map from key → index for O(1) loop detection
    const walkPath: [number, number][] = [[row, col]];
    const walkIndex = new Map<string, number>([[key(row, col), 0]]);

    // Random walk until we hit a maze cell
    while (!inMaze.has(key(row, col))) {
      const neighbors = getNeighbors(grid, row, col);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const nextKey = key(next.row, next.col);

      if (inMaze.has(nextKey)) {
        // Walk reached the maze — add endpoint and break to commit
        walkPath.push([next.row, next.col]);
        yield { phase: 'walking', row: next.row, col: next.col, path: [...walkPath] };
        break;
      }

      if (walkIndex.has(nextKey)) {
        // Loop detected — erase walk back to where we first visited nextKey
        const loopStart = walkIndex.get(nextKey)!;
        const removed = walkPath.splice(loopStart + 1);
        for (const [r, c] of removed) walkIndex.delete(key(r, c));
        row = next.row;
        col = next.col;
        yield { phase: 'erasing', row, col };
      } else {
        // Continue walk into unvisited territory
        row = next.row;
        col = next.col;
        walkPath.push([row, col]);
        walkIndex.set(nextKey, walkPath.length - 1);
        yield { phase: 'walking', row, col, path: [...walkPath] };
      }
    }

    // Commit the walk — carve walls along the path and add cells to maze
    // Last cell in walkPath is already in the maze (the endpoint), so stop before it
    for (let i = 0; i < walkPath.length - 1; i++) {
      const [r, c] = walkPath[i];
      const [nr, nc] = walkPath[i + 1];
      removeWall(grid[r][c], grid[nr][nc]);
      grid[r][c].visited = true;
      inMaze.add(key(r, c));
      unvisited.delete(key(r, c));
      yield { phase: 'carving', row: r, col: c };
    }
  }

  yield { phase: 'done' };
}
