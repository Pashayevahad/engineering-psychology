import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useSeasonStore } from '../../../state/useSeasonStore';
import gsap from 'gsap';

// A dynamic material hook that creates a customized MeshStandardMaterial
// which supports interpolating a base color and accumulating procedural snow on top-facing normals.
export const useSeasonMaterial = () => {
    const currentSeason = useSeasonStore((state) => state.currentSeason);
    const materialRef = useRef();

    // Define season colors
    const seasonColors = useMemo(() => ({
        Spring: new THREE.Color('#4ade80'), // Vibrant Green
        Summer: new THREE.Color('#166534'), // Deep Green
        Autumn: new THREE.Color('#ea580c'), // Orange/Red
        Winter: new THREE.Color('#453530'), // Bare dark wood
    }), []);

    const material = useMemo(() => {
        const mat = new THREE.MeshStandardMaterial({
            color: seasonColors['Winter'], // init with something, will be updated immediately
            roughness: 0.9,
            metalness: 0.0,
        });

        // Inject custom shader chunks to handle procedural snow accumulation
        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uSnowIntensity = { value: 0.0 };

            shader.fragmentShader = `
        uniform float uSnowIntensity;
      ` + shader.fragmentShader;

            // Replace the outgoing light calculation to mix in snow color based on the world normal (upward facing)
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
        #include <dithering_fragment>
        
        // Calculate dot product of normal and "up" vector to find top-facing surfaces
        float dotUp = dot(vNormal, vec3(0.0, 1.0, 0.0));
        
        // Map to a sharp threshold for snow accumulation
        float snowFactor = smoothstep(0.5, 0.8, dotUp) * uSnowIntensity;
        
        // Final color mix: blend current standard output with pure white snow
        vec3 snowColor = vec3(1.0, 1.0, 1.0);
        gl_FragColor = vec4(mix(gl_FragColor.rgb, snowColor, snowFactor), gl_FragColor.a);
        `
            );

            // Save a reference to uniforms for animation
            mat.userData.shader = shader;
        };

        return mat;
    }, [seasonColors]);

    // Keep a ref attached for GSAP targeting
    materialRef.current = material;

    // Animate transitions
    useEffect(() => {
        if (!materialRef.current) return;

        const mat = materialRef.current;
        const targetColor = seasonColors[currentSeason] || seasonColors['Summer'];
        const targetSnow = currentSeason === 'Winter' ? 1.0 : 0.0;

        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 4 } });

        // 1. Animate base color
        tl.to(mat.color, {
            r: targetColor.r,
            g: targetColor.g,
            b: targetColor.b
        }, 0);

        // 2. Animate snow uniform if the shader is ready
        if (mat.userData.shader) {
            tl.to(mat.userData.shader.uniforms.uSnowIntensity, {
                value: targetSnow
            }, 0);
        } else {
            // If shader hasn't compiled yet, wait a frame and try applying directly
            setTimeout(() => {
                if (mat.userData.shader) {
                    gsap.to(mat.userData.shader.uniforms.uSnowIntensity, {
                        value: targetSnow,
                        duration: 4,
                        ease: 'power2.inOut'
                    });
                }
            }, 100);
        }
    }, [currentSeason, seasonColors]);

    return material;
};
