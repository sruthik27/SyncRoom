import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <motion.div
        className="w-6 h-6 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary rounded-full"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            style={{
              top: i === 0 ? 0 : i === 2 ? "100%" : "50%",
              left: i === 3 ? 0 : i === 1 ? "100%" : "50%",
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
