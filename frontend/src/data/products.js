// Catálogo de produtos da GuinaCar Autopeças.
// As imagens usam placeholders públicos (placehold.co) apenas para fins de demonstração.
const img = (text, bg = '17171a', fg = 'f4f4f3') =>
  `https://placehold.co/600x460/${bg}/${fg}?font=oswald&text=${encodeURIComponent(text)}`

export const products = [
  {
    id: 'pastilha-freio-bosch',
    name: 'Pastilha de Freio Bosch',
    manufacturer: 'Bosch',
    price: 189.9,
    category: 'freios',
    vehicleBrands: ['volkswagen', 'chevrolet', 'fiat'],
    image: img('Pastilha Bosch', '17171a', 'e0122a'),
    description:
      'Pastilhas de freio dianteiras Bosch, desenvolvidas com composto cerâmico de baixo ruído e alta resistência ao desgaste, garantindo frenagem segura e progressiva.',
    specs: [
      { label: 'Posição', value: 'Dianteira' },
      { label: 'Material', value: 'Cerâmico' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'filtro-oleo-fram',
    name: 'Filtro de Óleo Fram',
    manufacturer: 'Fram',
    price: 39.9,
    category: 'lubrificantes',
    vehicleBrands: ['ford', 'toyota', 'honda'],
    image: img('Filtro Fram'),
    description:
      'Filtro de óleo Fram com elemento filtrante de alta capacidade de retenção, protegendo o motor contra partículas contaminantes.',
    specs: [
      { label: 'Tipo', value: 'Rosca' },
      { label: 'Vida útil', value: 'Até 10.000 km' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  {
    id: 'amortecedor-cofap',
    name: 'Amortecedor Cofap',
    manufacturer: 'Cofap',
    price: 279.0,
    category: 'suspensao',
    vehicleBrands: ['fiat', 'chevrolet', 'renault'],
    image: img('Amortecedor Cofap', '17171a', 'e0122a'),
    description:
      'Amortecedor dianteiro Cofap a gás, projetado para maior estabilidade e conforto, mantendo o contato dos pneus com o solo.',
    specs: [
      { label: 'Posição', value: 'Dianteira' },
      { label: 'Tecnologia', value: 'Gás pressurizado' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'farol-honda-civic',
    name: 'Farol Honda Civic',
    manufacturer: 'Original',
    price: 549.0,
    category: 'iluminacao',
    vehicleBrands: ['honda'],
    image: img('Farol Civic'),
    description:
      'Conjunto de farol dianteiro para Honda Civic, com lente em policarbonato de alta transparência e encaixe perfeito de fábrica.',
    specs: [
      { label: 'Lado', value: 'Direito' },
      { label: 'Lâmpada', value: 'H11 / LED compatível' },
      { label: 'Garantia', value: '90 dias' },
    ],
  },
  {
    id: 'kit-embreagem-luk',
    name: 'Kit Embreagem Luk',
    manufacturer: 'Luk',
    price: 689.9,
    category: 'motor',
    vehicleBrands: ['volkswagen', 'audi'],
    image: img('Kit Luk', '17171a', 'e0122a'),
    description:
      'Kit de embreagem completo Luk: disco, platô e rolamento, garantindo troca de marchas precisa e maior vida útil do sistema.',
    specs: [
      { label: 'Itens', value: 'Disco + Platô + Rolamento' },
      { label: 'Aplicação', value: 'Motores 1.6 a 2.0' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'radiador-fiat-uno',
    name: 'Radiador Fiat Uno',
    manufacturer: 'Valeo',
    price: 320.0,
    category: 'arrefecimento',
    vehicleBrands: ['fiat'],
    image: img('Radiador Uno'),
    description:
      'Radiador de arrefecimento para Fiat Uno, com colmeia em alumínio de alta eficiência térmica e caixas plásticas reforçadas.',
    specs: [
      { label: 'Material', value: 'Alumínio / Plástico' },
      { label: 'Câmbio', value: 'Manual e automático' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'correia-dentada-gates',
    name: 'Correia Dentada Gates',
    manufacturer: 'Gates',
    price: 129.9,
    category: 'motor',
    vehicleBrands: ['chevrolet', 'ford', 'hyundai'],
    image: img('Correia Gates', '17171a', 'e0122a'),
    description:
      'Correia dentada Gates em borracha de alta performance, com reforço de fibra de vidro para maior resistência à tração.',
    specs: [
      { label: 'Dentes', value: '144' },
      { label: 'Recomendação', value: 'Trocar a cada 60.000 km' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'bateria-moura',
    name: 'Bateria Moura',
    manufacturer: 'Moura',
    price: 459.0,
    category: 'eletrica',
    vehicleBrands: ['toyota', 'nissan', 'jeep'],
    image: img('Bateria Moura'),
    description:
      'Bateria automotiva Moura de 60Ah, com tecnologia de placas de cálcio-prata para maior durabilidade e menor manutenção.',
    specs: [
      { label: 'Capacidade', value: '60Ah' },
      { label: 'Polaridade', value: 'Positivo à direita' },
      { label: 'Garantia', value: '18 meses' },
    ],
  },
  {
    id: 'oleo-mobil-super',
    name: 'Óleo Mobil Super',
    manufacturer: 'Mobil',
    price: 79.9,
    category: 'lubrificantes',
    vehicleBrands: ['chevrolet', 'volkswagen', 'fiat', 'ford', 'toyota', 'honda'],
    image: img('Óleo Mobil', '17171a', 'e0122a'),
    description:
      'Óleo lubrificante Mobil Super 5W30 semissintético, formulado para proteção contra desgaste em qualquer condição de uso.',
    specs: [
      { label: 'Viscosidade', value: '5W30' },
      { label: 'Volume', value: '1 litro' },
      { label: 'Tipo', value: 'Semissintético' },
    ],
  },
  {
    id: 'disco-freio-trw',
    name: 'Disco de Freio TRW',
    manufacturer: 'TRW',
    price: 249.9,
    category: 'freios',
    vehicleBrands: ['bmw', 'mercedes-benz', 'audi'],
    image: img('Disco TRW'),
    description:
      'Disco de freio ventilado TRW, com tratamento anticorrosivo e usinagem de precisão para frenagem sem vibrações.',
    specs: [
      { label: 'Tipo', value: 'Ventilado' },
      { label: 'Diâmetro', value: '300 mm' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'caixa-direcao-zf',
    name: 'Caixa de Direção ZF',
    manufacturer: 'ZF',
    price: 899.0,
    category: 'direcao',
    vehicleBrands: ['volkswagen', 'chevrolet'],
    image: img('Direção ZF', '17171a', 'e0122a'),
    description:
      'Caixa de direção hidráulica ZF remanufaturada com padrão de fábrica, garantindo precisão e retorno suave ao volante.',
    specs: [
      { label: 'Tipo', value: 'Hidráulica' },
      { label: 'Procedência', value: 'Remanufaturada' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'escapamento-magnaflow',
    name: 'Escapamento Esportivo Magnaflow',
    manufacturer: 'Magnaflow',
    price: 1290.0,
    category: 'escapamento',
    vehicleBrands: ['ford', 'chevrolet'],
    image: img('Escape Magnaflow'),
    description:
      'Sistema de escapamento esportivo Magnaflow em aço inox, com som encorpado e ganho de performance no fluxo de gases.',
    specs: [
      { label: 'Material', value: 'Aço inox 304' },
      { label: 'Ponteira', value: 'Dupla cromada' },
      { label: 'Garantia', value: '24 meses' },
    ],
  },
  {
    id: 'tapete-personalizado',
    name: 'Tapete Automotivo Personalizado',
    manufacturer: 'GuinaCar Acessórios',
    price: 149.9,
    category: 'acessorios',
    vehicleBrands: ['chevrolet', 'volkswagen', 'fiat', 'ford', 'toyota', 'honda', 'hyundai', 'renault', 'nissan', 'jeep', 'peugeot', 'citroen', 'bmw', 'mercedes-benz', 'audi'],
    image: img('Tapete GuinaCar', '17171a', 'e0122a'),
    description:
      'Jogo de tapetes automotivos sob medida, em material emborrachado antiderrapante e fácil higienização.',
    specs: [
      { label: 'Peças', value: '4 unidades' },
      { label: 'Material', value: 'PVC emborrachado' },
      { label: 'Garantia', value: '6 meses' },
    ],
  },
  {
    id: 'vela-ignicao-ngk',
    name: 'Vela de Ignição NGK',
    manufacturer: 'NGK',
    price: 34.9,
    category: 'motor',
    vehicleBrands: ['toyota', 'honda', 'hyundai'],
    image: img('Vela NGK'),
    description:
      'Vela de ignição NGK de irídio, com maior durabilidade e melhor combustão para desempenho consistente do motor.',
    specs: [
      { label: 'Eletrodo', value: 'Irídio' },
      { label: 'Vida útil', value: 'Até 60.000 km' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'amortecedor-monroe',
    name: 'Amortecedor Traseiro Monroe',
    manufacturer: 'Monroe',
    price: 259.0,
    category: 'suspensao',
    vehicleBrands: ['renault', 'peugeot', 'citroen'],
    image: img('Amortecedor Monroe', '17171a', 'e0122a'),
    description:
      'Amortecedor traseiro Monroe com tecnologia de válvulas progressivas, proporcionando conforto e segurança em qualquer piso.',
    specs: [
      { label: 'Posição', value: 'Traseira' },
      { label: 'Tecnologia', value: 'Válvula progressiva' },
      { label: 'Garantia', value: '12 meses' },
    ],
  },
  {
    id: 'lampada-led-philips',
    name: 'Lâmpada LED Philips',
    manufacturer: 'Philips',
    price: 189.0,
    category: 'iluminacao',
    vehicleBrands: ['chevrolet', 'volkswagen', 'fiat', 'ford', 'toyota', 'honda', 'hyundai'],
    image: img('LED Philips'),
    description:
      'Par de lâmpadas LED Philips Ultinon, com até 6000K de temperatura de cor e instalação plug-and-play.',
    specs: [
      { label: 'Temperatura de cor', value: '6000K' },
      { label: 'Vida útil', value: 'Até 12.000 horas' },
      { label: 'Garantia', value: '24 meses' },
    ],
  },
]

export const getProductById = (id) => products.find((p) => p.id === id)
