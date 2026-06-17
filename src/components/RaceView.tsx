import { useEffect, type RefObject } from 'react';
import { useRace } from '../hooks/useRace';
import { GENERATORS, SOLVERS } from '../engine/algorithms';
import type { SolverId } from '../engine/algorithms';

const SOLVER_NAMES: Record<SolverId, string> = {
  bfs: 'BFS',
  dfs: 'DFS',
  astar: 'A*',
};

const CANVAS_SIZE = 420;

function RaceCanvas({
  canvasRef,
  label,
  isWinner,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  label: string;
  isWinner: boolean;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  return (
    <div className={`race-canvas-col ${isWinner ? 'winner' : ''}`}>
      <div className="race-solver-label">
        {isWinner && <span className="trophy">🏆</span>}
        {label}
      </div>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef as RefObject<HTMLCanvasElement>}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="maze-canvas"
        />
      </div>
    </div>
  );
}

export function RaceView() {
  const race = useRace();
  const canRace = race.phase === 'ready' || race.phase === 'done';

  return (
    <div className="race-view">
      {/* Controls bar */}
      <div className="race-controls">
        <div className="race-controls-left">
          <div className="control-group-inline">
            <span className="control-label-sm">Generation</span>
            <select
              value={race.generatorId}
              disabled={race.phase === 'racing'}
              onChange={(e) => race.setGeneratorId(e.target.value as typeof race.generatorId)}
              className="select"
            >
              {GENERATORS.filter((g) => g.available).map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group-inline">
            <span className="control-label-sm">Size <strong>{race.size}</strong></span>
            <input
              type="range" min={5} max={40} value={race.size}
              disabled={race.phase === 'racing'}
              onChange={(e) => race.setSize(Number(e.target.value))}
              className="slider slider-sm"
            />
          </div>

          <div className="control-group-inline">
            <span className="control-label-sm">Speed <strong>{race.speed}</strong></span>
            <input
              type="range" min={1} max={10} value={race.speed}
              onChange={(e) => race.setSpeed(Number(e.target.value))}
              className="slider slider-sm"
            />
          </div>

          <button
            onClick={race.generate}
            disabled={race.phase === 'racing'}
            className="btn btn-primary btn-sm"
          >
            Generate
          </button>
        </div>

        <div className="race-controls-right">
          {/* Solver A */}
          <select
            value={race.solverAId}
            disabled={!canRace}
            onChange={(e) => race.setSolverAId(e.target.value as SolverId)}
            className="select"
          >
            {SOLVERS.filter((s) => s.available).map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === race.solverBId}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="race-vs-label">vs</span>

          {/* Solver B */}
          <select
            value={race.solverBId}
            disabled={!canRace}
            onChange={(e) => race.setSolverBId(e.target.value as SolverId)}
            className="select"
          >
            {SOLVERS.filter((s) => s.available).map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === race.solverAId}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={race.startRace}
            disabled={!canRace}
            className="btn btn-secondary btn-sm"
          >
            {race.phase === 'racing' ? 'Racing…' : '▶ Start Race'}
          </button>
        </div>
      </div>

      {/* Canvases */}
      <div className={`race-canvases ${race.phase !== 'idle' ? 'visible' : ''}`}>
        <RaceCanvas
          canvasRef={race.canvasARef}
          label={SOLVER_NAMES[race.solverAId]}
          isWinner={race.result?.winner === 'a'}
        />

        <div className="race-divider">
          <span className="race-vs-badge">VS</span>
        </div>

        <RaceCanvas
          canvasRef={race.canvasBRef}
          label={SOLVER_NAMES[race.solverBId]}
          isWinner={race.result?.winner === 'b'}
        />
      </div>

      {/* Stats banner */}
      {race.result && (
        <div className="race-stats-banner">
          <div className={`race-stat-col ${race.result.winner === 'a' ? 'stat-winner' : ''}`}>
            <span className="stat-algo">{SOLVER_NAMES[race.solverAId]}</span>
            <span className="stat-item">{race.result.a.visitedCount} cells visited</span>
            <span className="stat-item">path length {race.result.a.pathLength}</span>
          </div>
          <div className="race-stat-divider" />
          <div className={`race-stat-col ${race.result.winner === 'b' ? 'stat-winner' : ''}`}>
            <span className="stat-algo">{SOLVER_NAMES[race.solverBId]}</span>
            <span className="stat-item">{race.result.b.visitedCount} cells visited</span>
            <span className="stat-item">path length {race.result.b.pathLength}</span>
          </div>
        </div>
      )}
    </div>
  );
}
