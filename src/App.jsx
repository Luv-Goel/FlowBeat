import React from 'react';
import SceneManager from './visuals/SceneManager';
import ControlPanel from './ui/ControlPanel';
import { AppProvider } from './AppContext';
import './index.css';

function App() {
  return (
    <AppProvider>
      <div className="flowbeat-app">
        <div className="canvas-container">
          <SceneManager />
        </div>
        <ControlPanel />
      </div>
    </AppProvider>
  );
}

export default App;
