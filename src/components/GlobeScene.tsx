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
        
        // Draw a line segment
        float line(vec2 p, vec2 a, vec2 b, float width) {
          vec2 pa = p - a;
          vec2 ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          float dist = length(pa - ba * h);
          return smoothstep(width, width * 0.5, dist);
        }
        
        void main() {
          vec2 uv = vUv * 20.0;
          vec2 gridId = floor(uv);
          vec2 gridUv = fract(uv);
          
          float circuit = 0.0;
          float nodes = 0.0;
          float lineWidth = 0.04;
          
          // Random seed for this cell
          float seed = random(gridId);
          float patternChoice = floor(seed * 6.0);
          
          // Center point
          vec2 center = vec2(0.5);
          
          // Pattern 1: Horizontal line with nodes
          if (patternChoice < 1.0) {
            circuit = line(gridUv, vec2(0.0, 0.5), vec2(1.0, 0.5), lineWidth);
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.0, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(1.0, 0.5)));
          }
          // Pattern 2: Vertical line with nodes
          else if (patternChoice < 2.0) {
            circuit = line(gridUv, vec2(0.5, 0.0), vec2(0.5, 1.0), lineWidth);
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.0)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 1.0)));
          }
          // Pattern 3: Diagonal line
          else if (patternChoice < 3.0) {
            circuit = line(gridUv, vec2(0.0, 0.0), vec2(1.0, 1.0), lineWidth);
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.0, 0.0)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(1.0, 1.0)));
          }
          // Pattern 4: L-shape (corner)
          else if (patternChoice < 4.0) {
            circuit = max(
              line(gridUv, vec2(0.0, 0.5), vec2(0.5, 0.5), lineWidth),
              line(gridUv, vec2(0.5, 0.5), vec2(0.5, 1.0), lineWidth)
            );
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.0, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 1.0)));
          }
          // Pattern 5: Reverse L-shape
          else if (patternChoice < 5.0) {
            circuit = max(
              line(gridUv, vec2(1.0, 0.5), vec2(0.5, 0.5), lineWidth),
              line(gridUv, vec2(0.5, 0.5), vec2(0.5, 0.0), lineWidth)
            );
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(1.0, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.0)));
          }
          // Pattern 6: T-junction
          else {
            circuit = max(
              line(gridUv, vec2(0.0, 0.5), vec2(1.0, 0.5), lineWidth),
              line(gridUv, vec2(0.5, 0.5), vec2(0.5, 0.0), lineWidth)
            );
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.0, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(1.0, 0.5)));
            nodes += smoothstep(0.08, 0.04, length(gridUv - vec2(0.5, 0.0)));
          }
          
          // Only show if random threshold met
          float showPattern = step(0.35, seed);
          circuit *= showPattern;
          nodes *= showPattern;
          
          // Wrapping animation from angle
          float angle = atan(vPosition.z, vPosition.x);
          float heightFactor = (vPosition.y + 1.0) * 0.5;
          float normalizedAngle = (angle + 3.14159) / 6.28318;
          float wrapPos = normalizedAngle + heightFactor * 0.3;
          float reveal = smoothstep(progress * 1.5 - 0.4, progress * 1.5, wrapPos);
          reveal *= smoothstep(0.0, 0.15, progress);
          
          // Glow effect
          float glow = (circuit + nodes) * 2.0;
          vec3 color = glowColor * (circuit * 3.0 + nodes * 4.0 + glow) * reveal;
          
          // Pulse
          float pulse = 1.0 + sin(time * 2.0 + seed * 6.28) * 0.2;
          color *= pulse;
          
          float alpha = (circuit + nodes) * reveal * 0.9;
          
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

