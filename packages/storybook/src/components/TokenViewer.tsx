import React, { useState, useEffect } from 'react';
import type { DesignTokens } from '@tokiforge/core';

export function TokenViewer() {
  const [tokens, setTokens] = useState<DesignTokens>({});
  const [currentTheme, setCurrentTheme] = useState<string>('');

  useEffect(() => {
    const handleTokensUpdate = (event: CustomEvent) => {
      setTokens(event.detail.tokens);
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('tokiforge:theme-change', handleTokensUpdate as EventListener);

    if (typeof window !== 'undefined' && (window as any).__tokiforge) {
      const runtime = (window as any).__tokiforge;
      const theme = runtime.getCurrentTheme();
      if (theme) {
        setTokens(runtime.getThemeTokens(theme));
        setCurrentTheme(theme);
      }
    }

    return () => {
      window.removeEventListener('tokiforge:theme-change', handleTokensUpdate as EventListener);
    };
  }, []);

  const renderTokens = (obj: any, path: string[] = []): React.ReactNode => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('value' in value) {
          const tokenValue = value as any;
          return (
            <div key={pathStr} style={{ marginLeft: `${path.length * 16}px`, marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#7C3AED' }}>{key}</div>
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                <span style={{ color: '#333' }}>Value: </span>
                <span style={{ fontFamily: 'monospace' }}>{String(tokenValue.value)}</span>
                {tokenValue.type && (
                  <span style={{ marginLeft: '8px', color: '#999' }}>({tokenValue.type})</span>
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div key={pathStr} style={{ marginLeft: `${path.length * 16}px`, marginTop: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{key}</div>
              {renderTokens(value, currentPath)}
            </div>
          );
        }
      }
      return null;
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginTop: 0 }}>Design Tokens</h3>
      {currentTheme && (
        <div style={{ marginBottom: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Current Theme:</strong> {currentTheme}
        </div>
      )}
      <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
        {Object.keys(tokens).length > 0 ? renderTokens(tokens) : <div>No tokens loaded</div>}
      </div>
    </div>
  );
}

