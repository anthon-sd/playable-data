// Ultra-minimal Astro configuration - all optimizations focused on successful build
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  site: 'https://playabledata.io',
  output: 'static',
  build: {
    // Absolute minimum settings for successful build
    format: 'directory',
    assets: 'assets',
    inlineStylesheets: 'never'
  },
  vite: {
    build: {
      // Disable all memory-intensive features
      sourcemap: false,
      minify: false, // Disable minification to save memory
      cssCodeSplit: true,
      reportCompressedSize: false,
      // Disable other memory-intensive operations
      cssMinify: false,
      modulePreload: false,
      ssrManifest: false,
      manifest: false,
      write: true
    },
    // Disable optimization completely to save memory
    optimizeDeps: {
      disabled: true
    },
    // Reduce plugin overhead
    plugins: []
  }
});