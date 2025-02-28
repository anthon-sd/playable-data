// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// Memory usage optimization - check if we're in a memory-constrained environment
const isMemoryConstrained = process.env.ASTRO_MEMORY_LIMIT === 'true';

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
    assets: 'assets', // Ensures assets are placed in the assets directory
    // Memory optimization - split the build into smaller chunks
    inlineStylesheets: 'never', // Never inline CSS to reduce memory usage
    excludeMiddleware: true, // Exclude middleware to save memory
    client: './dist', // Set the client directory explicitly
    server: './dist'  // Set the server directory explicitly
  },
  vite: {
    build: {
      // Always disable sourcemaps in production to save memory
      sourcemap: false,
      // Optimize build for production
      minify: 'terser',
      // Memory optimization - limit concurrent operations
      assetsInlineLimit: 0, // Never inline assets as base64
      cssCodeSplit: true, // Split CSS to reduce memory usage
      reportCompressedSize: false, // Skip compressed size reporting to save memory
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true,
          ecma: 2020,
          // Memory optimization - reduce optimization passes
          passes: isMemoryConstrained ? 1 : 2
        },
        format: {
          comments: false,
          ecma: 2020
        },
        // Memory optimization settings
        keep_classnames: false,
        keep_fnames: false,
        module: false,
        safari10: false
      },
      rollupOptions: {
        output: {
          // Memory optimization - create smaller chunks
          manualChunks: (id) => {
            // Split node_modules into chunks to reduce memory pressure
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('marked')) return 'vendor-marked';
              if (id.includes('tailwind')) return 'vendor-tailwind';
              return 'vendor'; // All other node_modules
            }
            // Keep application code separate
            return undefined;
          },
          // Add hash to chunk filenames for better caching
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
        }
      }
    },
    optimizeDeps: {
      exclude: ['fsevents'],
      // Memory optimizations for dependency optimization
      force: true,
      disabled: isMemoryConstrained // Skip optimization in memory-constrained environments
    },
    ssr: {
      noExternal: ['@supabase/supabase-js']
    },
    // Memory optimizations for Vite
    server: {
      fs: {
        strict: true // Restrict to working directory
      }
    }
  }
});