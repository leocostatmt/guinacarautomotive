import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import NotFound from './NotFound'
import { getBrandBySlug } from '../data/brands'
import { products } from '../data/products'

export default function BrandProducts() {
  const { slug } = useParams()
  const brand = getBrandBySlug(slug)

  if (!brand) return <NotFound />

  const items = products.filter((p) => p.vehicleBrands.includes(slug))

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Marcas', to: '/marcas' }, { label: brand.name }]} />
        <span className="eyebrow">Peças compatíveis</span>
        <h1 className="section-heading">{brand.name}</h1>
        <p className="section-sub">{items.length} peça(s) compatível(is) com veículos {brand.name}.</p>

        {items.length === 0 ? (
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
