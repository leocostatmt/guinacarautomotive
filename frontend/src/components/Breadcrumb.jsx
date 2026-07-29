import { Link } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
import './Breadcrumb.css'

/**
 * items: [{ label: 'Catálogo', to: '/catalogo' }, { label: 'Pastilha de Freio' }]
 * The last item is rendered as plain text (current page).
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      <Link to="/">Início</Link>
      {items.map((item, i) => (
        <span key={i} className="breadcrumb-item">
          <FaChevronRight className="breadcrumb-sep" aria-hidden="true" />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
