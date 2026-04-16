import React, { useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useAppContext, MODES } from '../AppContext';
import { audioEngine } from '../audio/AudioEngine';
import PulseGarden from './modes/PulseGarden';
import NeonRift from './modes/NeonRift';
import AuroraInk from './modes/AuroraInk';
import SpotifyMode from './modes/SpotifyMode';
import * as THREE from 'three';

// Expose the WebGL canvas element to the parent via callback
function CanvasRef({ onReady }) {
  const { gl } = useThree();
  useEffect(() => {
    if (onReady) onReady(gl.domElement);
  }, [gl, onReady]);
  return null;
}

// Gentle energy-reactive camera drift
function CameraController() {
  const { camera } = useThree();
  useFrame((state) => {
    const f = audioEngine.getFeatures();
    const t = state.clock.elapsedTime;
    const targetZ = 10 - (f.energy || 0) * 4;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.position.x = Math.sin(t * 0.07) * 0.8;
    camera.position.y = Math.cos(t * 0.05) * 0.4;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function ActiveMode() {
  const { activeMode } = useAppContext();
  switch (activeMode) {
    case MODES.PULSE_GARDEN: return <PulseGarden key="pulse" />;
    case MODES.NEON_RIFT:    return <NeonRift    key="neon" />;
    case MODES.AURORA_INK:   return <AuroraInk   key="aurora" />;
    case MODES.SPOTIFY:      return <SpotifyMode key="spotify" />;
    default:                 return null;
  }
}

export default function SceneManager({ onCanvasReady }) {
  const stableOnReady = useCallback(onCanvasReady || (() => {}), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      style={{ background: '#000' }}
    >
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <CanvasRef onReady={stableOnReady} />
      <CameraController />
      <ActiveMode />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} />
      </EffectComposer>
    </Canvas>
  );
}
