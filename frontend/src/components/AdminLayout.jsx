import { NavLink, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaChartLine,
  FaBoxOpen,
  FaTruck,
  FaCubes,
  FaUsers,
  FaUserTie,
  FaFileInvoiceDollar,
  FaStore,
  FaSignOutAlt,
  FaShieldAlt,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import '../pages/admin/AdminPages.css'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: FaChartLine, roles: ['ADMIN'], end: true },
  { to: '/admin/pedidos', label: 'Pedidos & Envios', icon: FaTruck, roles: ['ADMIN', 'FUNCIONARIO'] },
  { to: '/admin/produtos', label: 'Produtos', icon: FaCubes, roles: ['ADMIN', 'FUNCIONARIO'] },
  { to: '/admin/clientes', label: 'Clientes', icon: FaUsers, roles: ['ADMIN'] },
  { to: '/admin/funcionarios', label: 'Funcionários', icon: FaUserTie, roles: ['ADMIN'] },
  { to: '/admin/relatorios', label: 'Relatórios', icon: FaFileInvoiceDollar, roles: ['ADMIN'] },
]

export default function AdminLayout({ eyebrow = 'Central do Vendedor', title, subtitle, actions, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Sessão encerrada.')
    navigate('/')
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  return (
    <div className="page admin-page">
      <div className="admin-shell container">
        <aside className="admin-sidebar panel">
          <div className="admin-brand-box">
            <div className="admin-brand-badge">
              <FaShieldAlt />
              <span className="mono">{user?.role === 'ADMIN' ? 'ADMIN · DONO' : 'FUNCIONÁRIO'}</span>
            </div>
            <strong>{user?.nome || 'Gestor GuinaCar'}</strong>
            <small>{user?.email}</small>
          </div>

          <nav className="admin-nav" aria-label="Menu da Central do Administrador">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <Link to="/" className="admin-nav-link">
              <FaStore />
              <span>Voltar à Loja</span>
            </Link>
            <button type="button" onClick={handleLogout} className="admin-nav-link admin-logout-btn">
              <FaSignOutAlt />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h1 className="section-heading">{title}</h1>
              {subtitle && <p className="admin-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="admin-topbar-actions">{actions}</div>}
          </header>

          <div className="admin-content">{children}</div>
        </section>
      </div>
    </div>
  )
}
