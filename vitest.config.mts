import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    pool: "threads",
    setupFiles: ["vitest.setup.ts"]
  }
});
