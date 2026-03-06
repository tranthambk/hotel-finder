import { Hotel } from '@/types'

const KEY = 'hotel_finder_favorites'

export function getFavorites(): Hotel[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addFavorite(hotel: Hotel): void {
  const favs = getFavorites()
  if (!favs.find((h) => h.id === hotel.id)) {
    localStorage.setItem(KEY, JSON.stringify([...favs, hotel]))
  }
}

export function removeFavorite(hotelId: string): void {
  const favs = getFavorites().filter((h) => h.id !== hotelId)
  localStorage.setItem(KEY, JSON.stringify(favs))
}

export function isFavorite(hotelId: string): boolean {
  return getFavorites().some((h) => h.id === hotelId)
}

export function toggleFavorite(hotel: Hotel): boolean {
  if (isFavorite(hotel.id)) {
    removeFavorite(hotel.id)
    return false
  } else {
    addFavorite(hotel)
    return true
  }
}
