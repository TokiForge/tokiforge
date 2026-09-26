import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, type ReactNode } from 'react';
import { ThemeRuntime } from '@tokiforge/core/runtime';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core/runtime';
import { readTokensFromUrl } from './share-url';
import './App.css';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      const hasReloaded = sessionStorage.getItem('tf-import-reload-attempted');
      if (!hasReloaded) {
        sessionStorage.setItem('tf-import-reload-attempted', 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

const AIGenerator = lazyWithRetry(() => import('./panels/AIGenerator'));
const VisualEditor = lazyWithRetry(() => import('./panels/VisualEditor'));
const TokenManager = lazyWithRetry(() => import('./panels/TokenManager'));
const ExportPanel = lazyWithRetry(() => import('./panels/ExportPanel'));
const AccessibilityPanel = lazyWithRetry(() => import('./panels/AccessibilityPanel'));
const AnalyticsPanel = lazyWithRetry(() => import('./panels/AnalyticsPanel'));
const CollabPanel = lazyWithRetry(() => import('./panels/CollabPanel'));
const ComponentsPanel = lazyWithRetry(() => import('./panels/ComponentsPanel'));
const FigmaPanel = lazyWithRetry(() => import('./panels/FigmaPanel'));
const SettingsPanel = lazyWithRetry(() => import('./panels/SettingsPanel'));

export const defaultTokens: DesignTokens = {
  color: {
    primary: { value: '#fb7185', type: 'color' },
    secondary: { value: '#38bdf8', type: 'color' },
    success: { value: '#4ade80', type: 'color' },
    warning: { value: '#fbbf24', type: 'color' },
    danger: { value: '#f87171', type: 'color' },
    text: {
      primary: { value: '#fafafa', type: 'color' },
      secondary: { value: '#a1a1aa', type: 'color' },
      muted: { value: '#71717a', type: 'color' },
    },
    background: {
      base: { value: '#09090b', type: 'color' },
      raised: { value: '#111113', type: 'color' },
      card: { value: '#18181b', type: 'color' },
    },
    border: {
      default: { value: '#27272a', type: 'color' },
      brand: { value: 'rgba(251,113,133,0.4)', type: 'color' },
    },
  },
  typography: {
    fontFamily: {
      sans: { value: "'Plus Jakarta Sans', system-ui, sans-serif", type: 'fontFamily' },
      mono: { value: "'JetBrains Mono', ui-monospace, monospace", type: 'fontFamily' },
    },
    fontSize: {
      xs: { value: '0.75rem', type: 'dimension' },
      sm: { value: '0.8125rem', type: 'dimension' },
      md: { value: '0.875rem', type: 'dimension' },
      lg: { value: '1.0625rem', type: 'dimension' },
      xl: { value: '1.25rem', type: 'dimension' },
      '2xl': { value: '1.5rem', type: 'dimension' },
      '3xl': { value: '2rem', type: 'dimension' },
    },
    fontWeight: {
      regular: { value: '400', type: 'fontWeight' },
      medium: { value: '500', type: 'fontWeight' },
      semibold: { value: '600', type: 'fontWeight' },
      bold: { value: '700', type: 'fontWeight' },
    },
    lineHeight: {
      tight: { value: '1.2', type: 'custom' },
      normal: { value: '1.5', type: 'custom' },
      relaxed: { value: '1.7', type: 'custom' },
    },
  },
  spacing: {
    '1': { value: '0.25rem', type: 'dimension' },
    '2': { value: '0.5rem', type: 'dimension' },
    '3': { value: '0.75rem', type: 'dimension' },
    '4': { value: '1rem', type: 'dimension' },
    '5': { value: '1.25rem', type: 'dimension' },
    '6': { value: '1.5rem', type: 'dimension' },
    '8': { value: '2rem', type: 'dimension' },
    '10': { value: '2.5rem', type: 'dimension' },
    '12': { value: '3rem', type: 'dimension' },
  },
  radius: {
    sm: { value: '6px', type: 'dimension' },
    md: { value: '8px', type: 'dimension' },
    lg: { value: '10px', type: 'dimension' },
    xl: { value: '12px', type: 'dimension' },
    full: { value: '9999px', type: 'dimension' },
  },
  shadow: {
    sm: { value: '0 1px 2px rgba(0,0,0,0.35)', type: 'custom' },
    md: { value: '0 8px 20px rgba(0,0,0,0.28)', type: 'custom' },
    lg: { value: '0 16px 40px rgba(0,0,0,0.35)', type: 'custom' },
  },
};

type PanelId =
  | 'home'
  | 'ai'
  | 'editor'
  | 'tokens'
  | 'export'
  | 'a11y'
  | 'analytics'
  | 'collab'
  | 'components'
  | 'figma'
  | 'settings';

type IconName = 'search' | 'sun' | 'moon' | 'more';

const TABS: Array<{ id: PanelId; label: string }> = [
  { id: 'home', label: 'Playground' },
  { id: 'editor', label: 'Editor' },
  { id: 'ai', label: 'AI' },
  { id: 'components', label: 'Components' },
  { id: 'a11y', label: 'A11y' },
  { id: 'export', label: 'Export' },
  { id: 'analytics', label: 'Analytics' },
];

const MORE_TABS: Array<{ id: PanelId; label: string }> = [
  { id: 'tokens', label: 'Token Manager' },
  { id: 'figma', label: 'Figma Sync' },
  { id: 'collab', label: 'Collaboration' },
  { id: 'settings', label: 'Settings' },
];

const PALETTE_COMMANDS = [
  ...TABS.map((t) => ({ label: `Open ${t.label}`, desc: t.label, panel: t.id })),
  ...MORE_TABS.map((t) => ({ label: `Open ${t.label}`, desc: t.label, panel: t.id })),
];

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'search') {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }
  if (name === 'sun') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    );
  }
  if (name === 'moon') {
    return (
      <svg {...common}>
        <path d="M18 14.5A7.5 7.5 0 1 1 9.5 6 6 6 0 0 0 18 14.5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function countTokens(tokens: DesignTokens): number {
  let n = 0;
  function walk(obj: unknown): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    const node = obj as Record<string, unknown>;
    if ('value' in node) {
      n++;
      return;
    }
    for (const child of Object.values(node)) walk(child);
  }
  walk(tokens);
  return n;
}

function tokenValue(tokens: DesignTokens, path: string, fallback: string): string {
  const parts = path.split('.');
  let cur: unknown = tokens;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return fallback;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur && typeof cur === 'object' && 'value' in (cur as object)) {
    return String((cur as { value: unknown }).value);
  }
  return fallback;
}

function setTokenValue(tokens: DesignTokens, path: string, value: string): DesignTokens {
  const parts = path.split('.');
  function setNested(obj: DesignTokens, keys: string[]): DesignTokens {
    const [head, ...rest] = keys;
    if (rest.length === 0) {
      const prev = (obj[head] as Record<string, unknown> | undefined) ?? {};
      return { ...obj, [head]: { ...prev, value } };
    }
    return { ...obj, [head]: setNested(((obj[head] as DesignTokens) ?? {}) as DesignTokens, rest) };
  }
  return setNested(tokens, parts);
}

type FlatToken = { path: string; value: string; isColor: boolean; group: string };

function flattenTokens(obj: DesignTokens, prefix = ''): FlatToken[] {
  const out: FlatToken[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
    const node = val as Record<string, unknown>;
    if ('value' in node) {
      const value = String(node.value);
      out.push({
        path,
        value,
        isColor: value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'),
        group: path.split('.')[0],
      });
    } else {
      out.push(...flattenTokens(val as DesignTokens, path));
    }
  }
  return out;
}

function PanelLoader() {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', gap: 10 }}>
      <div className="tf-spinner" />
      <span style={{ color: 'var(--tf-text-3)', fontSize: 13 }}>Loading…</span>
    </div>
  );
}

function CommandPalette({ onClose, onNav }: { onClose: () => void; onNav: (p: PanelId) => void }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(0);
  const filtered = PALETTE_COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setFocused((f) => Math.min(f + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setFocused((f) => Math.max(f - 1, 0));
      if (e.key === 'Enter' && filtered[focused]) {
        onNav(filtered[focused].panel);
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, focused, onClose, onNav]);

  return (
    <div className="tf-palette-backdrop" onClick={onClose} role="presentation">
      <div className="tf-palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input
          className="tf-palette-input"
          autoFocus
          placeholder="Go to…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocused(0);
          }}
        />
        <div className="tf-palette-results">
          <div className="tf-palette-group-label">Pages</div>
          {filtered.map((cmd, i) => (
            <div
              key={cmd.label}
              className={`tf-palette-item${i === focused ? ' focused' : ''}`}
              onClick={() => {
                onNav(cmd.panel);
                onClose();
              }}
              onMouseEnter={() => setFocused(i)}
            >
              <span className="tf-palette-item-label">{cmd.label}</span>
              <span className="tf-palette-item-desc">{cmd.desc}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tf-text-3)', fontSize: 13 }}>No results</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Workbench({
  tokens,
  setTokens,
  toast,
}: {
  tokens: DesignTokens;
  setTokens: (t: DesignTokens) => void;
  toast: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const flat = useMemo(() => flattenTokens(tokens), [tokens]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>('color.primary');
  const [draft, setDraft] = useState(() => tokenValue(tokens, 'color.primary', '#fb7185'));

  const filtered = flat.filter(
    (t) => t.path.toLowerCase().includes(query.toLowerCase()) || t.value.toLowerCase().includes(query.toLowerCase())
  );
  const groups = useMemo(() => {
    const map = new Map<string, FlatToken[]>();
    for (const t of filtered) {
      const list = map.get(t.group) ?? [];
      list.push(t);
      map.set(t.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  useEffect(() => {
    setDraft(tokenValue(tokens, selected, ''));
  }, [selected, tokens]);

  const primary = tokenValue(tokens, 'color.primary', '#fb7185');
  const secondary = tokenValue(tokens, 'color.secondary', '#38bdf8');
  const text = tokenValue(tokens, 'color.text.primary', '#fafafa');
  const muted = tokenValue(tokens, 'color.text.secondary', '#a1a1aa');
  const card = tokenValue(tokens, 'color.background.card', '#18181b');
  const radius = tokenValue(tokens, 'radius.md', '8px');
  const colors = flat.filter((t) => t.isColor).slice(0, 12);

  function applyEdit() {
    setTokens(setTokenValue(tokens, selected, draft));
    toast('Token updated', 'success');
  }

  return (
    <div className="tf-bench">
      <aside className="tf-bench-side">
        <div className="tf-bench-side-head">
          <h2>Tokens</h2>
          <span>{countTokens(tokens)}</span>
        </div>
        <div className="tf-bench-search">
          <input
            className="tf-input"
            placeholder="Filter tokens"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="tf-bench-list">
          {groups.map(([group, items]) => (
            <div className="tf-group" key={group}>
              <div className="tf-group-title">{group}</div>
              {items.map((t) => (
                <button
                  key={t.path}
                  type="button"
                  className={`tf-token${selected === t.path ? ' selected' : ''}`}
                  onClick={() => setSelected(t.path)}
                >
                  {t.isColor ? (
                    <span className="tf-color-dot" style={{ background: t.value }} />
                  ) : (
                    <span className="tf-color-dot" style={{ background: 'var(--tf-line)' }} />
                  )}
                  <span className="tf-token-name">{t.path}</span>
                  <span className="tf-token-val">{t.value}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className="tf-bench-canvas">
        <div className="tf-bench-canvas-head">
          <div>
            <h2>Live preview</h2>
            <p>Changes apply instantly to this canvas.</p>
          </div>
          <span className="tf-badge">runtime</span>
        </div>

        <div className="tf-bench-canvas-body">
          <div className="tf-preview-block">
            <h3>Buttons</h3>
            <div className="tf-preview-row">
              <button className="tf-preview-btn" style={{ background: primary, color: '#fff', borderRadius: radius }}>
                Primary
              </button>
              <button
                className="tf-preview-btn"
                style={{ background: secondary, color: '#0a0a0a', borderRadius: radius }}
              >
                Secondary
              </button>
              <button
                className="tf-preview-btn"
                style={{
                  background: 'transparent',
                  color: primary,
                  border: `1px solid ${primary}`,
                  borderRadius: radius,
                }}
              >
                Outline
              </button>
              <button
                className="tf-preview-btn"
                style={{
                  background: 'transparent',
                  color: muted,
                  border: '1px solid var(--tf-line)',
                  borderRadius: radius,
                }}
              >
                Ghost
              </button>
            </div>
          </div>

          <div className="tf-preview-block">
            <h3>Surfaces</h3>
            <div className="tf-preview-row">
              <div className="tf-preview-card" style={{ background: card, color: text, borderColor: 'var(--tf-line)' }}>
                <h4>Card surface</h4>
                <p style={{ color: muted }}>Typography and background tokens drive this block.</p>
              </div>
              <div className="tf-preview-card" style={{ background: card, color: text, borderColor: primary }}>
                <h4 style={{ color: primary }}>Accent border</h4>
                <p style={{ color: muted }}>Uses color.primary for emphasis.</p>
              </div>
            </div>
          </div>

          <div className="tf-preview-block">
            <h3>Palette</h3>
            <div className="tf-swatch-row">
              {colors.map((c) => (
                <button
                  key={c.path}
                  type="button"
                  className="tf-swatch tf-tooltip"
                  data-tip={`${c.path}: ${c.value}`}
                  style={{ background: c.value }}
                  onClick={() => setSelected(c.path)}
                  aria-label={c.path}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="tf-edit-bar">
          <label>
            <span className="hint">{selected}</span>
            <input
              className="tf-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyEdit();
              }}
            />
          </label>
          <button className="tf-btn tf-btn-primary" type="button" onClick={applyEdit}>
            Apply
          </button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [tokens, setTokens] = useState<DesignTokens>(() => readTokensFromUrl() ?? defaultTokens);
  const [activePanel, setActivePanel] = useState<PanelId>('home');
  const [palette, setPalette] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: 'success' | 'error' | 'info' }>>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const cfg: ThemeConfig = { themes: [{ name: 'current', tokens }], defaultTheme: 'current' };
    const r = new ThemeRuntime(cfg);
    r.init();
    return () => {
      r.destroy();
    };
  }, [tokens]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('tf-import-reload-attempted');
  }, []);

  const toast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  function renderPanel(): ReactNode {
    if (activePanel === 'home') {
      return <Workbench tokens={tokens} setTokens={setTokens} toast={toast} />;
    }
    return (
      <div className="tf-main-scroll">
        <Suspense fallback={<PanelLoader />}>
          {activePanel === 'ai' && <AIGenerator tokens={tokens} setTokens={setTokens} toast={toast} />}
          {activePanel === 'editor' && <VisualEditor tokens={tokens} setTokens={setTokens} toast={toast} />}
          {activePanel === 'tokens' && <TokenManager tokens={tokens} setTokens={setTokens} toast={toast} />}
          {activePanel === 'export' && <ExportPanel tokens={tokens} toast={toast} />}
          {activePanel === 'a11y' && <AccessibilityPanel tokens={tokens} toast={toast} />}
          {activePanel === 'analytics' && <AnalyticsPanel tokens={tokens} />}
          {activePanel === 'collab' && <CollabPanel toast={toast} />}
          {activePanel === 'components' && <ComponentsPanel tokens={tokens} />}
          {activePanel === 'figma' && <FigmaPanel tokens={tokens} toast={toast} />}
          {activePanel === 'settings' && <SettingsPanel theme={theme} setTheme={setTheme} toast={toast} />}
        </Suspense>
      </div>
    );
  }

  const activeInMore = MORE_TABS.some((t) => t.id === activePanel);

  return (
    <div className="tf-app">
      <header className="tf-header">
        <a
          className="tf-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePanel('home');
          }}
        >
          <span className="tf-brand-mark">TF</span>
          <span className="tf-brand-name">TokiForge</span>
        </a>

        <nav className="tf-tabs" aria-label="Primary">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tf-tab${activePanel === tab.id ? ' active' : ''}`}
              onClick={() => setActivePanel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`tf-tab${activeInMore ? ' active' : ''}`}
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
            >
              More
            </button>
            {moreOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  minWidth: 180,
                  background: 'var(--tf-bg-card)',
                  border: '1px solid var(--tf-line)',
                  borderRadius: 10,
                  padding: 6,
                  zIndex: 30,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                }}
              >
                {MORE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className="tf-tab"
                    style={{ width: '100%', justifyContent: 'flex-start', display: 'flex' }}
                    onClick={() => {
                      setActivePanel(tab.id);
                      setMoreOpen(false);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="tf-header-actions">
          <button className="tf-icon-btn" type="button" onClick={() => setPalette(true)} aria-label="Search (Ctrl+K)" title="Ctrl+K">
            <Icon name="search" />
          </button>
          <button
            className="tf-icon-btn"
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="tf-btn tf-btn-primary tf-btn-sm" type="button" onClick={() => setActivePanel('export')}>
            Export
          </button>
        </div>
      </header>

      <main className="tf-main">{renderPanel()}</main>

      {palette && (
        <CommandPalette
          onClose={() => setPalette(false)}
          onNav={(p) => {
            setActivePanel(p);
            setPalette(false);
          }}
        />
      )}

      <div className="tf-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`tf-toast tf-toast-${t.type}`}>
            <span className="tf-toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
