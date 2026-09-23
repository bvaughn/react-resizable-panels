import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "react-resizable-panels": new URL("../../lib/index.ts", import.meta.url)
        .pathname
    }
  },
  server: {
    cors: true
  }
});
