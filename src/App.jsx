import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import Sunrise from './components/3D/Seasons/Sunrise';
import WinterEnvironment from './components/3D/Seasons/WinterEnvironment';
import CameraRig from './components/3D/CameraRig';
import { useSeasonStore } from './state/useSeasonStore';
import gsap from 'gsap';
import './App.css';

/* ─── Scene Transition Controller (runs inside Canvas) ─── */
const SceneTransition = () => {
  const { scene } = useThree();
  const currentSeason = useSeasonStore((state) => state.currentSeason);
  const ambientRef = useRef();
  const hasTransitioned = useRef(false);

  useEffect(() => {
    if (currentSeason === 'Spring' && !hasTransitioned.current) {
      hasTransitioned.current = true;

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

      // Fog density dissolves
      if (scene.fog) {
        tl.to(scene.fog, {
          density: 0.0,
          duration: 5,
        }, 0);
      }

      // Background color: charcoal → deep purple → dawn orange
      const bgColorObj = { r: 5 / 255, g: 5 / 255, b: 16 / 255 };
      tl.to(bgColorObj, {
        r: 26 / 255, g: 10 / 255, b: 46 / 255,
        duration: 2.5,
        onUpdate: () => {
          scene.background = new THREE.Color(bgColorObj.r, bgColorObj.g, bgColorObj.b);
        },
      }, 0);
      tl.to(bgColorObj, {
        r: 40 / 255, g: 20 / 255, b: 60 / 255,
        duration: 3,
        onUpdate: () => {
          scene.background = new THREE.Color(bgColorObj.r, bgColorObj.g, bgColorObj.b);
        },
      }, 2.5);

      // Ambient light warms up
      if (ambientRef.current) {
        tl.to(ambientRef.current, {
          intensity: 0.6,
          duration: 5,
        }, 0);
        // Shift ambient color to warm
        tl.to(ambientRef.current.color, {
          r: 1.0, g: 0.85, b: 0.7,
          duration: 5,
        }, 0);
      }
    }

    // Reset on Winter
    if (currentSeason === 'Winter') {
      hasTransitioned.current = false;
    }
  }, [currentSeason, scene]);

  return <ambientLight ref={ambientRef} intensity={0.15} color="#8888cc" />;
};

/* ─── Ground Plane (subtle horizon reference) ─── */
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial
        color="#080815"
        transparent
        opacity={0.6}
        roughness={1}
      />
    </mesh>
  );
};

const App = () => {
  const { currentSeason, setSeason } = useSeasonStore();

  useEffect(() => {
    // Fetch persisted season from Supabase
    useSeasonStore.getState().fetchSeason();

    // Demo: auto-trigger Spring after 6s of Winter
    const timer = setTimeout(() => {
      if (useSeasonStore.getState().currentSeason === 'Winter') {
        setSeason('Spring');
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [setSeason]);

  return (
    <div className="canvas-container">
      {/* Minimal cinematic overlay */}
      <div className="ui-overlay">
        <span className="season-label">{currentSeason}</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 5, 50], fov: 45, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      >
        {/* Scene transition controller */}
        <SceneTransition />

        {/* Winter atmosphere (snow + fog) */}
        <WinterEnvironment />

        {/* Stars visible in winter */}
        {currentSeason === 'Winter' && (
          <Stars
            radius={200}
            depth={80}
            count={4000}
            factor={5}
            saturation={0}
            fade
            speed={0.5}
          />
        )}

        {/* Layered sun */}
        <Sunrise />

        {/* Ground plane */}
        <Ground />

        {/* Mouse-follow camera */}
        <CameraRig />
      </Canvas>
    </div>
  );
};

export default App;
