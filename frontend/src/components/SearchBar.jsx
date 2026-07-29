import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import './SearchBar.css'

export default function SearchBar({ onSubmit, compact = false }) {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/catalogo?busca=${encodeURIComponent(term)}`)
    if (onSubmit) onSubmit(term)
  }

  return (
    <form className={`search-bar ${compact ? 'search-bar--compact' : ''}`} onSubmit={handleSubmit} role="search">
      <FaSearch className="search-bar-icon" aria-hidden="true" />
      <input
        type="search"
        placeholder="Buscar peças, marcas ou categorias..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Pesquisar produtos"
      />
      <button type="submit" className="search-bar-submit">
        Buscar
      </button>
    </form>
  )
}
