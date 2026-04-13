import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, monitorsAPI, publicationsAPI } from '../lib/api'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: accent } : {}}>{value ?? '—'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentPubs, setRecentPubs] = useState([])
  const [recentMonitors, setRecentMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      dashboardAPI.stats(),
      publicationsAPI.list({ limit: 5 }),
      monitorsAPI.list(),
    ]).then(([s, p, m]) => {
      if (s.success) setStats(s.stats)
      if (p.success) setRecentPubs(p.publications)
      if (m.success) setRecentMonitors(m.monitors.slice(0, 4))
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="loading-state" style={{ minHeight: '60vh' }}>
      <span className="spinner" /> Carregando dashboard...
    </div>
  )

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{greeting}</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/monitors')}>
          + Novo monitor
        </button>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Stats */}
        <div className="stat-grid">
          <StatCard label="Monitores ativos"  value={stats?.activeMonitors} sub="buscas automáticas" accent="var(--green)" />
          <StatCard label="Não lidos"         value={stats?.unreadCount}    sub="aguardando leitura" accent="var(--gold)" />
          <StatCard label="Salvos"            value={stats?.savedCount}     sub="artigos salvos" />
          <StatCard label="Total de artigos"  value={stats?.totalArticles}  sub="no seu acervo" />
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Recent publications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }}>Publicações recentes</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/publications')}>Ver todas →</button>
            </div>

            {recentPubs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">Nenhuma publicação ainda</div>
                <div className="empty-state-sub">Execute um monitor para capturar artigos</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentPubs.map(p => (
                  <div key={p.id} className="card card-sm" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {p.read_status === 'unread' && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 5 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="truncate" style={{ fontSize: '0.86rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                          {p.title}
                        </div>
                        <div className="text-xs text-dim">{p.journal || p.source} · {p.year}</div>
                      </div>
                      <span className={`badge badge-${p.source === 'pubmed' ? 'teal' : p.source === 'crossref' ? 'gold' : 'neutral'}`} style={{ flexShrink: 0 }}>
                        {p.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monitors overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }}>Seus monitores</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/monitors')}>Gerenciar →</button>
            </div>

            {recentMonitors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">Nenhum monitor criado</div>
                <div className="empty-state-sub">Configure vigilâncias automáticas de literatura</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentMonitors.map(m => (
                  <div key={m.id} className="card card-sm" style={{ padding: '14px 18px' }}>
                    <div className="flex items-center gap-2 mb-4" style={{ marginBottom: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: m.status === 'active' ? 'var(--green)' : 'var(--text-3)',
                        boxShadow: m.status === 'active' ? '0 0 6px var(--green)' : 'none',
                      }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', flex: 1 }} className="truncate">{m.name}</span>
                    </div>
                    <div className="text-xs text-dim truncate" style={{ marginBottom: 8 }}>{m.keywords}</div>
                    <div className="flex gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      <span><strong style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{m.total_results || 0}</strong> encontrados</span>
                      <span><strong style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{m.new_results || 0}</strong> novos</span>
                      <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>{m.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
