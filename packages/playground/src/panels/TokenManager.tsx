import { useState, useMemo } from 'react';
import type { DesignTokens, TokenValue } from '@tokiforge/core';

type TokenType = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'custom';
interface FlatToken { path: string; value: unknown; type?: TokenType; }

function flattenTokens(obj: DesignTokens, prefix = ''): FlatToken[] {
  const result: FlatToken[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('value' in val) {
        const node = val as Record<string, unknown>;
        result.push({ path, value: node.value, type: node.type as TokenType | undefined });
      } else {
        result.push(...flattenTokens(val as DesignTokens, path));
      }
    }
  }
  return result;
}

type FilterType = 'all' | 'color' | 'dimension' | 'fontFamily' | 'custom' | 'duration';
const TYPE_ICONS: Record<string, string> = {
  color: '🎨', dimension: '📏', fontFamily: '🔤', custom: '⚙️', duration: '⏱️', fontWeight: '🅱️',
};

interface Props {
  tokens: DesignTokens;
  setTokens: (t: DesignTokens) => void;
  toast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

// Helper: set a deeply nested value in a DesignTokens tree
function setNestedToken(obj: DesignTokens, keys: string[], token: TokenValue): DesignTokens {
  const [head, ...rest] = keys;
  if (rest.length === 0) return { ...obj, [head]: token };
  return { ...obj, [head]: setNestedToken((obj[head] as DesignTokens) ?? {}, rest, token) };
}

// Helper: update only the value field of an existing nested token
function updateNestedValue(obj: DesignTokens, keys: string[], newValue: string): DesignTokens {
  const [head, ...rest] = keys;
  if (rest.length === 0) {
    const existing = obj[head] as Record<string, unknown>;
    return { ...obj, [head]: { ...existing, value: newValue } };
  }
  return { ...obj, [head]: updateNestedValue((obj[head] as DesignTokens) ?? {}, rest, newValue) };
}

// Helper: delete a nested token
function deleteNestedToken(obj: DesignTokens, keys: string[]): DesignTokens {
  const [head, ...rest] = keys;
  if (rest.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [head]: _removed, ...remaining } = obj;
    return remaining as DesignTokens;
  }
  return { ...obj, [head]: deleteNestedToken((obj[head] as DesignTokens) ?? {}, rest) };
}

export default function TokenManager({ tokens, setTokens, toast }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<TokenType>('color');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const flat = useMemo(() => flattenTokens(tokens), [tokens]);

  const filtered = flat.filter((t) => {
    const matchSearch =
      t.path.toLowerCase().includes(search.toLowerCase()) ||
      String(t.value).toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: flat.length };
    for (const t of flat) {
      if (t.type) counts[t.type] = (counts[t.type] ?? 0) + 1;
    }
    return counts;
  }, [flat]);

  function addToken() {
    if (!newPath.trim() || !newValue.trim()) return;
    const parts = newPath.trim().split('.');
    const token: TokenValue = { value: newValue.trim(), type: newType };
    setTokens(setNestedToken(tokens, parts, token));
    setAdding(false);
    setNewPath('');
    setNewValue('');
    setNewType('color');
    toast('Token added ✓', 'success');
  }

  function deleteToken(path: string) {
    const parts = path.split('.');
    setTokens(deleteNestedToken(tokens, parts));
    toast('Token deleted', 'info');
  }

  function saveEdit(path: string) {
    const parts = path.split('.');
    setTokens(updateNestedValue(tokens, parts, editValue));
    setEditingPath(null);
    toast('Token saved ✓', 'success');
  }

  const FILTERS: Array<{ id: FilterType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'color', label: 'Color' },
    { id: 'dimension', label: 'Dimension' },
    { id: 'fontFamily', label: 'Typography' },
    { id: 'duration', label: 'Animation' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div className="tf-page-header" style={{ padding: '0 0 1.5rem', border: 'none', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="tf-page-title">🪙 Token Manager</h1>
          <p className="tf-page-subtitle">Manage your complete design token system with full CRUD operations</p>
        </div>
        <button className="tf-btn tf-btn-primary" onClick={() => setAdding(true)}>+ Add Token</button>
      </div>

      {/* Add Token Form */}
      {adding && (
        <div className="tf-card" style={{ marginBottom: '1.5rem', borderColor: 'var(--tf-border-brand)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--tf-text-primary)', marginBottom: '1rem' }}>Add New Token</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label className="tf-label">Token Path</label>
              <input className="tf-input" placeholder="e.g. color.brand.primary" value={newPath} onChange={e => setNewPath(e.target.value)} style={{ fontFamily: 'var(--tf-font-mono)', fontSize: '0.8125rem' }} />
            </div>
            <div>
              <label className="tf-label">Value</label>
              <input className="tf-input" placeholder="e.g. #7c3aed" value={newValue} onChange={e => setNewValue(e.target.value)} style={{ fontFamily: 'var(--tf-font-mono)', fontSize: '0.8125rem' }} />
            </div>
            <div>
              <label className="tf-label">Type</label>
              <select className="tf-input" value={newType} onChange={e => setNewType(e.target.value as TokenType)} style={{ fontSize: '0.8125rem' }}>
                {(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'custom'] as TokenType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="tf-btn tf-btn-primary" onClick={addToken}>Add Token</button>
            <button className="tf-btn tf-btn-ghost" onClick={() => { setAdding(false); setNewPath(''); setNewValue(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input className="tf-input" placeholder="🔍 Search tokens by name or value…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {FILTERS.map(f => (
            <button key={f.id} className={`tf-btn tf-btn-sm${filter === f.id ? ' tf-btn-primary' : ' tf-btn-ghost'}`} onClick={() => setFilter(f.id)}>
              {f.label} {typeCounts[f.id] ? <span style={{ opacity: 0.7 }}>({typeCounts[f.id]})</span> : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Token Table */}
      <div className="tf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 0 }}>
          {/* Header */}
          {['Token Path', 'Value', 'Type', 'Actions'].map(h => (
            <div key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--tf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--tf-border)', background: 'rgba(255,255,255,0.02)' }}>
              {h}
            </div>
          ))}

          {/* Rows */}
          {filtered.map((token, i) => {
            const isCol = token.type === 'color' || (typeof token.value === 'string' && String(token.value).startsWith('#'));
            const isEditing = editingPath === token.path;
            const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)';
            return (
              <div key={token.path} style={{ display: 'contents' }}>
                <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--tf-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: rowBg }}>
                  {isCol && <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: String(token.value), flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }} />}
                  <code style={{ fontSize: '0.75rem', color: 'var(--tf-text-brand)', fontFamily: 'var(--tf-font-mono)' }}>{token.path}</code>
                </div>
                <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--tf-border)', display: 'flex', alignItems: 'center', background: rowBg }}>
                  {isEditing ? (
                    <input className="tf-input" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ fontFamily: 'var(--tf-font-mono)', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} autoFocus onKeyDown={e => { if (e.key === 'Enter') saveEdit(token.path); if (e.key === 'Escape') setEditingPath(null); }} />
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--tf-text-primary)', fontFamily: 'var(--tf-font-mono)' }}>{String(token.value)}</span>
                  )}
                </div>
                <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--tf-border)', display: 'flex', alignItems: 'center', background: rowBg }}>
                  {token.type
                    ? <span className="tf-badge tf-badge-accent">{TYPE_ICONS[token.type] ?? '•'} {token.type}</span>
                    : <span style={{ color: 'var(--tf-text-muted)', fontSize: '0.75rem' }}>—</span>
                  }
                </div>
                <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--tf-border)', display: 'flex', alignItems: 'center', gap: '0.375rem', background: rowBg }}>
                  {isEditing ? (
                    <>
                      <button className="tf-btn tf-btn-sm tf-btn-primary" onClick={() => saveEdit(token.path)}>✓</button>
                      <button className="tf-btn tf-btn-sm tf-btn-ghost" onClick={() => setEditingPath(null)}>✕</button>
                    </>
                  ) : (
                    <>
                      <button className="tf-btn tf-btn-sm tf-btn-ghost" onClick={() => { setEditingPath(token.path); setEditValue(String(token.value)); }}>✏️</button>
                      <button className="tf-btn tf-btn-sm tf-btn-danger" onClick={() => deleteToken(token.path)}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tf-text-muted)' }}>
            {search ? `No tokens matching "${search}"` : 'No tokens found'}
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--tf-text-muted)', textAlign: 'right' }}>
        Showing {filtered.length} of {flat.length} tokens
      </div>
    </div>
  );
}
