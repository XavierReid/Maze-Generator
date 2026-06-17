import { useRef, useState, useCallback, useEffect } from 'react';
import { createGrid } from '../engine/grid';
import { makeGenerator, makeSolver } from '../engine/factory';
import type { Grid } from '../engine/types';
import type { GeneratorId, SolverId } from '../engine/algorithms';
import { renderMaze } from '../renderer/draw';

const speedToDelay = (speed: number) => Math.round(205 - speed * 20);

export type SolverStats = {
  visitedCount: number;
  pathLength: number;
  done: boolean;
};

export type RaceResult = {
  winner: 'a' | 'b';
  a: SolverStats;
  b: SolverStats;
};

export type RacePhase = 'idle' | 'ready' | 'racing' | 'done';

export type RaceControls = {
  canvasARef: React.RefObject<HTMLCanvasElement | null>;
  canvasBRef: React.RefObject<HTMLCanvasElement | null>;
  phase: RacePhase;
  size: number;
  speed: number;
  generatorId: GeneratorId;
  solverAId: SolverId;
  solverBId: SolverId;
  result: RaceResult | null;
  setSize: (n: number) => void;
  setSpeed: (n: number) => void;
  setGeneratorId: (id: GeneratorId) => void;
  setSolverAId: (id: SolverId) => void;
  setSolverBId: (id: SolverId) => void;
  generate: () => void;
  startRace: () => void;
};

export function useRace(): RaceControls {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid>(createGrid(15));

  const [phase, setPhase] = useState<RacePhase>('idle');
  const [size, setSize] = useState(15);
  const [speed, setSpeed] = useState(5);
  const [generatorId, setGeneratorId] = useState<GeneratorId>('recursive-backtracking');
  const [solverAId, setSolverAId] = useState<SolverId>('bfs');
  const [solverBId, setSolverBId] = useState<SolverId>('astar');
  const [result, setResult] = useState<RaceResult | null>(null);

  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Per-solver render state (all in refs — no re-renders during race)
  const aVisitedRef  = useRef<Set<string>>(new Set());
  const aPathRef     = useRef<[number, number][]>([]);
  const aCurrentRef  = useRef<[number, number] | null>(null);
  const aStatsRef    = useRef<SolverStats>({ visitedCount: 0, pathLength: 0, done: false });

  const bVisitedRef  = useRef<Set<string>>(new Set());
  const bPathRef     = useRef<[number, number][]>([]);
  const bCurrentRef  = useRef<[number, number] | null>(null);
  const bStatsRef    = useRef<SolverStats>({ visitedCount: 0, pathLength: 0, done: false });

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopLoop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const renderBoth = useCallback((racePhase: 'solving' | 'solved') => {
    const grid = gridRef.current;

    if (canvasARef.current) {
      renderMaze(canvasARef.current, {
        grid,
        currentCell: aCurrentRef.current,
        frontierCells: [],
        walkPath: [],
        solvePath: aPathRef.current,
        solveVisited: aVisitedRef.current,
        phase: racePhase,
      });
    }

    if (canvasBRef.current) {
      renderMaze(canvasBRef.current, {
        grid,
        currentCell: bCurrentRef.current,
        frontierCells: [],
        walkPath: [],
        solvePath: bPathRef.current,
        solveVisited: bVisitedRef.current,
        phase: racePhase,
      });
    }
  }, []);

  const renderGenerated = useCallback(() => {
    const grid = gridRef.current;
    const emptyState = {
      grid,
      currentCell: null,
      frontierCells: [],
      walkPath: [],
      solvePath: [],
      solveVisited: new Set<string>(),
      phase: 'generated',
    };
    if (canvasARef.current) renderMaze(canvasARef.current, emptyState);
    if (canvasBRef.current) renderMaze(canvasBRef.current, emptyState);
  }, []);

  // ── Generate (synchronous — no animation in race mode) ───────────────────
  const generate = useCallback(() => {
    stopLoop();
    setResult(null);

    const newGrid = createGrid(size);
    const gen = makeGenerator(generatorId, newGrid);

    // Run to completion instantly
    let step = gen.next();
    while (!step.done && step.value.phase !== 'done') {
      step = gen.next();
    }

    gridRef.current = newGrid;
    renderGenerated();
    setPhase('ready');
  }, [size, generatorId, stopLoop, renderGenerated]);

  // ── Start race ────────────────────────────────────────────────────────────
  const startRace = useCallback(() => {
    if (phase !== 'ready' && phase !== 'done') return;
    stopLoop();

    // Reset per-solver state
    aVisitedRef.current  = new Set();
    aPathRef.current     = [];
    aCurrentRef.current  = null;
    aStatsRef.current    = { visitedCount: 0, pathLength: 0, done: false };

    bVisitedRef.current  = new Set();
    bPathRef.current     = [];
    bCurrentRef.current  = null;
    bStatsRef.current    = { visitedCount: 0, pathLength: 0, done: false };

    setResult(null);
    setPhase('racing');

    const grid = gridRef.current;
    const end: [number, number] = [grid.length - 1, grid.length - 1];
    const genA = makeSolver(solverAId, grid, [0, 0], end);
    const genB = makeSolver(solverBId, grid, [0, 0], end);

    intervalRef.current = setInterval(() => {
      const delay = speedToDelay(speedRef.current);
      const stepsPerTick = delay < 20 ? 6 : 1;
      let justFinished = false;

      for (let i = 0; i < stepsPerTick; i++) {
        // Advance solver A
        if (!aStatsRef.current.done) {
          const resA = genA.next();
          if (!resA.done) {
            const stepA = resA.value;
            if (stepA.phase === 'visiting') {
              aCurrentRef.current = [stepA.row, stepA.col];
              aVisitedRef.current.add(`${stepA.row},${stepA.col}`);
              aStatsRef.current.visitedCount++;
            } else if (stepA.phase === 'done') {
              aPathRef.current = stepA.path;
              aCurrentRef.current = null;
              aStatsRef.current = {
                ...aStatsRef.current,
                pathLength: stepA.path.length,
                done: true,
              };
              justFinished = true;
            }
          } else {
            aStatsRef.current.done = true;
          }
        }

        // Advance solver B
        if (!bStatsRef.current.done) {
          const resB = genB.next();
          if (!resB.done) {
            const stepB = resB.value;
            if (stepB.phase === 'visiting') {
              bCurrentRef.current = [stepB.row, stepB.col];
              bVisitedRef.current.add(`${stepB.row},${stepB.col}`);
              bStatsRef.current.visitedCount++;
            } else if (stepB.phase === 'done') {
              bPathRef.current = stepB.path;
              bCurrentRef.current = null;
              bStatsRef.current = {
                ...bStatsRef.current,
                pathLength: stepB.path.length,
                done: true,
              };
              justFinished = true;
            }
          } else {
            bStatsRef.current.done = true;
          }
        }

        // Stop when BOTH are done
        if (aStatsRef.current.done && bStatsRef.current.done) {
          justFinished = true;
          break;
        }
      }

      renderBoth(
        aStatsRef.current.done && bStatsRef.current.done ? 'solved' : 'solving',
      );

      if (aStatsRef.current.done && bStatsRef.current.done) {
        stopLoop();

        // Winner = whoever finished with fewer cells visited
        // (both reached goal, path length is the same for BFS/A*, but visited count differs)
        // If path lengths differ (DFS), the one with shorter path wins
        const aScore = aStatsRef.current.pathLength || Infinity;
        const bScore = bStatsRef.current.pathLength || Infinity;
        const winner = aScore <= bScore ? 'a' : 'b';

        setResult({
          winner,
          a: { ...aStatsRef.current },
          b: { ...bStatsRef.current },
        });
        setPhase('done');
      } else if (justFinished) {
        // One solver just finished — keep going until both are done
      }
    }, speedToDelay(speed));
  }, [phase, solverAId, solverBId, speed, stopLoop, renderBoth]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  return {
    canvasARef, canvasBRef,
    phase, size, speed,
    generatorId, solverAId, solverBId,
    result,
    setSize, setSpeed,
    setGeneratorId, setSolverAId, setSolverBId,
    generate, startRace,
  };
}
