import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import '../../App.css'; // Relies on styles defined in App.css

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        // We use GSAP quickTo for highly performant, smooth trailing
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.4, ease: "power3" });

        const moveCursor = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener('mousemove', moveCursor);

        // Optional: add scale effect on mousedown
        const scaleDown = () => gsap.to(cursorRef.current, { scale: 0.8, duration: 0.2 });
        const scaleUp = () => gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });

        window.addEventListener('mousedown', scaleDown);
        window.addEventListener('mouseup', scaleUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', scaleDown);
            window.removeEventListener('mouseup', scaleUp);
        };
    }, []);

    return (
        <div ref={cursorRef} className="custom-cursor">
            <div className="custom-cursor-dot"></div>
        </div>
    );
};

export default CustomCursor;
