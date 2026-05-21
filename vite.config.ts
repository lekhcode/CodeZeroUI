import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev proxy keeps the browser on :5173 while API calls hit the Express backend.
 * Production builds use VITE_API_BASE_URL (same-origin or deployed API host).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("monaco-editor") || id.includes("@monaco-editor")) {
            return "monaco";
          }
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@mui/icons-material")) return "mui-icons";
          if (id.includes("@mui/material") || id.includes("@emotion")) return "mui";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:2026",
        changeOrigin: true,
      },
    },
  },
});
