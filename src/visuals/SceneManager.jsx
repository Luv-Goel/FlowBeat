import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAppContext, MODES } from '../AppContext';
import PulseGarden from './modes/PulseGarden';
import NeonRift from './modes/NeonRift';
import AuroraInk from './modes/AuroraInk';

export default function SceneManager() {
  const { activeMode } = useAppContext();

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#050505']} />
        {/* Boosted lighting for meshStandardMaterial modes (NeonRift, AuroraInk) */}
        <ambientLight intensity={1.2} />
        <pointLight position={[0, 0, 8]} intensity={2} color="#ffffff" />

        <Suspense fallback={null}>
          <group visible={activeMode === MODES.PULSE_GARDEN}>
            <PulseGarden />
          </group>
          <group visible={activeMode === MODES.NEON_RIFT}>
            <NeonRift />
          </group>
          <group visible={activeMode === MODES.AURORA_INK}>
            <AuroraInk />
          </group>
        </Suspense>

        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
