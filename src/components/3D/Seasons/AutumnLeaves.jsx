import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';

const AutumnLeaves = () => {
    const currentSeason = useSeasonStore((state) => state.currentSeason);
    const pointsRef = useRef();

    const count = 800;

    // Calculate positions, rotations, colors, falling speeds
    const { positions, colors, speeds, rotations, scales } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        const rot = new Float32Array(count);
        const sca = new Float32Array(count);

        const colorOptions = [
            new THREE.Color('#ea580c'), // Orange
            new THREE.Color('#dc2626'), // Red
            new THREE.Color('#ca8a04'), // Gold
            new THREE.Color('#78350f')  // Brown
        ];

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 150;
            pos[i * 3 + 1] = Math.random() * 100 - 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 150;

            const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;

            spd[i] = 1 + Math.random() * 3; // fall speed
            rot[i] = Math.random() * Math.PI; // initial rotation
            sca[i] = 0.5 + Math.random() * 1.5; // size
        }

        return { positions: pos, colors: col, speeds: spd, rotations: rot, scales: sca };
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || currentSeason !== 'Autumn') return;

        const posArray = pointsRef.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            // Lazy fall
            posArray[i * 3 + 1] -= delta * speeds[i];

            // Wind drift (x) + spiral (z)
            posArray[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + rotations[i]) * delta * 2;
            posArray[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 0.5 + rotations[i]) * delta * 2;

            // Reset
            if (posArray[i * 3 + 1] < -20) {
                posArray[i * 3 + 1] = 80;
                posArray[i * 3] = (Math.random() - 0.5) * 150;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (currentSeason !== 'Autumn') return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.8}
                vertexColors
                transparent
                opacity={0.9}
                depthWrite={false}
            />
        </points>
    );
};

export default AutumnLeaves;
