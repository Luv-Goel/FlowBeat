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
  const { sensitivity, colorTheme } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    if (!groupRef.current) return;

    // rotation driven by energy (was features.rms — fixed to features.energy)
    groupRef.current.rotation.z += delta * (0.4 + features.energy * sensitivity * 12);
    groupRef.current.rotation.x += delta * 0.15;

    const scale = 1 + (features.energyDelta * sensitivity * 20) + (features.zcr * 0.003);
    targetScale.current.setScalar(scale);
    groupRef.current.scale.lerp(targetScale.current, 0.15);

    // Flash trigger + decay
    if (features.energyDelta > 0.05 * sensitivity) flashRef.current = 1.0;
    flashRef.current *= 0.85;

    // colorTheme: hueShift shifts base hue, satMult scales saturation
    // Box: warm red/orange base, shifted by theme
    if (boxRef.current) {
      const baseHue = 0.0 + colorTheme.hueShift; // red base
      const sat = colorTheme.satMult;
      const lit = 0.5 + flashRef.current * 0.3;
      const c = new THREE.Color().setHSL(((baseHue % 1) + 1) % 1, sat, lit);
      c.r = Math.min(c.r + features.energyDelta * 5, 1);
      boxRef.current.material.color.set(c);
      boxRef.current.material.emissive.set(c);
      boxRef.current.material.emissiveIntensity = 0.5 + flashRef.current * 2.0;
    }

    // Octahedron: cyan/blue base, shifted by theme
    if (octaRef.current) {
      const baseHue = 0.55 + colorTheme.hueShift; // cyan base
      const sat = colorTheme.satMult;
      const lit = 0.4 + features.brightness * 0.3;
      const c = new THREE.Color().setHSL(((baseHue % 1) + 1) % 1, sat, lit);
      octaRef.current.material.color.set(c);
      octaRef.current.material.emissive.set(c);
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
