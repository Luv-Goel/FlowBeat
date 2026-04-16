import React, { useEffect, useRef, useCallback } from 'react';
import { AppProvider, MODES, useAppContext } from './AppContext';
import SceneManager from './visuals/SceneManager';
import StudioScope from './visuals/modes/StudioScope';
import ControlPanel from './ui/ControlPanel';
import { audioEngine } from './audio/AudioEngine';

function AppInner() {
  const { setActiveMode } = useAppContext();
  const canvasRef = useRef(null);

  const handleCanvasReady = useCallback((canvas) => {
    canvasRef.current = canvas;
  }, []);

  // Global keyboard shortcuts
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
      if (e.key === '5') setActiveMode(MODES.SPOTIFY);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveMode]);

  const { activeMode } = useAppContext();

  return (
    <div className="flowbeat-app">
      <div className="canvas-container">
        <SceneManager onCanvasReady={handleCanvasReady} />
        {activeMode === MODES.STUDIO_SCOPE && <StudioScope />}
      </div>
      <ControlPanel canvasRef={canvasRef} />
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
