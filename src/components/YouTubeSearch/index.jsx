import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import useDebounce from "@/hooks/useDebounce";
import LoadingSpinner from "./LoadingSpinner";
import SearchResult from "./SearchResult";

const YouTubeSearch = ({ onSubmit }) => {
  const placeholder = "Search for your favorite songs here 🎶...";
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const typePlaceholder = () => {
      if (!isDeleting && currentIndex <= placeholder.length) {
        setTypedPlaceholder(placeholder.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typePlaceholder, 100);
      } else if (!isDeleting && currentIndex > placeholder.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          typePlaceholder();
        }, 2000);
      } else if (isDeleting && currentIndex > 0) {
        currentIndex--;
        setTypedPlaceholder(placeholder.slice(0, currentIndex));
        timeoutId = setTimeout(typePlaceholder, 50);
      } else {
        isDeleting = false;
        timeoutId = setTimeout(typePlaceholder, 500);
      }
    };

    typePlaceholder();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchResults = async () => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://d6nsmmp64k.execute-api.ap-south-1.amazonaws.com/default/YouTubeSearcher?songName=${encodeURIComponent(debouncedSearch)}`,
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [debouncedSearch]);

  const handleResultClick = (result) => {
    onSubmit(result.title, result.url);
    setSearchResults([]);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative w-full">
        <Input
          placeholder={typedPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchResults();
            }
          }}
          className="pr-10 h-12 border-primary caret-pink-500"
          data-testid={"search-input"}
        />
        <AnimatePresence>{isLoading && <LoadingSpinner />}</AnimatePresence>
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-popover rounded-md border shadow-lg overflow-hidden bg-secondary"
          >
            <ScrollArea className="h-[300px]">
              <div className="p-1 space-y-1">
                {searchResults.map((result, index) => (
                  <SearchResult
                    key={result.id.videoId}
                    result={result}
                    index={index}
                    onSelect={handleResultClick}
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeSearch;
