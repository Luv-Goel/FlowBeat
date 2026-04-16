import React, { useEffect } from 'react';
import { AppProvider, MODES, useAppContext } from './AppContext';
import SceneManager from './visuals/SceneManager';
import StudioScope from './visuals/modes/StudioScope';
import ControlPanel from './ui/ControlPanel';
import { audioEngine } from './audio/AudioEngine';

function AppInner() {
  const { activeMode, setActiveMode, sensitivity } = useAppContext();

  useEffect(() => {
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); audioEngine.togglePlay(); }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === '1') setActiveMode(MODES.PULSE_GARDEN);
      if (e.key === '2') setActiveMode(MODES.NEON_RIFT);
      if (e.key === '3') setActiveMode(MODES.AURORA_INK);
      if (e.key === '4') setActiveMode(MODES.STUDIO_SCOPE);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveMode]);

  return (
    <div className="flowbeat-app">
      <div className="canvas-container">
        <SceneManager />
        {activeMode === MODES.STUDIO_SCOPE && (
          <StudioScope
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
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
