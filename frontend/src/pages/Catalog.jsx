import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import { products } from '../data/products'
import { categories } from '../data/categories'
import { brands } from '../data/brands'
import './Catalog.css'

const PAGE_SIZE = 8

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const term = searchParams.get('busca') || ''
  const categoryFilter = searchParams.get('categoria') || ''
  const brandFilter = searchParams.get('marca') || ''
  const sort = searchParams.get('ordenar') || ''

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [term, categoryFilter, brandFilter, sort])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (term) {
      const q = term.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter)
    if (brandFilter) list = list.filter((p) => p.vehicleBrands.includes(brandFilter))

    if (sort === 'menor-preco') list.sort((a, b) => a.price - b.price)
    if (sort === 'maior-preco') list.sort((a, b) => b.price - a.price)

    return list
  }, [term, categoryFilter, brandFilter, sort])

  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="page">
      <div className="container page-section">
        <Breadcrumb items={[{ label: 'Catálogo' }]} />
        <span className="eyebrow">Catálogo completo</span>
        <h1 className="section-heading">Todas as peças</h1>
        <p className="section-sub">
          Use os filtros abaixo para encontrar exatamente a peça que você precisa.
        </p>

        <div className="catalog-filters panel">
          <div className="form-field">
            <label htmlFor="busca">Buscar por nome</label>
            <input
              id="busca"
              type="text"
              placeholder="Ex: pastilha de freio"
              value={term}
              onChange={(e) => updateParam('busca', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" value={categoryFilter} onChange={(e) => updateParam('categoria', e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="marca">Marca do veículo</label>
            <select id="marca" value={brandFilter} onChange={(e) => updateParam('marca', e.target.value)}>
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="ordenar">Ordenar por preço</label>
            <select id="ordenar" value={sort} onChange={(e) => updateParam('ordenar', e.target.value)}>
              <option value="">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </div>
        </div>

        <p className="catalog-count mono">{filtered.length} produto(s) encontrado(s)</p>

        {loading ? (
          <div className="grid-auto">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="catalog-empty panel">
            <p>Nenhum produto encontrado com esses filtros. Tente ajustar sua busca.</p>
          </div>
        ) : (
          <>
            <div className="grid-auto">
              {visible.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="catalog-load-more">
                <button className="btn btn-outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Carregar mais produtos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
