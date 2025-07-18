import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated ring component
function AnimatedRing({ radius = 1, color = '#00ff88', speed = 1 }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02 * speed;
    }
  });
  
  return (
    <mesh ref={ringRef}>
      <ringGeometry args={[radius, radius + 0.1, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Floating spheres component
function FloatingSpheres() {
  const spheresRef = useRef();
  
  useFrame((state) => {
    if (spheresRef.current) {
      spheresRef.current.rotation.y += 0.01;
      spheresRef.current.children.forEach((sphere, i) => {
        sphere.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
      });
    }
  });
  
  return (
    <group ref={spheresRef}>
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 1.5,
            0,
            Math.sin((i / 6) * Math.PI * 2) * 1.5
          ]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      ))}
    </group>
  );
}

// Pulsing center sphere
function PulsingSphere() {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      sphereRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color="#4ecdc4" transparent opacity={0.9} />
    </mesh>
  );
}

// Main loading scene
function LoadingScene() {
  return (
    <>
      <AnimatedRing radius={2} color="#00ff88" speed={1} />
      <AnimatedRing radius={1.5} color="#ff6b6b" speed={-1.5} />
      <AnimatedRing radius={1} color="#4ecdc4" speed={2} />
      <FloatingSpheres />
      <PulsingSphere />
    </>
  );
}

// Main LoadingR3F component
export default function LoadingR3F({ 
  size = 200, 
  backgroundColor = '#1a1a1a',
  className = '',
  text = 'Loading...'
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        style={{ 
          backgroundColor,
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <LoadingScene />
        </Canvas>
      </div>
    
    </div>
  );
}