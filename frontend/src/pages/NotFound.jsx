import { Link } from 'react-router-dom'
import { FaTools } from 'react-icons/fa'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="page not-found">
      <div className="container not-found-inner">
        <FaTools className="not-found-icon" />
        <span className="mono not-found-code">ERRO 404</span>
        <h1 className="not-found-title">Peça não encontrada</h1>
        <p className="not-found-text">
          A página que você procura saiu de linha ou nunca esteve no nosso estoque.
        </p>
        <Link to="/" className="btn btn-primary">Voltar para a Página Inicial</Link>
      </div>
    </div>
  )
}
