import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { inlineAllAssetsPlugin } from './vite-plugins/inline-all-assets'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    inlineAllAssetsPlugin()
  ],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000, // Inline all assets
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    }
  },
  publicDir: false, // Don't copy public directory files
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
})
