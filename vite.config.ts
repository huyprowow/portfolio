import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import glsl from 'vite-plugin-glsl'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
      },
    }),
    glsl(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      three: path.resolve(__dirname, 'node_modules/three'),
      'three-stdlib': path.resolve(__dirname, 'node_modules/three-stdlib'),
      // '@framework': path.resolve(__dirname, './src/lib/CubismSdkForWeb-5-r.4/Framework/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  base: '/',
  publicDir: './public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      // external: ['three', 'three-stdlib'],
      output: {
        globals: {
          three: 'THREE',
          'three-stdlib': 'THREE_STDLIB',
        },
        assetFileNames: (assetInfo) => {
          if (/\.(glb|fbx|pmx)$/.test(assetInfo.name)) {
            return `assets/[name].[ext]`
          }
          return `assets/[name]-[hash].[ext]`
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three', 'three-stdlib'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or "modern"
      },
    },
  },
})
