import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import './App.css';

// Helper to retry dynamic imports when Vite HMR or build hashes mismatch
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
        return new Promise(() => {}); // hold rendering during reload
      }
      throw error;
    }
  });
}

// ── Lazy panel imports ──────────────────────────────────────────
const AIGenerator      = lazyWithRetry(() => import('./panels/AIGenerator'));
const VisualEditor     = lazyWithRetry(() => import('./panels/VisualEditor'));
const TokenManager     = lazyWithRetry(() => import('./panels/TokenManager'));
const ExportPanel      = lazyWithRetry(() => import('./panels/ExportPanel'));
const AccessibilityPanel = lazyWithRetry(() => import('./panels/AccessibilityPanel'));
const AnalyticsPanel   = lazyWithRetry(() => import('./panels/AnalyticsPanel'));
const CollabPanel      = lazyWithRetry(() => import('./panels/CollabPanel'));
const ComponentsPanel  = lazyWithRetry(() => import('./panels/ComponentsPanel'));
const FigmaPanel       = lazyWithRetry(() => import('./panels/FigmaPanel'));
const SettingsPanel    = lazyWithRetry(() => import('./panels/SettingsPanel'));

// ── Default token set ───────────────────────────────────────────
export const defaultTokens: DesignTokens = {
  color: {
    primary:   { value: '#7c3aed', type: 'color' },
    secondary: { value: '#06b6d4', type: 'color' },
    success:   { value: '#10b981', type: 'color' },
    warning:   { value: '#f59e0b', type: 'color' },
    danger:    { value: '#ef4444', type: 'color' },
    text: {
      primary:   { value: '#f1f5f9', type: 'color' },
      secondary: { value: '#94a3b8', type: 'color' },
      muted:     { value: '#475569', type: 'color' },
    },
    background: {
      base:    { value: '#080b12', type: 'color' },
      raised:  { value: '#0d1117', type: 'color' },
      card:    { value: '#111827', type: 'color' },
    },
    border: {
      default: { value: 'rgba(255,255,255,0.07)', type: 'color' },
      brand:   { value: 'rgba(124,58,237,0.4)',   type: 'color' },
    },
  },
  typography: {
    fontFamily: {
      sans: { value: "'Inter', -apple-system, sans-serif",     type: 'fontFamily' },
      mono: { value: "'JetBrains Mono', 'Fira Code', monospace", type: 'fontFamily' },
    },
    fontSize: {
      xs:  { value: '0.75rem',  type: 'dimension' },
      sm:  { value: '0.8125rem',type: 'dimension' },
      md:  { value: '0.9375rem',type: 'dimension' },
      lg:  { value: '1.0625rem',type: 'dimension' },
      xl:  { value: '1.25rem',  type: 'dimension' },
      '2xl':{ value: '1.5rem', type: 'dimension' },
      '3xl':{ value: '2rem',   type: 'dimension' },
    },
    fontWeight: {
      regular: { value: '400', type: 'fontWeight' },
      medium:  { value: '500', type: 'fontWeight' },
      semibold:{ value: '600', type: 'fontWeight' },
      bold:    { value: '700', type: 'fontWeight' },
      black:   { value: '900', type: 'fontWeight' },
    },
    lineHeight: {
      tight:  { value: '1.25', type: 'custom' },
      normal: { value: '1.6',  type: 'custom' },
      relaxed:{ value: '1.8',  type: 'custom' },
    },
  },
  spacing: {
    '1': { value: '0.25rem', type: 'dimension' },
    '2': { value: '0.5rem',  type: 'dimension' },
    '3': { value: '0.75rem', type: 'dimension' },
    '4': { value: '1rem',    type: 'dimension' },
    '5': { value: '1.25rem', type: 'dimension' },
    '6': { value: '1.5rem',  type: 'dimension' },
    '8': { value: '2rem',    type: 'dimension' },
    '10':{ value: '2.5rem',  type: 'dimension' },
    '12':{ value: '3rem',    type: 'dimension' },
    '16':{ value: '4rem',    type: 'dimension' },
  },
  radius: {
    sm:  { value: '0.375rem', type: 'dimension' },
    md:  { value: '0.625rem', type: 'dimension' },
    lg:  { value: '0.875rem', type: 'dimension' },
    xl:  { value: '1.125rem', type: 'dimension' },
    '2xl':{ value:'1.5rem',   type: 'dimension' },
    full:{ value: '9999px',   type: 'dimension' },
  },
  shadow: {
    sm:   { value: '0 1px 3px rgba(0,0,0,0.5)',   type: 'custom' },
    md:   { value: '0 4px 16px rgba(0,0,0,0.4)',  type: 'custom' },
    lg:   { value: '0 8px 32px rgba(0,0,0,0.5)',  type: 'custom' },
    brand:{ value: '0 0 32px rgba(124,58,237,0.25)', type: 'custom' },
  },
  animation: {
    duration: {
      fast:   { value: '150ms', type: 'duration' },
      normal: { value: '250ms', type: 'duration' },
      slow:   { value: '400ms', type: 'duration' },
    },
    easing: {
      smooth: { value: 'cubic-bezier(0.4,0,0.2,1)', type: 'custom' },
      spring: { value: 'cubic-bezier(0.34,1.56,0.64,1)', type: 'custom' },
    },
  },
};

// ── Navigation items ────────────────────────────────────────────
type PanelId = 'home'|'ai'|'editor'|'tokens'|'export'|'a11y'|'analytics'|'collab'|'components'|'figma'|'settings';

const NAV_SECTIONS = [
  {
    label: 'Create',
    items: [
      { id: 'home'      as PanelId, icon: '⚡', label: 'Dashboard' },
      { id: 'ai'        as PanelId, icon: '🤖', label: 'AI Generator', badge: 'New' },
      { id: 'editor'    as PanelId, icon: '🎨', label: 'Visual Editor' },
      { id: 'tokens'    as PanelId, icon: '🪙', label: 'Token Manager' },
      { id: 'components'as PanelId, icon: '🧱', label: 'Components' },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { id: 'a11y'      as PanelId, icon: '♿', label: 'Accessibility' },
      { id: 'analytics' as PanelId, icon: '📊', label: 'Analytics' },
    ],
  },
  {
    label: 'Ship',
    items: [
      { id: 'export'    as PanelId, icon: '📦', label: 'Export' },
      { id: 'figma'     as PanelId, icon: '🖼', label: 'Figma Sync' },
      { id: 'collab'    as PanelId, icon: '👥', label: 'Collaboration' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings'  as PanelId, icon: '⚙️', label: 'Settings' },
    ],
  },
];

const PALETTE_COMMANDS = [
  { icon:'🤖', label:'Open AI Generator', desc:'AI',    panel:'ai' as PanelId },
  { icon:'🎨', label:'Open Visual Editor', desc:'Edit',  panel:'editor' as PanelId },
  { icon:'📦', label:'Export Tokens',      desc:'Export',panel:'export' as PanelId },
  { icon:'♿', label:'Run A11y Check',     desc:'A11y',  panel:'a11y' as PanelId },
  { icon:'📊', label:'Analytics',          desc:'Data',  panel:'analytics' as PanelId },
  { icon:'🖼', label:'Figma Sync',         desc:'Figma', panel:'figma' as PanelId },
  { icon:'👥', label:'Collaboration',      desc:'Team',  panel:'collab' as PanelId },
  { icon:'🧱', label:'Components',         desc:'UI',    panel:'components' as PanelId },
];

function PanelLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div className="tf-spinner" style={{ width:32, height:32, borderWidth:3 }} />
      <span style={{ color:'var(--tf-text-muted)', fontSize:'0.875rem' }}>Loading…</span>
    </div>
  );
}

function CommandPalette({ onClose, onNav }: { onClose:()=>void; onNav:(p:PanelId)=>void }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(0);
  const filtered = PALETTE_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setFocused(f => Math.min(f+1, filtered.length-1));
      if (e.key === 'ArrowUp')   setFocused(f => Math.max(f-1, 0));
      if (e.key === 'Enter' && filtered[focused]) { onNav(filtered[focused].panel); onClose(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, focused, onClose, onNav]);
  return (
    <div className="tf-palette-backdrop" onClick={onClose}>
      <div className="tf-palette" onClick={e => e.stopPropagation()}>
        <input className="tf-palette-input" autoFocus placeholder="Type a command or search…" value={query} onChange={e=>{setQuery(e.target.value);setFocused(0);}} />
        <div className="tf-palette-results">
          <div className="tf-palette-group-label">Navigation</div>
          {filtered.map((cmd, i) => (
            <div key={cmd.label} className={`tf-palette-item${i===focused?' focused':''}`}
              onClick={() => { onNav(cmd.panel); onClose(); }}
              onMouseEnter={() => setFocused(i)}>
              <span className="tf-palette-item-icon">{cmd.icon}</span>
              <span className="tf-palette-item-label">{cmd.label}</span>
              <span className="tf-palette-item-desc">{cmd.desc}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--tf-text-muted)', fontSize:'0.875rem' }}>No commands found</div>}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ tokens, onNav }: { tokens: DesignTokens; onNav: (p: PanelId) => void }) {
  const features = [
    { icon:'🤖', label:'AI Generator',  color:'rgba(124,58,237,0.2)', desc:'Generate complete design systems from natural language prompts', panel:'ai' as PanelId },
    { icon:'🎨', label:'Visual Editor', color:'rgba(6,182,212,0.15)',  desc:'Drag & drop token editor with live preview', panel:'editor' as PanelId },
    { icon:'🪙', label:'Token Manager', color:'rgba(16,185,129,0.15)', desc:'Semantic & component tokens with inheritance', panel:'tokens' as PanelId },
    { icon:'📦', label:'Multi-Export',  color:'rgba(245,158,11,0.15)', desc:'CSS, Tailwind, React, Flutter, SwiftUI and more', panel:'export' as PanelId },
    { icon:'♿', label:'A11y Engine',   color:'rgba(239,68,68,0.15)',   desc:'WCAG validation, contrast analysis, AI fixes', panel:'a11y' as PanelId },
    { icon:'📊', label:'Analytics',     color:'rgba(124,58,237,0.15)', desc:'Unused tokens, bundle impact, performance scoring', panel:'analytics' as PanelId },
    { icon:'👥', label:'Collaboration', color:'rgba(6,182,212,0.12)',  desc:'Team workspaces, version control, live sync', panel:'collab' as PanelId },
    { icon:'🖼', label:'Figma Sync',    color:'rgba(245,158,11,0.12)', desc:'Import/export, live design variable sync', panel:'figma' as PanelId },
  ];

  const colorTokens = Object.entries((tokens.color ?? {}) as DesignTokens)
    .flatMap(([group, vals]) => {
      if (typeof vals !== 'object' || vals === null || Array.isArray(vals)) return [];
      const node = vals as Record<string, unknown>;
      if ('value' in node) {
        return [{ name: group, value: String(node.value) }];
      }
      return Object.entries(vals as DesignTokens).flatMap(([k, v]) => {
        const vNode = v as Record<string, unknown> | null;
        if (vNode && typeof vNode === 'object' && 'value' in vNode) {
          return [{ name: `${group}.${k}`, value: String(vNode.value) }];
        }
        return [];
      });
    })
    .filter((t) => typeof t.value === 'string' && (t.value.startsWith('#') || t.value.startsWith('rgb')));

  return (
    <div>
      {/* Hero */}
      <div className="tf-hero">
        <div className="tf-hero-bg" />
        <div className="tf-badge tf-badge-new tf-hero-eyebrow">
          ✨ AI-Powered Design Infrastructure
        </div>
        <h1 className="tf-hero-title">
          The Future of<br /><span className="gradient-text">Design Systems</span>
        </h1>
        <p className="tf-hero-desc">
          Generate, edit, and ship design tokens across every framework. Powered by AI, built for teams, loved by developers.
        </p>
        <div className="tf-hero-actions">
          <button className="tf-btn tf-btn-primary tf-btn-lg" onClick={() => onNav('ai')}>
            🤖 Generate with AI
          </button>
          <button className="tf-btn tf-btn-ghost tf-btn-lg" onClick={() => onNav('editor')}>
            🎨 Open Editor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="tf-stats-row">
        {[
          { value: countTokens(tokens), label: 'Total Tokens', delta: '+12 today' },
          { value: '8',  label: 'Export Targets', delta: 'All frameworks' },
          { value: 'A',  label: 'A11y Grade',      delta: 'WCAG 2.2 AAA' },
          { value: '100%',label: 'Coverage',        delta: 'All components' },
        ].map(s => (
          <div className="tf-stat-card" key={s.label}>
            <div className="tf-stat-value">{s.value}</div>
            <div className="tf-stat-label">{s.label}</div>
            <div className="tf-stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Color Palette Preview */}
      {colorTokens.length > 0 && (
        <div style={{ padding:'1.5rem 2rem', borderBottom:'1px solid var(--tf-border)' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--tf-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.75rem' }}>
            Active Color Palette
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {colorTokens.map(t => (
              <div key={t.name} className="tf-tooltip" data-tip={`${t.name}: ${t.value}`}>
                <div className="tf-color-dot" style={{ backgroundColor: t.value, width:32, height:32 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div style={{ padding:'1.5rem 2rem' }}>
        <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--tf-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'1rem' }}>
          Platform Features
        </div>
        <div className="tf-grid tf-grid-2">
          {features.map((f, i) => (
            <div key={f.label} className="tf-feature-card" style={{ animationDelay:`${i*0.05}s` }} onClick={() => onNav(f.panel)}>
              <div className="tf-feature-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <div className="tf-feature-title">{f.label}</div>
              <div className="tf-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function countTokens(tokens: DesignTokens): number {
  let n = 0;
  function walk(obj: DesignTokens | unknown): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    const node = obj as Record<string, unknown>;
    if ('value' in node) { n++; return; }
    for (const child of Object.values(node)) walk(child);
  }
  walk(tokens);
  return n;
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);
  const [activePanel, setActivePanel] = useState<PanelId>('home');
  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [toasts, setToasts] = useState<Array<{id:number;msg:string;type:'success'|'error'|'info'}>>([]);

  // Theme runtime — initialised once per token change; no state storage needed
  useEffect(() => {
    const cfg: ThemeConfig = { themes: [{ name: 'current', tokens }], defaultTheme: 'current' };
    const r = new ThemeRuntime(cfg);
    r.init();
    return () => { r.destroy(); };
  }, [tokens]);

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPalette(p => !p); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Clear HMR reload safety flag on successful mount
  useEffect(() => {
    sessionStorage.removeItem('tf-import-reload-attempted');
  }, []);

  const toast = useCallback((msg: string, type: 'success'|'error'|'info' = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  function renderPanel() {
    if (activePanel === 'home') return <Dashboard tokens={tokens} onNav={setActivePanel} />;
    return (
      <Suspense fallback={<PanelLoader />}>
        {activePanel === 'ai'         && <AIGenerator   tokens={tokens} setTokens={setTokens} toast={toast} />}
        {activePanel === 'editor'     && <VisualEditor  tokens={tokens} setTokens={setTokens} toast={toast} />}
        {activePanel === 'tokens'     && <TokenManager  tokens={tokens} setTokens={setTokens} toast={toast} />}
        {activePanel === 'export'     && <ExportPanel   tokens={tokens} toast={toast} />}
        {activePanel === 'a11y'       && <AccessibilityPanel tokens={tokens} toast={toast} />}
        {activePanel === 'analytics'  && <AnalyticsPanel tokens={tokens} />}
        {activePanel === 'collab'     && <CollabPanel   toast={toast} />}
        {activePanel === 'components' && <ComponentsPanel tokens={tokens} />}
        {activePanel === 'figma'      && <FigmaPanel    tokens={tokens} toast={toast} />}
        {activePanel === 'settings'   && <SettingsPanel  theme={theme} setTheme={setTheme} toast={toast} />}
      </Suspense>
    );
  }

  return (
    <div className="tf-app">
      {/* Topbar */}
      <header className="tf-topbar">
        <a className="tf-logo" href="#" onClick={e=>{e.preventDefault();setActivePanel('home');}}>
          <div className="tf-logo-icon">⚡</div>
          <span className="tf-logo-text">Toki<span>Forge</span></span>
        </a>

        <nav className="tf-topbar-nav">
          {[
            { id:'home'  as PanelId, label:'Dashboard' },
            { id:'ai'    as PanelId, label:'AI' },
            { id:'editor'as PanelId, label:'Editor' },
            { id:'tokens'as PanelId, label:'Tokens' },
            { id:'export'as PanelId, label:'Export' },
            { id:'a11y'  as PanelId, label:'A11y' },
          ].map(n => (
            <button key={n.id} className={`tf-nav-btn${activePanel===n.id?' active':''}`} onClick={()=>setActivePanel(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="tf-topbar-actions">
          <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => setPalette(true)} title="Ctrl+K">
            ⌘K Search
          </button>
          <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => { setTheme(t=>t==='dark'?'light':'dark'); toast('Theme toggled','info'); }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="tf-btn tf-btn-primary tf-btn-sm" onClick={() => setActivePanel('export')}>
            Export ↗
          </button>
        </div>
      </header>

      <div className="tf-main">
        {/* Sidebar */}
        <aside className="tf-sidebar">
          {NAV_SECTIONS.map(section => (
            <div className="tf-sidebar-section" key={section.label}>
              <div className="tf-sidebar-label">{section.label}</div>
              {section.items.map(item => (
                <button key={item.id} className={`tf-sidebar-item${activePanel===item.id?' active':''}`} onClick={() => setActivePanel(item.id)}>
                  <span className="tf-sidebar-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="tf-sidebar-item-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}

          <div style={{ marginTop:'auto', padding:'0.75rem 0.5rem', borderTop:'1px solid var(--tf-border)' }}>
            <div style={{ fontSize:'0.6875rem', color:'var(--tf-text-muted)', textAlign:'center', lineHeight:1.5 }}>
              TokiForge v2.2.3<br />
              <span style={{ color:'var(--tf-brand-light)' }}>{countTokens(tokens)} tokens</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="tf-content">
          {renderPanel()}
        </main>
      </div>

      {/* Command Palette */}
      {palette && <CommandPalette onClose={() => setPalette(false)} onNav={p => { setActivePanel(p); setPalette(false); }} />}

      {/* Toasts */}
      <div className="tf-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`tf-toast tf-toast-${t.type}`}>
            <span>{t.type==='success'?'✅':t.type==='error'?'❌':'ℹ️'}</span>
            <span className="tf-toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
