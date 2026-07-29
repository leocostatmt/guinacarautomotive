import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import './AuthPages.css'

const initialForm = { nome: '', cpf: '', telefone: '', email: '', senha: '', confirmarSenha: '' }

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const next = {}
    if (form.nome.trim().split(' ').filter(Boolean).length < 2) {
      next.nome = 'Informe seu nome completo.'
    }
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      next.cpf = 'CPF deve conter 11 dígitos.'
    }
    if (form.telefone.replace(/\D/g, '').length < 10) {
      next.telefone = 'Informe um telefone válido com DDD.'
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Informe um e-mail válido.'
    }
    if (form.senha.length < 6) {
      next.senha = 'A senha deve ter no mínimo 6 caracteres.'
    }
    if (form.confirmarSenha !== form.senha) {
      next.confirmarSenha = 'As senhas não coincidem.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    toast.success('Conta criada com sucesso! Faça login para continuar.')
    navigate('/login')
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
          <span className="eyebrow">Junte-se à GuinaCar</span>
          <h1 className="section-heading">Criar conta</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" />
              {errors.nome && <span className="form-error">{errors.nome}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
              {errors.cpf && <span className="form-error">{errors.cpf}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(11) 90000-0000" />
              {errors.telefone && <span className="form-error">{errors.telefone}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@email.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="senha">Senha</label>
              <input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="••••••••" />
              {errors.senha && <span className="form-error">{errors.senha}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <input id="confirmarSenha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={handleChange} placeholder="••••••••" />
              {errors.confirmarSenha && <span className="form-error">{errors.confirmarSenha}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block">Criar Conta</button>
          </form>

          <div className="auth-links">
            <span>
              Já possui conta? <Link to="/login">Fazer login</Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
