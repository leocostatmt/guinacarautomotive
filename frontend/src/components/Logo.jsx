import { Link } from 'react-router-dom'
import { FaGasPump } from 'react-icons/fa'
import './Logo.css'

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="GuinaCar Autopeças — voltar ao início">
      <span className="logo-icon">
        <FaGasPump />
      </span>
      <span className="logo-text">
        GUINA<span className="logo-accent">CAR</span>
      </span>
    </Link>
  )
}
