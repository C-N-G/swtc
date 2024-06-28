import { defineConfig } from 'astro/config';

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  srcDir: "./src/pedia",
  integrations: [starlight({
    title: "swtcpedia"
  })]
});