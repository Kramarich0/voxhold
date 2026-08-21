import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".git"],
    css: false,

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/shared/lib/**",
        "src/shared/api/**",
        "src/features/**/model/**",
        "src/features/**/api/**",
        "src/entities/**/model/**",
        "src/entities/**/api/**",
      ],
      exclude: [
        "**/*.types.ts",
        "**/*.keys.ts",
        "**/*.constants.ts",
        "src/routeTree.gen.ts",
        "src/vite-env.d.ts",
        "src/test-setup.ts",
        "src/**/*.test.{ts,tsx}",
      ],
    },
  },
});
