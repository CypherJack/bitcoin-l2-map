import { defineConfig } from 'astro/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  build: {
    inlineStylesheets: 'always',
    assets: 'a',
    format: 'file',
  },
  vite: {
    plugins: [viteSingleFile({ removeViteModuleLoader: true })],
    build: {
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false,
    },
  },
});
