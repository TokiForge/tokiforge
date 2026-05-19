interface Props {
  theme: 'dark'|'light';
  setTheme: (t: 'dark'|'light') => void;
  toast: (m: string, t?: 'success'|'error'|'info') => void;
}

const SHORTCUTS = [
  { key:'⌘K',        desc:'Open command palette' },
  { key:'⌘S',        desc:'Save current tokens' },
  { key:'⌘Z',        desc:'Undo token change' },
  { key:'⌘⇧Z',       desc:'Redo token change' },
  { key:'⌘E',        desc:'Open export panel' },
  { key:'⌘⇧A',       desc:'Run accessibility check' },
  { key:'⌘/',        desc:'Toggle dark/light mode' },
  { key:'Esc',       desc:'Close modal/palette' },
];

export default function SettingsPanel({ theme, setTheme, toast }: Props) {
  return (
    <div style={{ padding:'2rem', maxWidth:800, margin:'0 auto' }}>
      <div className="tf-page-header" style={{ padding:'0 0 1.5rem', border:'none', marginBottom:'1.5rem' }}>
        <div>
          <h1 className="tf-page-title">⚙️ Settings</h1>
          <p className="tf-page-subtitle">Configure TokiForge to match your workflow</p>
        </div>
        <button className="tf-btn tf-btn-primary" onClick={() => toast('Settings saved!','success')}>Save Changes</button>
      </div>

      {/* Appearance */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1.25rem' }}>🎨 Appearance</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'0.875rem', color:'var(--tf-text-primary)', fontWeight:500 }}>Color Scheme</div>
              <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>Choose your preferred interface theme</div>
            </div>
            <div style={{ display:'flex', gap:'0.375rem' }}>
              {(['dark','light'] as const).map(t => (
                <button key={t} className={`tf-btn tf-btn-sm${theme===t?' tf-btn-primary':' tf-btn-ghost'}`} onClick={() => { setTheme(t); toast(`Switched to ${t} mode`,'info'); }}>
                  {t==='dark'?'🌙':'☀️'} {t}
                </button>
              ))}
            </div>
          </div>
          <hr className="tf-divider" />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'0.875rem', color:'var(--tf-text-primary)', fontWeight:500 }}>Animations</div>
              <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>Enable UI micro-animations and transitions</div>
            </div>
            <label style={{ position:'relative', display:'inline-block', width:44, height:24 }}>
              <input type="checkbox" defaultChecked style={{ opacity:0, width:0, height:0 }} />
              <span style={{ position:'absolute', cursor:'pointer', inset:0, background:'var(--tf-brand)', borderRadius:99, transition:'0.3s' }}><span style={{ position:'absolute', left:2, bottom:2, width:20, height:20, background:'#fff', borderRadius:'50%', transition:'0.3s', transform:'translateX(20px)' }} /></span>
            </label>
          </div>
          <hr className="tf-divider" />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'0.875rem', color:'var(--tf-text-primary)', fontWeight:500 }}>Compact Mode</div>
              <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>Reduce spacing for denser information display</div>
            </div>
            <label style={{ position:'relative', display:'inline-block', width:44, height:24 }}>
              <input type="checkbox" style={{ opacity:0, width:0, height:0 }} />
              <span style={{ position:'absolute', cursor:'pointer', inset:0, background:'rgba(255,255,255,0.1)', borderRadius:99 }}><span style={{ position:'absolute', left:2, bottom:2, width:20, height:20, background:'#fff', borderRadius:'50%' }} /></span>
            </label>
          </div>
        </div>
      </div>

      {/* AI Provider */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1.25rem' }}>🤖 AI Provider</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          <div>
            <label className="tf-label">API Provider</label>
            <select className="tf-input" style={{ fontSize:'0.875rem' }}>
              <option>OpenAI (GPT-4o)</option>
              <option>Anthropic (Claude)</option>
              <option>Google (Gemini)</option>
              <option>Local (Ollama)</option>
              <option>Custom endpoint</option>
            </select>
          </div>
          <div>
            <label className="tf-label">API Key</label>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input className="tf-input" type="password" placeholder="sk-…" style={{ fontFamily:'var(--tf-font-mono)' }} />
              <button className="tf-btn tf-btn-ghost" onClick={() => toast('API key validated!','success')}>Verify</button>
            </div>
          </div>
          <div>
            <label className="tf-label">Model</label>
            <select className="tf-input" style={{ fontSize:'0.875rem' }}>
              <option>gpt-4o</option>
              <option>gpt-4o-mini</option>
              <option>claude-3-5-sonnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="tf-card" style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>⌨️ Keyboard Shortcuts</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.375rem' }}>
          {SHORTCUTS.map(s => (
            <div key={s.key} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem', borderRadius:'var(--tf-radius-sm)', background:'rgba(255,255,255,0.02)' }}>
              <kbd style={{ padding:'2px 6px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:4, fontFamily:'var(--tf-font-mono)', fontSize:'0.75rem', color:'var(--tf-text-primary)', whiteSpace:'nowrap' }}>
                {s.key}
              </kbd>
              <span style={{ fontSize:'0.8125rem', color:'var(--tf-text-secondary)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="tf-card">
        <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>ℹ️ About TokiForge</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
          {[
            ['Version',   'v2.2.3'],
            ['License',   'AGPL-3.0'],
            ['Packages',  '19 packages'],
            ['Frameworks','React, Vue, Svelte, Angular, Next.js, and more'],
          ].map(([k,v]) => (
            <div key={k} style={{ padding:'0.625rem', background:'rgba(255,255,255,0.02)', borderRadius:'var(--tf-radius-sm)' }}>
              <div style={{ fontSize:'0.6875rem', color:'var(--tf-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginBottom:'2px' }}>{k}</div>
              <div style={{ fontSize:'0.8125rem', color:'var(--tf-text-primary)', fontFamily:k==='Version'?'var(--tf-font-mono)':undefined }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem' }}>
          <a href="https://github.com/TokiForge/tokiforge" target="_blank" rel="noopener" className="tf-btn tf-btn-ghost tf-btn-sm">GitHub ↗</a>
          <a href="#" className="tf-btn tf-btn-ghost tf-btn-sm">Docs ↗</a>
          <a href="#" className="tf-btn tf-btn-ghost tf-btn-sm">Changelog ↗</a>
        </div>
      </div>
    </div>
  );
}
