// ── Core data structures ─────────────────────────────────────────────────────

export type Walls = {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
};

export type Cell = {
  row: number;
  col: number;
  walls: Walls;
  visited: boolean;
};

export type Grid = Cell[][];

// ── Generator step types ─────────────────────────────────────────────────────

export type GenerateStep =
  | { phase: 'visiting'; row: number; col: number }               // recursive backtracking
  | { phase: 'backtracking'; row: number; col: number }           // recursive backtracking
  | { phase: 'carving'; row: number; col: number }                // Prim's / Kruskal's / Wilson's: cell added to maze
  | { phase: 'frontier'; cells: [number, number][] }              // Prim's: updated frontier snapshot
  | { phase: 'walking'; row: number; col: number; path: [number, number][] } // Wilson's: active random walk
  | { phase: 'erasing'; row: number; col: number }                // Wilson's: loop detected, erasing back
  | { phase: 'done' };

export type SolveStep =
  | { phase: 'visiting'; row: number; col: number }
  | { phase: 'done'; path: [number, number][] };

// ── App state ────────────────────────────────────────────────────────────────

export type AppPhase =
  | 'idle'
  | 'generating'
  | 'generated'
  | 'solving'
  | 'solved';

export type MazeState = {
  phase: AppPhase;
  grid: Grid;
  size: number;
  speed: number;
  currentCell: [number, number] | null;
  solvePath: [number, number][];
  solveVisited: Set<string>;
};
