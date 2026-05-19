import type { DesignTokens } from '@tokiforge/core';

interface Props { tokens: DesignTokens; }

export default function ComponentsPanel({ tokens }: Props) {
  interface ColorValue { value?: string; }
  interface TextNodes { primary?: ColorValue; secondary?: ColorValue; }
  interface BgNodes { card?: ColorValue; }
  interface ColorTokens { primary?: ColorValue; secondary?: ColorValue; success?: ColorValue; warning?: ColorValue; danger?: ColorValue; text?: TextNodes; background?: BgNodes; }
  interface RadiusTokens { md?: ColorValue; }

  const c = (tokens.color ?? {}) as ColorTokens;
  const primary   = c.primary?.value   ?? '#7c3aed';
  const secondary = c.secondary?.value ?? '#06b6d4';
  const success   = c.success?.value   ?? '#10b981';
  const warning   = c.warning?.value   ?? '#f59e0b';
  const danger    = c.danger?.value    ?? '#ef4444';
  const text      = c.text?.primary?.value    ?? '#f1f5f9';
  const textSec   = c.text?.secondary?.value  ?? '#94a3b8';
  const bgCard    = c.background?.card?.value ?? '#111827';
  const radius    = (tokens.radius as RadiusTokens)?.md?.value ?? '0.5rem';

  return (
    <div style={{ padding:'2rem', maxWidth:1000, margin:'0 auto' }}>
      <div className="tf-page-header" style={{ padding:'0 0 1.5rem', border:'none', marginBottom:'1.5rem' }}>
        <div>
          <h1 className="tf-page-title">🧱 Component System</h1>
          <p className="tf-page-subtitle">Live component preview powered by your active design tokens</p>
        </div>
        <span className="tf-badge tf-badge-brand">Token-driven</span>
      </div>

      {/* Buttons */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>🔘 Buttons</div>
        <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          {[
            { label:'Primary',   bg:primary,   color:'#fff', border:'none' },
            { label:'Secondary', bg:secondary, color:'#fff', border:'none' },
            { label:'Outline',   bg:'transparent', color:primary, border:`1.5px solid ${primary}` },
            { label:'Ghost',     bg:'transparent', color:textSec, border:'1px solid rgba(255,255,255,0.1)' },
            { label:'Danger',    bg:danger,    color:'#fff', border:'none' },
            { label:'Success',   bg:success,   color:'#fff', border:'none' },
          ].map(btn => (
            <button key={btn.label} style={{ padding:'0.5rem 1rem', background:btn.bg, color:btn.color, border:btn.border, borderRadius:radius, fontWeight:600, fontSize:'0.875rem', cursor:'pointer', fontFamily:'var(--tf-font-sans)' }}>
              {btn.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop:'0.75rem', display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          {['sm','md','lg'].map(size => (
            <button key={size} style={{
              padding: size==='sm'?'0.25rem 0.75rem':size==='lg'?'0.75rem 1.5rem':'0.5rem 1rem',
              fontSize: size==='sm'?'0.75rem':size==='lg'?'1rem':'0.875rem',
              background:primary, color:'#fff', border:'none', borderRadius:radius,
              fontWeight:600, cursor:'pointer', fontFamily:'var(--tf-font-sans)'
            }}>
              Button {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>🏷️ Badges</div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          {[
            { label:'Default', bg:`${primary}22`, color:primary,   border:`1px solid ${primary}44` },
            { label:'Success', bg:`${success}22`, color:success,   border:`1px solid ${success}44` },
            { label:'Warning', bg:`${warning}22`, color:warning,   border:`1px solid ${warning}44` },
            { label:'Danger',  bg:`${danger}22`,  color:danger,    border:`1px solid ${danger}44` },
            { label:'Info',    bg:`${secondary}22`,color:secondary,border:`1px solid ${secondary}44` },
            { label:'New ✨',  bg:`linear-gradient(135deg,${primary}33,${secondary}33)`, color:text, border:`1px solid ${primary}44` },
          ].map(b => (
            <span key={b.label} style={{ padding:'2px 10px', background:b.bg, color:b.color, border:b.border, borderRadius:9999, fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem', marginBottom:'1rem' }}>
        {[
          { title:'Default Card', desc:'Standard card using your token system for background and borders.', variant:'default' },
          { title:'Elevated Card', desc:'Elevated card with enhanced shadow and glow effect.', variant:'elevated' },
          { title:'Bordered Card', desc:'Card with prominent colored border accent.', variant:'branded' },
        ].map(card => (
          <div key={card.title} style={{
            background: bgCard,
            border: card.variant==='branded'?`1px solid ${primary}55`:'1px solid rgba(255,255,255,0.07)',
            borderRadius:radius,
            padding:'1.25rem',
            boxShadow: card.variant==='elevated'?`0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${primary}11`:'none'
          }}>
            <div style={{ fontSize:'0.9375rem', fontWeight:700, color:text, marginBottom:'0.375rem' }}>{card.title}</div>
            <div style={{ fontSize:'0.8125rem', color:textSec, lineHeight:1.6, marginBottom:'0.875rem' }}>{card.desc}</div>
            <button style={{ padding:'0.375rem 0.875rem', background:primary, color:'#fff', border:'none', borderRadius:radius, fontWeight:600, fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--tf-font-sans)' }}>
              Action
            </button>
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>📝 Form Elements</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:textSec, marginBottom:'0.375rem', letterSpacing:'0.04em', textTransform:'uppercase' }}>Default Input</label>
            <input placeholder="Enter value…" style={{ width:'100%', padding:'0.625rem 0.875rem', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:radius, color:text, fontSize:'0.875rem', outline:'none', fontFamily:'var(--tf-font-sans)' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:textSec, marginBottom:'0.375rem', letterSpacing:'0.04em', textTransform:'uppercase' }}>Focused Input</label>
            <input defaultValue="Active state" style={{ width:'100%', padding:'0.625rem 0.875rem', background:'rgba(0,0,0,0.3)', border:`1.5px solid ${primary}`, borderRadius:radius, color:text, fontSize:'0.875rem', outline:'none', boxShadow:`0 0 0 3px ${primary}22`, fontFamily:'var(--tf-font-sans)' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:danger, marginBottom:'0.375rem', letterSpacing:'0.04em', textTransform:'uppercase' }}>Error State</label>
            <input placeholder="Invalid value" style={{ width:'100%', padding:'0.625rem 0.875rem', background:`${danger}11`, border:`1.5px solid ${danger}`, borderRadius:radius, color:text, fontSize:'0.875rem', outline:'none', fontFamily:'var(--tf-font-sans)' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--tf-text-muted)', marginBottom:'0.375rem', letterSpacing:'0.04em', textTransform:'uppercase' }}>Disabled</label>
            <input disabled placeholder="Disabled input" style={{ width:'100%', padding:'0.625rem 0.875rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:radius, color:'var(--tf-text-muted)', fontSize:'0.875rem', cursor:'not-allowed', fontFamily:'var(--tf-font-sans)' }} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="tf-card">
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>🔔 Alerts</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {[
            { type:'info',    icon:'ℹ️', title:'Information', msg:'This is an informational message using your token system.', color:secondary },
            { type:'success', icon:'✅', title:'Success',     msg:'Operation completed successfully with your design tokens.', color:success },
            { type:'warning', icon:'⚠️', title:'Warning',     msg:'Please review your token contrast ratios before publishing.', color:warning },
            { type:'danger',  icon:'❌', title:'Error',       msg:'Accessibility check failed. Some color pairs need adjustment.', color:danger },
          ].map(alert => (
            <div key={alert.type} style={{ display:'flex', gap:'0.75rem', padding:'0.875rem 1rem', background:`${alert.color}11`, border:`1px solid ${alert.color}33`, borderRadius:radius, borderLeft:`3px solid ${alert.color}` }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{alert.icon}</span>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:alert.color, marginBottom:'1px' }}>{alert.title}</div>
                <div style={{ fontSize:'0.8125rem', color:textSec }}>{alert.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
