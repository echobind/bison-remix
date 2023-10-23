// For now, this is only used by vitest. Eventually Remix itself will be compiled with Vite too.
import { defineConfig } from "vitest/dist/config.js";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
  plugins: [tsconfigPaths(), react()],
});
