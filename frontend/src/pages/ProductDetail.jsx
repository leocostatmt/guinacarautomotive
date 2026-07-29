import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Breadcrumb from '../components/Breadcrumb'
import NotFound from './NotFound'
import { useCart } from '../context/CartContext'
import { getProductById } from '../data/products'
import { getCategoryBySlug } from '../data/categories'
import { getBrandBySlug } from '../data/brands'
import { formatCurrency } from '../utils/formatCurrency'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!product) return <NotFound />

  const category = getCategoryBySlug(product.category)
  const compatibleBrands = product.vehicleBrands.map(getBrandBySlug).filter(Boolean)

  const handleAdd = () => {
    addToCart(product, quantity)
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho`)
  }

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb
          items={[
            { label: 'Catálogo', to: '/catalogo' },
            ...(category ? [{ label: category.name, to: `/categorias/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="product-detail">
          <div className="product-detail-image panel">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <span className="eyebrow mono">{product.manufacturer}</span>
            <h1 className="product-detail-title">{product.name}</h1>
            <p className="product-detail-price mono">{formatCurrency(product.price)}</p>
            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-specs">
              <h3>Especificações</h3>
              <ul>
                {product.specs.map((spec) => (
                  <li key={spec.label}>
                    <span className="mono">{spec.label}</span>
                    <span>{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="product-detail-compat">
              <h3>Compatibilidade com veículos</h3>
              <div className="product-detail-compat-tags">
                {compatibleBrands.map((b) => (
                  <span key={b.slug} className="mono">{b.name}</span>
                ))}
              </div>
            </div>

            <div className="product-detail-buy">
              <div className="cart-item-qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">−</button>
                <span className="mono">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar quantidade">+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAdd}>
                <FaShoppingCart /> Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
