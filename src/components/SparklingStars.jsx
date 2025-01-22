import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const Star = ({ x, y, size, duration, delay }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 90, 180],
    }}
    transition={{
      duration,
      delay,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background:
        "radial-gradient(circle at center, #e9d5ff 0%, #d8b4fe 50%, #c084fc 100%)",
      boxShadow: "0 0 8px #e9d5ff",
      zIndex: 50,
      pointerEvents: "none",
    }}
  />
);

const SparklingStars = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      }));
      setStars(newStars);
    };

    generateStars();
    const interval = setInterval(generateStars, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden sparkling-stars">
      <AnimatePresence>
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SparklingStars;
