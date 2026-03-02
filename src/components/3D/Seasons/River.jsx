import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';
import gsap from 'gsap';

const River = () => {
    const meshRef = useRef();
    const materialRef = useRef();
    const currentSeason = useSeasonStore((state) => state.currentSeason);

    // Fallback procedural "noise" map for water normals if no texture is loaded
    const noiseMap = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const v = Math.floor(Math.random() * 255);
            imgData.data[i] = v;
            imgData.data[i + 1] = v;
            imgData.data[i + 2] = 255; // strong blue for normal UP
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 20); // stretch along river flow
        return tex;
    }, []);

    const flowSpeed = useRef({ value: 0.5 }); // normal scroll speed

    useEffect(() => {
        if (!materialRef.current) return;
        const mat = materialRef.current;

        const isWinter = currentSeason === 'Winter';
        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 4 } });

        // Transition material properties
        tl.to(mat, {
            roughness: isWinter ? 0.1 : 0.0, // Ice is glossy but scuffed, water is mirror
            metalness: isWinter ? 0.8 : 0.9, // Ice has high reflection
        }, 0);

        tl.to(mat.color, {
            r: isWinter ? 0.6 : 0.1,
            g: isWinter ? 0.8 : 0.2,
            b: isWinter ? 0.9 : 0.3,
        }, 0);

        // Freeze or flow
        tl.to(flowSpeed.current, {
            value: isWinter ? 0.0 : 0.5,
        }, 0);

    }, [currentSeason]);

    useFrame((state, delta) => {
        if (materialRef.current && materialRef.current.normalMap) {
            // Scroll the normal map offset to simulate flowing water
            materialRef.current.normalMap.offset.y -= delta * flowSpeed.current.value;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, -14.8, 0]} // slightly above ground
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[30, 250, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                color="#1a334d"
                roughness={0.0}
                metalness={0.9}
                normalMap={noiseMap}
                normalScale={new THREE.Vector2(0.5, 0.5)}
                transparent={true}
                opacity={0.9}
            />
        </mesh>
    );
};

export default River;
