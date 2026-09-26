import type { DefaultTheme } from 'vitepress';

export const docsNav: DefaultTheme.NavItem[] = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'API', link: '/api/core' },
  { text: 'Playground', link: '/api/playground' },
  { text: 'Examples', link: '/examples/react' },
  { text: 'CLI', link: '/cli/overview' },
  { text: 'GitHub', link: 'https://github.com/TokiForge/tokiforge' },
];

export const docsSidebar: DefaultTheme.Sidebar = {
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
      collapsed: true,
      items: [
        { text: 'Advanced Features', link: '/guide/advanced-features' },
        { text: 'Advanced Token Features', link: '/guide/advanced-token-features' },
        { text: 'Semantic Tokens', link: '/guide/semantic-tokens' },
        { text: 'Multi-Platform Exporters', link: '/guide/platform-exporters' },
        { text: 'VS Code extension', link: '/guide/vscode-extension' },
        { text: 'Plugin development', link: '/guide/plugin-development' },
        { text: 'Visual regression testing', link: '/guide/visual-regression-testing' },
        { text: 'Enterprise & registry', link: '/guide/enterprise-and-registry' },
        { text: 'Performance Optimization', link: '/guide/performance-optimization' },
        { text: 'Accessibility', link: '/guide/accessibility' },
        { text: 'Integrations', link: '/guide/integrations' },
        { text: 'Theming', link: '/guide/theming' },
        { text: 'Design Tokens', link: '/guide/design-tokens' },
        { text: 'Custom Exporters', link: '/guide/custom-exporters' },
        { text: 'Performance', link: '/guide/performance' },
        { text: 'SSR', link: '/guide/ssr' },
        { text: 'Troubleshooting', link: '/guide/troubleshooting' },
      ],
    },
  ],
  '/api/': [
    {
      text: 'Core API',
      items: [
        { text: 'Playground', link: '/api/playground' },
        { text: 'Overview', link: '/api/core' },
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
    {
      text: 'Advanced APIs',
      collapsed: true,
      items: [
        { text: 'Token Functions', link: '/api/advanced/token-functions' },
        { text: 'Token Expressions', link: '/api/advanced/token-expressions' },
        { text: 'Token References', link: '/api/advanced/token-references' },
        { text: 'Theming API', link: '/api/advanced/theming-api' },
        { text: 'Token Analytics', link: '/api/advanced/token-analytics' },
        { text: 'Token Validator', link: '/api/advanced/token-validator' },
        { text: 'Token Importer', link: '/api/advanced/token-importer' },
        { text: 'Token Merger', link: '/api/advanced/token-merger' },
        { text: 'Token Transforms', link: '/api/advanced/token-transforms' },
        { text: 'Token Doc Generator', link: '/api/advanced/token-doc-generator' },
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
};
