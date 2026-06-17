export type GeneratorId =
  | 'recursive-backtracking'
  | 'prims'
  | 'kruskals'
  | 'wilsons';

export type SolverId = 'bfs' | 'dfs' | 'astar';

export type AlgorithmMeta = {
  id: GeneratorId | SolverId;
  name: string;
  description: string;
  available: boolean;
};

export const GENERATORS: AlgorithmMeta[] = [
  {
    id: 'recursive-backtracking',
    name: 'Recursive Backtracking',
    description:
      'Carves passages by walking randomly and backtracking when stuck. Produces long, winding corridors with few dead ends — tends to feel river-like.',
    available: true,
  },
  {
    id: 'prims',
    name: "Prim's",
    description:
      'Grows the maze from a single cell by repeatedly adding the cheapest frontier edge. Produces a more uniform, branchy texture.',
    available: true,
  },
  {
    id: 'kruskals',
    name: "Kruskal's",
    description:
      'Randomly merges disconnected regions using a union-find structure. Produces a highly uniform maze with many short dead ends.',
    available: false,
  },
  {
    id: 'wilsons',
    name: "Wilson's",
    description:
      'Uses loop-erased random walks to carve passages. Slower to generate but produces a perfectly uniform random maze.',
    available: false,
  },
];

export const SOLVERS: AlgorithmMeta[] = [
  {
    id: 'bfs',
    name: 'BFS',
    description:
      'Breadth-first search explores all paths equally, layer by layer. Always finds the shortest path — but visits a lot of cells doing it.',
    available: true,
  },
  {
    id: 'dfs',
    name: 'DFS',
    description:
      'Depth-first search dives deep before backtracking. Fast but does not guarantee the shortest path.',
    available: true,
  },
  {
    id: 'astar',
    name: 'A*',
    description:
      'Uses a heuristic to bias search toward the goal. Finds the shortest path while visiting far fewer cells than BFS.',
    available: true,
  },
];
