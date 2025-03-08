import { defineConfig } from 'vite';

export default defineConfig({
  // Optimize build performance
  build: {
    target: 'es2020',
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
  
  // Optimize dev server
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      'marked',
      'slugify'
    ],
    exclude: ['fsevents']
  }
});