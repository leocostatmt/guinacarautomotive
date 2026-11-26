import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import NotFound from './NotFound'
import { getBrandBySlug } from '../data/brands'
import { fetchCatalogProducts } from '../services/productsApi'

export default function BrandProducts() {
  const { slug } = useParams()
  const brand = getBrandBySlug(slug)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchCatalogProducts()
      .then((list) => {
        if (active) setItems(list.filter((p) => (p.vehicleBrands || []).includes(slug)))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (!brand) return <NotFound />

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Marcas', to: '/marcas' }, { label: brand.name }]} />
        <span className="eyebrow">Peças compatíveis</span>
        <h1 className="section-heading">{brand.name}</h1>
        <p className="section-sub">{items.length} peça(s) compatível(is) com veículos {brand.name}.</p>

        {loading ? (
          <div className="grid-auto">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--gray)' }}>
            Ainda não há peças cadastradas para esta marca.
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
