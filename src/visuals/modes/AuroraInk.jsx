import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function AuroraInk() {
  const meshRef = useRef();
  const materialRef = useRef();
  const targetScale = useRef(new THREE.Vector3(1, 1, 1)); // Fix: persistent ref
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    if (!meshRef.current) return;

    meshRef.current.rotation.y += delta * 0.12;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.4;

    const scale = 1 + features.rms * sensitivity * 4;
    targetScale.current.set(scale, scale * 1.4, scale); // Fix: reuse same object
    meshRef.current.scale.lerp(targetScale.current, 0.05);

    if (materialRef.current) {
      // Use normalized brightness (already dynamic in AudioEngine)
      const hue = 0.58 + features.brightness * 0.25;
      materialRef.current.color.setHSL(hue, 1, 0.55);
      materialRef.current.emissiveIntensity = 0.4 + features.energy * sensitivity * 3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#aa00ff"
        wireframe
        emissive="#5500aa"
        emissiveIntensity={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
