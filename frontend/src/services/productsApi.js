import { products as staticProducts, getProductById as getStaticProductById } from '../data/products'

const API_BASE = 'http://localhost:8081'

function slugifyBrand(name = '') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildFallbackImage(name = 'GuinaCar') {
  return `https://placehold.co/600x460/17171a/e0122a?font=oswald&text=${encodeURIComponent(name.slice(0, 24))}`
}

export function normalizeProduct(dto) {
  const images =
    Array.isArray(dto.images) && dto.images.length > 0
      ? dto.images
      : dto.image
        ? [dto.image]
        : [buildFallbackImage(dto.name)]

  const compatibilidades = Array.isArray(dto.compatibilidades) ? dto.compatibilidades : []
  const vehicleBrands = Array.from(
    new Set(compatibilidades.map((c) => slugifyBrand(c.montadora)).filter(Boolean))
  )

  return {
    id: dto.slug,
    dbId: dto.id,
    slug: dto.slug,
    name: dto.name,
    manufacturer: dto.manufacturer,
    price: Number(dto.price),
    stock: dto.stock ?? 0,
    active: dto.active ?? true,
    category: dto.category?.slug || '',
    categoryName: dto.category?.name || '',
    image: dto.image || images[0],
    images,
    description: dto.description || '',
    specs: Array.isArray(dto.specs) ? dto.specs : [],
    compatibilidades,
    vehicleBrands,
  }
}

export async function fetchCatalogProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/produtos?page=0&size=100`)
    if (!res.ok) throw new Error('Falha ao buscar catálogo')
    const data = await res.json()
    const items = Array.isArray(data?.content) ? data.content.map(normalizeProduct) : []
    return items
  } catch (err) {
    console.warn('API de produtos indisponível, usando fallback local:', err)
    return staticProducts
  }
}

export async function fetchProductBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/produtos/${encodeURIComponent(slug)}`)
    if (res.ok) {
      const dto = await res.json()
      return normalizeProduct(dto)
    }
  } catch (err) {
    console.warn('Erro ao buscar produto na API:', err)
  }
  return getStaticProductById(slug) || null
}
