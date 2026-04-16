import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function AuroraInk() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      
      const scale = 1 + (features.rms * sensitivity * 5);
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale * 1.5, scale), 0.05);
    }

    if (materialRef.current) {
      // Modulate color by spectral centroid
      const hue = 0.6 + (features.spectralCentroid / 2000) * 0.3; // Blue/Purple range
      materialRef.current.color.setHSL(hue, 1, 0.6);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#aa00ff"
        wireframe={true}
        emissive="#5500aa"
        emissiveIntensity={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
