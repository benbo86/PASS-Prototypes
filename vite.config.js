import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SKIP = new Set(['node_modules', 'Styles', 'dist', '.git', '.github'])

// Auto-discovers any subfolder that contains an index.html
const prototypeInputs = Object.fromEntries(
  readdirSync(__dirname, { withFileTypes: true })
    .filter(d => d.isDirectory() && !SKIP.has(d.name) && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(name => existsSync(resolve(__dirname, name, 'index.html')))
    .map(name => [name, resolve(__dirname, name, 'index.html')])
)

export default defineConfig({
  base: '/PASS-Prototypes/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...prototypeInputs,
      }
    }
  }
})
