import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

const RIBBON_POINTS = 80;

export default function AuroraInk() {
  const meshRef = useRef();
  const colorRef = useRef(new THREE.Color());
  const { sensitivity } = useAppContext();

  // Persistent control-point array — mutated in-place each frame, no allocation
  const pointsArray = useRef(
    Array.from({ length: RIBBON_POINTS }, (_, i) =>
      new THREE.Vector3(Math.sin(i * 0.2) * 4, (i - RIBBON_POINTS / 2) * 0.15, 0)
    )
  );

  useFrame((state) => {
    const features = audioEngine.getFeatures();
    const t = state.clock.elapsedTime;

    // Animate control points like flowing ink ribbons
    pointsArray.current.forEach((pt, i) => {
      pt.x = Math.sin(i * 0.2 + t * 0.5) * (3 + features.brightness * 2 * sensitivity);
      pt.z = Math.cos(i * 0.15 + t * 0.3) * (1 + features.energy * sensitivity * 4);
    });

    // Rebuild tube geometry each frame (kept cheap at RIBBON_POINTS=80)
    if (meshRef.current) {
      const curve = new THREE.CatmullRomCurve3(pointsArray.current);
      const newGeo = new THREE.TubeGeometry(curve, RIBBON_POINTS, 0.05 + features.energy * 0.15, 6, false);
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = newGeo;

      const hue = (0.6 + features.brightness * 0.3 + t * 0.02) % 1;
      colorRef.current.setHSL(hue, 0.8, 0.55);
      meshRef.current.material.color.copy(colorRef.current);
      meshRef.current.material.emissive.copy(colorRef.current);
      meshRef.current.material.emissiveIntensity = 0.3 + features.energy * sensitivity * 2;
    }
  });

  const initialGeo = useMemo(() => {
    const pts = Array.from({ length: RIBBON_POINTS }, (_, i) =>
      new THREE.Vector3(Math.sin(i * 0.2) * 4, (i - RIBBON_POINTS / 2) * 0.15, 0)
    );
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, RIBBON_POINTS, 0.05, 6, false);
  }, []);

  return (
    <mesh ref={meshRef} geometry={initialGeo}>
      <meshStandardMaterial color="#8844ff" emissive="#8844ff" emissiveIntensity={0.3} />
    </mesh>
  );
}
