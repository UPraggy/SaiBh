import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Permite usar JSX dentro de arquivos .js (padrao do DevProfile do Rafael)
export default defineConfig({
  // repositorio: github.com/UPraggy/SaiBh -> site servido em /SaiBh/ (gh-pages)
  base: '/SaiBh/',
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
