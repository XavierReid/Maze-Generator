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
  | { phase: 'visiting'; row: number; col: number }
  | { phase: 'backtracking'; row: number; col: number }
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
