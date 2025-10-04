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
  

  // Create material for the globe with real Earth texture (brighter with glow)
  const globeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.1,
      roughness: 0.5,
      emissive: new THREE.Color(0x3a7aa0),
      emissiveIntensity: 0.8,
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
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        void main() {
          vec2 uv = vUv * 20.0;
          vec2 gridId = floor(uv);
          vec2 gridUv = fract(uv);
          
          // Clean circuit board traces - horizontal and vertical
          float lineWidth = 0.08;
          float hLine = step(abs(gridUv.y - 0.5), lineWidth);
          float vLine = step(abs(gridUv.x - 0.5), lineWidth);
          
          // Random pattern for traces
          float pattern = random(gridId);
          float hTrace = hLine * step(0.7, pattern);
          float vTrace = vLine * step(0.7, random(gridId + vec2(1.0, 0.0)));
          
          // Connection nodes at intersections
          vec2 nodePos = vec2(0.5);
          float nodeDist = length(gridUv - nodePos);
          float node = smoothstep(0.15, 0.08, nodeDist) * step(0.8, pattern);
          
          // Small circuit pads
          float pad = smoothstep(0.25, 0.18, nodeDist) * step(0.85, random(gridId + vec2(0.5, 0.5)));
          
          // Combine circuit elements
          float circuit = max(max(hTrace, vTrace), max(node, pad));
          
          // Wrapping animation
          float angle = atan(vPosition.z, vPosition.x);
          float normalizedAngle = (angle + 3.14159) / 6.28318;
          
          // Smooth progressive reveal
          float wrapSpeed = progress * 1.3;
          float reveal = smoothstep(wrapSpeed - 0.2, wrapSpeed, normalizedAngle);
          reveal *= min(progress * 5.0, 1.0);
          
          // Intense glow effect
          float glow = circuit * 1.5;
          vec3 color = glowColor * (circuit * 2.0 + glow) * reveal;
          
          // Extra bright nodes
          color += glowColor * (node + pad) * 1.5 * reveal;
          
          // Subtle pulse on traces
          float pulse = 1.0 + sin(time * 2.0 + pattern * 6.28) * 0.2;
          color *= pulse;
          
          // Strong alpha for visibility
          float alpha = (circuit * reveal * 0.95) + (glow * reveal * 0.3);
          
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

