import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';

const WinterEnvironment = () => {
    const { scene } = useThree();
    const currentSeason = useSeasonStore((state) => state.currentSeason);
    const pointsRef = useRef();
    const fogRef = useRef(null);

    // Set background + fog when Winter is active
    useMemo(() => {
        if (currentSeason === 'Winter') {
            scene.background = new THREE.Color(0x050510);
            const fog = new THREE.FogExp2(0x050510, 0.025);
            scene.fog = fog;
            fogRef.current = fog;
        }
    }, [currentSeason, scene]);

    // Expose fog ref for external animation (via scene.fog)
    // The transition system in App.jsx will animate scene.fog.density

    // Snow particles — 3000 with size variation and horizontal drift
    const count = 3000;
    const { positions, sizes, drifts } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        const dr = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 1] = Math.random() * 120 - 60;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
            sz[i] = 0.05 + Math.random() * 0.15; // size variation
            dr[i] = (Math.random() - 0.5) * 2; // horizontal drift speed
        }
        return { positions: pos, sizes: sz, drifts: dr };
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || currentSeason !== 'Winter') return;

        const posArray = pointsRef.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            // Vertical fall (varied speed based on size)
            posArray[i * 3 + 1] -= delta * (3 + sizes[i] * 8);
            // Horizontal drift
            posArray[i * 3] += delta * drifts[i] * 0.5;
            // Subtle sway
            posArray[i * 3] += Math.sin(state.clock.elapsedTime * 0.3 + i) * delta * 0.2;

            // Reset when below ground
            if (posArray[i * 3 + 1] < -60) {
                posArray[i * 3 + 1] = 60;
                posArray[i * 3] = (Math.random() - 0.5) * 120;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (currentSeason !== 'Winter') return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                attach="material"
                size={0.12}
                sizeAttenuation={true}
                color="#e8e8ff"
                transparent={true}
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default WinterEnvironment;
