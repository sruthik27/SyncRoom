import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronRight, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SparklingStars from "./SparklingStars";

const MembersSidebar = ({
  isOpen,
  onClose,
  usernames,
  currentUser,
  isAdmin,
  onRemoveMember,
  playSound,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const MembersList = () => (
    <>
      <SparklingStars />
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        data-testid="members-list"
      >
        {usernames.map((name, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0 },
            }}
            className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary
                   text-sm flex items-center justify-between group
                   transition-colors duration-200"
            data-testid={`member-${name}`}
          >
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse-slow" />
              <span className="font-medium">{name}</span>
              {name === currentUser && (
                <span className="text-xs text-primary/60">(you)</span>
              )}
            </span>
            {name !== currentUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-opacity"
                onClick={() => {
                  playSound();
                  onRemoveMember(name);
                }}
                data-testid={`remove-member-${name}`}
              >
                <UserMinus className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </>
  );

  // Mobile View
  if (isMobile) {
    return (
      <>
        <SparklingStars />
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] p-0"
            data-testid="mobile-sheet-content"
          >
            <div className="h-full flex flex-col p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Room Members ({usernames.length})
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <MembersList />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop View
  return (
    <>
      <SparklingStars />
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed lg:relative right-0 top-0 h-full w-80 bg-background border-l border-border z-10"
            data-testid="desktop-sidebar"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">
                    Room Members ({usernames.length})
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onClose}
                  data-testid="close-button"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <MembersList />
              </ScrollArea>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default MembersSidebar;
