import react from '@vitejs/plugin-react';
import { defineConfig, transformWithEsbuild, loadEnv } from 'vite';
import * as path from 'node:path';
import svgr from 'vite-plugin-svgr'; // 新增

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const root = process.cwd();
  const env = loadEnv(process.env.NODE_ENV ?? mode, root);

  return {
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
      react(),
      svgr({ include: 'src/assets/images/**/*.svg?react' })
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
      outDir: 'build',
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
          target: env.VITE_REACT_APP_SERVER || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  };
});
