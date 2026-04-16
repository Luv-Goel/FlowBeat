import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function NeonRift() {
  const groupRef = useRef();
  const boxRef = useRef();
  const octaRef = useRef();
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const flashRef = useRef(0);
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    if (!groupRef.current) return;

    groupRef.current.rotation.z += delta * (0.4 + features.rms * sensitivity * 12);
    groupRef.current.rotation.x += delta * 0.15;

    const scale = 1 + (features.energyDelta * sensitivity * 20) + (features.zcr * 0.003);
    targetScale.current.setScalar(scale);
    groupRef.current.scale.lerp(targetScale.current, 0.15);

    // Flash trigger + decay
    if (features.energyDelta > 0.05 * sensitivity) {
      flashRef.current = 1.0;
    }
    flashRef.current *= 0.85;

    // meshStandardMaterial — color AND emissiveIntensity both work now
    if (boxRef.current) {
      const r = 0.8 + features.energyDelta * 5 + flashRef.current * 0.5;
      boxRef.current.material.color.setRGB(Math.min(r, 1), flashRef.current * 0.1, 0.3);
      boxRef.current.material.emissiveIntensity = 0.5 + flashRef.current * 2.0;
    }
    if (octaRef.current) {
      const b = 0.5 + features.brightness * 0.5;
      octaRef.current.material.color.setRGB(flashRef.current * 0.2, b, 1);
      octaRef.current.material.emissiveIntensity = 0.3 + flashRef.current * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={boxRef}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={0.5} wireframe />
      </mesh>
      <mesh ref={octaRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[4, 0]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} wireframe />
      </mesh>
    </group>
  );
}
