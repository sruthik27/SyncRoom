import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RunningText from "@/components/RunningText";

const SearchResult = ({ result, index, onSelect }) => {
  return (
    <motion.div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 group"
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.05 },
      }}
      data-testid="search-result"
    >
      <img
        src={result.snippet.thumbnails.default.url}
        alt={result.title}
        className="w-20 h-12 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <div className="w-[calc(100%-40px)]">
          <RunningText text={result.title} className="text-sm font-medium" />
        </div>
        <p className="text-xs text-muted-foreground">{result.duration_raw}</p>
      </div>
      <Button
        size="icon"
        onClick={() => onSelect(result)}
        data-testid="add-button"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default SearchResult;
