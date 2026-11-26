import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import NotFound from './NotFound'
import { getCategoryBySlug } from '../data/categories'
import { fetchCatalogProducts } from '../services/productsApi'

export default function CategoryProducts() {
  const { slug } = useParams()
  const category = getCategoryBySlug(slug)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchCatalogProducts()
      .then((list) => {
        if (active) setItems(list.filter((p) => p.category === slug))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (!category) return <NotFound />

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Categorias', to: '/categorias' }, { label: category.name }]} />
        <span className="eyebrow">Categoria</span>
        <h1 className="section-heading">{category.name}</h1>
        <p className="section-sub">{items.length} produto(s) disponível(is) nesta categoria.</p>

        {loading ? (
          <div className="grid-auto">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--gray)' }}>
            Nenhum produto cadastrado nesta categoria no momento.
          </div>
        ) : (
          <div className="grid-auto">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}
