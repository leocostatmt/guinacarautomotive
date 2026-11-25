import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const GUEST_CART_KEY = 'guinacar:cart:guest'
const LEGACY_CART_KEY = 'guinacar:cart'

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // ignore storage quota errors
  }
}

function normalizeItems(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    image: item.image || '',
    quantity: Number(item.quantity) || 1,
  }))
}

function mergeCarts(serverItems, guestItems) {
  const map = new Map()
  for (const item of serverItems) {
    map.set(item.id, { ...item })
  }
  for (const item of guestItems) {
    const existing = map.get(item.id)
    if (existing) {
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity })
    } else {
      map.set(item.id, { ...item })
    }
  }
  return Array.from(map.values())
}

export function CartProvider({ children }) {
  const { isLoggedIn, user } = useAuth()
  const [items, setItems] = useState(() => (isLoggedIn ? [] : readGuestCart()))
  const itemsRef = useRef(items)
  const wasLoggedInRef = useRef(isLoggedIn)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // Remove chave antiga compartilhada para evitar vazamento entre contas
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_CART_KEY)
    } catch {
      // ignore
    }
  }, [])

  const syncToServer = useCallback(async (nextItems) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      if (nextItems.length === 0) {
        await fetch('http://localhost:8081/api/carrinho', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await fetch('http://localhost:8081/api/carrinho', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nextItems),
        })
      }
    } catch (err) {
      console.error('Erro ao sincronizar carrinho com o servidor:', err)
    }
  }, [])

  // Sincroniza ao logar e limpa o carrinho local ao deslogar (mantendo salvo no banco!)
  useEffect(() => {
    if (!isLoggedIn) {
      if (wasLoggedInRef.current) {
        // Acabou de deslogar: limpa a exibição do carrinho sem apagar o carrinho salvo na conta
        setItems([])
        writeGuestCart([])
      } else {
        setItems(readGuestCart())
      }
      wasLoggedInRef.current = false
      return
    }

    wasLoggedInRef.current = true
    const token = localStorage.getItem('token')
    if (!token) return

    let active = true
    const guestItems = readGuestCart()

    fetch('http://localhost:8081/api/carrinho', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((serverData) => {
        if (!active) return
        const serverItems = normalizeItems(serverData)

        if (guestItems.length > 0) {
          const merged = mergeCarts(serverItems, normalizeItems(guestItems))
          writeGuestCart([])
          setItems(merged)
          syncToServer(merged)
        } else {
          setItems(serverItems)
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar carrinho da conta:', err)
      })

    return () => {
      active = false
    }
  }, [isLoggedIn, user?.id, syncToServer])

  const commitItems = useCallback(
    (updater) => {
      const next = updater(itemsRef.current)
      itemsRef.current = next
      setItems(next)
      if (isLoggedIn) {
        syncToServer(next)
      } else {
        writeGuestCart(next)
      }
    },
    [isLoggedIn, syncToServer]
  )

  const addToCart = useCallback(
    (product, quantity = 1) => {
      commitItems((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image || '',
            quantity,
          },
        ]
      })
    },
    [commitItems]
  )

  const removeFromCart = useCallback(
    (id) => {
      commitItems((prev) => prev.filter((item) => item.id !== id))
    },
    [commitItems]
  )

  const updateQuantity = useCallback(
    (id, quantity) => {
      if (quantity < 1) return
      commitItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    },
    [commitItems]
  )

  const clearCart = useCallback(() => {
    commitItems(() => [])
  }, [commitItems])

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
