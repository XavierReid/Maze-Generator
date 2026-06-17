import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { AppPhase } from '../engine/types';

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phase: AppPhase;
};

const CANVAS_SIZE = 560;

export function MazeCanvas({ canvasRef, phase }: Props) {
  // Draw a blank canvas on first mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef as RefObject<HTMLCanvasElement>}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={`maze-canvas ${phase}`}
      />
    </div>
  );
}
