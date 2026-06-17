import { useState } from 'react';
import { useMaze } from './hooks/useMaze';
import { MazeCanvas } from './components/MazeCanvas';
import { Controls } from './components/Controls';
import { RaceView } from './components/RaceView';
import './styles/global.css';

type Tab = 'visualizer' | 'race';

export default function App() {
  const [tab, setTab] = useState<Tab>('visualizer');
  const maze = useMaze(15, 5);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1 className="title">
            Maze <span className="title-accent">Lab</span>
          </h1>
          <nav className="tabs">
            <button
              className={`tab ${tab === 'visualizer' ? 'active' : ''}`}
              onClick={() => setTab('visualizer')}
            >
              Visualizer
            </button>
            <button
              className={`tab ${tab === 'race' ? 'active' : ''}`}
              onClick={() => setTab('race')}
            >
              Race
            </button>
          </nav>
        </div>
      </header>

      {tab === 'visualizer' ? (
        <main className="main">
          <MazeCanvas canvasRef={maze.canvasRef} phase={maze.phase} />
          <Controls
            phase={maze.phase}
            size={maze.size}
            speed={maze.speed}
            generatorId={maze.generatorId}
            solverId={maze.solverId}
            setSize={maze.setSize}
            setSpeed={maze.setSpeed}
            setGeneratorId={maze.setGeneratorId}
            setSolverId={maze.setSolverId}
            generate={maze.generate}
            solve={maze.solve}
          />
        </main>
      ) : (
        <RaceView />
      )}
    </div>
  );
}
