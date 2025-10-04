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
  

  // Create material for the globe with real Earth texture
  const globeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.2,
      roughness: 0.7,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
  }, [texture]);
  
  // Create overlay material for circuit board pattern
  const overlayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        glowColor: { value: new THREE.Color(0x00ff66) },
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
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          vec2 uv = vUv * 25.0;
          vec2 gridId = floor(uv);
          vec2 gridUv = fract(uv);
          
          float circuit = 0.0;
          float seed = random(gridId);
          
          // Create flowing circuit paths
          float pathNoise = noise(gridId * 0.5);
          float angle = pathNoise * 6.28318;
          
          // Multiple parallel traces
          float lineWidth = 0.035;
          float spacing = 0.15;
          
          // Horizontal parallel traces
          for (float i = -2.0; i <= 2.0; i += 1.0) {
            float offset = i * spacing;
            float hTrace = step(abs(gridUv.y - 0.5 - offset), lineWidth);
            circuit += hTrace * step(0.3, seed + i * 0.1);
          }
          
          // Vertical parallel traces  
          for (float i = -2.0; i <= 2.0; i += 1.0) {
            float offset = i * spacing;
            float vTrace = step(abs(gridUv.x - 0.5 - offset), lineWidth);
            circuit += vTrace * step(0.3, seed + i * 0.15);
          }
          
          // Diagonal traces
          float diagNoise = noise(gridId + vec2(5.0, 3.0));
          if (diagNoise > 0.4) {
            for (float i = -1.0; i <= 1.0; i += 1.0) {
              float offset = i * spacing;
              float diagDist = abs(gridUv.x - gridUv.y - offset);
              float diagTrace = step(diagDist, lineWidth * 1.4);
              circuit += diagTrace * step(0.5, diagNoise + i * 0.1);
            }
          }
          
          // Corner connections - L shapes
          float cornerNoise = noise(gridId + vec2(10.0, 7.0));
          if (cornerNoise > 0.6) {
            // Horizontal part of L
            float hPart = step(abs(gridUv.y - 0.5), lineWidth) * step(gridUv.x, 0.6);
            // Vertical part of L
            float vPart = step(abs(gridUv.x - 0.5), lineWidth) * step(gridUv.y, 0.6);
            circuit += max(hPart, vPart) * 1.5;
          }
          
          // Connection nodes at intersections
          vec2 nodeCenter = vec2(0.5);
          float nodeDist = length(gridUv - nodeCenter);
          float mainNode = smoothstep(0.12, 0.06, nodeDist) * step(0.5, seed);
          
          // Small endpoint nodes
          float endpoints = 0.0;
          vec2 ep1 = vec2(0.2, 0.5);
          vec2 ep2 = vec2(0.8, 0.5);
          vec2 ep3 = vec2(0.5, 0.2);
          vec2 ep4 = vec2(0.5, 0.8);
          
          endpoints += smoothstep(0.08, 0.04, length(gridUv - ep1));
          endpoints += smoothstep(0.08, 0.04, length(gridUv - ep2));
          endpoints += smoothstep(0.08, 0.04, length(gridUv - ep3));
          endpoints += smoothstep(0.08, 0.04, length(gridUv - ep4));
          endpoints *= step(0.6, random(gridId + vec2(20.0, 15.0)));
          
          // Combine all elements
          circuit = clamp(circuit, 0.0, 1.0);
          float nodes = mainNode + endpoints;
          
          // Wrapping animation - covers the globe progressively
          float angle3d = atan(vPosition.z, vPosition.x);
          float heightFactor = (vPosition.y + 1.0) * 0.5;
          float normalizedAngle = (angle3d + 3.14159) / 6.28318;
          float wrapPos = normalizedAngle + heightFactor * 0.4;
          
          // Reverse the reveal so it wraps instead of unwraps
          float reveal = smoothstep(progress * 1.6, progress * 1.6 - 0.5, wrapPos);
          reveal *= smoothstep(0.0, 0.2, progress);
          
          // Intense glowing effect
          float totalCircuit = circuit + nodes;
          float glow = totalCircuit * 2.5;
          vec3 color = glowColor * (totalCircuit * 4.0 + glow * 2.0) * reveal;
          
          // Extra bright nodes
          color += glowColor * nodes * 5.0 * reveal;
          
          // Pulse animation
          float pulse = 1.0 + sin(time * 2.5 + seed * 6.28) * 0.25;
          color *= pulse;
          
          // Alpha with strong visibility
          float alpha = totalCircuit * reveal * 0.95 + glow * reveal * 0.5;
          
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

