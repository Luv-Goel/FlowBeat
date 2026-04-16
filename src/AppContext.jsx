import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const MODES = {
  PULSE_GARDEN: 'Pulse Garden',
  NEON_RIFT: 'Neon Rift',
  AURORA_INK: 'Aurora Ink',
  STUDIO_SCOPE: 'Studio Scope',
  SPOTIFY: 'Spotify',
};

export const COLOR_THEMES = {
  NEON:   { name: 'Neon',   hueShift: 0,    satMult: 1.0 },
  PASTEL: { name: 'Pastel', hueShift: 0.1,  satMult: 0.5 },
  FIRE:   { name: 'Fire',   hueShift: -0.3, satMult: 1.2 },
  MONO:   { name: 'Mono',   hueShift: 0,    satMult: 0.0 },
};

export function AppProvider({ children }) {
  const [activeMode, setActiveMode] = useState(MODES.PULSE_GARDEN);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [smoothing, setSmoothness] = useState(0.8);
  const [debugMode, setDebugMode] = useState(false);
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES.NEON);

  // Spotify auth tokens (in-memory only)
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState(null);

  // Album dominant colour extracted from current track art
  const [albumColor, setAlbumColor] = useState({ r: 0.4, g: 0.2, b: 0.8 });

  return (
    <AppContext.Provider value={{
      activeMode, setActiveMode,
      sensitivity, setSensitivity,
      smoothing, setSmoothness,
      debugMode, setDebugMode,
      colorTheme, setColorTheme,
      spotifyToken, setSpotifyToken,
      spotifyRefreshToken, setSpotifyRefreshToken,
      albumColor, setAlbumColor,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
