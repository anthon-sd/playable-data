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
  site: 'https://playabledata.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: 'assets' // Ensures assets are placed in the assets directory
  },
  vite: {
    build: {
      sourcemap: false,
      // Optimize build for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true,
          ecma: 2020,
          passes: 2
        },
        format: {
          comments: false,
          ecma: 2020
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              '@supabase/supabase-js',
              'marked',
              'slugify'
            ]
          },
          // Add hash to chunk filenames for better caching
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
        }
      }
    },
    optimizeDeps: {
      exclude: ['fsevents']
    },
    ssr: {
      noExternal: ['@supabase/supabase-js']
    }
  }
});