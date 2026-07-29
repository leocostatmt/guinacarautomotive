import { Link } from 'react-router-dom'
import { FaCarSide } from 'react-icons/fa'
import Breadcrumb from '../components/Breadcrumb'
import { brands } from '../data/brands'
import { products } from '../data/products'
import './Brands.css'

export default function Brands() {
  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Marcas' }]} />
        <span className="eyebrow">Compatibilidade garantida</span>
        <h1 className="section-heading">Marcas atendidas</h1>
        <p className="section-sub">
          Selecione a marca do seu veículo para ver todas as peças compatíveis.
        </p>

        <div className="brands-grid">
          {brands.map((brand) => {
            const count = products.filter((p) => p.vehicleBrands.includes(brand.slug)).length
            return (
              <Link key={brand.slug} to={`/marcas/${brand.slug}`} className="brand-card panel">
                <FaCarSide className="brand-icon" />
                <h3>{brand.name}</h3>
                <span className="mono brand-count">{count} peça(s)</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
