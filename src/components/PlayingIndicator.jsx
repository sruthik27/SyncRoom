import { motion } from "framer-motion";

const PlayingSongIndicator = () => {
  const bars = [1, 2, 3];

  return (
    <div className="flex items-center gap-[2px]">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="w-[2px] h-3 bg-primary rounded-full"
          animate={{
            height: ["12px", "16px", "12px"],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: bar * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default PlayingSongIndicator;
