import type { Grid, SolveStep } from '../types';
import { getNeighbors, canTraverse } from '../grid';
import { MinHeap } from '../utils/MinHeap';

const key = (r: number, c: number) => `${r},${c}`;

// Manhattan distance — never overestimates on a grid, so A* finds the shortest path
const heuristic = (r: number, c: number, er: number, ec: number) =>
  Math.abs(r - er) + Math.abs(c - ec);

/**
 * A* solver using a min-heap priority queue ordered by f = g + h.
 * g = steps taken from start, h = Manhattan distance to end.
 * Finds the shortest path while visiting far fewer cells than BFS.
 */
export function* astar(
  grid: Grid,
  start: [number, number],
  end: [number, number],
): Generator<SolveStep, void, unknown> {
  const [sr, sc] = start;
  const [er, ec] = end;

  const heap = new MinHeap<[number, number]>();
  const gScore = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  const startKey = key(sr, sc);
  gScore.set(startKey, 0);
  prev.set(startKey, null);
  heap.push([sr, sc], heuristic(sr, sc, er, ec));

  while (!heap.isEmpty) {
    const [row, col] = heap.pop()!;
    const cellKey = key(row, col);

    if (visited.has(cellKey)) continue; // stale heap entry — skip
    visited.add(cellKey);

    yield { phase: 'visiting', row, col };

    if (row === er && col === ec) {
      // Reconstruct path by walking prev map back to start
      const path: [number, number][] = [];
      let cur: string | null | undefined = key(er, ec);
      while (cur != null) {
        const [r, c] = cur.split(',').map(Number) as [number, number];
        path.unshift([r, c]);
        cur = prev.get(cur);
      }
      yield { phase: 'done', path };
      return;
    }

    for (const neighbor of getNeighbors(grid, row, col)) {
      if (!canTraverse(grid[row][col], neighbor)) continue;
      const nKey = key(neighbor.row, neighbor.col);
      if (visited.has(nKey)) continue;

      const tentativeG = (gScore.get(cellKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        gScore.set(nKey, tentativeG);
        prev.set(nKey, cellKey);
        const f = tentativeG + heuristic(neighbor.row, neighbor.col, er, ec);
        heap.push([neighbor.row, neighbor.col], f);
      }
    }
  }

  yield { phase: 'done', path: [] };
}
