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
    format: 'directory'
  },
  vite: {
    build: {
      sourcemap: false,
      // Optimize build for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true
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
          }
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