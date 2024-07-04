import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: 'https://tauseefkhan.xyz',
  integrations: [tailwind(), icon(), compress()],
  output: "static",
  adapter: node({
    mode: "standalone"
  }),
});