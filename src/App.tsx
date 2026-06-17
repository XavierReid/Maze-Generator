import { useMaze } from './hooks/useMaze';
import { MazeCanvas } from './components/MazeCanvas';
import { Controls } from './components/Controls';
import './styles/global.css';

export default function App() {
  const maze = useMaze(15, 5);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          Maze <span className="title-accent">Lab</span>
        </h1>
        <p className="subtitle">Algorithm visualizer &amp; game</p>
      </header>

      <main className="main">
        <MazeCanvas canvasRef={maze.canvasRef} phase={maze.phase} />
        <Controls
          phase={maze.phase}
          size={maze.size}
          speed={maze.speed}
          setSize={maze.setSize}
          setSpeed={maze.setSpeed}
          generate={maze.generate}
          solve={maze.solve}
        />
      </main>
    </div>
  );
}
