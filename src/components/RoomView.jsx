import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SelectStep from "./SelectStep";
import RoomForm from "./RoomForm";

const RoomView = ({ roomId, setRoomId, onSubmit, setIsCreatingRoom }) => {
  const [step, setStep] = useState("select"); // 'select' | 'join' | 'create'
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-[95vh] flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <AnimatePresence mode="wait">
        {step === "select" ? (
          <SelectStep
            onSelect={setStep}
            fadeIn={fadeIn}
            setIsCreatingRoom={setIsCreatingRoom}
          />
        ) : (
          <RoomForm
            step={step}
            roomId={roomId}
            setRoomId={setRoomId}
            onSubmit={onSubmit}
            onBack={() => setStep("select")}
            fadeIn={fadeIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomView;
