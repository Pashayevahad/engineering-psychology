import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';

const WinterEnvironment = () => {
    const { scene } = useThree();
    const currentSeason = useSeasonStore((state) => state.currentSeason);
    const pointsRef = useRef();

    // Set background color when component is active
    useMemo(() => {
        if (currentSeason === 'Winter') {
            scene.background = new THREE.Color(0x050510);
        }
    }, [currentSeason, scene]);

    // Create snow particles
    const count = 2000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 1] = Math.random() * 100 - 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        return pos;
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current || currentSeason !== 'Winter') return;

        const positions = pointsRef.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            // Move particles down
            positions[i * 3 + 1] -= delta * 5;
            // Reset position if it goes too low
            if (positions[i * 3 + 1] < -50) {
                positions[i * 3 + 1] = 50;
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
                size={0.15}
                sizeAttenuation={true}
                color="#ffffff"
                transparent={true}
                opacity={0.8}
            />
        </points>
    );
};

export default WinterEnvironment;
