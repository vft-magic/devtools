import { resolve } from 'node:path';

import Vue from '@vitejs/plugin-vue';
import VueJSX from '@vitejs/plugin-vue-jsx';
import Unocss from 'unocss/vite';

export default {
  resolve: {
    alias: {
      '~/': `${resolve(__dirname)}/src/`,
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    minify: false,
  },
  plugins: [
    {
      name: 'local-object-transform',
      transform: {
        order: 'post',
        async handler(code) {
          return `${code}\n/* Injected with object hook! */`;
        },
      },
    },
    Vue(),
    VueJSX(),
    Unocss(),
  ],
};
