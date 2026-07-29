import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaUserPlus } from 'react-icons/fa'
import Logo from './Logo'
import SearchBar from './SearchBar'
import { useCart } from '../context/CartContext'
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

  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Logo />

        <div className="navbar-search-desktop">
          <SearchBar compact />
        </div>

        <nav className={`navbar-links ${open ? 'is-open' : ''}`}>
          <div className="navbar-search-mobile">
            <SearchBar compact onSubmit={() => close()} />
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={close}
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="navbar-auth-mobile">
            <NavLink to="/login" onClick={close} className="navbar-link">Login</NavLink>
            <NavLink to="/cadastro" onClick={close} className="navbar-link">Cadastro</NavLink>
          </div>
        </nav>

        <div className="navbar-actions">
          <NavLink to="/login" className="navbar-icon-link" title="Login">
            <FaUser />
            <span>Login</span>
          </NavLink>
          <NavLink to="/cadastro" className="navbar-icon-link" title="Cadastro">
            <FaUserPlus />
            <span>Cadastro</span>
          </NavLink>
          <NavLink to="/carrinho" className="navbar-cart" title="Carrinho">
            <FaShoppingCart />
            {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
          </NavLink>

          <button
            className="navbar-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  )
}
