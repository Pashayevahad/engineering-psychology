import React, { useRef, useEffect } from 'react';
import { useSeasonStore } from '../../../state/useSeasonStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const Sunrise = () => {
    const sunRef = useRef();
    const currentSeason = useSeasonStore((state) => state.currentSeason);

    useGSAP(() => {
        if (currentSeason === 'Spring') {
            gsap.to(sunRef.current.position, {
                y: 15,
                duration: 4,
                ease: 'power2.out',
            });
        }
    }, [currentSeason]);

    return (
        <mesh ref={sunRef} position={[0, -20, -30]}>
            <sphereGeometry args={[5, 32, 32]} />
            <meshStandardMaterial
                emissive="#ffcc00"
                emissiveIntensity={2}
                color="#ff8800"
            />
            <pointLight intensity={2} color="#ffcc00" />
        </mesh>
    );
};

export default Sunrise;
