import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

const externals = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies), 'react/jsx-runtime'];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'hexglass',
    },
    rolldownOptions: {
      // Every dependency (and its subpaths, e.g. @base-ui/react/dialog) stays external.
      external: (id) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        banner: "'use client';",
      },
    },
    sourcemap: true,
  },
});
