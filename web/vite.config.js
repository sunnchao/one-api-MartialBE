import react from '@vitejs/plugin-react';
import { defineConfig, transformWithEsbuild } from 'vite';
import * as path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic'
        });
      }
    },
    react()
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   'react-core': ['react', 'react-dom', 'react-router-dom'],
        //   tools: ['axios', 'history', 'marked'],
        //   'react-components': ['react-dropzone', 'react-fireworks', 'react-toastify', 'react-turnstile']
        // }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://sunwangwang-freeask.hf.space/',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
