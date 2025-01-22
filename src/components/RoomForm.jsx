import { useState } from "react";
import { ArrowRight, Dices, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RoomForm = ({ step, roomId, setRoomId, onSubmit, onBack, fadeIn }) => {
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoomIdChange = (e) => {
    const value = e.target.value;
    setRoomId(value);
    validateRoomId(value);
  };

  const validateRoomId = (value) => {
    if (!value.trim()) {
      setError("Room Name cannot be empty or just spaces.");
    } else if (/\s/.test(value)) {
      setError("Room Name cannot contain spaces.");
    } else if (value.length >= 10) {
      setError("Room Name must be less than 10 characters.");
    } else {
      setError("");
    }
  };

  const generateRandomNumber = () => {
    setIsGenerating(true);
    const minDigits = 6;
    const maxDigits = 6;
    const digits =
      Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    // Animate the number generation
    let counter = 0;
    const interval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      setRoomId(randomNum.toString());
      counter++;

      if (counter === 10) {
        clearInterval(interval);
        setIsGenerating(false);
        setError("");
      }
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-2">
          <CardTitle
            className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
            data-testid={"create-room-card"}
          >
            {step === "join" ? "Join a Room" : "Create a Room"}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {step === "join"
              ? "Enter the room Name to join"
              : "Choose a name for your room"}
            <div className="mt-2 p-2 bg-secondary/20 rounded-lg">
              <span className="text-purple-400">
                Room Name cannot be <span className="text-red-500">empty</span>,
                contain <span className="text-red-500">spaces</span>, or be more
                than <span className="text-red-500">10</span> characters.
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testId={"room-form"}
          >
            <div className="relative group">
              <Input
                placeholder="Enter Room Name"
                value={roomId}
                onChange={handleRoomIdChange}
                className="h-12 pl-4 pr-24 text-lg bg-secondary/50 transition-all duration-300 border-2 focus:border-purple-400"
                data-testid={"room-name-input"}
              />
              {step === "create" && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                          onClick={generateRandomNumber}
                          disabled={isGenerating}
                          data-testid={"generate-room-id-button"}
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Dices className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate random room ID</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ArrowRight className="text-muted-foreground" />
                </div>
              )}
            </div>
            {error && (
              <p
                className="text-red-500 text-sm flex items-center gap-2 animate-fadeIn"
                data-testid={"error-message"}
              >
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {error}
              </p>
            )}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={!!error || isSubmitting}
                data-testId={"submit-room-button"}
              >
                {step === "join" ? "Join Room" : "Create Room"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-lg hover:bg-secondary/50 transition-colors duration-300"
                onClick={onBack}
                data-testid={"go-back-button"}
              >
                Go Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomForm;
