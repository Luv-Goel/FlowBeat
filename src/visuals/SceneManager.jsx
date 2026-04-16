import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useAppContext, MODES } from '../AppContext';
import PulseGarden from './modes/PulseGarden';
import NeonRift from './modes/NeonRift';
import AuroraInk from './modes/AuroraInk';
import SpotifyMode from './modes/SpotifyMode';

function ActiveMode() {
  const { activeMode } = useAppContext();
  switch (activeMode) {
    case MODES.PULSE_GARDEN: return <PulseGarden />;
    case MODES.NEON_RIFT:    return <NeonRift />;
    case MODES.AURORA_INK:   return <AuroraInk />;
    case MODES.SPOTIFY:      return <SpotifyMode />;
    default:                 return null;
  }
}

export default function SceneManager() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      style={{ background: '#000' }}
    >
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <ActiveMode />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} />
      </EffectComposer>
    </Canvas>
  );
}
