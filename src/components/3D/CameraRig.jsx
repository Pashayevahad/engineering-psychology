import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';

const CameraRig = () => {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });

    // Listen for mouse movement (runs once via useFrame pattern)
    React.useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse to -1..1
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame(() => {
        // Smooth lerp toward mouse position
        target.current.x += (mouse.current.x - target.current.x) * 0.05;
        target.current.y += (mouse.current.y - target.current.y) * 0.05;

        // Apply rotation: ±8° horizontal, ±5° vertical
        const maxRotY = 8 * (Math.PI / 180);
        const maxRotX = 5 * (Math.PI / 180);

        camera.rotation.y = -target.current.x * maxRotY;
        camera.rotation.x = -target.current.y * maxRotX;
    });

    return null;
};

export default CameraRig;
