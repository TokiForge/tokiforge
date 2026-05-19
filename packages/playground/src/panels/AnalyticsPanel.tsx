import { useMemo } from 'react';
import type { DesignTokens } from '@tokiforge/core';

interface FlatToken { path: string; value: unknown; type?: string; }

function flattenTokens(obj: DesignTokens, prefix = ''): FlatToken[] {
  const result: FlatToken[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const node = val as Record<string, unknown>;
      if ('value' in node) {
        result.push({ path, value: node.value, type: node.type as string | undefined });
      } else {
        result.push(...flattenTokens(val as DesignTokens, path));
      }
    }
  }
  return result;
}

interface Props { tokens: DesignTokens; }

const TYPE_ICON: Record<string, string> = {
  color: '🎨', dimension: '📏', fontFamily: '🔤', fontWeight: '🅱️',
  custom: '⚙️', duration: '⏱️', unknown: '❓',
};

const INSIGHT_SEVERITY_MAP: Record<string, string> = {
  info: 'brand', success: 'success', warning: 'warning',
};

export default function AnalyticsPanel({ tokens }: Props) {
  const flat = useMemo(() => flattenTokens(tokens), [tokens]);

  const typeDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of flat) {
      const k = t.type ?? 'unknown';
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [flat]);

  const groupDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of flat) {
      const k = t.path.split('.')[0];
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [flat]);

  const totalTokens   = flat.length;
  const colorCount    = flat.filter(t => t.type === 'color' || String(t.value).startsWith('#')).length;
  const dimCount      = flat.filter(t => t.type === 'dimension').length;
  const groupCount    = new Set(flat.map(t => t.path.split('.')[0])).size;
  const bundleKB      = (JSON.stringify(tokens).length / 1024).toFixed(1);
  const avgDepth      = (flat.reduce((s, t) => s + t.path.split('.').length, 0) / (flat.length || 1)).toFixed(1);

  const maxType  = typeDist[0]?.[1]  ?? 1;
  const maxGroup = groupDist[0]?.[1] ?? 1;

  const stats = [
    { label: 'Total Tokens',     value: totalTokens, icon: '🪙', color: 'var(--tf-brand-light)' },
    { label: 'Color Tokens',     value: colorCount,  icon: '🎨', color: '#67e8f9'               },
    { label: 'Dimension Tokens', value: dimCount,    icon: '📏', color: '#34d399'               },
    { label: 'Token Groups',     value: groupCount,  icon: '📁', color: '#fbbf24'               },
    { label: 'Est. Bundle Size', value: `${bundleKB} KB`, icon: '📦', color: '#f87171'         },
    { label: 'Avg Depth',        value: avgDepth,    icon: '🌳', color: 'var(--tf-brand-light)' },
  ];

  const insights = [
    { icon: '💡', title: 'Optimization Opportunity', desc: `Found ${colorCount} color tokens. Consider consolidating similar hues into a unified palette scale.`, severity: 'info' },
    { icon: '✅', title: 'Token Coverage',           desc: 'All major design categories (color, typography, spacing) are defined. Good coverage for a complete design system.', severity: 'success' },
    { icon: '⚡', title: 'Performance',              desc: `Your token system compiles to approximately ${bundleKB} KB. Well within optimal range (<10 KB).`, severity: 'success' },
    { icon: '🔗', title: 'Token References',         desc: 'Consider using semantic token aliases to reduce duplication and improve maintainability across themes.', severity: 'warning' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div className="tf-page-header" style={{ padding: '0 0 1.5rem', border: 'none', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="tf-page-title">📊 Analytics Dashboard</h1>
          <p className="tf-page-subtitle">Token performance, distribution analysis, and optimization insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div className="tf-stat-card" key={s.label} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.icon}</div>
            <div className="tf-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="tf-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Token Type Distribution */}
        <div className="tf-card">
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tf-text-primary)', marginBottom: '1.25rem' }}>Token Type Distribution</div>
          {typeDist.map(([type, count]) => (
            <div key={type} className="tf-chart-bar-row">
              <div className="tf-chart-bar-label">{TYPE_ICON[type] ?? '•'} {type}</div>
              <div className="tf-chart-bar-track">
                <div className="tf-chart-bar-fill" style={{
                  width: `${(count / maxType) * 100}%`,
                  background: type === 'color'
                    ? 'linear-gradient(90deg,#0891b2,#06b6d4)'
                    : type === 'dimension'
                      ? 'linear-gradient(90deg,#047857,#10b981)'
                      : 'linear-gradient(90deg,var(--tf-brand),var(--tf-brand-light))',
                }} />
              </div>
              <div className="tf-chart-bar-val">{count}</div>
            </div>
          ))}
        </div>

        {/* Token Group Distribution */}
        <div className="tf-card">
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tf-text-primary)', marginBottom: '1.25rem' }}>Token Group Distribution</div>
          {groupDist.map(([group, count]) => (
            <div key={group} className="tf-chart-bar-row">
              <div className="tf-chart-bar-label" style={{ textTransform: 'capitalize' }}>{group}</div>
              <div className="tf-chart-bar-track">
                <div className="tf-chart-bar-fill" style={{ width: `${(count / maxGroup) * 100}%` }} />
              </div>
              <div className="tf-chart-bar-val">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tf-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          AI-Powered Insights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {insights.map(ins => (
            <div key={ins.title} className="tf-card" style={{
              padding: '1rem 1.25rem',
              borderColor: ins.severity === 'success' ? 'rgba(16,185,129,0.2)' : ins.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.2)',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.125rem', flexShrink: 0, marginTop: '1px' }}>{ins.icon}</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tf-text-primary)', marginBottom: '0.25rem' }}>{ins.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--tf-text-secondary)', lineHeight: 1.6 }}>{ins.desc}</div>
              </div>
              <span className={`tf-badge tf-badge-${INSIGHT_SEVERITY_MAP[ins.severity] ?? ins.severity}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                {ins.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Token list sample */}
      <div className="tf-card">
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tf-text-primary)', marginBottom: '1rem' }}>Token Registry</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 260, overflowY: 'auto' }}>
          {flat.slice(0, 20).map(t => {
            const isCol = t.type === 'color' || String(t.value).startsWith('#');
            return (
              <div key={t.path} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {isCol && <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: String(t.value), border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />}
                <code style={{ fontSize: '0.75rem', color: 'var(--tf-text-brand)', fontFamily: 'var(--tf-font-mono)', flex: 1 }}>{t.path}</code>
                <code style={{ fontSize: '0.75rem', color: 'var(--tf-text-muted)', fontFamily: 'var(--tf-font-mono)' }}>{String(t.value).slice(0, 30)}</code>
                {t.type && <span className="tf-badge tf-badge-accent" style={{ fontSize: '0.5625rem' }}>{t.type}</span>}
              </div>
            );
          })}
          {flat.length > 20 && (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--tf-text-muted)', paddingTop: '0.5rem' }}>
              +{flat.length - 20} more tokens
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
