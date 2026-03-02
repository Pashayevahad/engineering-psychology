import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useSeasonMaterial } from './useSeasonMaterial';

const Forest = () => {
    const meshRef = useRef();

    // Get our animated, season-aware material
    const seasonMaterial = useSeasonMaterial();

    const count = 1000;

    // Pre-calculate positions, scales, and rotations for the instanced mesh
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const transforms = useMemo(() => {
        const matrices = [];
        for (let i = 0; i < count; i++) {
            // Keep trees out of the very center where the river will go
            let x, z;
            do {
                x = (Math.random() - 0.5) * 200;
                z = (Math.random() - 0.5) * 200;
            } while (Math.abs(x) < 15); // River margin

            const scale = 1 + Math.random() * 2; // Varied heights
            const rotationY = Math.random() * Math.PI * 2;

            dummy.position.set(x, 0, z);
            dummy.rotation.y = rotationY;

            // Tapered "pine tree" style
            dummy.scale.set(scale * 0.5, scale * 3, scale * 0.5);

            dummy.updateMatrix();
            matrices.push(dummy.matrix.clone());
        }
        return matrices;
    }, [count, dummy]);

    useEffect(() => {
        if (meshRef.current) {
            for (let i = 0; i < count; i++) {
                meshRef.current.setMatrixAt(i, transforms[i]);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [transforms, count]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, count]}
            material={seasonMaterial}
            castShadow
            receiveShadow
            position={[0, -15, 0]} // align with Ground plane
        >
            {/* A simple low-poly cone for the tree canopy */}
            <coneGeometry args={[2, 5, 5]} />
        </instancedMesh>
    );
};

export default Forest;
