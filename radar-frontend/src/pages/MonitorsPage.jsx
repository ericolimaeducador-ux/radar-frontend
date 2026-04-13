import { useState, useEffect } from 'react'
import { monitorsAPI } from '../lib/api'
import { useToast } from '../components/Toast'

const SOURCES = ['pubmed','crossref','openalex']
const FREQUENCIES = [
  { value: 'daily',     label: 'Diária' },
  { value: 'weekly',    label: 'Semanal' },
  { value: 'biweekly',  label: 'Quinzenal' },
  { value: 'monthly',   label: 'Mensal' },
]

function MonitorModal({ monitor, onClose, onSaved }) {
  const toast = useToast()
  const editing = !!monitor?.id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:             monitor?.name || '',
    research_question:monitor?.research_question || '',
    keywords:         monitor?.keywords || '',
    boolean_query:    monitor?.boolean_query || '',
    sources:          monitor?.sources ? JSON.parse(monitor.sources) : SOURCES,
    frequency:        monitor?.frequency || 'weekly',
    language_filter:  monitor?.language_filter || 'all',
    study_type_filter:monitor?.study_type_filter || 'all',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleSource = s => set('sources', form.sources.includes(s)
    ? form.sources.filter(x => x !== s)
    : [...form.sources, s]
  )

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const res = editing
      ? await monitorsAPI.update(monitor.id, form)
      : await monitorsAPI.create(form)
    setLoading(false)
    if (res.success) {
      toast(editing ? 'Monitor atualizado.' : 'Monitor criado com sucesso!', 'success')
      onSaved()
    } else {
      toast(res.error, 'error')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editing ? 'Editar monitor' : 'Novo monitor de literatura'}</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome do monitor *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Feridas crônicas em diabéticos" required />
            </div>

            <div className="form-group">
              <label className="form-label">Pergunta de pesquisa</label>
              <textarea className="form-input form-textarea" value={form.research_question} onChange={e => set('research_question', e.target.value)} placeholder="Qual o efeito de X em Y?" style={{ minHeight: 70 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Palavras-chave *</label>
              <input className="form-input" value={form.keywords} onChange={e => set('keywords', e.target.value)} placeholder="wound healing, chronic wound, diabetes" required />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Separe com vírgulas</span>
            </div>

            <div className="form-group">
              <label className="form-label">Consulta booleana (opcional)</label>
              <input className="form-input" value={form.boolean_query} onChange={e => set('boolean_query', e.target.value)} placeholder='("wound healing") AND (diabetes OR "type 2")' style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Fontes de busca</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SOURCES.map(s => (
                  <button
                    key={s} type="button"
                    className={`btn btn-sm ${form.sources.includes(s) ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => toggleSource(s)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Frequência</label>
                <select className="form-input form-select" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Idioma</label>
                <select className="form-input form-select" value={form.language_filter} onChange={e => set('language_filter', e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="en">Inglês</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Salvando...</> : editing ? 'Salvar' : 'Criar monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | monitor obj
  const [running, setRunning] = useState({})
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    const res = await monitorsAPI.list()
    if (res.success) setMonitors(res.monitors)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRun = async (id) => {
    setRunning(r => ({ ...r, [id]: true }))
    const res = await monitorsAPI.run(id)
    setRunning(r => ({ ...r, [id]: false }))
    if (res.success) {
      toast(`✓ ${res.results.newFound} novos artigos encontrados`, 'success')
      load()
    } else {
      toast(res.error, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este monitor?')) return
    const res = await monitorsAPI.delete(id)
    if (res.success) { toast('Monitor removido.', 'info'); load() }
    else toast(res.error, 'error')
  }

  const handleToggleStatus = async (m) => {
    const newStatus = m.status === 'active' ? 'paused' : 'active'
    const res = await monitorsAPI.update(m.id, { status: newStatus })
    if (res.success) load()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Monitores</div>
          <div className="page-subtitle">{monitors.length} monitor{monitors.length !== 1 ? 'es' : ''} configurado{monitors.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>+ Novo monitor</button>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Carregando monitores...</div>
        ) : monitors.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="24" cy="24" r="20"/><circle cx="24" cy="24" r="8"/>
              <path d="M24 4v4M24 40v4M4 24h4M40 24h4"/>
            </svg>
            <div className="empty-state-title">Nenhum monitor ainda</div>
            <div className="empty-state-sub">Crie um monitor para começar a capturar literatura automaticamente</div>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setModal('new')}>Criar primeiro monitor</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monitors.map(m => {
              let sources = []
              try { sources = JSON.parse(m.sources) } catch {}
              return (
                <div key={m.id} className="monitor-card">
                  <span className={`monitor-dot ${m.status !== 'active' ? 'paused' : ''}`} />

                  <div className="monitor-info">
                    <div className="monitor-name">{m.name}</div>
                    <div className="monitor-keywords">{m.keywords}</div>
                    <div className="monitor-stats">
                      <div>
                        <span className="monitor-stat-val">{m.total_results || 0}</span>
                        artigos encontrados
                      </div>
                      <div>
                        <span className="monitor-stat-val" style={{ color: 'var(--gold)' }}>{m.new_results || 0}</span>
                        novos
                      </div>
                      <div>
                        <span className="monitor-stat-val" style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>{FREQUENCIES.find(f => f.value === m.frequency)?.label || m.frequency}</span>
                        frequência
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {sources.map(s => (
                        <span key={s} className={`badge badge-${s === 'pubmed' ? 'teal' : s === 'crossref' ? 'gold' : 'neutral'}`}>{s}</span>
                      ))}
                    </div>

                    <div className="monitor-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRun(m.id)}
                        disabled={running[m.id]}
                        title="Executar agora"
                      >
                        {running[m.id]
                          ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Buscando...</>
                          : '▶ Executar'
                        }
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(m)}>Editar</button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggleStatus(m)}
                        style={{ color: m.status === 'active' ? 'var(--red)' : 'var(--green)' }}
                      >
                        {m.status === 'active' ? 'Pausar' : 'Ativar'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Remover</button>
                    </div>

                    {m.last_run && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                        Última execução: {new Date(m.last_run).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <MonitorModal
          monitor={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </>
  )
}
