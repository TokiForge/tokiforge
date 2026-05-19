import { useState, useMemo } from 'react';
import type { DesignTokens, TokenValue } from '@tokiforge/core';

interface FlatToken { path: string; value: unknown; type?: string; }

function flattenTokens(obj: DesignTokens, prefix = ''): FlatToken[] {
  const result: FlatToken[] = [];
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('value' in val) {
        const tv = val as TokenValue;
        result.push({ path, value: tv.value, type: tv.type });
      } else {
        result.push(...flattenTokens(val as DesignTokens, path));
      }
    }
  }
  return result;
}

interface Props { tokens: DesignTokens; setTokens: (t: DesignTokens) => void; toast: (m: string, t?: 'success'|'error'|'info') => void; }

export default function VisualEditor({ tokens, setTokens, toast }: Props) {
  const [search, setSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState<string|null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewMode, setPreviewMode] = useState<'light'|'dark'>('dark');

  const flat = useMemo(() => flattenTokens(tokens), [tokens]);
  const filtered = flat.filter(t => t.path.toLowerCase().includes(search.toLowerCase()) || String(t.value).toLowerCase().includes(search.toLowerCase()));

  const groups = useMemo(() => {
    const g: Record<string, FlatToken[]> = {};
    filtered.forEach(t => {
      const top = t.path.split('.')[0];
      if (!g[top]) g[top] = [];
      g[top].push(t);
    });
    return g;
  }, [filtered]);

  function selectToken(t: FlatToken) {
    setSelectedPath(t.path);
    setEditValue(String(t.value));
  }

  function saveToken() {
    if (!selectedPath) return;
    const parts = selectedPath.split('.');
    function setNested(obj: DesignTokens, keys: string[], value: unknown): DesignTokens {
      const [head, ...rest] = keys;
      if (rest.length === 0) {
        return { ...obj, [head]: { ...((obj[head] as any) ?? {}), value } };
      }
      return { ...obj, [head]: setNested((obj[head] as DesignTokens) ?? {}, rest, value) };
    }
    setTokens(setNested(tokens, parts, editValue));
    toast('Token updated ✓', 'success');
  }

  const selected = flat.find(t => t.path === selectedPath);
  const isColor = selected?.type === 'color' || (typeof selected?.value === 'string' && (String(selected.value).startsWith('#') || String(selected.value).startsWith('rgb')));

  return (
    <div style={{ display:'flex', height:'calc(100vh - 52px)', overflow:'hidden' }}>
      {/* Token Tree */}
      <div style={{ width:280, background:'var(--tf-bg-card)', borderRight:'1px solid var(--tf-border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'0.75rem', borderBottom:'1px solid var(--tf-border)' }}>
          <input className="tf-input" style={{ fontSize:'0.8125rem' }} placeholder="🔍 Search tokens…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0.5rem 0' }}>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div style={{ padding:'0.5rem 1rem', fontSize:'0.625rem', fontWeight:700, color:'var(--tf-text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span>{group}</span>
                <span style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, padding:'1px 6px' }}>{items.length}</span>
              </div>
              {items.map(token => {
                const isCol = token.type==='color' || (typeof token.value==='string' && String(token.value).startsWith('#'));
                return (
                  <div key={token.path} className={`tf-token-row${selectedPath===token.path?' selected':''}`} onClick={() => selectToken(token)}>
                    {isCol && <div className="tf-token-swatch" style={{ backgroundColor: String(token.value) }} />}
                    <span className="tf-token-name" style={{ color: selectedPath===token.path ? 'var(--tf-brand-light)' : undefined }}>
                      {token.path.split('.').slice(1).join('.') || token.path}
                    </span>
                    <span className="tf-token-val">{String(token.value).length > 14 ? String(token.value).slice(0,14)+'…' : String(token.value)}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--tf-text-muted)', fontSize:'0.875rem' }}>No tokens match "{search}"</div>
          )}
        </div>
        <div style={{ padding:'0.75rem', borderTop:'1px solid var(--tf-border)', fontSize:'0.6875rem', color:'var(--tf-text-muted)', textAlign:'center' }}>
          {flat.length} tokens total
        </div>
      </div>

      {/* Edit Panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 1rem', background:'var(--tf-bg-card)', borderBottom:'1px solid var(--tf-border)' }}>
          <span style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>Preview:</span>
          {(['dark','light'] as const).map(m => (
            <button key={m} className={`tf-btn tf-btn-sm${previewMode===m?' tf-btn-primary':' tf-btn-ghost'}`} onClick={() => setPreviewMode(m)}>
              {m==='dark'?'🌙':'☀️'} {m}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
            <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(tokens,null,2)); toast('JSON copied!','success'); }}>
              📋 Copy JSON
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', padding:'1.5rem' }}>
          {/* Token Editor */}
          <div>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>Token Editor</h2>
            {selected ? (
              <div className="tf-card">
                <div style={{ marginBottom:'1rem' }}>
                  <div className="tf-label">Token Path</div>
                  <code style={{ fontSize:'0.8125rem', color:'var(--tf-text-brand)', background:'rgba(124,58,237,0.1)', padding:'0.25rem 0.5rem', borderRadius:'var(--tf-radius-sm)', fontFamily:'var(--tf-font-mono)' }}>
                    {selected.path}
                  </code>
                </div>

                {selected.type && (
                  <div style={{ marginBottom:'1rem' }}>
                    <div className="tf-label">Type</div>
                    <span className="tf-badge tf-badge-accent">{selected.type}</span>
                  </div>
                )}

                <div style={{ marginBottom:'1rem' }}>
                  <div className="tf-label">Value</div>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    {isColor && (
                      <input type="color" value={editValue.startsWith('#') ? editValue : '#7c3aed'}
                        onChange={e => setEditValue(e.target.value)}
                        style={{ width:40, height:40, border:'none', background:'none', cursor:'pointer', borderRadius:'var(--tf-radius-sm)', padding:0 }} />
                    )}
                    <input className="tf-input" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Token value…" style={{ fontFamily:'var(--tf-font-mono)' }} />
                  </div>
                </div>

                {isColor && editValue && (
                  <div style={{ marginBottom:'1rem' }}>
                    <div className="tf-label">Preview</div>
                    <div style={{ height:60, borderRadius:'var(--tf-radius-md)', backgroundColor: editValue, border:'1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                )}

                <button className="tf-btn tf-btn-primary" style={{ width:'100%' }} onClick={saveToken}>
                  Save Token
                </button>
              </div>
            ) : (
              <div style={{ padding:'3rem', textAlign:'center', color:'var(--tf-text-muted)', fontSize:'0.875rem', background:'var(--tf-bg-card)', borderRadius:'var(--tf-radius-xl)', border:'1px dashed var(--tf-border)' }}>
                ← Select a token to edit
              </div>
            )}
          </div>

          {/* Component Preview */}
          <div>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>Component Preview</h2>
            <ComponentPreview tokens={tokens} mode={previewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentPreview({ tokens, mode }: { tokens: DesignTokens; mode: 'light'|'dark' }) {
  const c = (tokens.color ?? {}) as any;
  const isDark = mode === 'dark';
  const primary = c?.primary?.value ?? '#7c3aed';
  const bg      = isDark ? (c?.background?.base?.value ?? '#080b12') : '#ffffff';
  const bgCard  = isDark ? (c?.background?.card?.value ?? '#111827') : '#f8fafc';
  const text    = isDark ? (c?.text?.primary?.value   ?? '#f1f5f9') : '#0f172a';
  const textSec = isDark ? (c?.text?.secondary?.value ?? '#94a3b8') : '#475569';
  const radius  = (tokens.radius as any)?.md?.value ?? '0.5rem';

  return (
    <div style={{ background:bg, borderRadius:'var(--tf-radius-xl)', padding:'1.5rem', border:'1px solid rgba(255,255,255,0.1)' }}>
      {/* Button row */}
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
        <button style={{ padding:'0.5rem 1rem', background:primary, color:'#fff', border:'none', borderRadius:radius, fontWeight:600, fontSize:'0.875rem', cursor:'pointer' }}>
          Primary
        </button>
        <button style={{ padding:'0.5rem 1rem', background:'transparent', color:primary, border:`1px solid ${primary}`, borderRadius:radius, fontWeight:600, fontSize:'0.875rem', cursor:'pointer' }}>
          Outline
        </button>
        <button style={{ padding:'0.5rem 1rem', background:'transparent', color:textSec, border:'1px solid rgba(255,255,255,0.1)', borderRadius:radius, fontWeight:600, fontSize:'0.875rem', cursor:'pointer' }}>
          Ghost
        </button>
      </div>

      {/* Card */}
      <div style={{ background:bgCard, borderRadius:radius, padding:'1rem', marginBottom:'1rem', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:'0.9375rem', fontWeight:700, color:text, marginBottom:'0.375rem' }}>Card Component</div>
        <div style={{ fontSize:'0.8125rem', color:textSec, marginBottom:'0.75rem' }}>This card uses your active design tokens for all styling values.</div>
        <div style={{ display:'flex', gap:'0.375rem' }}>
          {['Design','Tokens','AI'].map(tag => (
            <span key={tag} style={{ fontSize:'0.6875rem', padding:'2px 8px', background:`${primary}22`, color:primary, borderRadius:99, border:`1px solid ${primary}44`, fontWeight:600 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Input */}
      <input placeholder="Input field…" style={{ width:'100%', padding:'0.625rem 0.875rem', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', borderRadius:radius, color:text, fontSize:'0.875rem', marginBottom:'1rem', outline:'none' }} />

      {/* Color swatches */}
      <div style={{ display:'flex', gap:'0.375rem' }}>
        {[primary, c?.secondary?.value??'#06b6d4', c?.success?.value??'#10b981', c?.warning?.value??'#f59e0b', c?.danger?.value??'#ef4444'].map((col, i) => (
          <div key={i} style={{ flex:1, height:24, borderRadius:4, backgroundColor:col }} />
        ))}
      </div>
    </div>
  );
}
