import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/index.ts'],
  noExternal: ['speakingurl', 'superjson'],
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  shims: true,
});
