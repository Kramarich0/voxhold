import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
    }),
    svgr(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    mkcert(),
    // checker({
    //   typescript: true,
    //   biome: true,
    // }),
    // visualizer({
    //   open: true,
    //   filename: `generated/stats-${Date.now()}.html`,
    //   gzipSize: true,
    //   brotliSize: true,
    //   template: "treemap",
    // }),
    VitePWA({
      registerType: "prompt",
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
      },
      manifest: {
        name: "VoxHold",
        short_name: "VH",
        description: "Voice and text chat platform",
        theme_color: "#171717",
        background_color: "#171717",
        display: "standalone",
        start_url: "/",
        orientation: "any",
        categories: ["social", "entertainment"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: false,
        secure: false,
        ws: true,
      },
    },
  },
});
