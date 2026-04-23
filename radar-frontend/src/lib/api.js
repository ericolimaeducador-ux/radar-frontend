// ─── CONFIGURAÇÃO ────────────────────────────────────────────
// Substitua pela URL do seu Web App publicado no Google Apps Script
const SCRIPT_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/SEU_ID_AQUI/exec'

// ─── TOKEN STORE ─────────────────────────────────────────────
export const auth = {
  getToken: () => localStorage.getItem('radar_token'),
  getUser:  () => JSON.parse(localStorage.getItem('radar_user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('radar_token', token)
    localStorage.setItem('radar_user', JSON.stringify(user))
  },
  clearSession: () => {
    localStorage.removeItem('radar_token')
    localStorage.removeItem('radar_user')
  },
  isLoggedIn: () => !!localStorage.getItem('radar_token'),
}

// ─── CORE ────────────────────────────────────────────────────
export async function api(action, data = {}) {
  const body = { action, token: auth.getToken() || '', data }
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!json.success && json.error?.includes('Sessão inválida')) {
      auth.clearSession()
      window.location.hash = '/'
    }
    return json
  } catch (err) {
    return { success: false, error: err.message || 'Erro de conexão.' }
  }
}

// ─── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  async login(email, password) {
    const res = await api('auth.login', { email, password })
    if (res.success) auth.setSession(res.token, res.user)
    return res
  },
  async signup(name, email, password) {
    const res = await api('auth.signup', { name, email, password })
    if (res.success) auth.setSession(res.token, res.user)
    return res
  },
  async logout() {
    await api('auth.logout')
    auth.clearSession()
  },
}

// ─── MÓDULOS ─────────────────────────────────────────────────
export const monitorsAPI = {
  list:   ()           => api('monitors.list'),
  create: (data)       => api('monitors.create', data),
  update: (id, u)      => api('monitors.update', { id, updates: u }),
  delete: (id)         => api('monitors.delete', { id }),
  run:    (id)         => api('monitors.run', { id }),
}

export const publicationsAPI = {
  list:         (f = {}) => api('publications.list', f),
  markRead:     (mid)    => api('publications.updateStatus', { matchId: mid, updates: { read_status: 'read' } }),
  toggleSaved:  (mid, v) => api('publications.updateStatus', { matchId: mid, updates: { saved: v } }),
  toggleFav:    (mid, v) => api('publications.updateStatus', { matchId: mid, updates: { favorite: v } }),
  export:       (ids, f) => api('publications.export', { ids, format: f }),
}

export const notesAPI = {
  list:   (pubId)            => api('notes.list', { publicationId: pubId }),
  save:   (pubId, content, type) => api('notes.save', { publicationId: pubId, content, type: type || 'insight' }),
}

export const collectionsAPI = {
  list:   ()          => api('collections.list'),
  create: (name, desc) => api('collections.create', { name, description: desc }),
}

export const dashboardAPI = {
  stats: () => api('dashboard.stats'),
}

export const adminAPI = {
  stats:    ()  => api('admin.stats'),
  journals: ()  => api('admin.journals'),
  addJournal: (j) => api('admin.addJournal', j),
}
