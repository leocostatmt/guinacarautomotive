// Categorias de autopeças oferecidas pela GuinaCar
export const categories = [
  { slug: 'motor', name: 'Motor', icon: 'FaCogs' },
  { slug: 'suspensao', name: 'Suspensão', icon: 'FaCompressArrowsAlt' },
  { slug: 'freios', name: 'Freios', icon: 'FaStopCircle' },
  { slug: 'eletrica', name: 'Elétrica', icon: 'FaBolt' },
  { slug: 'iluminacao', name: 'Iluminação', icon: 'FaLightbulb' },
  { slug: 'arrefecimento', name: 'Arrefecimento', icon: 'FaFan' },
  { slug: 'direcao', name: 'Direção', icon: 'FaCompass' },
  { slug: 'escapamento', name: 'Escapamento', icon: 'FaSmog' },
  { slug: 'lubrificantes', name: 'Lubrificantes', icon: 'FaOilCan' },
  { slug: 'acessorios', name: 'Acessórios', icon: 'FaShoppingBag' },
]

export const getCategoryBySlug = (slug) =>
  categories.find((c) => c.slug === slug)
