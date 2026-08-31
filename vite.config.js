import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
      root: '.',
      plugins: [react()],
      server: {
            port: 5173,
      },
      resolve: {
            alias: {
                  '@': path.resolve(__dirname, './src'),
            },
      },
      // Explicitly set the source root so Vite never crawls client/
      build: {
            rollupOptions: {
                  input: './index.html',
            },
      },
})