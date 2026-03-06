'use client'

import { useEffect, useRef } from 'react'
import { Hotel, VIETNAM_CITIES } from '@/types'
import { useApp } from '@/context/AppContext'

interface Props {
  hotels: Hotel[]
  destination: string
  famousPlace?: string
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function MapView({ hotels, destination, famousPlace }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const activeLineRef = useRef<import('leaflet').Polyline | null>(null)
  const activeLabelRef = useRef<import('leaflet').Marker | null>(null)
  const { t, formatPrice } = useApp()

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    import('leaflet').then((L) => {
      // @ts-expect-error _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const key = destination.toLowerCase().trim()
      const center = VIETNAM_CITIES[key] || { lat: 11.9404, lng: 108.4583 }
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([center.lat, center.lng], 14)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const clearLine = () => {
        activeLineRef.current?.remove()
        activeLineRef.current = null
        activeLabelRef.current?.remove()
        activeLabelRef.current = null
      }

      const famousLatLng: [number, number] = [center.lat, center.lng]
      const attractionLabel = t('map.pin.attraction')
      const famousIcon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="background:linear-gradient(135deg,#fbbf24,#d97706);color:white;border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);margin-bottom:3px;">📍 ${attractionLabel}</div>
          <div style="width:26px;height:26px;background:linear-gradient(135deg,#fbbf24,#d97706);border-radius:50%;border:3px solid white;box-shadow:0 3px 12px rgba(251,191,36,0.8);display:flex;align-items:center;justify-content:center;font-size:14px;">⭐</div>
          <div style="width:2px;height:8px;background:#d97706;"></div>
          <div style="width:6px;height:3px;background:#d97706;border-radius:50%;opacity:0.4;"></div>
        </div>`,
        className: '',
        iconSize: [120, 54],
        iconAnchor: [60, 54],
        popupAnchor: [0, -56],
      })

      L.marker(famousLatLng, { icon: famousIcon, zIndexOffset: 1000 })
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:180px;">
            <b style="color:#d97706;font-size:14px;">⭐ ${famousPlace || destination}</b>
            <p style="color:#888;font-size:12px;margin:4px 0 0;">${t('map.popup.attraction')}</p>
          </div>`
        )
        .addTo(map)

      const allLatLngs: [number, number][] = [famousLatLng]
      const spreadRadius = 0.012

      hotels.forEach((hotel, i) => {
        let hotelLatLng: [number, number]
        if (hotel.coordinates) {
          hotelLatLng = [hotel.coordinates.lat, hotel.coordinates.lng]
        } else {
          const angle = (i / hotels.length) * 2 * Math.PI
          const jitter = Math.sin(i * 137.5) * 0.003
          hotelLatLng = [
            center.lat + (spreadRadius + jitter) * Math.sin(angle),
            center.lng + (spreadRadius + jitter) * Math.cos(angle),
          ]
        }
        allLatLngs.push(hotelLatLng)

        const priceLabel = hotel.price ? formatPrice(hotel.price.amount, hotel.price.currency) : null

        const hotelIcon = L.divIcon({
          html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            ${priceLabel ? `<div style="background:#1d4ed8;color:white;border-radius:8px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);margin-bottom:3px;">${priceLabel}</div>` : ''}
            <div style="width:22px;height:22px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(59,130,246,0.7);"></div>
            <div style="width:2px;height:8px;background:#1d4ed8;"></div>
            <div style="width:6px;height:3px;background:#1d4ed8;border-radius:50%;opacity:0.4;"></div>
          </div>`,
          className: '',
          iconSize: [priceLabel ? 100 : 28, priceLabel ? 56 : 33],
          iconAnchor: [priceLabel ? 50 : 14, priceLabel ? 56 : 33],
          popupAnchor: [0, -58],
        })

        const km = distanceKm(hotelLatLng[0], hotelLatLng[1], famousLatLng[0], famousLatLng[1])
        const bookLink = hotel.link && hotel.link !== '#'
          ? `<a href="${hotel.link}" target="_blank" style="color:#f59e0b;font-size:12px;text-decoration:none;">🔗 ${t('map.popup.book')}</a>`
          : ''
        const mapsLink = hotel.googleMapsLink
          ? `<a href="${hotel.googleMapsLink}" target="_blank" style="color:#60a5fa;font-size:12px;text-decoration:none;margin-left:8px;">🗺 Maps</a>`
          : ''
        const displayPrice = hotel.price
          ? `<div style="color:#059669;font-size:15px;font-weight:700;margin:6px 0 2px;">${formatPrice(hotel.price.amount, hotel.price.currency)}<span style="font-size:11px;font-weight:400;color:#666;">${t('map.popup.pernight')}</span></div>`
          : ''

        const marker = L.marker(hotelLatLng, { icon: hotelIcon }).bindPopup(
          `<div style="font-family:sans-serif;min-width:230px;max-width:280px;">
            <b style="color:#1e3a8a;font-size:14px;line-height:1.3;">${hotel.name}</b>
            ${displayPrice}
            ${hotel.rating ? `<div style="color:#d97706;font-size:12px;margin:2px 0;">⭐ ${hotel.rating.toFixed(1)}${hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()} ${t('map.popup.reviews')}` : ''}</div>` : ''}
            ${hotel.address ? `<div style="color:#555;font-size:11px;margin:4px 0;">📍 ${hotel.address}</div>` : ''}
            ${hotel.phone && hotel.phone !== 'Not available' ? `<div style="font-size:11px;margin:2px 0;">📞 ${hotel.phone}</div>` : ''}
            <div style="margin-top:8px;display:flex;gap:4px;">${bookLink}${mapsLink}</div>
          </div>`,
          { maxWidth: 300 }
        )

        marker.on('click', () => {
          clearLine()
          activeLineRef.current = L.polyline([hotelLatLng, famousLatLng], {
            color: '#f59e0b', weight: 2.5, opacity: 0.9, dashArray: '8, 6',
          }).addTo(map)

          const distText = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`
          const midLat = (hotelLatLng[0] + famousLatLng[0]) / 2
          const midLng = (hotelLatLng[1] + famousLatLng[1]) / 2
          activeLabelRef.current = L.marker([midLat, midLng], {
            icon: L.divIcon({
              html: `<div style="background:rgba(15,23,42,0.92);color:#fbbf24;border:1.5px solid #f59e0b;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);">📏 ${distText}</div>`,
              className: '', iconSize: [110, 26], iconAnchor: [55, 13],
            }),
            interactive: false,
          }).addTo(map)
        })

        marker.on('popupclose', clearLine)
        marker.addTo(map)
      })

      if (allLatLngs.length > 1) map.fitBounds(L.latLngBounds(allLatLngs).pad(0.25))
      map.on('click', clearLine)
    })

    return () => {
      activeLineRef.current?.remove()
      activeLabelRef.current?.remove()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels, destination, famousPlace, formatPrice, t])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '600px' }}>
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 text-xs z-[1000] border border-white/10 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400">
          <span className="text-base">⭐</span><span>{t('map.legend.attraction')}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block flex-shrink-0" />
          <span>{t('map.legend.hotel')}</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="font-mono text-xs">- -</span><span>{t('map.legend.line')}</span>
        </div>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-gray-300 z-[1000] border border-white/10 pointer-events-none whitespace-nowrap">
        {t('map.hint')}
      </div>
    </div>
  )
}
