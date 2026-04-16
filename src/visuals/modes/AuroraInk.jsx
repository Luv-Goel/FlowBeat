import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

const COUNT = 80;

export default function AuroraInk() {
  const groupRef = useRef();
  const { sensitivity, colorTheme } = useAppContext();
  const colorRef = useRef(new THREE.Color());

  const meshRefs = useRef([]);

  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    x: (Math.random() - 0.5) * 14,
    y: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.7,
    baseHue: Math.random(),
  })), []);

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    const t = state.clock.elapsedTime;

    data.forEach((d, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const wave = Math.sin(t * d.speed + d.phase) * features.energy * sensitivity * 3;
      mesh.position.x = d.x + wave;
      mesh.position.y = d.y + Math.cos(t * d.speed * 0.5 + d.phase) * features.brightness * 2;
      mesh.position.z = d.z;

      const s = 0.05 + features.energy * sensitivity * 0.4;
      mesh.scale.setScalar(s);

      // Apply colorTheme
      const hue = ((d.baseHue + features.brightness * 0.3 + colorTheme.hueShift) % 1 + 1) % 1;
      const sat = Math.max(0.7 * colorTheme.satMult, 0.01);
      colorRef.current.setHSL(hue, sat, 0.55);
      mesh.material.color.set(colorRef.current);
      mesh.material.emissive.set(colorRef.current);
      mesh.material.emissiveIntensity = 0.4 + features.energy * 2;
    });

    if (groupRef.current) {
      groupRef.current.rotation.z += delta * features.energy * sensitivity * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          position={[d.x, d.y, d.z]}
        >
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial
            color="#8844ff"
            emissive="#8844ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}
