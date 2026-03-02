import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';
import gsap from 'gsap';

/* ─── Glow Shader (Fresnel-based radial falloff) ─── */
const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const glowFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 3.0) * uIntensity;
    gl_FragColor = vec4(uColor, fresnel * uOpacity);
  }
`;

const Sunrise = () => {
    const groupRef = useRef();
    const coreRef = useRef();
    const glowRef = useRef();
    const coronaRef = useRef();
    const pointLightRef = useRef();
    const dirLightRef = useRef();
    const currentSeason = useSeasonStore((state) => state.currentSeason);
    const hasAnimated = useRef(false);

    // Glow shader material
    const glowUniforms = useMemo(() => ({
        uColor: { value: new THREE.Color('#ffaa00') },
        uIntensity: { value: 1.5 },
        uOpacity: { value: 0.2 },
    }), []);

    // Corona shader material
    const coronaUniforms = useMemo(() => ({
        uColor: { value: new THREE.Color('#ff6600') },
        uIntensity: { value: 1.0 },
        uOpacity: { value: 0.1 },
    }), []);

    // Animate on Spring
    useFrame(() => {
        if (currentSeason === 'Spring' && !hasAnimated.current && groupRef.current) {
            hasAnimated.current = true;

            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

            // Sun rises
            tl.to(groupRef.current.position, {
                y: 15,
                duration: 5,
                ease: 'power3.out',
            }, 0);

            // Point light intensifies
            if (pointLightRef.current) {
                tl.to(pointLightRef.current, {
                    intensity: 4,
                    distance: 200,
                    duration: 5,
                }, 0);
            }

            // Directional light warms up
            if (dirLightRef.current) {
                tl.to(dirLightRef.current, {
                    intensity: 1.5,
                    duration: 5,
                }, 0);
            }

            // Glow opacity increases
            tl.to(glowUniforms.uOpacity, {
                value: 1.0,
                duration: 4,
            }, 0.5);

            tl.to(glowUniforms.uIntensity, {
                value: 2.5,
                duration: 4,
            }, 0.5);

            // Corona brightens
            tl.to(coronaUniforms.uOpacity, {
                value: 0.4,
                duration: 4,
            }, 1);

            // Core emissive ramps up
            if (coreRef.current) {
                tl.to(coreRef.current.material, {
                    emissiveIntensity: 3,
                    duration: 4,
                }, 0.5);
            }
        }

        // Reset if we go back to Winter
        if (currentSeason === 'Winter') {
            hasAnimated.current = false;
        }
    });

    // Subtle pulse on the glow
    useFrame((state) => {
        if (glowRef.current) {
            const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1.0;
            glowRef.current.scale.setScalar(pulse);
        }
        if (coronaRef.current) {
            const pulse = Math.sin(state.clock.elapsedTime * 0.3 + 1.0) * 0.05 + 1.0;
            coronaRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group ref={groupRef} position={[0, -20, -30]}>
            {/* Inner Core — bright emissive sphere */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[4, 64, 64]} />
                <meshStandardMaterial
                    emissive="#ffcc00"
                    emissiveIntensity={1.5}
                    color="#ffffff"
                    toneMapped={false}
                />
            </mesh>

            {/* Outer Glow — Fresnel shader sphere */}
            <mesh ref={glowRef} scale={1.0}>
                <sphereGeometry args={[7, 64, 64]} />
                <shaderMaterial
                    vertexShader={glowVertexShader}
                    fragmentShader={glowFragmentShader}
                    uniforms={glowUniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Corona Haze — larger, subtler glow */}
            <mesh ref={coronaRef} scale={1.0}>
                <sphereGeometry args={[12, 32, 32]} />
                <shaderMaterial
                    vertexShader={glowVertexShader}
                    fragmentShader={glowFragmentShader}
                    uniforms={coronaUniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Light sources */}
            <pointLight
                ref={pointLightRef}
                intensity={0.5}
                distance={80}
                color="#ffaa44"
                decay={2}
            />
            <directionalLight
                ref={dirLightRef}
                intensity={0.1}
                color="#ffeedd"
                position={[0, 10, 10]}
            />
        </group>
    );
};

export default Sunrise;
