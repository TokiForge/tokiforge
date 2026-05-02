import { useState, useEffect, useMemo, useRef, lazy, Suspense, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import './App.css';

const ContrastVisualizer = lazy(() => import('./components/ContrastVisualizer').then(m => ({ default: m.ContrastVisualizer })));
const TokenUsageVisualizer = lazy(() => import('./components/TokenUsageVisualizer').then(m => ({ default: m.TokenUsageVisualizer })));
const ThemeComparison = lazy(() => import('./components/ThemeComparison').then(m => ({ default: m.ThemeComparison })));
const ExportShare = lazy(() => import('./components/ExportShare').then(m => ({ default: m.ExportShare })));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));

interface FlatToken {
  path: string;
  value: unknown;
  type?: string;
}

const VIRTUAL_THRESHOLD = 50;
const ROW_HEIGHT = 44;

const TokenListRow = memo(function TokenListRow({ token }: { token: FlatToken }) {
  return (
    <div className="token-item">
      <div className="token-path">{token.path}</div>
      <div className="token-value">
        {token.type === 'color' && typeof token.value === 'string' && token.value.startsWith('#') ? (
          <div className="color-preview">
            <div className="color-swatch" style={{ backgroundColor: token.value }} aria-hidden />
            <span>{token.value}</span>
          </div>
        ) : (
          <span>{String(token.value)}</span>
        )}
      </div>
    </div>
  );
});

function TokenList({ flatTokens }: { flatTokens: FlatToken[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = flatTokens.length > VIRTUAL_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: flatTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (!useVirtual) {
    return (
      <div className="tokens">
        {flatTokens.map((token) => (
          <TokenListRow key={token.path} token={token} />
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="tokens tokens-virtual" style={{ height: '400px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const token = flatTokens[virtualRow.index];
          return (
            <div
              key={token.path}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TokenListRow token={token} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const defaultTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    secondary: { value: '#06B6D4', type: 'color' },
    text: {
      primary: { value: '#1F2937', type: 'color' },
      secondary: { value: '#6B7280', type: 'color' },
    },
    background: {
      default: { value: '#FFFFFF', type: 'color' },
      secondary: { value: '#F9FAFB', type: 'color' },
    },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
    md: { value: '16px', type: 'dimension' },
    lg: { value: '24px', type: 'dimension' },
  },
  radius: {
    sm: { value: '4px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '12px', type: 'dimension' },
  },
};

function App() {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultTokens, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [activeTab, setActiveTab] = useState<'preview' | 'contrast' | 'usage' | 'compare' | 'export' | 'analytics'>('preview');

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setTokens(parsed);
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    }
  }, [jsonInput]);

  const themeConfig = useMemo<ThemeConfig>(
    () => ({
      themes: [
        { name: 'light', tokens },
        {
          name: 'dark',
          tokens: {
            ...tokens,
            color: {
              ...tokens.color,
              text: {
                primary: { value: '#F9FAFB', type: 'color' },
                secondary: { value: '#D1D5DB', type: 'color' },
              },
              background: {
                default: { value: '#111827', type: 'color' },
                secondary: { value: '#1F2937', type: 'color' },
              },
            },
          },
        },
      ],
      defaultTheme: selectedTheme,
    }),
    [tokens, selectedTheme]
  );

  const [runtime, setRuntime] = useState<ThemeRuntime | null>(null);
  useEffect(() => {
    const r = new ThemeRuntime(themeConfig);
    r.init();
    setRuntime(r);
    return () => {
      r.destroy();
    };
  }, [themeConfig]);

  const flattenTokens = (obj: DesignTokens, prefix: string = ''): FlatToken[] => {
    const result: FlatToken[] = [];
    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const token = value as { value?: unknown; $value?: unknown; type?: string };
          result.push({
            path,
            value: token.value ?? token.$value,
            type: token.type,
          });
        } else {
          result.push(...flattenTokens(value as DesignTokens, path));
        }
      }
    }
    return result;
  };

  const flatTokens = useMemo(() => flattenTokens(tokens), [tokens]);

  const tabIds = ['preview', 'contrast', 'usage', 'compare', 'export', 'analytics'] as const;
  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const i = tabIds.indexOf(activeTab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTab(tabIds[(i + 1) % tabIds.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTab(tabIds[(i - 1 + tabIds.length) % tabIds.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab('preview');
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab('analytics');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 TokiForge Playground</h1>
        <p>Visual design token editor, theme preview, and analysis tools</p>
      </header>

      <div className="container">
        <div className="editor-panel">
          <h2>Token Editor</h2>
          <textarea
            className="json-editor"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck={false}
          />
          {error && (
          <div className="error" role="alert" aria-live="assertive">
            Error: {error}
          </div>
        )}
        </div>

        <div className="preview-panel">
          <div className="theme-selector">
            <label htmlFor="playground-theme-select">Theme:</label>
            <select
              id="playground-theme-select"
              value={selectedTheme}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedTheme(v);
                runtime?.applyTheme(v);
              }}
              aria-label="Select theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="tabs" role="tablist" aria-label="Playground sections" tabIndex={0} onKeyDown={handleTabKeyDown}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'preview'}
              aria-controls="tab-preview"
              id="tab-preview-btn"
              className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              👁️ Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'contrast'}
              aria-controls="tab-contrast"
              id="tab-contrast-btn"
              className={`tab ${activeTab === 'contrast' ? 'active' : ''}`}
              onClick={() => setActiveTab('contrast')}
            >
              🎯 Contrast
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'usage'}
              aria-controls="tab-usage"
              id="tab-usage-btn"
              className={`tab ${activeTab === 'usage' ? 'active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              📊 Usage
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'compare'}
              aria-controls="tab-compare"
              id="tab-compare-btn"
              className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              🔄 Compare
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'export'}
              aria-controls="tab-export"
              id="tab-export-btn"
              className={`tab ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              💾 Export
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'analytics'}
              aria-controls="tab-analytics"
              id="tab-analytics-btn"
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          <div className="tab-content">
            <div role="tabpanel" id="tab-preview" aria-labelledby="tab-preview-btn" hidden={activeTab !== 'preview'}>
              {runtime && (
                <>
                  <div className="token-list">
                    <h2>Tokens ({flatTokens.length})</h2>
                    <TokenList flatTokens={flatTokens} />
                  </div>

                  <div className="preview-components">
                    <h2>Component Preview</h2>
                    <div className="preview-card">
                      <h3>Card Title</h3>
                      <p>This is a preview of how your tokens look in components.</p>
                      <button type="button" className="preview-button">Button</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div role="tabpanel" id="tab-contrast" aria-labelledby="tab-contrast-btn" hidden={activeTab !== 'contrast'}>
              <Suspense fallback={<div className="tab-content" aria-busy>Loading…</div>}>
                <ContrastVisualizer tokens={tokens} />
              </Suspense>
            </div>
            <div role="tabpanel" id="tab-usage" aria-labelledby="tab-usage-btn" hidden={activeTab !== 'usage'}>
              <Suspense fallback={<div className="tab-content" aria-busy>Loading…</div>}>
                <TokenUsageVisualizer tokens={tokens} />
              </Suspense>
            </div>
            <div role="tabpanel" id="tab-compare" aria-labelledby="tab-compare-btn" hidden={activeTab !== 'compare'}>
              <Suspense fallback={<div className="tab-content" aria-busy>Loading…</div>}>
                <ThemeComparison config={themeConfig} />
              </Suspense>
            </div>
            <div role="tabpanel" id="tab-export" aria-labelledby="tab-export-btn" hidden={activeTab !== 'export'}>
              <Suspense fallback={<div className="tab-content" aria-busy>Loading…</div>}>
                <ExportShare tokens={tokens} themeName={selectedTheme} />
              </Suspense>
            </div>
            <div role="tabpanel" id="tab-analytics" aria-labelledby="tab-analytics-btn" hidden={activeTab !== 'analytics'}>
              <Suspense fallback={<div className="tab-content" aria-busy>Loading…</div>}>
                <AnalyticsDashboard tokens={tokens} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

