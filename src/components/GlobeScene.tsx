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
        
        void main() {
          // Circuit board pattern with angled traces
          vec2 uv = vUv * 15.0;
          vec2 gridId = floor(uv);
          vec2 gridUv = fract(uv);
          
          float lineWidth = 0.06;
          float circuit = 0.0;
          
          // Horizontal traces
          float hLine = step(abs(gridUv.y - 0.5), lineWidth);
          
          // Vertical traces
          float vLine = step(abs(gridUv.x - 0.5), lineWidth);
          
          // Diagonal traces (45 degrees)
          float diagDist1 = abs(gridUv.x - gridUv.y);
          float diagLine1 = step(diagDist1, lineWidth * 1.4);
          
          // Diagonal traces (-45 degrees)
          float diagDist2 = abs(gridUv.x - (1.0 - gridUv.y));
          float diagLine2 = step(diagDist2, lineWidth * 1.4);
          
          // Random pattern selector
          float pattern = random(gridId);
          float patternType = floor(pattern * 5.0);
          
          // Different trace patterns based on random
          if (patternType < 1.0) {
            circuit = hLine * step(0.5, fract(pattern * 10.0));
          } else if (patternType < 2.0) {
            circuit = vLine * step(0.5, fract(pattern * 20.0));
          } else if (patternType < 3.0) {
            circuit = diagLine1 * step(0.6, fract(pattern * 15.0));
          } else if (patternType < 4.0) {
            circuit = diagLine2 * step(0.6, fract(pattern * 25.0));
          } else {
            // Corner traces - L shapes
            circuit = max(
              hLine * step(gridUv.x, 0.5),
              vLine * step(gridUv.y, 0.5)
            ) * step(0.7, pattern);
          }
          
          // Connection nodes at intersections and endpoints
          vec2 nodePos = vec2(0.5);
          float nodeDist = length(gridUv - nodePos);
          float node = smoothstep(0.15, 0.08, nodeDist) * step(0.65, pattern);
          
          // Small endpoint nodes
          vec2 endPoint1 = vec2(0.0, 0.5);
          vec2 endPoint2 = vec2(1.0, 0.5);
          vec2 endPoint3 = vec2(0.5, 0.0);
          vec2 endPoint4 = vec2(0.5, 1.0);
          
          float endpoint = 0.0;
          endpoint = max(endpoint, smoothstep(0.12, 0.06, length(gridUv - endPoint1)));
          endpoint = max(endpoint, smoothstep(0.12, 0.06, length(gridUv - endPoint2)));
          endpoint = max(endpoint, smoothstep(0.12, 0.06, length(gridUv - endPoint3)));
          endpoint = max(endpoint, smoothstep(0.12, 0.06, length(gridUv - endPoint4)));
          endpoint *= step(0.75, random(gridId + vec2(0.5, 0.5)));
          
          // Combine circuit elements
          circuit = max(max(circuit, node), endpoint);
          
          // Wrapping animation from angle
          float angle = atan(vPosition.z, vPosition.x);
          float heightFactor = (vPosition.y + 1.0) * 0.5; // Add vertical component
          float normalizedAngle = (angle + 3.14159) / 6.28318;
          
          // Diagonal wrap
          float wrapPos = normalizedAngle + heightFactor * 0.3;
          float reveal = smoothstep(progress * 1.5 - 0.4, progress * 1.5, wrapPos);
          reveal *= smoothstep(0.0, 0.15, progress);
          
          // Intense glow effect
          float glow = circuit * 1.8;
          vec3 color = glowColor * (circuit * 2.5 + glow * 1.2) * reveal;
          
          // Extra bright nodes
          color += glowColor * (node + endpoint) * 2.5 * reveal;
          
          // Subtle pulse
          float pulse = 1.0 + sin(time * 1.8 + pattern * 6.28) * 0.15;
          color *= pulse;
          
          // Alpha for visibility
          float alpha = circuit * reveal * 0.85 + glow * reveal * 0.4;
          
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

