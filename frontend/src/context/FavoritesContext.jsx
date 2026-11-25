import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext(null)
const STORAGE_KEY = 'guinacar:favorites'

function readLocalFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(readLocalFavorites)
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  const syncLocal = useCallback((ids) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // ignore storage quota errors
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setFavoriteIds([])
      syncLocal([])
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    let active = true
    setLoadingFavorites(true)

    fetch('http://localhost:8081/api/favoritos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setFavoriteIds(data)
          syncLocal(data)
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar favoritos:', err)
      })
      .finally(() => {
        if (active) setLoadingFavorites(false)
      })

    return () => {
      active = false
    }
  }, [isLoggedIn, syncLocal])

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(productId),
    [favoriteIds]
  )

  const toggleFavorite = useCallback(
    async (product) => {
      const productId = typeof product === 'string' ? product : product.id
      const productName = typeof product === 'string' ? 'Produto' : product.name
      const alreadyFav = favoriteIds.includes(productId)

      const nextIds = alreadyFav
        ? favoriteIds.filter((id) => id !== productId)
        : [productId, ...favoriteIds]

      setFavoriteIds(nextIds)
      syncLocal(nextIds)

      if (alreadyFav) {
        toast.success(`${productName} removido dos favoritos`)
      } else {
        toast.success(`${productName} salvo nos favoritos`)
      }

      if (!isLoggedIn) return

      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await fetch(
          `http://localhost:8081/api/favoritos/${encodeURIComponent(productId)}`,
          {
            method: alreadyFav ? 'DELETE' : 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          const serverIds = await res.json()
          if (Array.isArray(serverIds)) {
            setFavoriteIds(serverIds)
            syncLocal(serverIds)
          }
        }
      } catch (err) {
        console.error('Erro ao sincronizar favorito:', err)
      }
    },
    [favoriteIds, isLoggedIn, syncLocal]
  )

  const removeFavorite = useCallback(
    async (product) => {
      const productId = typeof product === 'string' ? product : product.id
      if (!favoriteIds.includes(productId)) return
      await toggleFavorite(product)
    },
    [favoriteIds, toggleFavorite]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesCount: favoriteIds.length,
        loadingFavorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider')
  return ctx
}
