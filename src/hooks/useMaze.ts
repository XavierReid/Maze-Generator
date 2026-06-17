import { useRef, useState, useCallback, useEffect } from 'react';
import { createGrid } from '../engine/grid';
import { recursiveBacktracking } from '../engine/generators/recursiveBacktracking';
import { prims } from '../engine/generators/prims';
import { kruskals } from '../engine/generators/kruskals';
import { bfs } from '../engine/solvers/bfs';
import { dfs } from '../engine/solvers/dfs';
import { astar } from '../engine/solvers/astar';
import type { Grid, AppPhase } from '../engine/types';
import type { GeneratorId, SolverId } from '../engine/algorithms';
import { renderMaze } from '../renderer/draw';

const speedToDelay = (speed: number) => Math.round(205 - speed * 20); // 1→185ms  10→5ms

export type MazeControls = {
  phase: AppPhase;
  size: number;
  speed: number;
  generatorId: GeneratorId;
  solverId: SolverId;
  setSize: (n: number) => void;
  setSpeed: (n: number) => void;
  setGeneratorId: (id: GeneratorId) => void;
  setSolverId: (id: SolverId) => void;
  generate: () => void;
  solve: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function useMaze(
  initialSize = 15,
  initialSpeed = 5,
  initialGeneratorId: GeneratorId = 'recursive-backtracking',
  initialSolverId: SolverId = 'bfs',
): MazeControls {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Grid lives in a ref — we never need React to re-render based on it
  const gridRef = useRef<Grid>(createGrid(initialSize));

  const [phase, setPhase] = useState<AppPhase>('idle');
  const [size, setSize] = useState(initialSize);
  const [speed, setSpeed] = useState(initialSpeed);
  const [generatorId, setGeneratorId] = useState<GeneratorId>(initialGeneratorId);
  const [solverId, setSolverId] = useState<SolverId>(initialSolverId);

  // Mutable render state refs (updated every tick, no re-render needed)
  const currentCellRef = useRef<[number, number] | null>(null);
  const frontierCellsRef = useRef<[number, number][]>([]);
  const solvePathRef = useRef<[number, number][]>([]);
  const solveVisitedRef = useRef<Set<string>>(new Set());
  const phaseRef = useRef<AppPhase>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(speed);
  const generatorIdRef = useRef(generatorId);
  const solverIdRef = useRef(solverId);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { generatorIdRef.current = generatorId; }, [generatorId]);
  useEffect(() => { solverIdRef.current = solverId; }, [solverId]);

  const stopLoop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderMaze(canvas, {
      grid: gridRef.current,
      currentCell: currentCellRef.current,
      frontierCells: frontierCellsRef.current,
      solvePath: solvePathRef.current,
      solveVisited: solveVisitedRef.current,
      phase: phaseRef.current,
    });
  }, []);

  // ── Generate ───────────────────────────────────────────────────────────────
  const generate = useCallback(() => {
    stopLoop();

    const newGrid = createGrid(size);
    gridRef.current = newGrid;
    currentCellRef.current = null;
    frontierCellsRef.current = [];
    solvePathRef.current = [];
    solveVisitedRef.current = new Set();

    setPhase('generating');
    phaseRef.current = 'generating';

    // Switch on generatorId — new algorithms plug in here in Phase 2d+
    const gen = (() => {
      switch (generatorIdRef.current) {
        case 'prims':
          return prims(newGrid);
        case 'kruskals':
          return kruskals(newGrid);
        case 'recursive-backtracking':
        default:
          return recursiveBacktracking(newGrid);
      }
    })();

    intervalRef.current = setInterval(() => {
      const delay = speedToDelay(speedRef.current);
      const stepsPerTick = delay < 20 ? 5 : 1;

      for (let i = 0; i < stepsPerTick; i++) {
        const result = gen.next();
        if (result.done || result.value.phase === 'done') {
          stopLoop();
          currentCellRef.current = null;
          setPhase('generated');
          phaseRef.current = 'generated';
          render();
          return;
        }
        const step = result.value;
        if (step.phase === 'visiting') {
          currentCellRef.current = [step.row, step.col];
        } else if (step.phase === 'backtracking') {
          currentCellRef.current = null;
        } else if (step.phase === 'carving') {
          currentCellRef.current = [step.row, step.col];
        } else if (step.phase === 'frontier') {
          frontierCellsRef.current = step.cells;
        }
      }
      render();
    }, speedToDelay(speed));
  }, [size, speed, stopLoop, render]);

  // ── Solve ──────────────────────────────────────────────────────────────────
  const solve = useCallback(() => {
    if (phase !== 'generated' && phase !== 'solved') return;
    stopLoop();

    solvePathRef.current = [];
    solveVisitedRef.current = new Set();

    setPhase('solving');
    phaseRef.current = 'solving';

    const grid = gridRef.current;
    const end: [number, number] = [grid.length - 1, grid.length - 1];

    // Switch on solverId — new algorithms plug in here in Phase 2b+
    const gen = (() => {
      switch (solverIdRef.current) {
        case 'dfs':
          return dfs(grid, [0, 0], end);
        case 'astar':
          return astar(grid, [0, 0], end);
        case 'bfs':
        default:
          return bfs(grid, [0, 0], end);
      }
    })();

    intervalRef.current = setInterval(() => {
      const delay = speedToDelay(speedRef.current);
      const stepsPerTick = delay < 20 ? 8 : 1;

      for (let i = 0; i < stepsPerTick; i++) {
        const result = gen.next();
        if (result.done) {
          stopLoop();
          setPhase('solved');
          phaseRef.current = 'solved';
          render();
          return;
        }
        const step = result.value;
        if (step.phase === 'visiting') {
          currentCellRef.current = [step.row, step.col];
          solveVisitedRef.current.add(`${step.row},${step.col}`);
        } else if (step.phase === 'done') {
          solvePathRef.current = step.path;
          currentCellRef.current = null;
          stopLoop();
          setPhase('solved');
          phaseRef.current = 'solved';
          render();
          return;
        }
      }
      render();
    }, speedToDelay(speed));
  }, [phase, speed, stopLoop, render]);

  // Cleanup on unmount
  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    phase,
    size,
    speed,
    generatorId,
    solverId,
    setSize,
    setSpeed,
    setGeneratorId,
    setSolverId,
    generate,
    solve,
    canvasRef,
  };
}
