import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  progress: number;
  mousePosition: { x: number; y: number };
}

export const Globe = ({ progress, mousePosition }: GlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const gridLinesRef = useRef<THREE.Group>(null);
  
  // Create latitude and longitude lines
  const gridLines = useMemo(() => {
    const lines = [];
    const radius = 2.01; // Slightly larger than globe
    const segments = 32;
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const points = [];
      const latRad = (lat * Math.PI) / 180;
      const latRadius = Math.cos(latRad) * radius;
      
      for (let i = 0; i <= segments; i++) {
        const lng = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            latRadius * Math.cos(lng),
            Math.sin(latRad) * radius,
            latRadius * Math.sin(lng)
          )
        );
      }
      lines.push({ points, type: 'latitude', lat });
    }
    
    // Longitude lines
    for (let lng = 0; lng < 180; lng += 20) {
      const points = [];
      const lngRad = (lng * Math.PI) / 180;
      
      for (let i = 0; i <= segments; i++) {
        const lat = ((i / segments) * 180 - 90) * (Math.PI / 180);
        const latRadius = Math.cos(lat) * radius;
        
        points.push(
          new THREE.Vector3(
            latRadius * Math.cos(lngRad),
            Math.sin(lat) * radius,
            latRadius * Math.sin(lngRad)
          )
        );
      }
      lines.push({ points, type: 'longitude', lng });
    }
    
    return lines;
  }, []);

  // Create shader material for the globe
  const globeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        glowColor: { value: new THREE.Color(0x00ff66) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float progress;
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Create grid effect based on position
          float grid = sin(vPosition.x * 20.0) * sin(vPosition.y * 20.0) * sin(vPosition.z * 20.0);
          float gridPattern = smoothstep(0.8, 1.0, grid);
          
          // Progressive reveal based on latitude
          float reveal = smoothstep(-1.0, 1.0, vPosition.y - 2.0 + progress * 4.0);
          
          // Combine patterns
          vec3 color = mix(vec3(0.0), glowColor, gridPattern * reveal * 0.3);
          
          // Add base dark color
          color += vec3(0.05, 0.08, 0.1);
          
          // Edge glow
          float edgeGlow = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
          color += glowColor * edgeGlow * 0.2 * reveal;
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
    });
  }, []);

  useFrame((state) => {
    if (!globeRef.current || !gridLinesRef.current) return;
    
    // Rotate globe slowly
    globeRef.current.rotation.y += 0.002;
    gridLinesRef.current.rotation.y += 0.002;
    
    // Mouse influence - tilt globe
    const mouseX = (mousePosition.x / window.innerWidth - 0.5) * 0.3;
    const mouseY = (mousePosition.y / window.innerHeight - 0.5) * 0.3;
    globeRef.current.rotation.x = THREE.MathUtils.lerp(
      globeRef.current.rotation.x,
      mouseY,
      0.05
    );
    gridLinesRef.current.rotation.x = globeRef.current.rotation.x;
    
    // Update shader progress
    if (globeMaterial.uniforms.progress) {
      globeMaterial.uniforms.progress.value = progress / 100;
    }
  });

  return (
    <group>
      {/* Main globe sphere */}
      <Sphere ref={globeRef} args={[2, 64, 64]} material={globeMaterial} />
      
      {/* Grid lines */}
      <group ref={gridLinesRef}>
        {gridLines.map((line, i) => {
          // Calculate opacity based on progress
          const lineProgress = progress / 100;
          const opacity = Math.min(1, lineProgress * 1.5);
          
          return (
            <Line
              key={i}
              points={line.points}
              color="#00ff66"
              lineWidth={1}
              transparent
              opacity={opacity * 0.6}
            />
          );
        })}
      </group>
      
      {/* Ambient particles around globe */}
      <DataParticles progress={progress} />
    </group>
  );
};

const DataParticles = ({ progress }: { progress: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2.5 + Math.random() * 1.5;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y += 0.0005;
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
        size={0.05}
        color="#00ff66"
        transparent
        opacity={Math.min(1, progress / 50)}
        sizeAttenuation
      />
    </points>
  );
};
