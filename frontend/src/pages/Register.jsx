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
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8081/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf.replace(/\D/g, ''), // Envia apenas os números do CPF para o backend
          telefone: form.telefone.replace(/\D/g, ''), // Envia apenas os números
          email: form.email,
          senha: form.senha,
          confirmarSenha: form.confirmarSenha
        })
      })

      if (response.ok) {
        toast.success('Conta criada com sucesso! Faça login para continuar.')
        navigate('/login')
      } else {
        // Prepara uma mensagem padrão caso o backend não mande nada
        let errorMessage = 'Este e-mail ou CPF já está cadastrado em nosso sistema.'
        
        try {
          // Tenta ler a resposta do Spring Boot como JSON (formato mais comum de APIs)
          const errorData = await response.json()
          
          // Se o seu backend enviar { "message": "E-mail já existe" }, ele pega aqui:
          if (errorData.message) errorMessage = errorData.message
          else if (errorData.error) errorMessage = errorData.error
          
        } catch (e) {
          // Se o backend enviar apenas um texto simples em vez de JSON
          const errorText = await response.text()
          if (errorText && errorText.trim() !== '') {
            errorMessage = errorText
          }
        }

        // Dispara o alerta vermelho na tela com o erro exato
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
              <input id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" disabled={isLoading} />
              {errors.nome && <span className="form-error">{errors.nome}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" disabled={isLoading} />
              {errors.cpf && <span className="form-error">{errors.cpf}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(11) 90000-0000" disabled={isLoading} />
              {errors.telefone && <span className="form-error">{errors.telefone}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@email.com" disabled={isLoading} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="senha">Senha</label>
              <input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="••••••••" disabled={isLoading} />
              {errors.senha && <span className="form-error">{errors.senha}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <input id="confirmarSenha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={handleChange} placeholder="••••••••" disabled={isLoading} />
              {errors.confirmarSenha && <span className="form-error">{errors.confirmarSenha}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Criando Conta...' : 'Criar Conta'}
            </button>
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