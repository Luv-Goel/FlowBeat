import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../audio/AudioEngine';
import { useAppContext } from '../AppContext';
import * as THREE from 'three';

/**
 * Spectrogram3D — a 3D spectrogram visualization using Three.js via React Three Fiber.
 * Frequency data scrolls along the Z-axis creating a "waterfall" spectrogram effect.
 * Bars rise and fall with frequency intensity, colored by spectral content.
 */
const BARS_X = 64;    // frequency bins
const BARS_Z = 48;    // history depth
const BAR_SPACING = 0.22;
const BAR_WIDTH = 0.15;
const BAR_DEPTH = 0.22;
const MAX_HEIGHT = 4.5;

export default function Spectrogram3D() {
  const groupRef = useRef();
  const scrollRef = useRef(0);
  const { sensitivity, colorTheme } = useAppContext();

  // Pre-allocate bar data arrays so we mutate in-place (no GC thrash)
  const heightsRef = useRef(new Float32Array(BARS_X * BARS_Z));
  const barMeshes = useRef([]);

  // Build the geometry + materials once
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(BARS_X * BARS_Z * 3);
    const col = new Float32Array(BARS_X * BARS_Z * 3);

    const offsetX = -(BARS_X - 1) * BAR_SPACING * 0.5;
    const offsetZ = -(BARS_Z - 1) * BAR_DEPTH * 0.5;

    for (let z = 0; z < BARS_Z; z++) {
      for (let x = 0; x < BARS_X; x++) {
        const idx = z * BARS_X + x;
        pos[idx * 3]     = offsetX + x * BAR_SPACING;
        pos[idx * 3 + 1] = 0;
        pos[idx * 3 + 2] = offsetZ + z * BAR_DEPTH;

        // Precompute base hue across the frequency range
        const hue = ((x / BARS_X) * 0.7 + 0.55) % 1.0;
        const c = new THREE.Color().setHSL(hue, 1.0, 0.5);
        col[idx * 3]     = c.r;
        col[idx * 3 + 1] = c.g;
        col[idx * 3 + 2] = c.b;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    const heights = heightsRef.current;

    // --- Scroll: shift all heights down by one row ---
    for (let z = BARS_Z - 1; z > 0; z--) {
      for (let x = 0; x < BARS_X; x++) {
        heights[z * BARS_X + x] = heights[(z - 1) * BARS_X + x];
      }
    }

    // --- Read new frequency data into the front row (z=0) ---
    const analyser = audioEngine.analyser;
    if (analyser) {
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);

      const binsPerBar = Math.floor(freqData.length / BARS_X);
      for (let x = 0; x < BARS_X; x++) {
        let sum = 0;
        const start = x * binsPerBar;
        for (let b = 0; b < binsPerBar; b++) {
          sum += freqData[start + b] || 0;
        }
        const avg = sum / binsPerBar / 255;
        // Smooth toward target
        const target = avg * MAX_HEIGHT * sensitivity;
        heights[x] = THREE.MathUtils.lerp(heights[x], target, 0.35);
      }
    } else {
      // No audio source — fade to silence
      for (let x = 0; x < BARS_X; x++) {
        heights[x] = THREE.MathUtils.lerp(heights[x], 0, 0.08);
      }
    }

    // --- Update bar group scale / rotation ---
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y += delta * (0.08 + features.energy * sensitivity * 0.5);
      groupRef.current.position.y = -1.0 - features.energy * 1.2;
    }

    // --- Write heights into the instanced mesh or update children ---
    // We use individual box meshes stored in barMeshes
    const meshes = barMeshes.current;
    if (meshes.length === 0) return;

    const offsetX = -(BARS_X - 1) * BAR_SPACING * 0.5;
    const offsetZ = -(BARS_Z - 1) * BAR_DEPTH * 0.5;

    for (let z = 0; z < BARS_Z; z++) {
      for (let x = 0; x < BARS_X; x++) {
        const idx = z * BARS_X + x;
        const mesh = meshes[idx];
        if (!mesh) continue;

        const h = Math.max(heights[idx], 0.05);
        mesh.scale.y = h;
        mesh.position.y = h * 0.5;

        // Color based on height + frequency position
        const norm = Math.min(h / MAX_HEIGHT, 1);
        const hueShift = colorTheme.hueShift;
        const hue = (((x / BARS_X) * 0.7 + 0.55 + hueShift) % 1 + 1) % 1;
        const sat = colorTheme.satMult * (0.6 + norm * 0.4);
        const light = 0.25 + norm * 0.7;
        const c = new THREE.Color().setHSL(hue, sat, light);
        mesh.material.color.set(c);
        mesh.material.emissive.set(c);
        mesh.material.emissiveIntensity = norm * 0.6 + features.energy * 0.5;
      }
    }
  });

  // Build bar mesh array on first render via callback refs
  const bars = [];
  for (let i = 0; i < BARS_X * BARS_Z; i++) {
    bars.push(i);
  }

  return (
    <group ref={groupRef}>
      {/* Subtle floor reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial
          color="#0a0a2e"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {bars.map((idx) => {
        const z = Math.floor(idx / BARS_X);
        const x = idx % BARS_X;
        const offsetX = -(BARS_X - 1) * BAR_SPACING * 0.5;
        const offsetZ = -(BARS_Z - 1) * BAR_DEPTH * 0.5;

        return (
          <mesh
            key={idx}
            ref={(el) => {
              if (el && !barMeshes.current[idx]) {
                barMeshes.current[idx] = el;
                // Initial position
                el.position.set(
                  offsetX + x * BAR_SPACING,
                  0.5,
                  offsetZ + z * BAR_DEPTH,
                );
              }
            }}
            position={[
              offsetX + x * BAR_SPACING,
              0.5,
              offsetZ + z * BAR_DEPTH,
            ]}
          >
            <boxGeometry args={[BAR_WIDTH, 1, BAR_DEPTH]} />
            <meshStandardMaterial
              color="#4477ff"
              emissive="#2244aa"
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}
