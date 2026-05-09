import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://berlinportfolio.com',
  build: {
    assets: 'assets'
  },
  server: {
    port: 4321,
    host: true
  },
  devToolbar: {
    enabled: false
  }
});
