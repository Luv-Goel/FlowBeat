import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppContext } from '../../AppContext';
import { audioEngine } from '../../audio/AudioEngine';

const PARTICLE_COUNT = 1000;

/**
 * SpotifyMode — an album-colour-reactive particle sphere.
 * The base hue is derived from the dominant album art colour;
 * particle brightness and spread pulse with the audio energy.
 */
export default function SpotifyMode() {
  const meshRef = useRef();
  const colorRef = useRef(new THREE.Color());
  const { sensitivity, albumColor } = useAppContext();

  // Build static geometry once
  const { positions, targetScales } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetScales = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      targetScales[i] = 0.5 + Math.random();
    }
    return { positions, targetScales };
  }, []);

  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const features = audioEngine.getFeatures();
    const energy = (features.energy || 0) * (sensitivity || 1);
    const brightness = features.brightness || 0;

    // Derive hue from album dominant colour via HSL
    const { r = 0.4, g = 0.2, b = 0.8 } = albumColor || {};
    colorRef.current.setRGB(r, g, b);
    const hsl = {};
    colorRef.current.getHSL(hsl);
    const baseHue = hsl.h;

    const geo = meshRef.current.geometry;
    const colorAttr = geo.attributes.color;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hue = (baseHue + (i / PARTICLE_COUNT) * 0.15 + brightness * 0.1) % 1;
      const lightness = 0.4 + energy * targetScales[i] * 0.4;
      colorRef.current.setHSL(hue, 0.85, Math.min(lightness, 0.9));
      colorAttr.setXYZ(i, colorRef.current.r, colorRef.current.g, colorRef.current.b);
    }
    colorAttr.needsUpdate = true;

    // Pulse overall scale with energy
    const scale = 1 + energy * 0.6;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.y += 0.002 + energy * 0.01;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
