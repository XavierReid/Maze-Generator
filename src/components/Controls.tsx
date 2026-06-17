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
  setSize,
  setSpeed,
  generate,
  solve,
}: Props) {
  const isBusy = phase === 'generating' || phase === 'solving';
  const canSolve = phase === 'generated';

  return (
    <div className="controls">
      {/* Status badge */}
      <div className={`status-badge ${phase}`}>{PHASE_LABEL[phase] ?? phase}</div>

      {/* Size */}
      <div className="control-group">
        <label className="control-label">
          Size
          <span className="control-value">{size} × {size}</span>
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
        <button
          onClick={generate}
          disabled={isBusy}
          className="btn btn-primary"
        >
          {phase === 'generating' ? 'Generating…' : 'Generate'}
        </button>
        <button
          onClick={solve}
          disabled={!canSolve}
          className="btn btn-secondary"
        >
          {phase === 'solving' ? 'Solving…' : 'Solve (BFS)'}
        </button>
      </div>
    </div>
  );
}
