import { useState } from 'react'
import { NavLink, redirect } from 'react-router-dom'
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import Logo from './Logo'
import SearchBar from './SearchBar'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' // Importando o contexto de autenticação
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
  
  // Trazendo o estado de login e a função de deslogar
  const { isLoggedIn, logout } = useAuth() 

  const close = () => setOpen(false)

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
            {/* LÓGICA DE EXIBIÇÃO CONDICIONAL */}
            {!isLoggedIn ? (
              // SE NÃO ESTIVER LOGADO: Mostra Login e Cadastro
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
              // SE ESTIVER LOGADO: Mostra botão de Sair
              <button 
                onClick={() => { 
                  logout(); 
                  close(); 
                  redirect('/'); // Redireciona para a página inicial após logout
                }} 
                className="sidebar-auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left', fontFamily: 'inherit' }}
              >
                <FaSignOutAlt />
                <span>Sair da conta</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}