import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: (id) => {
        // 将 wagmi 和 privy 相关的依赖标记为外部依赖
        return id.startsWith('wagmi') || 
               id.startsWith('@wagmi') ||
               id.startsWith('@privy-io/react-auth') ||
               id.startsWith('@privy-io/wagmi')
      }
    }
  },
  server: {
    port: 3001,
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },
// 排除测试文件的监视和加载
  watchOptions: {
    ignore: [
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*'
    ]
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      'wagmi',
      '@tanstack/react-query',
      'viem'
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_./ }, args => ({
              path: args.path,
              namespace: 'process-polyfill',
            }))
            build.onLoad({ filter: /.*/, namespace: 'process-polyfill' }, () => ({
              contents: 'export default { env: {} }'
            }))
          }
        }
      ]
    }
  }

})