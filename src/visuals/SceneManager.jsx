import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useAppContext, MODES } from '../AppContext';
import PulseGarden from './modes/PulseGarden';
import NeonRift from './modes/NeonRift';
import AuroraInk from './modes/AuroraInk';
import SpotifyMode from './modes/SpotifyMode';

export default function SceneManager() {
  const { activeMode } = useAppContext();

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      style={{ background: '#000' }}
    >
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <PulseGarden  visible={activeMode === MODES.PULSE_GARDEN} />
      <NeonRift     visible={activeMode === MODES.NEON_RIFT} />
      <AuroraInk    visible={activeMode === MODES.AURORA_INK} />
      <SpotifyMode  visible={activeMode === MODES.SPOTIFY} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} />
      </EffectComposer>
    </Canvas>
  );
}
