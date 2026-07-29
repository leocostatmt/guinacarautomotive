# GuinaCar Autopeças

Loja virtual de autopeças construída com **React + Vite**, com catálogo, categorias,
marcas, carrinho persistente, autenticação simulada e identidade visual própria
(preto, vermelho e branco).

## Como rodar o projeto

```bash
npm install
npm run dev
```

Depois abra o endereço exibido no terminal (geralmente `http://localhost:5174`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
  assets/        # imagens e arquivos estáticos
  components/    # componentes reutilizáveis (Navbar, Footer, ProductCard, etc.)
  context/       # CartContext (estado global do carrinho, persistido em localStorage)
  data/          # dados estáticos: produtos, categorias e marcas
  hooks/         # hooks customizados (useLocalStorage)
  pages/         # páginas da aplicação (Home, Catalog, Cart, Login, etc.)
  styles/        # estilos globais e tokens de design
  utils/         # funções utilitárias (formatCurrency)
```

## Funcionalidades

- Navegação com React Router (Home, Catálogo, Categorias, Marcas, Contato, Login, Cadastro)
- Catálogo com busca, filtro por categoria/marca, ordenação por preço e paginação por "carregar mais"
- Carrinho de compras com persistência em localStorage (adicionar, remover, alterar quantidade, calcular totais)
- Login, Cadastro e Recuperação de Senha com validações básicas
- Toasts para ações do usuário, skeleton loading, botão de voltar ao topo, breadcrumbs e página 404 personalizada
- Design responsivo (desktop, tablet e celular) com animações suaves via Framer Motion

## Observação sobre imagens

As imagens dos produtos usam placeholders públicos (placehold.co) apenas para fins de
demonstração. Substitua os links em `src/data/products.js` por fotos reais dos produtos
quando for para produção.
