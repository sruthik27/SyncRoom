import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SelectStep = ({ onSelect, fadeIn, setIsCreatingRoom }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      key="select"
      {...fadeIn}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md relative"
      data-testid="select-container"
    >
      <motion.h1
        className="text-center mb-8 text-6xl font-bold relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        data-testid="select-title"
      >
        <span className="relative inline-block">
          <span className="animate-flicker bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            S
          </span>
          <span className="animate-fast-flicker bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            ync
          </span>
          <span className="animate-flicker bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            &nbsp;R
          </span>
          <span className="animate-fast-flicker bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            oom
          </span>
        </span>
      </motion.h1>

      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        data-testid="background-decoration"
      />

      <Card
        className="border-2 bg-background/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500"
        data-testid="select-card"
      >
        <CardHeader className="space-y-6 pt-8">
          <motion.div
            className="relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            data-testid="card-header"
          >
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="header-decoration"
            />

            <div className="text-center space-y-2">
              <CardTitle
                className="text-4xl font-bold text-center"
                data-testid="card-title"
              >
                <span className="relative">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    🎶
                  </span>
                </span>
              </CardTitle>
              <CardDescription
                className="text-lg text-muted-foreground mt-4"
                data-testid="card-description"
              >
                Your gateway to collaborative music
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 p-8" data-testid="card-content">
          <motion.div variants={itemVariants} className="space-y-4">
            <Button
              variant="outline"
              className={`w-full h-28 text-lg relative overflow-hidden group transition-all duration-300 ${
                hoveredButton === "join" ? "border-purple-500 shadow-lg" : ""
              } hover:bg-muted`}
              onClick={() => {
                onSelect("join");
                setIsCreatingRoom(false);
              }}
              onMouseEnter={() => setHoveredButton("join")}
              onMouseLeave={() => setHoveredButton(null)}
              data-testid="join-room-button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{
                    scale: hoveredButton === "join" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="w-8 h-8 text-purple-500" />
                </motion.div>
                <span className="font-semibold">Join a Room</span>
                <span className="text-sm text-muted-foreground">
                  Connect with friends
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`w-full h-28 text-lg relative overflow-hidden group transition-all duration-300 ${
                hoveredButton === "create" ? "border-purple-500 shadow-lg" : ""
              } hover:bg-muted`}
              onClick={() => {
                onSelect("create");
                setIsCreatingRoom(true);
              }}
              onMouseEnter={() => setHoveredButton("create")}
              onMouseLeave={() => setHoveredButton(null)}
              data-testid="create-room-button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{
                    scale: hoveredButton === "create" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <UserPlus className="w-8 h-8 text-purple-500" />
                </motion.div>
                <span className="font-semibold">Create a Room</span>
                <span className="text-sm text-muted-foreground">
                  Start your own session
                </span>
              </div>
            </Button>
          </motion.div>

          <div
            className="absolute bottom-0 left-0 w-full h-1 overflow-hidden"
            data-testid="decorative-waves"
          >
            <motion.div
              className="w-full h-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20"
              animate={{
                x: [-100, 100],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SelectStep;
