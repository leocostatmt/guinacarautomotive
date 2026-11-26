import { Link } from 'react-router-dom'
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatCurrency } from '../utils/formatCurrency'
import { getCategoryBySlug } from '../data/categories'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const category = getCategoryBySlug(product.category)
  const categoryLabel = product.categoryName || category?.name
  const favorited = isFavorite(product.id)

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(product, 1)
    toast.success(`${product.name} adicionado ao carrinho`)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  return (
    <article className="product-card panel">
      <div className="product-card-media-wrap">
        <Link to={`/produto/${product.id}`} className="product-card-media">
          <img src={product.image} alt={product.name} loading="lazy" />
          {categoryLabel && <span className="product-card-tag">{categoryLabel}</span>}
        </Link>
        <button
          type="button"
          className={`product-card-fav ${favorited ? 'is-active' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          title={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          {favorited ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
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
