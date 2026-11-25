import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaUser, FaBoxOpen, FaHeart, FaSignOutAlt } from 'react-icons/fa'
import Breadcrumb from './Breadcrumb'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import '../pages/AccountPages.css'

export default function AccountLayout({ eyebrow, title, subtitle, breadcrumbLabel, children }) {
  const { user, logout } = useAuth()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Você saiu da conta com sucesso.')
    navigate('/')
  }

  const initials = user?.nome
    ? user.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'GC'

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Conta', to: '/minha-conta' }, ...(breadcrumbLabel ? [{ label: breadcrumbLabel }] : [])]} />

        <div className="account-header">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="section-heading">{title}</h1>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>

        <div className="account-layout">
          <aside className="account-sidebar panel">
            <div className="account-user-card">
              <div className="account-avatar mono">{initials}</div>
              <div className="account-user-meta">
                <strong>{user?.nome || 'Cliente GuinaCar'}</strong>
                <span>{user?.email || 'Carregando dados...'}</span>
              </div>
            </div>

            <nav className="account-nav" aria-label="Navegação da conta">
              <NavLink
                to="/minha-conta"
                className={({ isActive }) => `account-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <FaUser />
                <span>Minha Conta</span>
              </NavLink>

              <NavLink
                to="/meus-pedidos"
                className={({ isActive }) => `account-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <FaBoxOpen />
                <span>Meus Pedidos</span>
              </NavLink>

              <NavLink
                to="/meus-favoritos"
                className={({ isActive }) => `account-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <FaHeart />
                <span>Meus Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="account-nav-badge mono">{favoritesCount}</span>
                )}
              </NavLink>

              <button type="button" onClick={handleLogout} className="account-nav-link account-nav-logout">
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </nav>
          </aside>

          <section className="account-content">{children}</section>
        </div>
      </div>
    </div>
  )
}
