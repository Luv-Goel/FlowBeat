import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, EffectComposer, Bloom } from '@react-three/drei';
import { useAppContext, MODES } from '../AppContext';

// Import visual modes
import PulseGarden from './modes/PulseGarden';
import NeonRift from './modes/NeonRift';
import AuroraInk from './modes/AuroraInk';

export default function SceneManager() {
  const { activeMode } = useAppContext();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          {activeMode === MODES.PULSE_GARDEN && <PulseGarden />}
          {activeMode === MODES.NEON_RIFT && <NeonRift />}
          {activeMode === MODES.AURORA_INK && <AuroraInk />}
        </Suspense>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            opacity={1.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
