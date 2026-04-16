import React, { useEffect } from 'react';
import { AppProvider, MODES, useAppContext } from './AppContext';
import SceneManager from './visuals/SceneManager';
import StudioScope from './visuals/modes/StudioScope';
import ControlPanel from './ui/ControlPanel';
import { audioEngine } from './audio/AudioEngine';
import { exchangeCodeForToken } from './spotify/SpotifyAuth';

function AppInner() {
  const {
    activeMode, setActiveMode,
    setSpotifyToken, setSpotifyRefreshToken,
    setAlbumColor,
  } = useAppContext();

  // Handle Spotify OAuth callback — exchange code for tokens then clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      exchangeCodeForToken(code)
        .then((data) => {
          setSpotifyToken(data.access_token);
          if (data.refresh_token) setSpotifyRefreshToken(data.refresh_token);
          setActiveMode(MODES.SPOTIFY);
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch((err) => console.error('Spotify token exchange failed:', err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="flowbeat-app">
      <div className="canvas-container">
        <SceneManager />
        {activeMode === MODES.STUDIO_SCOPE && <StudioScope />}
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
