import type { Grid, GenerateStep } from '../types';
import { getNeighbors, removeWall, shuffle } from '../grid';

/**
 * Randomized Prim's maze generator.
 * Grows the maze outward from a random start cell by repeatedly carving
 * through a randomly chosen frontier wall. Produces a branchy, uniform
 * texture — visually distinct from recursive backtracking's long corridors.
 */
export function* prims(grid: Grid): Generator<GenerateStep, void, unknown> {
  const size = grid.length;
  const startRow = Math.floor(Math.random() * size);
  const startCol = Math.floor(Math.random() * size);

  grid[startRow][startCol].visited = true;

  // Frontier: unvisited cells adjacent to the carved region
  const frontier: [number, number][] = getNeighbors(grid, startRow, startCol)
    .map((n) => [n.row, n.col] as [number, number]);

  // Track frontier membership to avoid duplicates
  const inFrontier = new Set<string>(frontier.map(([r, c]) => `${r},${c}`));

  while (frontier.length > 0) {
    // Pick a random frontier cell
    const idx = Math.floor(Math.random() * frontier.length);
    const [row, col] = frontier[idx];

    // Remove from frontier
    frontier.splice(idx, 1);
    inFrontier.delete(`${row},${col}`);

    // Skip if somehow already visited
    if (grid[row][col].visited) continue;

    // Find visited neighbors — pick one at random to carve through
    const visitedNeighbors = shuffle(
      getNeighbors(grid, row, col).filter((n) => n.visited),
    );

    if (visitedNeighbors.length > 0) {
      removeWall(grid[row][col], visitedNeighbors[0]);
      grid[row][col].visited = true;

      yield { phase: 'carving', row, col };

      // Add unvisited neighbors to frontier
      for (const neighbor of getNeighbors(grid, row, col)) {
        const nKey = `${neighbor.row},${neighbor.col}`;
        if (!neighbor.visited && !inFrontier.has(nKey)) {
          frontier.push([neighbor.row, neighbor.col]);
          inFrontier.add(nKey);
        }
      }

      yield { phase: 'frontier', cells: [...frontier] };
    }
  }

  yield { phase: 'done' };
}
