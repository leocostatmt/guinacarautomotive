// Marcas de veículos atendidas pela GuinaCar
export const brands = [
  { slug: 'chevrolet', name: 'Chevrolet' },
  { slug: 'volkswagen', name: 'Volkswagen' },
  { slug: 'fiat', name: 'Fiat' },
  { slug: 'ford', name: 'Ford' },
  { slug: 'toyota', name: 'Toyota' },
  { slug: 'honda', name: 'Honda' },
  { slug: 'hyundai', name: 'Hyundai' },
  { slug: 'renault', name: 'Renault' },
  { slug: 'nissan', name: 'Nissan' },
  { slug: 'jeep', name: 'Jeep' },
  { slug: 'peugeot', name: 'Peugeot' },
  { slug: 'citroen', name: 'Citroën' },
  { slug: 'bmw', name: 'BMW' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
  { slug: 'audi', name: 'Audi' },
]

export const getBrandBySlug = (slug) => brands.find((b) => b.slug === slug)
