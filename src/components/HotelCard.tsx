'use client'

import { useState, useEffect } from 'react'
import { Heart, MapPin, Phone, Star, ExternalLink, Navigation } from 'lucide-react'
import { Hotel } from '@/types'
import { toggleFavorite, isFavorite } from '@/lib/favorites'
import { useApp } from '@/context/AppContext'

interface Props {
  hotel: Hotel
  famousPlace?: string
  onFavoriteChange?: () => void
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round((rating / 10) * 5)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`}
        />
      ))}
      <span className="text-amber-400 font-semibold text-sm ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function HotelCard({ hotel, famousPlace, onFavoriteChange }: Props) {
  const [fav, setFav] = useState(false)
  const { t, formatPrice } = useApp()

  useEffect(() => {
    setFav(isFavorite(hotel.id))
  }, [hotel.id])

  const handleFav = () => {
    const next = toggleFavorite(hotel)
    setFav(next)
    onFavoriteChange?.()
  }

  const sourceBadgeColor: Record<string, string> = {
    'Booking.com': 'bg-blue-600',
    'Agoda.com': 'bg-red-600',
    'Airbnb.com': 'bg-rose-500',
    'Traveloka.com': 'bg-emerald-600',
    'Vntrip.vn': 'bg-purple-600',
  }

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1">
      {/* Image / Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        {hotel.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">🏨</span>
          </div>
        )}

        {/* Source badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white rounded-full ${sourceBadgeColor[hotel.source] || 'bg-slate-600'}`}>
          {hotel.source}
        </span>

        {/* Favorite button */}
        <button
          onClick={handleFav}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            fav
              ? 'bg-red-500 shadow-lg shadow-red-500/50'
              : 'bg-black/40 hover:bg-red-500/80'
          }`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-white text-white' : 'text-white'}`} />
        </button>

        {/* Price badge */}
        {hotel.price && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-amber-500 rounded-xl text-white text-sm font-bold shadow-lg leading-none">
            {formatPrice(hotel.price.amount, hotel.price.currency)}
            <span className="text-xs font-normal opacity-80">{t('card.pernight')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors">
            {hotel.name}
          </h3>
          {hotel.rating && (
            <div className="flex items-center gap-3 mt-1.5">
              <StarRating rating={hotel.rating} />
              {hotel.reviewCount && (
                <span className="text-gray-400 text-xs">({hotel.reviewCount.toLocaleString()} {t('card.reviews')})</span>
              )}
            </div>
          )}
        </div>

        {/* Address */}
        {hotel.address && (
          <div className="flex items-start gap-2 text-gray-300 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
            <span className="line-clamp-2">{hotel.address}</span>
          </div>
        )}

        {/* Distance */}
        {hotel.distance && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <Navigation className="w-4 h-4 flex-shrink-0" />
            <span>
              {hotel.distance}
              {famousPlace && <span className="text-gray-400 font-normal"> {t('card.distance.to')} {famousPlace}</span>}
            </span>
          </div>
        )}

        {/* Phone */}
        {hotel.phone && (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <a href={`tel:${hotel.phone}`} className="hover:text-blue-400 transition">
              {hotel.phone}
            </a>
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span key={a} className="px-2 py-0.5 text-xs bg-white/10 text-gray-300 rounded-full">
                {a}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-white/10 text-gray-400 rounded-full">
                +{hotel.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2 pt-1">
          <a
            href={hotel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 hover:border-amber-500 text-amber-400 hover:text-white rounded-xl text-sm font-medium text-center transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('card.book')}
          </a>
          {hotel.googleMapsLink && (
            <a
              href={hotel.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-blue-500/20 hover:bg-blue-500 border border-blue-500/40 hover:border-blue-500 text-blue-400 hover:text-white rounded-xl text-sm font-medium text-center transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              {t('card.gmaps')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
