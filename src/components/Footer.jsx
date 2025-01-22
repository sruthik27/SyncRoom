import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => {
  return (
    <footer
      className="relative mt-4"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <div className="absolute left-0 right-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="relative flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Crafted by</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="relative inline-flex items-center gap-1 font-medium bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                Sruthik
                <Sparkles className="w-3 h-3 text-purple-300 hover:animate-pulse" />
              </div>
            </TooltipTrigger>
            <TooltipContent>👋 Hi, Hope you enjoy this!</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
};

export default Footer;
