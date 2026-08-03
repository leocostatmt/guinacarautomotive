import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import './AuthPages.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false) // Novo estado para controlar o botão

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Informe um e-mail válido.'
    if (form.senha.length < 6) next.senha = 'A senha deve ter no mínimo 6 caracteres.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true) // Desabilita o botão enquanto carrega

    try {
      // Dispara a requisição para o seu Spring Boot
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          senha: form.senha
        })
      })

      // Se o Spring Boot retornar 200 OK
      if (response.ok) {
        // Dependendo de como você montou o backend, ele pode retornar texto ou JSON.
        // Se ele retornar o Token JWT em JSON, use: const data = await response.json()
        // e depois salve: localStorage.setItem('token', data.token)
        
        toast.success('Login realizado com sucesso!')
        navigate('/')
      } 
      // Se o Spring Boot retornar 401 Unauthorized ou 403 Forbidden
      else {
        toast.error('E-mail ou senha incorretos.')
      }
      
    } catch (error) {
      // Cai aqui se o backend estiver desligado ou der erro de CORS
      console.error("Erro na requisição:", error)
      toast.error('Erro ao conectar com o servidor. Tente novamente mais tarde.')
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
          <span className="eyebrow">Bem-vindo de volta</span>
          <h1 className="section-heading">Entrar na conta</h1>

          <form onSubmit={handleSubmit} noValidate>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
            <span>
              Não possui conta? <Link to="/cadastro">Cadastre-se</Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}