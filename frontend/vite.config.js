// vite.config.js

import { defineConfig } from "vite";
import polyfillNode from "rollup-plugin-polyfill-node";

export default defineConfig({
  plugins: [polyfillNode()],
  build: {
    rollupOptions: {
      plugins: [
        polyfillNode(), // Ensure polyfillNode is added for the build
      ],
    },
  },
  resolve: {
    alias: {
      // Alias for modules
      // If other modules are needed to be aliased, you can do it here
    },
  },
  define: {
    global: {}, // Polyfill the global object
  },
});
