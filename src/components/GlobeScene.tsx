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
  
  // Ocean base - brighter blue
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#0a4d7d');
  oceanGradient.addColorStop(0.5, '#1e5f8c');
  oceanGradient.addColorStop(1, '#0a4d7d');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Land masses with visible green/brown
  ctx.fillStyle = '#2d5a2d';
  
  // North America
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
  
  // Asia
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
  
  // Ice caps - visible white
  ctx.fillStyle = '#e8f4f8';
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
  
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
    const radius = 0.76; // Slightly larger than globe
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
    const earthTexture = new THREE.CanvasTexture(createEarthTexture());
    
    return new THREE.MeshStandardMaterial({
      map: earthTexture,
      metalness: 0.2,
      roughness: 0.8,
      emissive: new THREE.Color(0x112233),
      emissiveIntensity: 0.2,
    });
  }, []);
  
  // Create overlay material for circuit board pattern
  const overlayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        glowColor: { value: new THREE.Color(0x00ffaa) },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float progress;
        uniform vec3 glowColor;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        // Noise function for organic patterns
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          // Circuit board pattern using UV coordinates
          vec2 uv = vUv * 15.0; // Scale for pattern density
          
          // Main circuit traces - horizontal and vertical lines
          float hLines = step(0.92, fract(uv.y + noise(floor(uv) * 0.5) * 0.3));
          float vLines = step(0.92, fract(uv.x + noise(floor(uv) * 0.3) * 0.3));
          
          // Diagonal traces for complexity
          float diagLines = step(0.95, fract((uv.x + uv.y) * 0.5 + noise(floor(uv * 0.5)) * 0.2));
          
          // Connection nodes at intersections
          vec2 nodePos = fract(uv);
          float nodes = smoothstep(0.15, 0.05, length(nodePos - 0.5)) * 
                       step(0.8, random(floor(uv)));
          
          // Thicker main lines
          float mainLines = step(0.88, fract(uv.y * 0.5 + noise(floor(uv * 0.25)) * 0.5)) * 0.8;
          
          // Combine all patterns
          float circuit = max(max(hLines, vLines), max(diagLines, nodes));
          circuit = max(circuit, mainLines);
          
          // Wrapping animation - progressive reveal
          float angle = atan(vPosition.z, vPosition.x);
          float normalizedAngle = (angle + 3.14159) / 6.28318;
          
          // Sweep effect that wraps around
          float wrapReveal = smoothstep(progress - 0.3, progress + 0.1, normalizedAngle);
          
          // Vertical component
          float verticalReveal = smoothstep(-1.0, 1.0, vPosition.y + 1.5 - progress * 3.0);
          
          // Combined reveal
          float reveal = max(wrapReveal, verticalReveal * 0.4) * min(progress * 10.0, 1.0);
          
          // Add glow effect
          float glow = circuit * 0.3;
          vec3 color = glowColor * (circuit + glow) * reveal;
          
          // Pulsing effect on nodes
          float pulse = 1.0 + sin(time * 2.0 + random(floor(uv)) * 6.28) * 0.2;
          color *= mix(1.0, pulse, nodes * 0.5);
          
          float alpha = (circuit * reveal * 0.85) + (glow * reveal * 0.15);
          
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
    
    // Update shader progress and time for overlay
    const overlayMesh = globeRef.current.children[1] as THREE.Mesh;
    if (overlayMesh && overlayMesh.material) {
      const mat = overlayMesh.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        if (mat.uniforms.progress) {
          mat.uniforms.progress.value = progress / 100;
        }
        if (mat.uniforms.time) {
          mat.uniforms.time.value = state.clock.elapsedTime;
        }
      }
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Earth sphere with texture */}
      <Sphere args={[0.75, 64, 64]} material={globeMaterial} />
      
      {/* Circuit overlay */}
      <Sphere args={[0.755, 64, 64]} material={overlayMaterial} />
      
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
              lineWidth={0.8}
              transparent
              opacity={opacity * 0.6}
            />
          );
        })}
      </group>
    </group>
  );
};

