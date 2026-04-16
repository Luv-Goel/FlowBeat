import React from 'react';
import { AppProvider, MODES, useAppContext } from './AppContext';
import SceneManager from './visuals/SceneManager';
import StudioScope from './visuals/modes/StudioScope';
import ControlPanel from './ui/ControlPanel';

function AppInner() {
  const { activeMode } = useAppContext();
  return (
    <div className="flowbeat-app">
      <div className="canvas-container">
        {activeMode === MODES.STUDIO_SCOPE ? (
          <StudioScope />
        ) : (
          <SceneManager />
        )}
      </div>
      <ControlPanel />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
