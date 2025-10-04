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
  

  // Create material for the globe - visible Earth with subtle glow
  const globeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.15,
      roughness: 0.6,
      emissive: new THREE.Color(0x2a5a7a),
      emissiveIntensity: 0.6,
    });
  }, [texture]);
  
  // Create overlay material for city lights and infrastructure pattern
  const overlayMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        progress: { value: 0 },
        glowColor: { value: new THREE.Color(0x00d4ff) },
        time: { value: 0 },
        earthTexture: { value: texture },
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
        uniform sampler2D earthTexture;
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
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          // Sample earth texture to determine land vs ocean
          vec4 earthColor = texture2D(earthTexture, vUv);
          float landMask = step(0.35, earthColor.r + earthColor.g);
          
          // Create infrastructure network based on geography
          vec2 uv = vUv * 40.0;
          vec2 gridId = floor(uv);
          vec2 gridUv = fract(uv);
          
          // Detailed infrastructure lines
          float lineWidth = 0.05;
          float hLine = step(abs(gridUv.y - 0.5), lineWidth);
          float vLine = step(abs(gridUv.x - 0.5), lineWidth);
          
          // Random pattern following land masses
          float pattern = random(gridId);
          float infrastructure = (hLine + vLine) * step(0.75, pattern) * landMask;
          
          // City nodes - bright spots
          vec2 nodePos = vec2(0.5);
          float nodeDist = length(gridUv - nodePos);
          float cityNode = smoothstep(0.2, 0.05, nodeDist) * step(0.85, pattern) * landMask;
          
          // Additional scattered city lights
          float scatteredLights = step(0.92, random(gridId + vec2(0.3, 0.7))) * 
                                  smoothstep(0.3, 0.1, nodeDist) * landMask;
          
          // Coastal glow - detect edges
          float coastalGlow = landMask * (1.0 - landMask * 0.8) * noise(vUv * 30.0);
          
          // Combine all light sources
          float lights = max(max(infrastructure, cityNode), max(scatteredLights, coastalGlow * 0.5));
          
          // Progressive reveal animation
          float angle = atan(vPosition.z, vPosition.x);
          float normalizedAngle = (angle + 3.14159) / 6.28318;
          float reveal = smoothstep(progress * 1.3 - 0.3, progress * 1.3, normalizedAngle);
          reveal *= smoothstep(0.0, 0.2, progress);
          
          // Intense glow for city lights
          float glow = lights * 2.0;
          vec3 color = glowColor * (lights * 3.0 + glow) * reveal;
          
          // Extra bright city nodes
          color += glowColor * cityNode * 4.0 * reveal;
          
          // Pulsing effect
          float pulse = 1.0 + sin(time * 1.5 + pattern * 6.28) * 0.15;
          color *= pulse;
          
          // Alpha for visibility
          float alpha = lights * reveal * 0.9 + glow * reveal * 0.4;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    });
  }, [texture]);

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

