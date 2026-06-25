import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1200,
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('@supabase') || id.includes('supabase')) {
                  return 'supabase';
                }
                if (id.includes('lucide-react')) {
                  return 'lucide';
                }
                if (id.includes('recharts') || id.includes('d3')) {
                  return 'recharts';
                }
                if (id.includes('react')) {
                  return 'react-vendor';
                }
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
