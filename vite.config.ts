import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: isLib ? {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'MergedGitHubCalendar',
        fileName: (format) => `index.${format}.js`,
        formats: ['es', 'umd'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
    } : {
      outDir: 'dist-demo', // Separate output for the demo app
    },
  }
})
