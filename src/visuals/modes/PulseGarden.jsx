import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function PulseGarden() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    
    // Scale mesh based on smoothed energy
    const scale = 1 + (features.energy * sensitivity * 10);
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }

    // Color shift based on spectral centroid (brightness)
    if (materialRef.current) {
      const hue = (features.brightness * 0.5) % 1.0;
      materialRef.current.color.setHSL(hue, 0.8, 0.5);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[2, 0.6, 100, 16]} />
      <meshStandardMaterial 
        ref={materialRef} 
        color="#00ffcc" 
        wireframe={false} 
        emissive="#00ffcc"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
