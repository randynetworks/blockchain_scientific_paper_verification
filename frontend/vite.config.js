// vite.config.js

import { defineConfig } from 'vite';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [
  ],
  resolve: {
    alias: {
      // Add necessary module aliases here if needed
    },
  },
  define: {
    global: {}, // Provide a polyfill for the global object
  },
  build: {
    rollupOptions: {
      plugins: [
        polyfillNode(), // Ensure Node.js polyfills are used in the build
      ],
    },
  },
});