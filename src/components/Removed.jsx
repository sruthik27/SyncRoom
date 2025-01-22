import { motion } from "framer-motion";
import { DoorClosed, HomeIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Removed = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    initial: { scale: 0.8, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <Card className="border-2 overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-background to-destructive/5"
            animate={{
              x: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="relative p-6 flex flex-col items-center space-y-6">
            <motion.div
              variants={iconVariants}
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <motion.div animate={pulseAnimation}>
                <DoorClosed className="w-10 h-10 text-destructive" />
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center space-y-2"
            >
              <h2 className="text-2xl font-bold text-foreground">
                Room Access Removed
              </h2>
              <p className="text-muted-foreground">
                You have been removed from the room.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <Button
                className="flex-1 gap-2 group relative overflow-hidden"
                onClick={() => {
                  localStorage.removeItem("userName");
                  localStorage.removeItem("roomId");
                  window.location.href = "/";
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Go Home
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Removed;
