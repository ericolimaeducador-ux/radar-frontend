import { useState, useEffect } from 'react'
import { notesAPI, collectionsAPI } from '../lib/api'
import { useToast } from '../components/Toast'

function CollectionModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const save = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    const r = await collectionsAPI.create(form.name, form.description)
    setLoading(false)
    if (r.success) { toast('Coleção criada!', 'success'); onSaved() }
    else toast(r.error, 'error')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">Nova coleção</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem' }}>×</button>
        </div>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Revisão sistemática 2025" required />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Propósito desta coleção..." style={{ minHeight: 80 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar coleção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NotesCollectionsPage() {
  const [tab, setTab] = useState('notes')
  const [notes, setNotes] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [collModal, setCollModal] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const [nRes, cRes] = await Promise.all([notesAPI.list(), collectionsAPI.list()])
    if (nRes.success) setNotes(nRes.notes)
    if (cRes.success) setCollections(cRes.collections)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filteredNotes = notes.filter(n =>
    !search || n.content?.toLowerCase().includes(search.toLowerCase())
  )

  const NOTE_TYPE_COLORS = {
    insight: 'var(--teal)',
    crítica: 'var(--red)',
    metodologia: 'var(--gold)',
    referência: 'var(--green)',
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Notas & Coleções</div>
          <div className="page-subtitle">Organize seu conhecimento</div>
        </div>
        {tab === 'collections' && (
          <button className="btn btn-primary" onClick={() => setCollModal(true)}>+ Nova coleção</button>
        )}
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'notes', label: `Notas (${notes.length})` },
            { key: 'collections', label: `Coleções (${collections.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 20px',
                fontSize: '0.88rem', fontWeight: 500,
                color: tab === t.key ? 'var(--gold)' : 'var(--text-3)',
                borderBottom: `2px solid ${tab === t.key ? 'var(--gold)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><span className="spinner" /> Carregando...</div>
        ) : tab === 'notes' ? (
          <>
            <div className="search-input-wrap" style={{ maxWidth: 360, marginBottom: 16 }}>
              <svg className="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
              </svg>
              <input className="form-input" placeholder="Buscar nas notas..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {filteredNotes.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 240 }}>
                <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 8h24a2 2 0 012 2v28a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z"/>
                  <path d="M16 18h16M16 24h16M16 30h8"/>
                </svg>
                <div className="empty-state-title">Nenhuma nota ainda</div>
                <div className="empty-state-sub">Adicione notas diretamente nas publicações</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {filteredNotes.map(n => (
                  <div key={n.id} className="note-card" style={{ borderLeft: `3px solid ${NOTE_TYPE_COLORS[n.type] || 'var(--border)'}` }}>
                    <div className="note-type-tag" style={{ color: NOTE_TYPE_COLORS[n.type] || 'var(--teal)' }}>
                      {n.type}
                    </div>
                    <div className="note-content">{n.content}</div>
                    <div className="note-date">{new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {collections.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 240 }}>
                <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="6" y="16" width="36" height="26" rx="2"/>
                  <path d="M14 16V12a2 2 0 012-2h16a2 2 0 012 2v4"/>
                </svg>
                <div className="empty-state-title">Nenhuma coleção</div>
                <div className="empty-state-sub">Crie coleções para organizar artigos por tema ou projeto</div>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setCollModal(true)}>Criar coleção</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {collections.map(c => (
                  <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'border-color var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'var(--gold-dim)', border: '1px solid var(--border-hi)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                      }}>📁</div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          Criada em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    {c.description && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{c.description}</div>
                    )}
                  </div>
                ))}

                <div
                  className="card"
                  style={{ border: '1px dashed var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 100, color: 'var(--text-3)' }}
                  onClick={() => setCollModal(true)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.4rem' }}>+</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Nova coleção</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {collModal && <CollectionModal onClose={() => setCollModal(false)} onSaved={() => { setCollModal(false); load() }} />}
    </>
  )
}
