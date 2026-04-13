import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import { useToast } from '../components/Toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = mode === 'login'
      ? await authAPI.login(form.email, form.password)
      : await authAPI.signup(form.name, form.email, form.password)

    setLoading(false)

    if (res.success) {
      toast(`Bem-vindo, ${res.user.name}!`, 'success')
      navigate('/dashboard')
    } else {
      setError(res.error || 'Ocorreu um erro. Tente novamente.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-lines" />

      {/* decorative orb */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="auth-card">
        <div className="auth-logo">Radar Científico</div>
        <div className="auth-tagline">Vigilância da literatura em saúde</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                className="form-input"
                type="text"
                placeholder="Dr. João Silva"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail institucional</label>
            <input
              className="form-input"
              type="email"
              placeholder="nome@instituicao.br"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className="form-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '4px' }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Aguarde...</>
              : mode === 'login' ? 'Entrar' : 'Criar conta'
            }
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 20 }}>
          {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
          {' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 'inherit' }}
          >
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>

        <div style={{ marginTop: 28, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-2)' }}>Admin padrão:</strong> admin@radar.app / admin123
        </div>
      </div>
    </div>
  )
}
