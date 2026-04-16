import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';
import * as THREE from 'three';

export default function NeonRift() {
  const groupRef = useRef();
  const { sensitivity } = useAppContext();

  useFrame((state, delta) => {
    const features = audioEngine.getFeatures();
    const rms = features.rms * sensitivity * 15;
    
    // Rotate entire group based on energy
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * (0.5 + rms);
      
      const scale = 1 + features.zcr * 5; 
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        <meshBasicMaterial color="#ff0044" wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[4, 0]} />
        <meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
    </group>
  );
}
