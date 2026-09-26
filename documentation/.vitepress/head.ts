import type { HeadConfig } from 'vitepress';

const siteUrl = 'https://www.sachindilshan.com/tokiforge/';

export const docsHead: HeadConfig[] = [
  ['script', { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-QMSD2BCYDK' }],
  [
    'script',
    {},
    `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QMSD2BCYDK');`,
  ],
  ['link', { rel: 'icon', href: '/favicon.ico' }],
  ['link', { rel: 'canonical', href: siteUrl }],
  ['meta', { name: 'theme-color', content: '#7C3AED' }],
  [
    'meta',
    {
      name: 'keywords',
      content:
        'design tokens, theme engine, CSS variables, React theming, Vue theming, Angular theming, Svelte theming, dark mode, Style Dictionary, Figma tokens',
    },
  ],
  ['meta', { name: 'author', content: 'TokiForge Community' }],
  ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:title', content: 'TokiForge - Design Token & Theme Engine' }],
  [
    'meta',
    {
      property: 'og:description',
      content:
        'Framework-agnostic design tokens and runtime theming for React, Vue, Svelte, Angular, and more. <3KB gzipped.',
    },
  ],
  ['meta', { property: 'og:image', content: `${siteUrl}logo.svg` }],
  ['meta', { property: 'og:url', content: siteUrl }],
  ['meta', { property: 'og:site_name', content: 'TokiForge' }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:title', content: 'TokiForge - Design Token & Theme Engine' }],
  [
    'meta',
    {
      name: 'twitter:description',
      content: 'Framework-agnostic design tokens and runtime theming. <3KB gzipped.',
    },
  ],
  ['meta', { name: 'twitter:image', content: `${siteUrl}logo.svg` }],
  [
    'script',
    { type: 'application/ld+json' },
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TokiForge',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      softwareVersion: '2.4.0',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Framework-agnostic design token and theming engine. Runtime theme switching, CSS variables, <3KB gzipped.',
      url: 'https://www.sachindilshan.com',
      downloadUrl: 'https://www.npmjs.com/package/@tokiforge/core',
      author: {
        '@type': 'Organization',
        name: 'TokiForge Community',
        url: 'https://github.com/TokiForge/tokiforge',
      },
    }),
  ],
];
