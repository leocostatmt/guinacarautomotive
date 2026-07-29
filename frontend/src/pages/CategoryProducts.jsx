import { useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import NotFound from './NotFound'
import { getCategoryBySlug } from '../data/categories'
import { products } from '../data/products'

export default function CategoryProducts() {
  const { slug } = useParams()
  const category = getCategoryBySlug(slug)

  if (!category) return <NotFound />

  const items = products.filter((p) => p.category === slug)

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Categorias', to: '/categorias' }, { label: category.name }]} />
        <span className="eyebrow">Categoria</span>
        <h1 className="section-heading">{category.name}</h1>
        <p className="section-sub">{items.length} produto(s) disponível(is) nesta categoria.</p>

        {items.length === 0 ? (
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
