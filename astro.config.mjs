// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx()
  ],
  site: 'https://playable-data-blog.netlify.app',
  output: 'static',
  vite: {
    build: {
      sourcemap: false,
      // Increase the build timeout to prevent termination
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Create separate chunks for large dependencies
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ['fsevents']
    }
  }
});