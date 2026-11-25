import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaUserPlus, FaSignOutAlt, FaRegUserCircle, FaBoxOpen, FaHeart } from 'react-icons/fa'
import Logo from './Logo'
import SearchBar from './SearchBar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = [
  { to: '/', label: 'Página Inicial' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/marcas', label: 'Marcas' },
  { to: '/contato', label: 'Contato' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    toast.success('Você saiu da conta com sucesso.')
    navigate('/')
  }

  // Pega apenas o primeiro nome para a saudação. Se a API ainda estiver carregando, usa um fallback.
  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Conta';

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'is-open' : ''}`}
        onClick={close}
        aria-hidden="true"
      ></div>

      <header className="navbar">
        <div className="navbar-inner container">
          <Logo />

          <div className="navbar-actions">

            {/* DROPDOWN MINHA CONTA (Visível apenas se logado) */}
            {isLoggedIn && (
              <div className="user-dropdown-container">
                <div className="user-dropdown-trigger">
                  <span>Olá, {primeiroNome}</span>
                  <FaRegUserCircle size={20} />
                </div>

                {/* Menu que aparece no Hover */}
                <div className="user-dropdown-menu">
                  <Link to="/minha-conta">Minha Conta</Link>
                  <Link to="/meus-pedidos">Meus Pedidos</Link>
                  <Link to="/meus-favoritos">Meus Favoritos</Link>
                  <button onClick={handleLogout}>Sair</button>
                </div>
              </div>
            )}

            <NavLink to="/carrinho" className="navbar-cart" title="Carrinho">
              <FaShoppingCart />
              {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
            </NavLink>

            <button
              className="navbar-toggle"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <button className="sidebar-close" onClick={close} aria-label="Fechar menu">
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-search">
            <SearchBar compact onSubmit={close} />
          </div>

          <nav className="sidebar-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={close}
                className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-auth">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" onClick={close} className="sidebar-auth-link">
                  <FaUser />
                  <span>Login</span>
                </NavLink>
                <NavLink to="/cadastro" onClick={close} className="sidebar-auth-link">
                  <FaUserPlus />
                  <span>Cadastro</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/minha-conta" onClick={close} className="sidebar-auth-link">
                  <FaUser />
                  <span>Minha Conta</span>
                </NavLink>
                <NavLink to="/meus-pedidos" onClick={close} className="sidebar-auth-link">
                  <FaBoxOpen />
                  <span>Meus Pedidos</span>
                </NavLink>
                <NavLink to="/meus-favoritos" onClick={close} className="sidebar-auth-link">
                  <FaHeart />
                  <span>Meus Favoritos</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="sidebar-auth-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <FaSignOutAlt />
                  <span>Sair da conta</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}