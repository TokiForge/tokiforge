import { defineConfig } from 'vitepress';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const stubDir = resolve(__dirname, 'vitepress-stubs');

export default defineConfig({
  title: 'TokiForge',
  
  vite: {
    resolve: {
      alias: {
        'fs': resolve(stubDir, 'fs.js'),
        'path': resolve(stubDir, 'path.js'),
        'fs/promises': resolve(stubDir, 'fs-promises.js'),
      },
    },
    optimizeDeps: {
      exclude: ['@tokiforge/core'],
    },
    ssr: {
      noExternal: ['@tokiforge/core'],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress warning about mixed static/dynamic imports for @tokiforge/core
          // This is expected: ThemeRuntime is statically imported (needed at init),
          // while TokenExporter is dynamically imported (lazy-loaded in playground)
          const message = warning.message || String(warning);
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            (message.includes('dynamically imported') && 
             (message.includes('@tokiforge/core') || message.includes('packages/core')) &&
             message.includes('statically imported'))
          ) {
            return;
          }
          warn(warning);
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    logLevel: 'warn',
    customLogger: {
      info: (msg) => {
        // Suppress info messages about dynamic imports for @tokiforge/core
        if (typeof msg === 'string' && msg.includes('dynamically imported') && (msg.includes('@tokiforge/core') || msg.includes('packages/core'))) {
          return;
        }
        // Suppress other info messages during build
        return;
      },
      warn: (msg) => {
        // Suppress the specific warning about dynamic imports for @tokiforge/core
        const msgStr = typeof msg === 'string' ? msg : String(msg);
        if (msgStr.includes('dynamically imported') && (msgStr.includes('@tokiforge/core') || msgStr.includes('packages/core')) && msgStr.includes('statically imported')) {
          return;
        }
        console.warn(msg);
      },
      warnOnce: (msg) => {
        // Suppress the specific warning about dynamic imports for @tokiforge/core
        const msgStr = typeof msg === 'string' ? msg : String(msg);
        if (msgStr.includes('dynamically imported') && (msgStr.includes('@tokiforge/core') || msgStr.includes('packages/core')) && msgStr.includes('statically imported')) {
          return;
        }
        console.warn(msg);
      },
      error: (msg) => console.error(msg),
      clearScreen: () => {},
      hasErrorLogged: () => false,
      hasWarned: false,
    },
  },
  description: 'TokiForge is a framework-agnostic design token and theming engine for React, Vue, Svelte, Angular, and more. Runtime theme switching, CSS variables, and smart color utilities. <3KB gzipped.',
  base: '/tokiforge/',
  
  head: [
    ['script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-QMSD2BCYDK' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-QMSD2BCYDK');
    `],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#7C3AED' }],
    ['meta', { name: 'keywords', content: 'design tokens, theme engine, theming, CSS variables, design system, theme switching, runtime theming, React theming, Vue theming, Angular theming, Svelte theming, design tokens library, color tokens, design system tools, frontend theming, dark mode, light mode, theme management, token parser, style dictionary' }],
    ['meta', { name: 'author', content: 'TokiForge Community' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'TokiForge - Modern Design Token & Theme Engine' }],
    ['meta', { property: 'og:description', content: 'Framework-agnostic design token and theming engine. Runtime theme switching, CSS variables, and smart color utilities for React, Vue, Svelte, Angular, and more.' }],
    ['meta', { property: 'og:image', content: '/logo.svg' }],
    ['meta', { property: 'og:url', content: 'https://tokiforge.dev' }],
    ['meta', { property: 'og:site_name', content: 'TokiForge' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'TokiForge - Modern Design Token & Theme Engine' }],
    ['meta', { name: 'twitter:description', content: 'Framework-agnostic design token and theming engine for React, Vue, Svelte, Angular, and more.' }],
    ['meta', { name: 'twitter:image', content: '/logo.svg' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'TokiForge',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '5',
        'ratingCount': '1'
      },
      'description': 'Framework-agnostic design token and theming engine for React, Vue, Svelte, Angular, and more.',
      'url': 'https://github.com/TokiForge/tokiforge',
      'author': {
        '@type': 'Organization',
        'name': 'TokiForge Community'
      },
      'keywords': 'design tokens, theme engine, theming, CSS variables, design system, React, Vue, Angular, Svelte'
    })],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'TokiForge',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Playground', link: '/api/playground' },
      { text: 'Examples', link: '/examples/react' },
      { text: 'CLI', link: '/cli/overview' },
      { text: 'GitHub', link: 'https://github.com/TokiForge/tokiforge' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Framework Support', link: '/guide/framework-support' },
          ],
        },
        {
          text: 'Frameworks',
          items: [
            { text: 'React', link: '/guide/react' },
            { text: 'Vue', link: '/guide/vue' },
            { text: 'Angular', link: '/guide/angular' },
            { text: 'Svelte', link: '/guide/svelte' },
            { text: 'Any Framework', link: '/guide/framework-support' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Advanced Features', link: '/guide/advanced-features' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'Design Tokens', link: '/guide/design-tokens' },
            { text: 'Custom Exporters', link: '/guide/custom-exporters' },
            { text: 'Performance', link: '/guide/performance' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'Playground', link: '/api/playground' },
            {
              text: 'Core Package',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/api/core' },
                { text: 'TokenVersioning', link: '/api/core#tokenversioning' },
                { text: 'ComponentTheming', link: '/api/core#componenttheming' },
                { text: 'PluginManager', link: '/api/core#pluginmanager' },
                { text: 'AccessibilityUtils', link: '/api/core#accessibilityutils' },
                { text: 'ResponsiveTokens', link: '/api/core#responsivetokens' },
                { text: 'FigmaDiff', link: '/api/core#figmadiff' },
                { text: 'CICDValidator', link: '/api/core#cicdvalidator' },
                { text: 'TokenAnalytics', link: '/api/core#tokenanalytics' },
                { text: 'TokenRegistry', link: '/api/core#tokenregistry' },
                { text: 'IDESupport', link: '/api/core#idesupport' },
              ],
            },
            { text: 'TokenParser', link: '/api/token-parser' },
            { text: 'TokenExporter', link: '/api/token-exporter' },
            { text: 'ThemeRuntime', link: '/api/theme-runtime' },
          ],
        },
        {
          text: 'Framework APIs',
          items: [
            { text: 'React', link: '/api/react' },
            { text: 'Vue', link: '/api/vue' },
            { text: 'Angular', link: '/api/angular' },
            { text: 'Svelte', link: '/api/svelte' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'React Example', link: '/examples/react' },
            { text: 'Vue Example', link: '/examples/vue' },
            { text: 'Angular Example', link: '/examples/angular' },
            { text: 'Svelte Example', link: '/examples/svelte' },
            { text: 'CLI Usage', link: '/examples/cli' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'CLI Documentation',
          items: [
            { text: 'Overview', link: '/cli/overview' },
            { text: 'Commands', link: '/cli/commands' },
            { text: 'Configuration', link: '/cli/configuration' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TokiForge/tokiforge' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 TokiForge Community',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/TokiForge/tokiforge/edit/main/documentation/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Last updated',
    },
  },

  sitemap: {
    hostname: 'https://tokiforge.dev',
  },
});

