import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import { useSeasonStore } from './state/useSeasonStore';
import CustomCursor from './components/UI/CustomCursor';

// 3D Components
import CameraRig from './components/3D/CameraRig';
import Forest from './components/3D/Seasons/Forest';
import River from './components/3D/Seasons/River';
import Sunrise from './components/3D/Seasons/Sunrise';
import WinterEnvironment from './components/3D/Seasons/WinterEnvironment';
import AutumnLeaves from './components/3D/Seasons/AutumnLeaves';

import './App.css';

/* ─── Ground Plane ─── */
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial
        color="#0a0a0f"
        roughness={1}
      />
    </mesh>
  );
};

/* ─── 4-Season Transition Controller ─── */
const SceneTransition = () => {
  const { scene } = useThree();
  const currentSeason = useSeasonStore((state) => state.currentSeason);
  const ambientRef = useRef();

  // Define atmospheric values for each season
  const environments = {
    Winter: { bg: '#050510', fogDensity: 0.025, ambColor: '#8888cc', ambInt: 0.15 },
    Spring: { bg: '#1a334d', fogDensity: 0.015, ambColor: '#aaddff', ambInt: 0.6 },
    Summer: { bg: '#87CEEB', fogDensity: 0.01, ambColor: '#ffffff', ambInt: 1.0 }, // Sky blue
    Autumn: { bg: '#2b1b17', fogDensity: 0.02, ambColor: '#ffaa66', ambInt: 0.5 }
  };

  // Ensure scene has fog initialized
  useEffect(() => {
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(0x050510, 0.025);
    }
  }, [scene]);

  useEffect(() => {
    const target = environments[currentSeason] || environments['Spring'];
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 4 } });

    // Background color
    const currentBg = new THREE.Color(scene.background || target.bg);
    tl.to(currentBg, {
      r: new THREE.Color(target.bg).r,
      g: new THREE.Color(target.bg).g,
      b: new THREE.Color(target.bg).b,
      onUpdate: () => {
        scene.background = currentBg;
      }
    }, 0);

    // Fog color and density
    if (scene.fog) {
      const currentFogColor = scene.fog.color;
      tl.to(currentFogColor, {
        r: new THREE.Color(target.bg).r,
        g: new THREE.Color(target.bg).g,
        b: new THREE.Color(target.bg).b,
      }, 0);
      tl.to(scene.fog, {
        density: target.fogDensity
      }, 0);
    }

    // Ambient light
    if (ambientRef.current) {
      tl.to(ambientRef.current, {
        intensity: target.ambInt
      }, 0);
      const currentAmbColor = ambientRef.current.color;
      tl.to(currentAmbColor, {
        r: new THREE.Color(target.ambColor).r,
        g: new THREE.Color(target.ambColor).g,
        b: new THREE.Color(target.ambColor).b,
      }, 0);
    }
  }, [currentSeason, scene]);

  return <ambientLight ref={ambientRef} intensity={0.15} color="#8888cc" />;
};

const App = () => {
  const { currentSeason, setSeason } = useSeasonStore();

  useEffect(() => {
    useSeasonStore.getState().fetchSeason();
  }, []);

  return (
    <>
      <CustomCursor />

      <div className="canvas-container">

        {/* Mont-fort Minimal UI Overlay */}
        <div className="ui-overlay">
          <div className="nav-frame">
            <div className="logo">Engineering<br />Psychology</div>
            <div className="season-indicator">
              <div className="season-label">Currently: {currentSeason}</div>
              <div className="season-dot"></div>
            </div>
          </div>

          <div className="bottom-frame">
            <div className="scroll-prompt">
              <span className="scroll-text">Scroll to Discover</span>
              <div className="scroll-line"></div>
            </div>
          </div>
        </div>

        <Canvas
          shadows
          camera={{ position: [0, 8, 60], fov: 45, near: 0.1, far: 800 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        >
          <SceneTransition />

          <Ground />
          <River />
          <Forest />
          <Sunrise />

          <WinterEnvironment />
          <AutumnLeaves />

          {currentSeason === 'Winter' && (
            <Stars radius={200} depth={80} count={4000} factor={5} saturation={0} fade speed={0.5} />
          )}

          <CameraRig />
        </Canvas>
      </div>
    </>
  );
};

export default App;
