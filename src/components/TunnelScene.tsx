import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface TunnelProps {
  progress: number;
  mousePosition: { x: number; y: number };
}

export const Tunnel = ({ progress, mousePosition }: TunnelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create tunnel segments
  const segments = useMemo(() => {
    const segs = [];
    const numSegments = 30;
    const segmentDistance = 5;
    
    for (let i = 0; i < numSegments; i++) {
      const points = [];
      const sides = 8;
      const radius = 4;
      
      // Create octagonal ring
      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            -i * segmentDistance
          )
        );
      }
      
      segs.push({
        points,
        z: -i * segmentDistance,
        index: i
      });
    }
    
    return segs;
  }, []);

  // Create connecting lines between rings
  const connectionLines = useMemo(() => {
    const lines = [];
    const sides = 8;
    
    for (let j = 0; j < sides; j++) {
      const points = [];
      for (let i = 0; i < segments.length; i++) {
        points.push(segments[i].points[j]);
      }
      lines.push(points);
    }
    
    return lines;
  }, [segments]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Camera movement based on progress
    const zPosition = 10 - (progress / 100) * 30; // Move forward through tunnel
    state.camera.position.z = zPosition;
    
    // Slight rotation based on mouse
    const mouseX = (mousePosition.x / window.innerWidth - 0.5) * 0.3;
    const mouseY = (mousePosition.y / window.innerHeight - 0.5) * 0.3;
    groupRef.current.rotation.x = mouseY * 0.5;
    groupRef.current.rotation.y = mouseX * 0.5;
    
    // Gentle tunnel rotation
    groupRef.current.rotation.z += 0.001;
  });

  return (
    <group ref={groupRef}>
      {/* Tunnel rings */}
      {segments.map((segment, i) => (
        <Line
          key={`ring-${i}`}
          points={segment.points}
          color="#00ff66"
          lineWidth={1}
          opacity={0.6}
          transparent
        />
      ))}
      
      {/* Connection lines */}
      {connectionLines.map((points, i) => (
        <Line
          key={`connection-${i}`}
          points={points}
          color="#00ff66"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      ))}
      
      {/* Floating particles */}
      <ParticleField progress={progress} />
    </group>
  );
};

const ParticleField = ({ progress }: { progress: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * 150;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 0.2; // Move particles forward
      
      // Reset particles that pass camera
      if (positions[i + 2] > 10) {
        positions[i + 2] = -150;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#00ff66"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};
