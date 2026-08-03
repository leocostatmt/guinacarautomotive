import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaShippingFast, FaCertificate, FaShieldAlt, FaHeadset } from 'react-icons/fa'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import { products } from '../data/products'
import './Home.css'

const highlights = [
  { icon: <FaShippingFast />, title: 'Entrega rápida', text: 'Envio para todo o Brasil com rastreio em tempo real.' },
  { icon: <FaCertificate />, title: 'Produtos originais', text: 'Peças de marcas homologadas pelas montadoras.' },
  { icon: <FaShieldAlt />, title: 'Garantia', text: 'Garantia de fábrica em todos os itens do catálogo.' },
  { icon: <FaHeadset />, title: 'Atendimento especializado', text: 'Equipe técnica pronta para tirar suas dúvidas.' },
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const featured = products.slice(0, 8)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="page home">
      {/* Banner principal */}
      <section className="hero">
        <div className="hero-stripe" aria-hidden="true" />
        <div className="container hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="eyebrow">Guinacar Autopeças</span>
            <h1 className="hero-title">
              Encontre as melhores peças automotivas com qualidade garantida.
            </h1>
            <p className="hero-subtitle">
              Peças para diversas marcas, entrega rápida e preços competitivos.
            </p>
            <Link to="/catalogo" className="btn btn-primary hero-cta">
              Ver Catálogo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Destaques */}
      <section className="page-section">
        <div className="container">
          <div className="highlights-grid">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                className="highlight-card panel"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="highlight-icon">{h.icon}</div>
                <h3 className="highlight-title">{h.title}</h3>
                <p>{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="page-section">
        <div className="container">
          <span className="eyebrow">Selecionados para você</span>
          <h2 className="section-heading">Produtos em destaque</h2>
          <p className="section-sub">
            Os itens mais procurados da nossa loja, prontos para envio imediato.
          </p>
          <div className="grid-auto">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
