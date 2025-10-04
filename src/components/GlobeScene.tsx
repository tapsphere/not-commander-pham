import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Create procedural Earth texture
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  // Ocean base
  ctx.fillStyle = '#0a4d68';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add noise for ocean texture
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = `rgba(10, 77, 104, ${Math.random() * 0.3})`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  // Simplified continents (approximated shapes)
  ctx.fillStyle = '#2d5016';
  
  // North America
  ctx.beginPath();
  ctx.ellipse(400, 300, 180, 200, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // South America
  ctx.beginPath();
  ctx.ellipse(500, 600, 80, 180, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Europe
  ctx.beginPath();
  ctx.ellipse(950, 250, 120, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Africa
  ctx.beginPath();
  ctx.ellipse(1000, 500, 150, 200, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Asia
  ctx.beginPath();
  ctx.ellipse(1400, 300, 300, 200, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Australia
  ctx.beginPath();
  ctx.ellipse(1600, 700, 100, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add terrain texture
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[0] > 40) { // If it's land
      ctx.fillStyle = `rgba(45, 80, 22, ${Math.random() * 0.4})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Clouds layer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 20 + Math.random() * 80;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas;
}

interface GlobeProps {
  progress: number;
  mousePosition: { x: number; y: number };
}

export const Globe = ({ progress, mousePosition }: GlobeProps) => {
  const globeRef = useRef<THREE.Group>(null);
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
    // Create earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = new THREE.CanvasTexture(createEarthTexture());
    
    return new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.1,
      roughness: 0.9,
    });
  }, []);
  
  // Create overlay material for circuit grid
  const overlayMaterial = useMemo(() => {
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
          // Create circuit board pattern
          float circuit = sin(vPosition.x * 30.0) * sin(vPosition.y * 30.0);
          float circuitPattern = step(0.85, circuit);
          
          // Progressive reveal based on latitude (bottom to top)
          float reveal = smoothstep(-1.0, 1.0, vPosition.y - 2.0 + progress * 4.0);
          
          // Combine patterns
          vec3 color = glowColor * circuitPattern * reveal * 0.8;
          
          // Edge glow
          float edgeGlow = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 3.0);
          color += glowColor * edgeGlow * 0.3 * reveal;
          
          float alpha = (circuitPattern * reveal * 0.7) + (edgeGlow * reveal * 0.3);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
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
    
    // Update shader progress for overlay
    const overlayMesh = globeRef.current.children[0] as THREE.Mesh;
    if (overlayMesh && overlayMesh.material) {
      const mat = overlayMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms && mat.uniforms.progress) {
        mat.uniforms.progress.value = progress / 100;
      }
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Earth sphere with texture */}
      <Sphere args={[2, 64, 64]} material={globeMaterial} />
      
      {/* Circuit overlay */}
      <Sphere args={[2.01, 64, 64]} material={overlayMaterial} />
      
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
              opacity={opacity * 0.4}
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
