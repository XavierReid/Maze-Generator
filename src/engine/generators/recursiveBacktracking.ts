import type { Grid, GenerateStep } from '../types';
import { getNeighbors, removeWall, shuffle } from '../grid';

/**
 * Recursive backtracking maze generator (iterative via explicit stack).
 * Mutates the grid in place and yields a step after each meaningful action
 * so the caller controls animation timing.
 */
export function* recursiveBacktracking(
  grid: Grid,
): Generator<GenerateStep, void, unknown> {
  const size = grid.length;
  const startRow = Math.floor(Math.random() * size);
  const startCol = Math.floor(Math.random() * size);

  const stack: [number, number][] = [[startRow, startCol]];
  grid[startRow][startCol].visited = true;

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1];

    yield { phase: 'visiting', row, col };

    const unvisited = shuffle(
      getNeighbors(grid, row, col).filter((n) => !n.visited),
    );

    if (unvisited.length > 0) {
      const next = unvisited[0];
      removeWall(grid[row][col], next);
      next.visited = true;
      stack.push([next.row, next.col]);
    } else {
      stack.pop();
      yield { phase: 'backtracking', row, col };
    }
  }

  yield { phase: 'done' };
}
