import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'solar-requiem': resolve(__dirname, 'src/solar-requiem/solar-requiem.html'),
        'crossmen-newsite': resolve(__dirname, 'src/crossmen-newsite/index.html'),
      },
    },
  },
});
