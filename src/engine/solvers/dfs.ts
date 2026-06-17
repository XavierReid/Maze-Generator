import type { Grid, SolveStep } from '../types';
import { getNeighbors, canTraverse } from '../grid';

/**
 * Recursive DFS solver.
 * Dives deep along one path before backtracking — does NOT guarantee shortest path.
 * Path shown is the actual DFS traversal route, making the contrast with BFS clear.
 * Uses yield* to delegate yields up through recursive calls to the animation loop.
 */
export function* dfs(
  grid: Grid,
  start: [number, number],
  end: [number, number],
): Generator<SolveStep, void, unknown> {
  const visited = new Set<string>();
  const path: [number, number][] = [];
  let found = false;

  function* explore(
    row: number,
    col: number,
  ): Generator<SolveStep, void, unknown> {
    if (found) return;

    const key = `${row},${col}`;
    if (visited.has(key)) return;
    visited.add(key);
    path.push([row, col]);

    yield { phase: 'visiting', row, col };

    if (row === end[0] && col === end[1]) {
      found = true;
      yield { phase: 'done', path: [...path] };
      return;
    }

    for (const neighbor of getNeighbors(grid, row, col)) {
      if (!found && canTraverse(grid[row][col], neighbor)) {
        yield* explore(neighbor.row, neighbor.col);
      }
    }

    // Backtrack — remove this cell from the active path
    if (!found) path.pop();
  }

  yield* explore(start[0], start[1]);

  if (!found) yield { phase: 'done', path: [] };
}
