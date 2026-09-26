import { defineConfig } from 'vitepress';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docsHead } from './head';
import { docsNav, docsSidebar } from './nav';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const coreRoot = resolve(__dirname, '../../packages/core');
const coreRuntimeDist = resolve(coreRoot, 'dist/runtime.js');
const coreRuntimeSrc = resolve(coreRoot, 'src/runtime.ts');
/** Prefer built runtime (fast); fall back to source for first-time clones. */
const coreRuntime = existsSync(coreRuntimeDist) ? coreRuntimeDist : coreRuntimeSrc;

export default defineConfig({
  title: 'TokiForge',
  description:
    'TokiForge is a framework-agnostic design token and theming engine for React, Vue, Svelte, Angular, and more. Runtime theme switching, CSS variables, and smart color utilities. <3KB gzipped.',
  base: '/tokiforge/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,

  vite: {
    resolve: {
      // Exact match only — a string '@tokiforge/core' alias also rewrites '/runtime'.
      alias: [{ find: '@tokiforge/core/runtime', replacement: coreRuntime }],
    },
    optimizeDeps: {
      include: ['@tokiforge/core/runtime', '@tokiforge/vue'],
    },
    ssr: {
      noExternal: ['@tokiforge/core', '@tokiforge/core/runtime', '@tokiforge/vue'],
    },
    build: {
      chunkSizeWarningLimit: 800,
      cssCodeSplit: true,
    },
    server: {
      fs: {
        allow: [resolve(__dirname, '../..')],
      },
    },
  },

  head: docsHead,

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'TokiForge',
    nav: docsNav,
    sidebar: docsSidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/TokiForge/tokiforge' }],
    footer: {
      message:
        'Released under the <a href="https://github.com/TokiForge/tokiforge/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">GNU Affero General Public License v3.0 (AGPL-3.0)</a>.',
      copyright: 'Copyright © 2026 TokiForge Community',
    },
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },
    editLink: {
      pattern: 'https://github.com/TokiForge/tokiforge/edit/main/documentation/:path',
      text: 'Edit this page on GitHub',
    },
    lastUpdated: {
      text: 'Last updated',
    },
    outline: {
      level: [2, 3],
    },
  },

  sitemap: {
    hostname: 'https://www.sachindilshan.com',
  },
});
