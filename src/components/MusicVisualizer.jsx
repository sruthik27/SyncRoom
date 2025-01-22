import React, { useEffect, useRef } from 'react';

const MusicVisualizer = () => {
    const barsRef = useRef([]);

    useEffect(() => {
        let animationFrameId;

        const animateBars = () => {
            barsRef.current.forEach((bar, index) => {
                const height = Math.random() * 30 + 10; // Random height between 10px and 40px
                bar.style.height = `${height}px`;
            });
            animationFrameId = requestAnimationFrame(animateBars);
        };

        animateBars();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="flex items-end gap-1 h-8">
            {[...Array(4)].map((_, index) => (
                <div
                    key={index}
                    ref={(el) => (barsRef.current[index] = el)}
                    className="visualizer-bar w-1 bg-primary rounded-full transition-all"
                />
            ))}
        </div>
    );
};

export default MusicVisualizer;