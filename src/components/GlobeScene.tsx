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
  
  // Deep ocean base
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#001a33');
  oceanGradient.addColorStop(0.5, '#003d5c');
  oceanGradient.addColorStop(1, '#001a33');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Land masses with better colors
  ctx.fillStyle = '#1a4d2e';
  
  // North America (more accurate shape)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(300, 200);
  ctx.bezierCurveTo(350, 150, 450, 180, 500, 250);
  ctx.bezierCurveTo(480, 350, 420, 400, 380, 450);
  ctx.bezierCurveTo(320, 420, 280, 350, 300, 200);
  ctx.fill();
  ctx.restore();
  
  // South America
  ctx.beginPath();
  ctx.ellipse(480, 550, 70, 150, -0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Africa
  ctx.beginPath();
  ctx.moveTo(950, 400);
  ctx.bezierCurveTo(1000, 350, 1050, 380, 1080, 450);
  ctx.bezierCurveTo(1070, 550, 1020, 620, 970, 650);
  ctx.bezierCurveTo(920, 600, 900, 500, 950, 400);
  ctx.fill();
  
  // Europe
  ctx.beginPath();
  ctx.ellipse(1000, 220, 100, 70, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Asia (large mass)
  ctx.beginPath();
  ctx.moveTo(1100, 180);
  ctx.bezierCurveTo(1200, 140, 1400, 150, 1550, 200);
  ctx.bezierCurveTo(1600, 250, 1650, 300, 1680, 380);
  ctx.bezierCurveTo(1650, 450, 1550, 480, 1450, 450);
  ctx.bezierCurveTo(1350, 420, 1200, 350, 1150, 280);
  ctx.bezierCurveTo(1100, 240, 1080, 200, 1100, 180);
  ctx.fill();
  
  // Australia
  ctx.beginPath();
  ctx.ellipse(1580, 680, 90, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Greenland
  ctx.beginPath();
  ctx.ellipse(650, 120, 60, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add terrain variation
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[0] > 20) { // If it's land
      const shade = Math.random();
      ctx.fillStyle = shade > 0.7 
        ? 'rgba(40, 90, 50, 0.3)' // Mountains
        : 'rgba(25, 70, 40, 0.2)'; // Plains
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Ice caps
  ctx.fillStyle = 'rgba(240, 250, 255, 0.6)';
  ctx.fillRect(0, 0, canvas.width, 80);
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  
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
    const radius = 1.01; // Slightly larger than globe (half the original size)
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
          // Circuit board pattern - denser grid
          float circuitX = sin(vPosition.x * 50.0 + vPosition.z * 30.0);
          float circuitY = sin(vPosition.y * 50.0 + vPosition.x * 30.0);
          float circuitZ = sin(vPosition.z * 50.0 + vPosition.y * 30.0);
          float circuit = circuitX * circuitY * circuitZ;
          float circuitPattern = step(0.90, circuit);
          
          // Wrapping effect - reveals circuit as it wraps around
          // Based on angle from starting point (progressive wrap)
          float angle = atan(vPosition.z, vPosition.x);
          float normalizedAngle = (angle + 3.14159) / 6.28318; // Normalize to 0-1
          
          // Combine with vertical progression
          float verticalReveal = smoothstep(-1.0, 1.0, vPosition.y - 1.5 + progress * 3.0);
          float wrapReveal = smoothstep(0.0, 1.0, normalizedAngle - 1.0 + progress * 2.0);
          float reveal = max(verticalReveal, wrapReveal) * progress / 100.0;
          
          // Combine patterns
          vec3 color = glowColor * circuitPattern * reveal;
          
          // Edge glow for depth
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.5);
          color += glowColor * fresnel * 0.2 * reveal;
          
          float alpha = (circuitPattern * reveal * 0.85) + (fresnel * reveal * 0.15);
          
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
      {/* Main Earth sphere with texture - HALF SIZE */}
      <Sphere args={[1, 64, 64]} material={globeMaterial} />
      
      {/* Circuit overlay - HALF SIZE */}
      <Sphere args={[1.005, 64, 64]} material={overlayMaterial} />
      
      {/* Grid lines */}
      <group ref={gridLinesRef}>
        {gridLines.map((line, i) => {
          // Calculate opacity based on progress - wrapping effect
          const lineProgress = progress / 100;
          const opacity = Math.min(1, lineProgress * 2);
          
          return (
            <Line
              key={i}
              points={line.points}
              color="#00ff66"
              lineWidth={1.5}
              transparent
              opacity={opacity * 0.5}
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
      const radius = 1.3 + Math.random() * 0.8; // Adjusted for smaller globe
      
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
