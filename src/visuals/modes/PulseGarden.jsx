import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

const PARTICLE_COUNT = 1200;

export default function PulseGarden() {
  const pointsRef = useRef();
  const { sensitivity, colorTheme } = useAppContext();
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const colorRef = useRef(new THREE.Color());

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 3 + Math.random() * 2;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.8;
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    if (!pointsRef.current) return;

    const scale = 1 + features.energy * sensitivity * 8;
    targetScale.current.setScalar(scale);
    pointsRef.current.scale.lerp(targetScale.current, 0.08);
    pointsRef.current.rotation.y += delta * (0.1 + features.energy * 0.5);

    // Apply colorTheme: shift base hue, scale saturation
    const baseHue = 0.45 + features.brightness * 0.4;
    const hue = ((baseHue + colorTheme.hueShift) % 1 + 1) % 1;
    const sat = 0.9 * colorTheme.satMult;
    colorRef.current.setHSL(hue, Math.max(sat, 0.01), 0.6);

    const colAttr = pointsRef.current.geometry.attributes.color;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      colAttr.setXYZ(i, colorRef.current.r, colorRef.current.g, colorRef.current.b);
    }
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}
