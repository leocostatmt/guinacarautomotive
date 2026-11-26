import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import AccountLayout from '../components/AccountLayout'
import ProductCard from '../components/ProductCard'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import { fetchCatalogProducts } from '../services/productsApi'
import { getProductById as getStaticProductById } from '../data/products'

export default function MyFavorites() {
  const { favoriteIds, loadingFavorites } = useFavorites()
  const { addToCart } = useCart()
  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)

  useEffect(() => {
    let active = true
    fetchCatalogProducts()
      .then((list) => {
        if (active) setCatalog(list)
      })
      .finally(() => {
        if (active) setLoadingCatalog(false)
      })
    return () => {
      active = false
    }
  }, [])

  const byId = new Map(catalog.map((p) => [p.id, p]))
  const favoriteProducts = favoriteIds
    .map((id) => byId.get(id) || getStaticProductById(id))
    .filter(Boolean)

  const handleAddAllToCart = () => {
    favoriteProducts.forEach((product) => addToCart(product, 1))
    toast.success(`${favoriteProducts.length} itens adicionados ao carrinho!`)
  }

  return (
    <AccountLayout
      eyebrow="Lista de desejos"
      title="Meus Favoritos"
      subtitle="Salve as peças do seu interesse para comparar especificações ou comprar quando precisar."
      breadcrumbLabel="Meus Favoritos"
    >
      {(loadingFavorites || loadingCatalog) && favoriteProducts.length === 0 ? (
        <div className="favorites-grid">
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="account-empty panel">
          <FaHeart />
          <h3>Sua lista de favoritos está vazia</h3>
          <p>
            Clique no ícone de coração em qualquer peça do catálogo para salvar aqui e
            encontrar rapidamente depois.
          </p>
          <Link to="/catalogo" className="btn btn-primary">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="favorites-toolbar panel">
            <span className="favorites-count mono">
              <strong>{favoriteProducts.length}</strong>{' '}
              {favoriteProducts.length === 1 ? 'peça salva' : 'peças salvas'}
            </span>
            <button type="button" className="btn btn-primary" onClick={handleAddAllToCart}>
              <FaShoppingCart /> Adicionar tudo ao carrinho
            </button>
          </div>

          <div className="favorites-grid">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </AccountLayout>
  )
}
