import {defineConfig} from 'vite';
export default defineConfig({
  server: {
    allowedHosts: ['.app.github.dev'],
  },
  build: {rollupOptions: {treeshake: false, input: ['index.html', 'le-top.html', 'decouverte.html']}},
});
