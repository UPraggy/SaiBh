import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Permite usar JSX dentro de arquivos .js (padrao do DevProfile do Rafael)
export default defineConfig({
  // dominio proprio (saibh.rafaelmr.com.br) serve na raiz, entao base = '/'
  base: '/',
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  server: { port: 5173, host: true },
})
