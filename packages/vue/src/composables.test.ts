import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp, h, defineComponent } from 'vue';
import { provideTheme, useTheme, type ExtractTokenType } from './composables';
import type { DesignTokens, TokenValue, ThemeConfig } from '@tokiforge/core';

interface TestDesignTokens extends DesignTokens {
  color: {
    primary: TokenValue;
    secondary: TokenValue;
  };
  radius: {
    sm: TokenValue;
    md: TokenValue;
    lg: TokenValue;
  };
}

const lightTokens: TestDesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    secondary: { value: '#06B6D4', type: 'color' },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
};

const darkTokens: TestDesignTokens = {
  color: {
    primary: { value: '#A78BFA', type: 'color' },
    secondary: { value: '#22D3EE', type: 'color' },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
};

describe('Type-Safe Token Access', () => {
  beforeEach(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
        window.localStorage.removeItem('tokiforge-theme');
      }
    } catch (e) {
      // Ignore
    }
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    const styleElement = document.getElementById('tokiforge-theme');
    if (styleElement) {
      styleElement.remove();
    }
    document.body.className = '';
    vi.restoreAllMocks();
  });

  describe('provideTheme with type inference', () => {
    it('should infer token type from config', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const context = provideTheme(config);

      expect(context.tokens.value).toBeDefined();
      expect(context.tokens.value.color).toBeDefined();
      expect(context.tokens.value.color.primary).toBeDefined();
      expect(context.tokens.value.color.primary.value).toBe('#7C3AED');
      expect(context.tokens.value.radius.lg.value).toBe('12px');
    });

    it('should provide typed context that can be accessed', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const context = provideTheme(config);

      expect(context.theme).toBeDefined();
      expect(context.tokens).toBeDefined();
      expect(context.setTheme).toBeDefined();
      expect(context.nextTheme).toBeDefined();
      expect(context.availableThemes).toBeDefined();
      expect(context.runtime).toBeDefined();
    });
  });

  describe('useTheme with type parameter', () => {
    it('should return typed tokens when type parameter is provided', async () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const ParentComponent = defineComponent({
        setup() {
          provideTheme(config);
          return () => h(ChildComponent);
        },
      });

      const ChildComponent = defineComponent({
        setup() {
          const { tokens } = useTheme<TestDesignTokens>();

          expect(tokens.value.color.primary.value).toBe('#7C3AED');
          expect(tokens.value.radius.lg.value).toBe('12px');

          return () => h('div', `Primary: ${tokens.value.color.primary.value}`);
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp(ParentComponent);
      app.mount(container);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(container.textContent).toContain('#7C3AED');
      app.unmount();
      document.body.removeChild(container);
    });

    it('should allow type-safe token access in component', async () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const ParentComponent = defineComponent({
        setup() {
          provideTheme(config);
          return () => h(ChildComponent);
        },
      });

      const ChildComponent = defineComponent({
        setup() {
          const { tokens, setTheme } = useTheme<TestDesignTokens>();

          const primaryColor = tokens.value.color.primary.value;
          const radius = tokens.value.radius.lg.value;

          expect(primaryColor).toBe('#7C3AED');
          expect(radius).toBe('12px');

          setTheme('dark');
          expect(tokens.value.color.primary.value).toBe('#A78BFA');

          return () => h('div', `Color: ${tokens.value.color.primary.value}`);
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp(ParentComponent);
      app.mount(container);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(container.textContent).toContain('#A78BFA');
      app.unmount();
      document.body.removeChild(container);
    });
  });

  describe('type safety verification', () => {
    it('should maintain type information across provide/inject boundary', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const TestComponent = defineComponent({
        setup() {
          const context = useTheme<TestDesignTokens>();

          expect(context.tokens.value.color.primary).toBeDefined();
          expect(context.tokens.value.radius.lg).toBeDefined();

          const primary = context.tokens.value.color.primary.value;
          const radius = context.tokens.value.radius.lg.value;

          expect(primary).toBe('#7C3AED');
          expect(radius).toBe('12px');

          return () => h('div', primary);
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(TestComponent);
        },
      });
      app.mount(container);
      expect(container.textContent).toContain('#7C3AED');
      app.unmount();
      document.body.removeChild(container);
    });

    it('should allow accessing tokens with proper types', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const TestComponent = defineComponent({
        setup() {
          const { tokens } = useTheme<TestDesignTokens>();

          expect(tokens.value.color.primary.value).toBe('#7C3AED');
          expect(tokens.value.color.secondary.value).toBe('#06B6D4');
          expect(tokens.value.radius.sm.value).toBe('4px');
          expect(tokens.value.radius.md.value).toBe('8px');
          expect(tokens.value.radius.lg.value).toBe('12px');

          return () => h('div', 'test');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(TestComponent);
        },
      });
      app.mount(container);
      app.unmount();
      document.body.removeChild(container);
    });
  });

  describe('backward compatibility', () => {
    it('should work without type parameter (defaults to DesignTokens)', () => {
      const config: ThemeConfig = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const context = provideTheme(config);

      expect(context.tokens.value).toBeDefined();
      expect(context.tokens.value.color).toBeDefined();

      const TestComponent = defineComponent({
        setup() {
          const { tokens } = useTheme();

          expect(tokens.value).toBeDefined();
          expect(tokens.value.color).toBeDefined();

          return () => h('div', 'test');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(TestComponent);
        },
      });
      app.mount(container);
      app.unmount();
      document.body.removeChild(container);
    });

    it('should accept generic ThemeConfig', () => {
      const config: ThemeConfig = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const context = provideTheme(config);

      expect(context.theme.value).toBe('light');
      expect(context.tokens.value).toBeDefined();
    });
  });

  describe('ExtractTokenType helper', () => {
    it('should extract token type from ThemeConfig', () => {
      type TestThemeConfig = {
        themes: Array<{ name: string; tokens: TestDesignTokens }>;
        defaultTheme?: string;
      };

      type Extracted = ExtractTokenType<TestThemeConfig & ThemeConfig>;
      
      const config: TestThemeConfig = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const context = provideTheme(config);
      expect(context.tokens.value.color.primary.value).toBe('#7C3AED');
    });
  });

  describe('real-world usage scenario', () => {
    it('should work as described in the GitHub issue', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const ButtonComponent = defineComponent({
        setup() {
          const { tokens, setTheme } = useTheme<TestDesignTokens>();

          const backgroundColor = tokens.value.color.primary.value;
          const borderRadius = tokens.value.radius.lg.value;

          expect(backgroundColor).toBe('#7C3AED');
          expect(borderRadius).toBe('12px');

          setTheme('dark');
          expect(tokens.value.color.primary.value).toBe('#A78BFA');

          return () =>
            h('button', {
              style: {
                backgroundColor: tokens.value.color.primary.value,
                borderRadius: tokens.value.radius.lg.value,
              },
              onClick: () => setTheme('dark'),
            }, 'Switch Theme');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(ButtonComponent);
        },
      });
      app.mount(container);

      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Switch Theme');
      app.unmount();
      document.body.removeChild(container);
    });

    it('should provide autocomplete-friendly token access', () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const TestComponent = defineComponent({
        setup() {
          const { tokens } = useTheme<TestDesignTokens>();

          const tokensValue = tokens.value;

          expect(tokensValue.color.primary.value).toBe('#7C3AED');
          expect(tokensValue.color.secondary.value).toBe('#06B6D4');
          expect(tokensValue.radius.sm.value).toBe('4px');
          expect(tokensValue.radius.md.value).toBe('8px');
          expect(tokensValue.radius.lg.value).toBe('12px');

          return () => h('div', 'test');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(TestComponent);
        },
      });
      app.mount(container);
      app.unmount();
      document.body.removeChild(container);
    });
  });

  describe('theme switching with type safety', () => {
    it('should maintain type safety when switching themes', async () => {
      const config = {
        themes: [
          { name: 'light', tokens: lightTokens },
          { name: 'dark', tokens: darkTokens },
        ],
        defaultTheme: 'light',
      };

      const TestComponent = defineComponent({
        setup() {
          const { tokens, setTheme } = useTheme<TestDesignTokens>();

          expect(tokens.value.color.primary.value).toBe('#7C3AED');

          setTheme('dark');
          expect(tokens.value.color.primary.value).toBe('#A78BFA');

          return () => h('div', tokens.value.color.primary.value);
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp({
        setup() {
          provideTheme(config);
          return () => h(TestComponent);
        },
      });
      app.mount(container);

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(container.textContent).toContain('#A78BFA');
      app.unmount();
      document.body.removeChild(container);
    });
  });

  describe('error handling', () => {
    it('should throw error when useTheme is called outside provider', () => {
      const TestComponent = defineComponent({
        setup() {
          useTheme();
          return () => h('div', 'test');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp(TestComponent);
      
      let caughtError: Error | null = null;
      app.config.errorHandler = (err) => {
        caughtError = err as Error;
      };
      
      app.mount(container);
      
      // Vue catches errors in setup and calls errorHandler
      expect(caughtError).toBeTruthy();
      if (caughtError) {
        expect(caughtError.message).toContain('useTheme must be used within a component that provides theme context');
      }
      
      app.unmount();
      document.body.removeChild(container);
    });

    it('should throw error when useTheme is called with type but outside provider', () => {
      const TestComponent = defineComponent({
        setup() {
          useTheme<TestDesignTokens>();
          return () => h('div', 'test');
        },
      });

      const container = document.createElement('div');
      document.body.appendChild(container);
      const app = createApp(TestComponent);
      
      let caughtError: Error | null = null;
      app.config.errorHandler = (err) => {
        caughtError = err as Error;
      };
      
      app.mount(container);
      
      // Vue catches errors in setup and calls errorHandler
      expect(caughtError).toBeTruthy();
      if (caughtError) {
        expect(caughtError.message).toContain('useTheme must be used within a component that provides theme context');
      }
      
      app.unmount();
      document.body.removeChild(container);
    });
  });
});

