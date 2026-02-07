import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build options
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Chunk naming for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
  },
  
  // Development server options
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
  },
  
  // Preview server options
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },
  
  // Resolve options
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@context': '/src/context',
      '@config': '/src/config',
      '@data': '/src/data',
    },
  },
  
  // Optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
