import path from "path";
import react from "@vitejs/plugin-react";
import cleanPlugin from "vite-plugin-clean";
import removeConsole from "vite-plugin-remove-console";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    cleanPlugin({
      targetFiles: ["dist/assets"],
    }),
    removeConsole(),
    compression({ algorithm: "brotliCompress" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
