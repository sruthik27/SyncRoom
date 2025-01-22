import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileAudio, Plus } from "lucide-react";

const FileUpload = ({ handleFileChange, handleUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files].filter((file) =>
      file.type.startsWith("audio/"),
    );
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      handleFileChange({ target: { files } });
    }
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    setSelectedFiles((prev) => [...prev, ...files]);
    handleFileChange(e);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = async () => {
    try {
      await handleUpload();
      // Reset files after successful upload
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div data-testid="file-upload">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors duration-300
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${selectedFiles.length > 0 ? "p-2" : "p-3"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="drop-area"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Upload Area */}
            <motion.div layout className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden group inpulse-animation"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="choose-songs-button"
                >
                  <span className="relative flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Choose Songs
                  </span>
                </Button>
              </motion.div>

              <p className="text-sm text-muted-foreground hidden sm:block">
                or drag and drop here (only .mp3 files)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
                data-testid="file-input"
              />
            </motion.div>

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={handleUploadClick}
                  size="sm"
                  className="relative overflow-hidden group"
                  data-testid="upload-button"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10"
                    animate={{
                      x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span> (
                    {selectedFiles.length})
                  </span>
                </Button>
              </motion.div>
            )}
          </div>

          {/* File List */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 space-y-1"
                data-testid="file-list"
              >
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between py-1 px-2 rounded-md bg-secondary/50 group hover:bg-secondary transition-colors"
                    data-testid={`file-item-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[250px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-full hover:bg-destructive/10 group-hover:opacity-100 opacity-0 transition-opacity"
                      data-testid={`remove-file-button-${index}`}
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
