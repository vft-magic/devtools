import path from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import tmagicDevtools from '@tmagic/vite-plugin-devtools';

import pkg from './package.json';

export default defineConfig({
  define: {
    __VERSION__: `"${pkg.version}"`,
    __DEV__: `true`,
  },

  plugins: [vue(), tmagicDevtools()],

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  server: {
    port: 4000,
    host: '0.0.0.0',
    strictPort: true,
  },

  resolve: {
    alias: [
      { find: /^@tmagic\/core/, replacement: path.join(__dirname, '../../tmagic-editor/packages/core/src/index.ts') },
      { find: /^@tmagic\/utils/, replacement: path.join(__dirname, '../../tmagic-editor/packages/utils/src/index.ts') },
      { find: /^@tmagic\/dep/, replacement: path.join(__dirname, '../../tmagic-editor/packages/dep/src/index.ts') },
      {
        find: /^@tmagic\/schema/,
        replacement: path.join(__dirname, '../../tmagic-editor/packages/schema/src/index.ts'),
      },
      {
        find: /^@tmagic\/data-source/,
        replacement: path.join(__dirname, '../../tmagic-editor/packages/data-source/src/index.ts'),
      },
      {
        find: /^@data-source/,
        replacement: path.join(__dirname, '../../tmagic-editor/packages/data-source/src'),
      },
    ],
  },
});
