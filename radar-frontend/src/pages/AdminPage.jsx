import { useState, useEffect } from 'react'
import { adminAPI } from '../lib/api'
import { useToast } from '../components/Toast'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [journalForm, setJournalForm] = useState({ name: '', issn: '', qualis: 'B1', impact_factor: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const [sRes, jRes] = await Promise.all([adminAPI.stats(), adminAPI.journals()])
    if (sRes.success) setStats(sRes.stats)
    else toast(sRes.error, 'error')
    if (jRes.success) setJournals(jRes.journals)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addJournal = async e => {
    e.preventDefault()
    if (!journalForm.name) return
    setSaving(true)
    const r = await adminAPI.addJournal(journalForm)
    setSaving(false)
    if (r.success) {
      toast('Periódico adicionado!', 'success')
      setJournalForm({ name: '', issn: '', qualis: 'B1', impact_factor: '' })
      load()
    } else toast(r.error, 'error')
  }

  const QUALIS_COLORS = { 'A1': 'teal', 'A2': 'teal', 'A3': 'green', 'A4': 'green', 'B1': 'gold', 'B2': 'gold', 'B3': 'neutral', 'B4': 'neutral', 'C': 'red' }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Administração</div>
          <div className="page-subtitle">Painel do sistema</div>
        </div>
        <span className="badge badge-red" style={{ padding: '6px 14px' }}>⚠ Acesso restrito</span>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'overview', label: 'Visão geral' },
            { key: 'journals', label: 'Periódicos' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: '0.88rem', fontWeight: 500,
              color: tab === t.key ? 'var(--gold)' : 'var(--text-3)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--gold)' : 'transparent'}`,
              marginBottom: -1, transition: 'all var(--transition)', fontFamily: 'var(--font-body)',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner" /> Carregando...</div>
        ) : tab === 'overview' ? (
          <>
            <div className="stat-grid" style={{ marginBottom: 28 }}>
              <div className="stat-card">
                <div className="stat-label">Usuários</div>
                <div className="stat-value">{stats?.users ?? '—'}</div>
                <div className="stat-sub">contas cadastradas</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Monitores</div>
                <div className="stat-value">{stats?.monitors ?? '—'}</div>
                <div className="stat-sub">no sistema</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Publicações</div>
                <div className="stat-value">{stats?.publications ?? '—'}</div>
                <div className="stat-sub">indexadas</div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: 16 }}>
                Configurações do sistema
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Spreadsheet ID', value: 'Configurado no Apps Script' },
                  { label: 'Versão da API', value: '2.0' },
                  { label: 'Scheduler', value: 'A cada 6 horas (configurar via setupTriggers())' },
                  { label: 'Fontes disponíveis', value: 'PubMed, Crossref, OpenAlex' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-3)', minWidth: 180, letterSpacing: '0.04em' }}>{row.label}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-2)', fontFamily: row.label.includes('ID') || row.label.includes('Versão') ? 'monospace' : 'inherit' }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: 8 }}>
                Segurança
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Gerencie as credenciais de acesso diretamente no Google Apps Script (propriedades do script).
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Add journal form */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: 16 }}>
                Adicionar periódico
              </div>
              <form onSubmit={addJournal}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Nome do periódico *</label>
                    <input className="form-input" value={journalForm.name} onChange={e => setJournalForm(f => ({ ...f, name: e.target.value }))} placeholder="Journal of Wound Care" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISSN</label>
                    <input className="form-input" value={journalForm.issn} onChange={e => setJournalForm(f => ({ ...f, issn: e.target.value }))} placeholder="0000-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualis / Impact Factor</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-input form-select" value={journalForm.qualis} onChange={e => setJournalForm(f => ({ ...f, qualis: e.target.value }))} style={{ flex: 1 }}>
                        {['A1','A2','A3','A4','B1','B2','B3','B4','C'].map(q => <option key={q}>{q}</option>)}
                      </select>
                      <input className="form-input" value={journalForm.impact_factor} onChange={e => setJournalForm(f => ({ ...f, impact_factor: e.target.value }))} placeholder="IF" style={{ width: 70 }} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adicionando...' : '+ Adicionar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Journals table */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-2)' }}>
                {journals.length} periódicos cadastrados
              </div>
              {journals.length === 0 ? (
                <div className="empty-state" style={{ minHeight: 160 }}>
                  <div className="empty-state-title">Nenhum periódico cadastrado</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>ISSN</th>
                        <th>Qualis</th>
                        <th>Impact Factor</th>
                        <th>Cadastrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journals.map(j => (
                        <tr key={j.id}>
                          <td style={{ color: 'var(--text)', fontWeight: 500 }}>{j.name}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{j.issn || '—'}</td>
                          <td><span className={`badge badge-${QUALIS_COLORS[j.qualis] || 'neutral'}`}>{j.qualis}</span></td>
                          <td>{j.impact_factor || '—'}</td>
                          <td>{j.created_at ? new Date(j.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
