import type { Grid, SolveStep } from '../types';
import { getNeighbors, canTraverse } from '../grid';

/**
 * BFS solver. Yields each cell visited so the caller can animate the frontier,
 * then yields a final 'done' step with the shortest path.
 */
export function* bfs(
  grid: Grid,
  start: [number, number],
  end: [number, number],
): Generator<SolveStep, void, unknown> {
  const [sr, sc] = start;
  const [er, ec] = end;

  const visited = new Set<string>();
  const prev = new Map<string, string | null>();

  const key = (r: number, c: number) => `${r},${c}`;
  const startKey = key(sr, sc);
  const endKey = key(er, ec);

  const queue: [number, number][] = [[sr, sc]];
  visited.add(startKey);
  prev.set(startKey, null);

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const current = grid[row][col];

    yield { phase: 'visiting', row, col };

    if (row === er && col === ec) {
      // Reconstruct path
      const path: [number, number][] = [];
      let cur: string | null | undefined = endKey;
      while (cur != null) {
        const [r, c] = cur.split(',').map(Number) as [number, number];
        path.unshift([r, c]);
        cur = prev.get(cur);
      }
      yield { phase: 'done', path };
      return;
    }

    for (const neighbor of getNeighbors(grid, row, col)) {
      const nKey = key(neighbor.row, neighbor.col);
      if (!visited.has(nKey) && canTraverse(current, neighbor)) {
        visited.add(nKey);
        prev.set(nKey, key(row, col));
        queue.push([neighbor.row, neighbor.col]);
      }
    }
  }

  // No path found (shouldn't happen for a perfect maze)
  yield { phase: 'done', path: [] };
}
