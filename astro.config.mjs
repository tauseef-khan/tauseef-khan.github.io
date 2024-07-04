import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from 'astro/config';

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: 'https://tauseef-khan.github.io',
  base: '/src/pages',
  integrations: [tailwind(), icon(), compress()],
  output: "static",
  adapter: vercel()
});