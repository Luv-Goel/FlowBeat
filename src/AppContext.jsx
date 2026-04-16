import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const MODES = {
  PULSE_GARDEN: 'Pulse Garden',
  NEON_RIFT: 'Neon Rift',
  AURORA_INK: 'Aurora Ink'
};

export function AppProvider({ children }) {
  const [activeMode, setActiveMode] = useState(MODES.PULSE_GARDEN);
  const [sensitivity, setSensitivity] = useState(1.0);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <AppContext.Provider value={{
      activeMode, setActiveMode,
      sensitivity, setSensitivity,
      debugMode, setDebugMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
