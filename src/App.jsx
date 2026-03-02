import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Sunrise from './components/3D/Seasons/Sunrise';
import WinterEnvironment from './components/3D/Seasons/WinterEnvironment';
import { useSeasonStore } from './state/useSeasonStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './App.css';

const App = () => {
  const { currentSeason, setSeason } = useSeasonStore();
  const bgRef = useRef();

  useGSAP(() => {
    if (currentSeason === 'Spring') {
      // Animate background color from Winter Charcoal Blue to Spring Gold
      gsap.to('body', {
        backgroundColor: '#ffd700', // Gold
        duration: 4,
        ease: 'power2.inOut',
      });
    }
  }, [currentSeason]);

  useEffect(() => {
    // Initial fetch from Supabase
    useSeasonStore.getState().fetchSeason();

    // Demo Trigger: Only auto-trigger Spring if it's still Winter (for demo)
    // We'll give it more time to appreciate the snow
    const timer = setTimeout(() => {
      if (useSeasonStore.getState().currentSeason === 'Winter') {
        setSeason('Spring');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [setSeason]);

  return (
    <div className="canvas-container">
      <div className="ui-layer">
        <h1>Season: {currentSeason}</h1>
        <p>{currentSeason === 'Winter' ? 'Falling Snow...' : 'Sunrise Transition...'}</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 50], fov: 45 }}>
        {/* Winter environment handles its own background if active */}
        <WinterEnvironment />

        <ambientLight intensity={0.2} />
        {currentSeason === 'Winter' && (
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        )}

        <Sunrise />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default App;
