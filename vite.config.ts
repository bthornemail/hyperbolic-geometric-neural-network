import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';

  return {
    plugins: [
      react(),
    ],
    
    // Base URL for production deployment
    base: isProduction ? '/h2gnn/' : '/',
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mcp: ['@modelcontextprotocol/sdk'],
            utils: ['lucide-react', 'zod'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
        '/mcp': {
          target: env.VITE_MCP_URL || 'http://localhost:3002',
          changeOrigin: true,
        },
      },
    },

    // Preview server configuration
    preview: {
      port: 3000,
      host: true,
      strictPort: true,
    },

    // Dependency optimization
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom', '@modelcontextprotocol/sdk'],
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __NODE_ENV__: JSON.stringify(mode),
    },

    // CSS configuration
    css: {
      devSourcemap: !isProduction,
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@core': resolve(__dirname, 'src/core'),
        '@mcp': resolve(__dirname, 'src/mcp'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },

    // Environment-specific configurations
    ...(isProduction && {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    }),

    ...(isStaging && {
      build: {
        sourcemap: true,
        minify: 'esbuild',
      },
    }),
  };
});
