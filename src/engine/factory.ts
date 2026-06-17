import type { Grid } from './types';
import type { GeneratorId, SolverId } from './algorithms';
import { recursiveBacktracking } from './generators/recursiveBacktracking';
import { prims } from './generators/prims';
import { kruskals } from './generators/kruskals';
import { wilsons } from './generators/wilsons';
import { bfs } from './solvers/bfs';
import { dfs } from './solvers/dfs';
import { astar } from './solvers/astar';

export function makeGenerator(id: GeneratorId, grid: Grid) {
  switch (id) {
    case 'prims':    return prims(grid);
    case 'kruskals': return kruskals(grid);
    case 'wilsons':  return wilsons(grid);
    default:         return recursiveBacktracking(grid);
  }
}

export function makeSolver(
  id: SolverId,
  grid: Grid,
  start: [number, number],
  end: [number, number],
) {
  switch (id) {
    case 'dfs':   return dfs(grid, start, end);
    case 'astar': return astar(grid, start, end);
    default:      return bfs(grid, start, end);
  }
}
