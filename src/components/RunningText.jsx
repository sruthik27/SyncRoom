import React, { useRef, useState, useEffect } from "react";

const RunningText = ({ text, className = "" }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;
      setIsOverflowing(textWidth > containerWidth);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        ref={textRef}
        className={`inline-block ${isOverflowing ? "animate-marquee" : ""}`}
        style={{
          animationDuration: `${text.length * 0.2}s`, // Adjust speed based on text length
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default RunningText;
