import { useState, useEffect, useCallback } from 'react'
import { publicationsAPI, monitorsAPI, notesAPI } from '../lib/api'
import { useToast } from '../components/Toast'

const SOURCE_COLORS = { pubmed: 'teal', crossref: 'gold', openalex: 'neutral' }

function NoteModal({ pub, onClose }) {
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [type, setType] = useState('insight')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    notesAPI.list(pub.id).then(r => { if (r.success) setNotes(r.notes) })
  }, [pub.id])

  const save = async () => {
    if (!content.trim()) return
    setLoading(true)
    const r = await notesAPI.save(pub.id, content, type)
    setLoading(false)
    if (r.success) {
      toast('Nota salva.', 'success')
      setContent('')
      notesAPI.list(pub.id).then(r2 => { if (r2.success) setNotes(r2.notes) })
    } else toast(r.error, 'error')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div className="modal-title">Notas</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem' }}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '0.84rem', color: 'var(--text-2)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.4 }}>
            {pub.title}
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de nota</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['insight','crítica','metodologia','referência'].map(t => (
                <button key={t} type="button"
                  className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nova nota</label>
            <textarea className="form-input form-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Suas anotações sobre este artigo..." style={{ minHeight: 100 }} />
          </div>

          <button className="btn btn-primary" onClick={save} disabled={loading || !content.trim()}>
            {loading ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Salvando...</> : '+ Adicionar nota'}
          </button>

          {notes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div className="divider" />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Notas salvas</div>
              {notes.map(n => (
                <div key={n.id} className="note-card">
                  <div className="note-type-tag">{n.type}</div>
                  <div className="note-content">{n.content}</div>
                  <div className="note-date">{new Date(n.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function ExportModal({ selected, onClose }) {
  const [format, setFormat] = useState('abnt')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const doExport = async () => {
    setLoading(true)
    const r = await publicationsAPI.export([...selected], format)
    setLoading(false)
    if (r.success) setResult(r.content)
    else toast(r.error, 'error')
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    toast('Copiado para a área de transferência!', 'success')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">Exportar referências</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem' }}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '0.84rem', color: 'var(--text-2)' }}>{selected.size} artigo{selected.size !== 1 ? 's' : ''} selecionado{selected.size !== 1 ? 's' : ''}</div>
          <div className="form-group">
            <label className="form-label">Formato</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['abnt','apa','vancouver','bibtex','ris'].map(f => (
                <button key={f} type="button"
                  className={`btn btn-sm ${format === f ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFormat(f)}
                  style={{ textTransform: 'uppercase' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={doExport} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar referências'}
          </button>
          {result && (
            <div>
              <div className="divider" />
              <textarea
                readOnly value={result}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, width: '100%', minHeight: 200, fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-2)', resize: 'vertical' }}
              />
              <button className="btn btn-ghost btn-sm" onClick={copy}>Copiar tudo</button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

export default function PublicationsPage() {
  const [pubs, setPubs] = useState([])
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ monitorId: '', status: '', saved: false, favorite: false })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [noteModal, setNoteModal] = useState(null)
  const [exportModal, setExportModal] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const f = {}
    if (filters.monitorId) f.monitorId = filters.monitorId
    if (filters.status) f.status = filters.status
    if (filters.saved) f.saved = true
    if (filters.favorite) f.favorite = true
    const [pRes, mRes] = await Promise.all([publicationsAPI.list(f), monitorsAPI.list()])
    if (pRes.success) setPubs(pRes.publications)
    if (mRes.success) setMonitors(mRes.monitors)
    setLoading(false)
  }, [filters])

  useEffect(() => { load() }, [load])

  const filtered = pubs.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.authors?.toLowerCase().includes(search.toLowerCase()) ||
    p.journal?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const handleMarkRead = async (p) => {
    if (p.read_status === 'read') return
    await publicationsAPI.markRead(p.match_id)
    setPubs(ps => ps.map(x => x.match_id === p.match_id ? { ...x, read_status: 'read' } : x))
  }

  const handleToggleSaved = async (p) => {
    await publicationsAPI.toggleSaved(p.match_id, !p.saved)
    setPubs(ps => ps.map(x => x.match_id === p.match_id ? { ...x, saved: !x.saved } : x))
    toast(p.saved ? 'Removido dos salvos.' : 'Salvo!', 'success')
  }

  const handleToggleFav = async (p) => {
    await publicationsAPI.toggleFav(p.match_id, !p.favorite)
    setPubs(ps => ps.map(x => x.match_id === p.match_id ? { ...x, favorite: !x.favorite } : x))
  }

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const unreadCount = pubs.filter(p => p.read_status === 'unread').length

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Publicações</div>
          <div className="page-subtitle">
            {filtered.length} artigo{filtered.length !== 1 ? 's' : ''}
            {unreadCount > 0 && <span className="badge badge-gold" style={{ marginLeft: 10 }}>{unreadCount} não lidos</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button className="btn btn-ghost" onClick={() => setExportModal(true)}>
              Exportar {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
            </svg>
            <input className="form-input" placeholder="Buscar por título, autor, periódico..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="form-input form-select" value={filters.monitorId} onChange={e => setFilter('monitorId', e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="">Todos os monitores</option>
            {monitors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <button className={`btn btn-sm ${filters.status === 'unread' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('status', filters.status === 'unread' ? '' : 'unread')}>
            Não lidos
          </button>
          <button className={`btn btn-sm ${filters.saved ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('saved', !filters.saved)}>
            ★ Salvos
          </button>
          <button className={`btn btn-sm ${filters.favorite ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('favorite', !filters.favorite)}>
            ♥ Favoritos
          </button>

          {(filters.status || filters.saved || filters.favorite || filters.monitorId) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ monitorId: '', status: '', saved: false, favorite: false })}>
              Limpar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner" /> Carregando publicações...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 260 }}>
            <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="4" width="28" height="36" rx="2"/>
              <path d="M16 14h16M16 20h16M16 26h10"/>
            </svg>
            <div className="empty-state-title">Nenhuma publicação encontrada</div>
            <div className="empty-state-sub">Execute um monitor ou ajuste os filtros</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className={`pub-card ${p.read_status === 'unread' ? 'unread' : ''}`}
                onClick={() => handleMarkRead(p)}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    onClick={e => e.stopPropagation()}
                    style={{ marginTop: 4, accentColor: 'var(--gold)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pub-title">
                      {p.url
                        ? <a href={p.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{p.title}</a>
                        : p.title
                      }
                    </div>
                    <div className="pub-meta">
                      {p.authors && <span className="truncate" style={{ maxWidth: 280 }}>{p.authors}</span>}
                      {p.journal && <span className="pub-meta-sep">{p.journal}</span>}
                      {p.year && <span className="pub-meta-sep">{p.year}</span>}
                      <span className={`badge badge-${SOURCE_COLORS[p.source] || 'neutral'}`}>{p.source}</span>
                      {p.read_status === 'unread' && <span className="badge badge-gold">Novo</span>}
                    </div>
                  </div>
                  {p.relevance_score > 0 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: 3 }}>Relevância</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: p.relevance_score > 70 ? 'var(--gold)' : 'var(--text-2)' }}>
                        {p.relevance_score}%
                      </div>
                    </div>
                  )}
                </div>

                {p.abstract && <div className="pub-abstract">{p.abstract}</div>}

                <div className="pub-actions" onClick={e => e.stopPropagation()}>
                  <button className={`pub-action-btn ${p.saved ? 'active' : ''}`} onClick={() => handleToggleSaved(p)}>
                    ★ {p.saved ? 'Salvo' : 'Salvar'}
                  </button>
                  <button className={`pub-action-btn ${p.favorite ? 'active' : ''}`} onClick={() => handleToggleFav(p)}>
                    ♥ Favorito
                  </button>
                  <button className="pub-action-btn" onClick={() => setNoteModal(p)}>
                    ✎ Notas
                  </button>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="pub-action-btn" style={{ textDecoration: 'none', color: 'var(--text-3)' }}>
                      ↗ Abrir
                    </a>
                  )}
                  {p.doi && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                      DOI: {p.doi}
                    </span>
                  )}
                </div>

                {p.relevance_score > 0 && (
                  <div className="relevance-bar" style={{ width: `${p.relevance_score}%` }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {noteModal && <NoteModal pub={noteModal} onClose={() => setNoteModal(null)} />}
      {exportModal && <ExportModal selected={selected} onClose={() => setExportModal(false)} />}
    </>
  )
}
