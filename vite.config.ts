import path from 'node:path'
import {defineConfig} from 'vite'

export default defineConfig(({mode}) => {
  const production = mode === 'production'

  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/extension.ts'),
        fileName: () => 'extension.js',
        formats: ['cjs'],
      },
      outDir: 'dist',
      emptyOutDir: true,
      minify: production,
      sourcemap: production ? 'hidden' : true,
      rollupOptions: {
        external: (id) => id === 'vscode' || id.startsWith('node:'),
        output: {
          exports: 'named',
          inlineDynamicImports: true,
        },
      },
    },
  }
})
