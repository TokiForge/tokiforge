import { useState, useEffect } from 'react';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import './App.css';

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

  const themeConfig: ThemeConfig = {
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
  };

  const runtime = new ThemeRuntime(themeConfig);
  runtime.init();

  const flattenTokens = (obj: DesignTokens, prefix: string = ''): Array<{ path: string; value: any; type?: string }> => {
    const result: Array<{ path: string; value: any; type?: string }> = [];
    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value || '$value' in value) {
          const token = value as any;
          result.push({
            path,
            value: token.value || token.$value,
            type: token.type,
          });
        } else {
          result.push(...flattenTokens(value as DesignTokens, path));
        }
      }
    }
    return result;
  };

  const flatTokens = flattenTokens(tokens);

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 TokiForge Playground</h1>
        <p>Visual design token editor and theme preview</p>
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
          {error && <div className="error">Error: {error}</div>}
        </div>

        <div className="preview-panel">
          <div className="theme-selector">
            <label>Theme:</label>
            <select value={selectedTheme} onChange={(e) => {
              setSelectedTheme(e.target.value);
              runtime.applyTheme(e.target.value);
            }}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="token-list">
            <h2>Tokens ({flatTokens.length})</h2>
            <div className="tokens">
              {flatTokens.map((token) => (
                <div key={token.path} className="token-item">
                  <div className="token-path">{token.path}</div>
                  <div className="token-value">
                    {token.type === 'color' && token.value?.toString().startsWith('#') ? (
                      <div className="color-preview">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: token.value.toString() }}
                        />
                        <span>{token.value}</span>
                      </div>
                    ) : (
                      <span>{token.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-components">
            <h2>Component Preview</h2>
            <div className="preview-card">
              <h3>Card Title</h3>
              <p>This is a preview of how your tokens look in components.</p>
              <button className="preview-button">Button</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

