import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('guinacar:cart', [])

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity }]
    })
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const shipping = subtotal === 0 ? 0 : subtotal >= 300 ? 0 : 24.9
  const total = subtotal + shipping

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    total,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de um CartProvider')
  return ctx
}
