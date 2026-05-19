import { useState, useRef } from 'react';
import type { DesignTokens } from '@tokiforge/core';

// ── Prompt templates ─────────────────────────────────────────────
const PROMPT_TEMPLATES = [
  { label:'🏦 Fintech Dark', prompt:'Create a professional fintech dark theme with deep navy, electric blue accents, and gold highlights. Focus on trust and precision.' },
  { label:'🎮 Cyberpunk Gaming', prompt:'Generate a cyberpunk gaming design system with neon green, hot pink, and electric purple. High contrast, futuristic, aggressive.' },
  { label:'☁️ Minimal SaaS', prompt:'Create a minimalist SaaS design system with clean whites, subtle grays, and a single primary brand color. Modern and professional.' },
  { label:'🌿 Eco Wellness', prompt:'Generate a calming wellness and sustainability theme with forest greens, warm earth tones, and natural textures.' },
  { label:'🌸 Luxury Fashion', prompt:'Create a luxury fashion brand design system with ivory, rose gold, and black. Elegant, editorial, and timeless.' },
  { label:'🚀 Startup Bold', prompt:'Generate a bold startup design system with vibrant gradients, strong typography, and high-energy colors.' },
];

// ── Mock AI response generator ───────────────────────────────────
function generateMockTokens(prompt: string): DesignTokens {
  const p = prompt.toLowerCase();
  let primary='#7c3aed', secondary='#06b6d4', accent='#f59e0b';
  let bgBase='#080b12', bgCard='#111827', textPrimary='#f1f5f9';

  if (p.includes('fintech') || p.includes('navy') || p.includes('blue')) {
    primary='#1d4ed8'; secondary='#0ea5e9'; accent='#d97706';
    bgBase='#030712'; bgCard='#0f172a';
  } else if (p.includes('cyberpunk') || p.includes('neon') || p.includes('gaming')) {
    primary='#00ff41'; secondary='#ff0080'; accent='#bf00ff';
    bgBase='#050005'; bgCard='#0a000f';
  } else if (p.includes('minimal') || p.includes('saas') || p.includes('clean')) {
    primary='#2563eb'; secondary='#7c3aed'; accent='#059669';
    bgBase='#f8fafc'; bgCard='#ffffff'; textPrimary='#0f172a';
  } else if (p.includes('eco') || p.includes('wellness') || p.includes('green')) {
    primary='#059669'; secondary='#0d9488'; accent='#ca8a04';
    bgBase='#f0fdf4'; bgCard='#ffffff'; textPrimary='#14532d';
  } else if (p.includes('luxury') || p.includes('fashion') || p.includes('gold')) {
    primary='#b45309'; secondary='#1c1917'; accent='#d4af37';
    bgBase='#0c0a09'; bgCard='#1c1917';
  } else if (p.includes('startup') || p.includes('bold') || p.includes('vibrant')) {
    primary='#dc2626'; secondary='#ea580c'; accent='#7c3aed';
    bgBase='#09090b'; bgCard='#18181b';
  }

  return {
    color: {
      primary:   { value: primary,   type: 'color', description: 'Primary brand color' },
      secondary: { value: secondary, type: 'color', description: 'Secondary brand color' },
      accent:    { value: accent,    type: 'color', description: 'Accent / highlight color' },
      success:   { value: '#10b981', type: 'color' },
      warning:   { value: '#f59e0b', type: 'color' },
      danger:    { value: '#ef4444', type: 'color' },
      text: {
        primary:   { value: textPrimary, type: 'color' },
        secondary: { value: '#94a3b8',   type: 'color' },
        muted:     { value: '#64748b',   type: 'color' },
      },
      background: {
        base:   { value: bgBase, type: 'color' },
        raised: { value: bgCard, type: 'color' },
        card:   { value: bgCard, type: 'color' },
      },
    },
    typography: {
      fontFamily: {
        sans: { value: "'Inter', -apple-system, sans-serif",   type: 'fontFamily' },
        mono: { value: "'JetBrains Mono', monospace",           type: 'fontFamily' },
      },
      fontSize: {
        xs: { value:'0.75rem', type:'dimension' }, sm: { value:'0.875rem', type:'dimension' },
        md: { value:'1rem',    type:'dimension' }, lg: { value:'1.125rem', type:'dimension' },
        xl: { value:'1.25rem', type:'dimension' }, '2xl':{ value:'1.5rem',  type:'dimension' },
        '3xl':{ value:'2rem',  type:'dimension' }, '4xl':{ value:'2.75rem', type:'dimension' },
      },
    },
    spacing: {
      '1':{ value:'0.25rem',type:'dimension'}, '2':{ value:'0.5rem',type:'dimension'},
      '3':{ value:'0.75rem',type:'dimension'}, '4':{ value:'1rem',  type:'dimension'},
      '6':{ value:'1.5rem', type:'dimension'}, '8':{ value:'2rem',  type:'dimension'},
      '10':{ value:'2.5rem',type:'dimension'},'12':{ value:'3rem',  type:'dimension'},
      '16':{ value:'4rem',  type:'dimension'},'24':{ value:'6rem',  type:'dimension'},
    },
    radius: {
      none:{ value:'0',       type:'dimension'}, sm:{ value:'0.25rem',type:'dimension'},
      md:  { value:'0.5rem',  type:'dimension'}, lg:{ value:'0.75rem',type:'dimension'},
      xl:  { value:'1rem',    type:'dimension'}, '2xl':{ value:'1.5rem',type:'dimension'},
      full:{ value:'9999px',  type:'dimension'},
    },
    shadow: {
      sm:   { value:'0 1px 3px rgba(0,0,0,0.4)',   type:'custom'},
      md:   { value:'0 4px 16px rgba(0,0,0,0.35)', type:'custom'},
      lg:   { value:'0 8px 32px rgba(0,0,0,0.5)',  type:'custom'},
      brand:{ value:`0 0 24px ${primary}55`,        type:'custom'},
    },
    animation: {
      duration:{ fast:{value:'150ms',type:'duration'}, normal:{value:'250ms',type:'duration'}, slow:{value:'400ms',type:'duration'} },
      easing:  { smooth:{value:'cubic-bezier(0.4,0,0.2,1)',type:'custom'}, spring:{value:'cubic-bezier(0.34,1.56,0.64,1)',type:'custom'} },
    },
  };
}

interface Props {
  tokens: DesignTokens;
  setTokens: (t: DesignTokens) => void;
  toast: (msg: string, type?: 'success'|'error'|'info') => void;
}

export default function AIGenerator({ setTokens, toast }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState<string[]>([]);
  const [generated, setGenerated] = useState<DesignTokens|null>(null);
  const [step, setStep] = useState<'idle'|'streaming'|'preview'|'applied'>('idle');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function runGeneration(p: string) {
    if (!p.trim()) return;
    setLoading(true);
    setStep('streaming');
    setStreaming([]);
    setGenerated(null);

    const steps = [
      '🎨 Analyzing design intent…',
      '🔬 Extracting color psychology…',
      '📐 Computing typography scale…',
      '📏 Building spacing system…',
      '🌗 Generating semantic tokens…',
      '♿ Running accessibility checks…',
      '✨ Finalizing design system…',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 320 + Math.random() * 180));
      setStreaming(prev => [...prev, steps[i]]);
    }

    const result = generateMockTokens(p);
    await new Promise(r => setTimeout(r, 300));
    setGenerated(result);
    setStep('preview');
    setLoading(false);
  }

  function applyTokens() {
    if (!generated) return;
    setTokens(generated);
    setStep('applied');
    toast('✅ Design system applied!', 'success');
  }

  function regenerate() {
    setStep('idle');
    setGenerated(null);
    setStreaming([]);
    if (prompt) void runGeneration(prompt);
  }

  const previewColors = generated
    ? Object.entries((generated.color ?? {}) as DesignTokens)
        .filter(([,v]) => v && typeof v === 'object' && 'value' in (v as any))
        .map(([k, v]) => ({ name: k, value: String((v as any).value) }))
        .filter(c => c.value.startsWith('#'))
    : [];

  return (
    <div style={{ padding:'2rem', maxWidth:900, margin:'0 auto' }}>
      {/* Header */}
      <div className="tf-page-header" style={{ padding:'0 0 1.5rem', border:'none' }}>
        <div>
          <h1 className="tf-page-title">🤖 AI Token Generator</h1>
          <p className="tf-page-subtitle">Generate complete design systems from natural language prompts</p>
        </div>
        <span className="tf-badge tf-badge-brand">Powered by AI</span>
      </div>

      {/* Prompt box */}
      <div className="tf-ai-box" style={{ marginBottom:'1.5rem' }}>
        <div className="tf-ai-header">
          <div className="tf-ai-icon">✨</div>
          <div>
            <div className="tf-ai-title">Describe your design system</div>
            <div className="tf-ai-sub">Be specific about brand, mood, industry, and color preferences</div>
          </div>
        </div>

        <textarea
          ref={inputRef}
          className="tf-input tf-textarea"
          style={{ marginBottom:'0.75rem', minHeight:80 }}
          placeholder='e.g. "Create a dark fintech design system with deep navy, electric blue, and gold accent colors for a premium banking app"'
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) runGeneration(prompt); }}
          disabled={loading}
        />

        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <button className="tf-btn tf-btn-primary" onClick={() => runGeneration(prompt)} disabled={loading || !prompt.trim()}>
            {loading ? <><div className="tf-spinner" />Generating…</> : <>✨ Generate</>}
          </button>
          {step === 'preview' && (
            <button className="tf-btn tf-btn-ghost" onClick={regenerate}>↺ Regenerate</button>
          )}
          <span style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)', marginLeft:'auto' }}>⌘↵ to generate</span>
        </div>

        {/* Quick prompts */}
        <div className="tf-ai-chips">
          {PROMPT_TEMPLATES.map(t => (
            <button key={t.label} className="tf-ai-chip" onClick={() => { setPrompt(t.prompt); setTimeout(() => void runGeneration(t.prompt), 50); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Streaming log */}
      {streaming.length > 0 && (
        <div className="tf-card" style={{ marginBottom:'1.5rem', fontFamily:'var(--tf-font-mono)', fontSize:'0.8125rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--tf-text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.75rem' }}>
            AI Processing Log
          </div>
          {streaming.map((line, i) => (
            <div key={i} style={{ color: i===streaming.length-1 ? 'var(--tf-brand-light)' : 'var(--tf-text-secondary)', padding:'0.25rem 0', display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <span style={{ color:'var(--tf-success)' }}>✓</span> {line}
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', color:'var(--tf-text-muted)', padding:'0.25rem 0' }}>
              <div className="tf-spinner" /> Processing…
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {step === 'preview' && generated && (
        <div style={{ animation:'fadeInUp 0.4s ease' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--tf-text-primary)' }}>Generated Design System Preview</h2>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={regenerate}>↺ Regenerate</button>
              <button className="tf-btn tf-btn-primary" onClick={applyTokens}>Apply to Project →</button>
            </div>
          </div>

          {/* Color preview */}
          {previewColors.length > 0 && (
            <div className="tf-card" style={{ marginBottom:'1rem' }}>
              <div className="tf-label">Color Palette</div>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginTop:'0.5rem' }}>
                {previewColors.map(c => (
                  <div key={c.name} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.375rem' }}>
                    <div style={{ width:48, height:48, borderRadius:'var(--tf-radius-md)', backgroundColor:c.value, border:'1px solid rgba(255,255,255,0.1)', boxShadow:`0 0 12px ${c.value}44` }} />
                    <span style={{ fontSize:'0.625rem', color:'var(--tf-text-muted)', fontFamily:'var(--tf-font-mono)' }}>{c.name}</span>
                    <span style={{ fontSize:'0.625rem', color:'var(--tf-text-muted)', fontFamily:'var(--tf-font-mono)' }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON preview */}
          <div className="tf-code-block">
            <div className="tf-code-header">
              <span className="tf-code-lang">JSON — Design Tokens</span>
              <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(generated, null, 2)); toast('Copied!','success'); }}>
                📋 Copy
              </button>
            </div>
            <div className="tf-code-body" style={{ maxHeight:280, overflowY:'auto' }}>
              {JSON.stringify(generated, null, 2)}
            </div>
          </div>
        </div>
      )}

      {step === 'applied' && (
        <div style={{ textAlign:'center', padding:'3rem', animation:'scaleIn 0.3s ease' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎉</div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'0.5rem' }}>Design System Applied!</h2>
          <p style={{ color:'var(--tf-text-secondary)', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Your AI-generated tokens are now active across all panels.</p>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
            <button className="tf-btn tf-btn-ghost" onClick={() => { setStep('idle'); setPrompt(''); setStreaming([]); setGenerated(null); }}>
              Generate Another
            </button>
            <button className="tf-btn tf-btn-primary" onClick={() => toast('Navigate to Export panel to ship your tokens','info')}>
              Export Tokens →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
