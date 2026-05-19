import type { DesignTokens } from '@tokiforge/core';

interface Props { tokens: DesignTokens; toast: (m: string, t?: 'success'|'error'|'info') => void; }

export default function FigmaPanel({ tokens, toast }: Props) {

  return (
    <div style={{ padding:'2rem', maxWidth:900, margin:'0 auto' }}>
      <div className="tf-page-header" style={{ padding:'0 0 1.5rem', border:'none', marginBottom:'1.5rem' }}>
        <div>
          <h1 className="tf-page-title">🖼 Figma Integration</h1>
          <p className="tf-page-subtitle">Sync design tokens bidirectionally with your Figma workspace</p>
        </div>
        <span className="tf-badge tf-badge-warning">Beta</span>
      </div>

      {/* Connect Card */}
      <div className="tf-ai-box" style={{ marginBottom:'1.5rem' }}>
        <div className="tf-ai-header">
          <div className="tf-ai-icon">🔗</div>
          <div>
            <div className="tf-ai-title">Connect Figma Workspace</div>
            <div className="tf-ai-sub">Enter your Figma personal access token to enable sync</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'0.75rem' }}>
          <input className="tf-input" placeholder="fig-pat-xxxxxxxxxxxxxxxx" type="password" style={{ flex:1 }} />
          <button className="tf-btn tf-btn-primary" onClick={() => toast('Connecting to Figma…','info')}>Connect</button>
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>
          Your token is stored locally and never sent to TokiForge servers.
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Export to Figma */}
        <div className="tf-card">
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>📤 Export to Figma</div>
          <p style={{ fontSize:'0.8125rem', color:'var(--tf-text-secondary)', lineHeight:1.6, marginBottom:'1rem' }}>
            Push your TokiForge design tokens directly to Figma as Design Variables. Supports color styles, text styles, and effect styles.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem' }}>
            {[
              { label:'Color Variables',      count: Object.keys(tokens.color??{}).length, icon:'🎨' },
              { label:'Typography Styles',    count: Object.keys((tokens.typography as Record<string, Record<string, unknown>>)?.fontSize ?? {}).length, icon:'🔤' },
              { label:'Spacing Variables',    count: Object.keys(tokens.spacing??{}).length, icon:'📏' },
              { label:'Shadow Effects',       count: Object.keys(tokens.shadow??{}).length, icon:'🌟' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem', background:'rgba(255,255,255,0.03)', borderRadius:'var(--tf-radius-sm)' }}>
                <span>{item.icon}</span>
                <span style={{ fontSize:'0.8125rem', color:'var(--tf-text-secondary)', flex:1 }}>{item.label}</span>
                <span className="tf-badge tf-badge-brand">{item.count}</span>
              </div>
            ))}
          </div>
          <button className="tf-btn tf-btn-primary" style={{ width:'100%' }} onClick={() => toast('Exported to Figma!','success')}>
            Push to Figma →
          </button>
        </div>

        {/* Import from Figma */}
        <div className="tf-card">
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>📥 Import from Figma</div>
          <p style={{ fontSize:'0.8125rem', color:'var(--tf-text-secondary)', lineHeight:1.6, marginBottom:'1rem' }}>
            Pull design variables from any Figma file and auto-convert them to TokiForge token format with AI-assisted mapping.
          </p>
          <div style={{ marginBottom:'1rem' }}>
            <label className="tf-label">Figma File URL</label>
            <input className="tf-input" placeholder="https://figma.com/file/…" style={{ marginBottom:'0.75rem' }} />
            <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
              {['Colors','Typography','Spacing','Effects'].map(opt => (
                <label key={opt} style={{ display:'flex', alignItems:'center', gap:'0.375rem', fontSize:'0.75rem', color:'var(--tf-text-secondary)', cursor:'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor:'var(--tf-brand-light)' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <button className="tf-btn tf-btn-accent" style={{ width:'100%' }} onClick={() => toast('Importing from Figma…','info')}>
            Pull from Figma ←
          </button>
        </div>

        {/* Live Sync */}
        <div className="tf-card" style={{ gridColumn:'1/-1' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)' }}>⚡ Live Sync Status</div>
            <span className="tf-badge tf-badge-warning">Disconnected</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.75rem' }}>
            {[
              { label:'Last Sync',        value:'Not connected',  icon:'🔄' },
              { label:'Tokens Synced',    value:'—',              icon:'🪙' },
              { label:'Figma Variables',  value:'—',              icon:'📊' },
              { label:'Sync Mode',        value:'Bidirectional',  icon:'↕️' },
            ].map(s => (
              <div key={s.label} style={{ padding:'0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:'var(--tf-radius-md)', border:'1px solid var(--tf-border)' }}>
                <div style={{ fontSize:'1rem', marginBottom:'0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--tf-text-primary)' }}>{s.value}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
