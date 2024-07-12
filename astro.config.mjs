import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from 'astro/config';

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: 'https://tauseefkhan.xyz',
  integrations: [tailwind(), icon(), compress()]
});