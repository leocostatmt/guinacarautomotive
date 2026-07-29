import { Link } from 'react-router-dom'
import {
  FaCogs, FaCompressArrowsAlt, FaStopCircle, FaBolt, FaLightbulb,
  FaFan, FaCompass, FaSmog, FaOilCan, FaShoppingBag,
} from 'react-icons/fa'
import Breadcrumb from '../components/Breadcrumb'
import { categories } from '../data/categories'
import { products } from '../data/products'
import './Categories.css'

const iconMap = {
  FaCogs: <FaCogs />,
  FaCompressArrowsAlt: <FaCompressArrowsAlt />,
  FaStopCircle: <FaStopCircle />,
  FaBolt: <FaBolt />,
  FaLightbulb: <FaLightbulb />,
  FaFan: <FaFan />,
  FaCompass: <FaCompass />,
  FaSmog: <FaSmog />,
  FaOilCan: <FaOilCan />,
  FaShoppingBag: <FaShoppingBag />,
}

export default function Categories() {
  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Categorias' }]} />
        <span className="eyebrow">Explore por categoria</span>
        <h1 className="section-heading">Categorias de peças</h1>
        <p className="section-sub">
          Encontre rapidamente o sistema do veículo que você precisa reparar.
        </p>

        <div className="categories-grid">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length
            return (
              <Link key={cat.slug} to={`/categorias/${cat.slug}`} className="category-card panel">
                <span className="category-icon">{iconMap[cat.icon]}</span>
                <h3>{cat.name}</h3>
                <span className="category-count mono">{count} produto(s)</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
