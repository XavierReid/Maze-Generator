import { useState } from 'react';
import { GENERATORS, SOLVERS } from '../engine/algorithms';
import type { AlgorithmMeta, GeneratorId, SolverId } from '../engine/algorithms';
import type { MazeControls } from '../hooks/useMaze';

type Props = Omit<MazeControls, 'canvasRef'>;

const PHASE_LABEL: Record<string, string> = {
  idle: 'Ready',
  generating: 'Generating…',
  generated: 'Generated',
  solving: 'Solving…',
  solved: 'Solved!',
};

export function Controls({
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
}: Props) {
  const [hoveredAlgo, setHoveredAlgo] = useState<AlgorithmMeta | null>(null);

  const isBusy = phase === 'generating' || phase === 'solving';
  const canSolve = phase === 'generated';

  const activeGenerator = GENERATORS.find((g) => g.id === generatorId)!;
  const activeSolver = SOLVERS.find((s) => s.id === solverId)!;
  // Description card shows hovered algo, falling back to whichever mode is active
  const displayedAlgo =
    hoveredAlgo ??
    (phase === 'solving' || phase === 'solved' ? activeSolver : activeGenerator);

  return (
    <div className="controls">
      {/* Status badge */}
      <div className={`status-badge ${phase}`}>{PHASE_LABEL[phase] ?? phase}</div>

      {/* Generation + Solving selectors side by side */}
      <div className="algo-selectors">
        <div className="control-group">
          <span className="control-label">Generation</span>
          <div className="radio-group">
            {GENERATORS.map((algo) => (
              <label
                key={algo.id}
                className={`radio-option${!algo.available ? ' disabled' : ''}${generatorId === algo.id ? ' selected' : ''}`}
                onMouseEnter={() => setHoveredAlgo(algo)}
                onMouseLeave={() => setHoveredAlgo(null)}
              >
                <input
                  type="radio"
                  name="generator"
                  value={algo.id}
                  checked={generatorId === algo.id}
                  disabled={!algo.available || isBusy}
                  onChange={() => setGeneratorId(algo.id as GeneratorId)}
                />
                {algo.name}
                {!algo.available && <span className="coming-soon">soon</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Solving</span>
          <div className="radio-group">
            {SOLVERS.map((algo) => (
              <label
                key={algo.id}
                className={`radio-option${!algo.available ? ' disabled' : ''}${solverId === algo.id ? ' selected' : ''}`}
                onMouseEnter={() => setHoveredAlgo(algo)}
                onMouseLeave={() => setHoveredAlgo(null)}
              >
                <input
                  type="radio"
                  name="solver"
                  value={algo.id}
                  checked={solverId === algo.id}
                  disabled={!algo.available || isBusy}
                  onChange={() => setSolverId(algo.id as SolverId)}
                />
                {algo.name}
                {!algo.available && <span className="coming-soon">soon</span>}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Description card */}
      <div className="algo-description">
        <p className="algo-description-name">{displayedAlgo.name}</p>
        <p className="algo-description-text">{displayedAlgo.description}</p>
      </div>

      {/* Size */}
      <div className="control-group">
        <label className="control-label">
          Size
          <span className="control-value">
            {size} × {size}
          </span>
        </label>
        <input
          type="range"
          min={5}
          max={50}
          value={size}
          disabled={isBusy}
          onChange={(e) => setSize(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Speed */}
      <div className="control-group">
        <label className="control-label">
          Speed
          <span className="control-value">{speed}</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Actions */}
      <div className="button-row">
        <button onClick={generate} disabled={isBusy} className="btn btn-primary">
          {phase === 'generating' ? 'Generating…' : 'Generate'}
        </button>
        <button onClick={solve} disabled={!canSolve} className="btn btn-secondary">
          {phase === 'solving' ? 'Solving…' : 'Solve'}
        </button>
      </div>
    </div>
  );
}
