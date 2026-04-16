import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function NeonRift() {
  const groupRef = useRef();
  const boxRef = useRef();
  const octaRef = useRef();
  const targetScale = useRef(new THREE.Vector3(1, 1, 1)); // Fix: persistent ref
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    if (!groupRef.current) return;

    // Base rotation driven by rms
    groupRef.current.rotation.z += delta * (0.4 + features.rms * sensitivity * 12);
    groupRef.current.rotation.x += delta * 0.15;

    // energyDelta drives drop-reactive scale spike
    const scale = 1 + (features.energyDelta * sensitivity * 20) + (features.zcr * 0.003);
    targetScale.current.setScalar(scale); // Fix: reuse same object
    groupRef.current.scale.lerp(targetScale.current, 0.15);

    // Color shift on drop
    if (boxRef.current) {
      const r = 0.8 + features.energyDelta * 5;
      boxRef.current.material.color.setRGB(Math.min(r, 1), 0, 0.3);
    }
    if (octaRef.current) {
      const b = 0.5 + features.brightness * 0.5;
      octaRef.current.material.color.setRGB(0, b, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={boxRef}>
        <boxGeometry args={[3, 3, 3]} />
        <meshBasicMaterial color="#ff0044" wireframe />
      </mesh>
      <mesh ref={octaRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[4, 0]} />
        <meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
    </group>
  );
}
