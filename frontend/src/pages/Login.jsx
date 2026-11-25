import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa' // Importação dos ícones
import './AuthPages.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Informe um e-mail válido.'
    if (form.senha.length < 8) next.senha = 'A senha deve ter no mínimo 8 caracteres.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true) 

    try {
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

      if (response.ok) {
        const data = await response.json() 
        login(data.token) 
        toast.success('Login realizado com sucesso!')
        navigate(redirectTo, { replace: true })
      } else {
        toast.error('E-mail ou senha incorretos.')
      }
      
    } catch (error) {
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
              {/* Wrapper para posicionar o ícone dentro do input */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  id="senha" 
                  name="senha" 
                  type={showPassword ? "text" : "password"} 
                  value={form.senha} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  disabled={isLoading}
                  style={{ width: '100%', paddingRight: '40px' }} // Espaço extra para o ícone não sobrepor o texto
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position: 'absolute', right: '12px', background: 'transparent',
                    border: 'none', color: '#888', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  tabIndex="-1" // Evita que o usuário pare no ícone ao apertar a tecla TAB
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
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