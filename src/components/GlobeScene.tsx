import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import earthTexture from '@/assets/earth-texture.jpg';


interface GlobeProps {
  progress: number;
  mousePosition: { x: number; y: number };
}

export const Globe = ({ progress, mousePosition }: GlobeProps) => {
  const globeRef = useRef<THREE.Group>(null);
  const gridLinesRef = useRef<THREE.Group>(null);
  
  // Load real Earth texture
  const texture = useTexture(earthTexture);
  

  // Create material for the globe with real Earth texture (brighter)
  const globeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.05,
      roughness: 0.7,
      emissive: new THREE.Color(0x1a3a4a),
      emissiveIntensity: 0.4,
    });
  }, [texture]);
  
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
        
        // Noise for organic patterns
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
          vec2 uv = vUv * 12.0;
          
          // Organic circuit lines
          float line1 = abs(sin(uv.x * 2.0 + noise(floor(uv * 0.5)) * 3.0));
          float line2 = abs(sin(uv.y * 2.0 + noise(floor(uv * 0.3)) * 3.0));
          float hLines = smoothstep(0.85, 0.95, line1);
          float vLines = smoothstep(0.85, 0.95, line2);
          
          // Diagonal flowing traces
          float diag = abs(sin((uv.x + uv.y) * 1.5 + noise(floor(uv * 0.4)) * 2.0));
          float diagLines = smoothstep(0.88, 0.96, diag);
          
          // Connection nodes
          vec2 nodeUv = fract(uv);
          float nodeDist = length(nodeUv - 0.5);
          float nodes = smoothstep(0.12, 0.08, nodeDist) * step(0.85, random(floor(uv)));
          
          // Main thick pathways
          float mainPath = smoothstep(0.80, 0.90, abs(sin(uv.y * 0.8 + noise(floor(uv * 0.2)) * 4.0)));
          
          // Combine patterns
          float circuit = max(max(hLines, vLines), max(diagLines, nodes));
          circuit = max(circuit, mainPath);
          
          // Wrapping animation - starts from one edge and wraps around globe
          float angle = atan(vPosition.z, vPosition.x);
          float normalizedAngle = (angle + 3.14159) / 6.28318; // 0 to 1
          
          // Progressive wrap - sweeps around horizontally
          float wrapSpeed = progress * 1.2;
          float wrapReveal = step(normalizedAngle, wrapSpeed);
          
          // Smooth edge of the wrap
          float wrapEdge = smoothstep(wrapSpeed - 0.15, wrapSpeed, normalizedAngle);
          float reveal = wrapReveal * min(progress * 8.0, 1.0);
          
          // Brighter glow
          float glow = circuit * 0.5;
          vec3 color = glowColor * (circuit * 1.2 + glow) * reveal;
          
          // Add extra brightness to nodes
          color += glowColor * nodes * 0.8 * reveal;
          
          // Pulsing animation
          float pulse = 1.0 + sin(time * 1.5 + random(floor(uv)) * 6.28) * 0.15;
          color *= pulse;
          
          float alpha = (circuit * reveal * 0.9) + (glow * reveal * 0.2);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (!globeRef.current) return;
    
    // Rotate globe slowly
    globeRef.current.rotation.y += 0.002;
    
    // Mouse influence - tilt globe
    const mouseX = (mousePosition.x / window.innerWidth - 0.5) * 0.3;
    const mouseY = (mousePosition.y / window.innerHeight - 0.5) * 0.3;
    globeRef.current.rotation.x = THREE.MathUtils.lerp(
      globeRef.current.rotation.x,
      mouseY,
      0.05
    );
    
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
    </group>
  );
};

