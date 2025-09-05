import path from 'node:path'
import url from 'node:url'
import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import type { BuildEnvironmentOptions } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// SSR configuration
const ssrBuildConfig: BuildEnvironmentOptions = {
  ssr: true,
  outDir: 'dist/server',
  ssrEmitAssets: true,
  copyPublicDir: false,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, 'src/entry-server.tsx'),
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    },
  },
}

// Client-specific configuration
const clientBuildConfig: BuildEnvironmentOptions = {
  outDir: 'dist/client',
  emitAssets: true,
  copyPublicDir: true,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, 'src/entry-client.tsx'),
    output: {
      entryFileNames: 'static/[name].js',
      chunkFileNames: 'static/assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
}

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  const {  mode, isSsrBuild } = configEnv;
  
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      // Only expose VITE_ prefixed variables to the client
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    // Configure environment variable handling
    envPrefix: ['VITE_', 'PUBLIC_'], // Variables with these prefixes will be exposed to client

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss()
    ],
    build: isSsrBuild ? ssrBuildConfig : clientBuildConfig,
   
  }
})
