import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    tailwind(),
    mdx()
  ],
  output: 'static',
  site: 'https://playabledata.io',
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
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
    }
  }
});