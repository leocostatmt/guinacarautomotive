import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getCategoryBySlug } from '../data/categories'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const category = getCategoryBySlug(product.category)

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(product, 1)
    toast.success(`${product.name} adicionado ao carrinho`)
  }

  return (
    <article className="product-card panel">
      <Link to={`/produto/${product.id}`} className="product-card-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {category && <span className="product-card-tag">{category.name}</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-card-brand mono">{product.manufacturer}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price mono">{formatCurrency(product.price)}</p>
        <div className="product-card-actions">
          <Link to={`/produto/${product.id}`} className="btn btn-outline">
            Ver detalhes
          </Link>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FaShoppingCart /> Adicionar
          </button>
        </div>
      </div>
    </article>
  )
}
