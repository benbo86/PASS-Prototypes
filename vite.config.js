import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync, existsSync } from 'fs'
import devEditPlugin from './devEditPlugin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SKIP = new Set(['node_modules', 'Styles', 'Icons', 'Components', 'dist', '.git', '.github'])

// Auto-discovers any two-level nested subfolder that contains an index.html
// e.g. schedule/assign-visit-absent-employee/index.html
const prototypeInputs = Object.fromEntries(
  readdirSync(__dirname, { withFileTypes: true })
    .filter(d => d.isDirectory() && !SKIP.has(d.name) && !d.name.startsWith('.'))
    .flatMap(location =>
      readdirSync(resolve(__dirname, location.name), { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
        .map(d => `${location.name}/${d.name}`)
    )
    .filter(path => existsSync(resolve(__dirname, path, 'index.html')))
    .map(path => [path.replace('/', '--'), resolve(__dirname, path, 'index.html')])
)

export default defineConfig({
  base: '/PASS-Prototypes/',
  plugins: [react(), devEditPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...prototypeInputs,
      }
    }
  }
})
