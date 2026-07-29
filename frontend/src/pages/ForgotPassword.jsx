import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import './AuthPages.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Informe um e-mail válido.')
      return
    }
    setError('')
    setSent(true)
  }

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <motion.div
          className="auth-card panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="eyebrow">Recuperação de senha</span>
          <h1 className="section-heading">Esqueceu sua senha?</h1>

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate>
              <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: 18 }}>
                Informe seu e-mail cadastrado para receber o link de recuperação.
              </p>
              <div className="form-field">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
                {error && <span className="form-error">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary btn-block">Enviar</button>
            </form>
          ) : (
            <div className="auth-success">
              <FaCheckCircle style={{ color: 'var(--red)', marginRight: 8 }} />
              Se este e-mail estiver cadastrado, um link de recuperação foi enviado para <strong>{email}</strong>.
            </div>
          )}

          <div className="auth-links">
            <span>
              Lembrou a senha? <Link to="/login">Voltar para o login</Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
