interface Props { toast: (m: string, t?: 'success'|'error'|'info') => void; }

const TEAM = [
  { name:'Alex Chen',    role:'Design Lead',     avatar:'AC', color:'#7c3aed', status:'online' },
  { name:'Sarah Kim',    role:'Frontend Dev',    avatar:'SK', color:'#06b6d4', status:'online' },
  { name:'Marcus Reid',  role:'Design Systems',  avatar:'MR', color:'#10b981', status:'away' },
  { name:'Priya Sharma', role:'Product Manager', avatar:'PS', color:'#f59e0b', status:'offline' },
];

const ACTIVITY = [
  { user:'Alex Chen',    action:'Updated color.primary to #7c3aed',       time:'2m ago',  icon:'🎨' },
  { user:'Sarah Kim',    action:'Exported tokens to Tailwind config',       time:'15m ago', icon:'📦' },
  { user:'Marcus Reid',  action:'Added component token: button.primary.bg', time:'1h ago',  icon:'🪙' },
  { user:'Alex Chen',    action:'Ran accessibility check — Score: 94',     time:'2h ago',  icon:'♿' },
  { user:'Sarah Kim',    action:'Created branch: feature/dark-theme',       time:'3h ago',  icon:'🌿' },
  { user:'Priya Sharma', action:'Approved PR: typography scale update',     time:'1d ago',  icon:'✅' },
];

const BRANCHES = [
  { name:'main',              tokens:89, status:'stable', updated:'2h ago' },
  { name:'feature/dark-theme',tokens:95, status:'draft',  updated:'1h ago' },
  { name:'fix/contrast-ratio',tokens:89, status:'review', updated:'30m ago' },
];

export default function CollabPanel({ toast }: Props) {
  return (
    <div style={{ padding:'2rem', maxWidth:1000, margin:'0 auto' }}>
      <div className="tf-page-header" style={{ padding:'0 0 1.5rem', border:'none', marginBottom:'1.5rem' }}>
        <div>
          <h1 className="tf-page-title">👥 Collaboration</h1>
          <p className="tf-page-subtitle">Team workspaces, version control, and real-time collaboration</p>
        </div>
        <button className="tf-btn tf-btn-primary" onClick={() => toast('Invite sent!','success')}>+ Invite Member</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Team Members */}
        <div className="tf-card">
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>Team Members</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {TEAM.map(member => (
              <div key={member.name} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:'var(--tf-radius-lg)', border:'1px solid var(--tf-border)' }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:member.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6875rem', fontWeight:700, color:'#fff' }}>{member.avatar}</div>
                  <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background: member.status==='online'?'#10b981':member.status==='away'?'#f59e0b':'#475569', border:'2px solid var(--tf-bg-card)' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--tf-text-primary)' }}>{member.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>{member.role}</div>
                </div>
                <span className={`tf-badge ${member.status==='online'?'tf-badge-success':member.status==='away'?'tf-badge-warning':'tf-badge-danger'}`} style={{ fontSize:'0.5625rem' }}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="tf-card">
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)', marginBottom:'1rem' }}>Recent Activity</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {ACTIVITY.map((act, i) => (
              <div key={`${act.user}-${i}`} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', flexShrink:0 }}>{act.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--tf-text-primary)', fontWeight:500, marginBottom:'1px' }}>
                    <span style={{ color:'var(--tf-brand-light)' }}>{act.user}</span> {act.action}
                  </div>
                  <div style={{ fontSize:'0.6875rem', color:'var(--tf-text-muted)' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Management */}
        <div className="tf-card" style={{ gridColumn:'1/-1' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--tf-text-primary)' }}>Theme Branches</div>
            <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => toast('Branch created!','success')}>+ New Branch</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {BRANCHES.map(branch => (
              <div key={branch.name} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.875rem 1rem', background:'rgba(255,255,255,0.03)', borderRadius:'var(--tf-radius-lg)', border:'1px solid var(--tf-border)' }}>
                <span style={{ fontSize:'0.875rem' }}>🌿</span>
                <code style={{ fontSize:'0.8125rem', color:'var(--tf-text-brand)', fontFamily:'var(--tf-font-mono)', flex:1 }}>{branch.name}</code>
                <span style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>{branch.tokens} tokens</span>
                <span className={`tf-badge ${branch.status==='stable'?'tf-badge-success':branch.status==='review'?'tf-badge-warning':'tf-badge-brand'}`}>
                  {branch.status}
                </span>
                <span style={{ fontSize:'0.75rem', color:'var(--tf-text-muted)' }}>{branch.updated}</span>
                <div style={{ display:'flex', gap:'0.375rem' }}>
                  <button className="tf-btn tf-btn-ghost tf-btn-sm" onClick={() => toast(`Switched to ${branch.name}`,'info')}>Checkout</button>
                  {branch.status === 'review' && <button className="tf-btn tf-btn-primary tf-btn-sm" onClick={() => toast('PR merged!','success')}>Merge</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
