'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, LayoutGrid, Map, Heart, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Hotel, SearchParams } from '@/types'
import HotelCard from '@/components/HotelCard'
import ExportButton from '@/components/ExportButton'
import LangCurrencySwitch from '@/components/LangCurrencySwitch'
import { getFavorites } from '@/lib/favorites'
import { useApp } from '@/context/AppContext'

// Dynamic import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/10">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  ),
})

const CACHE_PREFIX = 'hotel_cache:'

function getCacheKey(params: SearchParams, sites: string[]) {
  const p = {
    destination: params.destination,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults,
    children: params.children,
    rooms: params.rooms,
    limit: params.limit,
    priorities: [...params.priorities].sort().join(','),
    sites: [...sites].sort().join(','),
  }
  return CACHE_PREFIX + JSON.stringify(p)
}

type CacheEntry = {
  hotels: Hotel[]
  sources: string[]
  runLinks: { site: string; url: string }[]
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(key: string, entry: CacheEntry) {
  try {
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const params: SearchParams = {
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: Number(searchParams.get('adults') || 2),
    children: Number(searchParams.get('children') || 0),
    rooms: Number(searchParams.get('rooms') || 1),
    famousPlace: searchParams.get('famousPlace') || '',
    limit: Number(searchParams.get('limit') || 3),
    priorities: (searchParams.get('priorities') || 'price').split(',').filter(Boolean),
  }
  const sites = (searchParams.get('sites') || 'booking,agoda').split(',').filter(Boolean)

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [sources, setSources] = useState<string[]>([])
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [favIds, setFavIds] = useState<Set<string>>(new Set())
  const [loadingMessage, setLoadingMessage] = useState('')
  const [pendingSites, setPendingSites] = useState(0)
  const [runLinks, setRunLinks] = useState<{ site: string; url: string }[]>([])
  const [fromCache, setFromCache] = useState(false)
  const { t } = useApp()

  const refreshFavs = useCallback(() => {
    setFavIds(new Set(getFavorites().map((h) => h.id)))
  }, [])

  const fetchHotels = useCallback(async (forceRefresh = false) => {
    if (!params.destination) return

    // Check cache first
    if (!forceRefresh) {
      const cacheKey = getCacheKey(params, sites)
      const cached = readCache(cacheKey)
      if (cached) {
        setHotels(cached.hotels)
        setSources(cached.sources)
        setRunLinks(cached.runLinks)
        setFromCache(true)
        setLoading(false)
        setFavIds(new Set(getFavorites().map((h) => h.id)))
        return
      }
    }

    setLoading(true)
    setError(null)
    setHotels([])
    setSources([])
    setRunLinks([])
    setFromCache(false)
    setPendingSites(sites.length)

    const messages = [
      t('load.1'), t('load.2'), t('load.3'), t('load.4'),
      t('load.5'), t('load.6'), t('load.7'), t('load.8'),
    ]
    setLoadingMessage(messages[0])
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length
      setLoadingMessage(messages[msgIdx])
    }, 20000)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, sites }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server lỗi ${res.status}: ${text.slice(0, 200)}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let allHotels: Hotel[] = []
      let allSources: string[] = []
      let allRunLinks: { site: string; url: string }[] = []
      const siteErrors: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const chunk = JSON.parse(line)
            if (chunk.type === 'site_result') {
              allHotels = [...allHotels, ...(chunk.hotels || [])]
              if (params.priorities.includes('price')) {
                allHotels.sort((a, b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity))
              } else if (params.priorities.includes('rating')) {
                allHotels.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
              }
              allSources = [...allSources, chunk.site]
              if (chunk.runUrl) allRunLinks = [...allRunLinks, { site: chunk.site, url: chunk.runUrl }]
              setHotels([...allHotels])
              setSources([...allSources])
              setRunLinks([...allRunLinks])
              setPendingSites((prev) => Math.max(0, prev - 1))
              setLoading(false)
            } else if (chunk.type === 'site_error') {
              siteErrors.push(`${chunk.site}: ${chunk.error}`)
              setPendingSites((prev) => Math.max(0, prev - 1))
            } else if (chunk.type === 'done') {
              setPendingSites(0)
              setLoading(false)
            }
          } catch {
            // skip malformed line
          }
        }
      }

      // If all sites failed and no results, surface the errors
      if (allHotels.length === 0 && siteErrors.length > 0) {
        throw new Error(siteErrors.join('\n'))
      }

      // Save to cache only if we got results
      if (allHotels.length > 0) {
        writeCache(getCacheKey(params, sites), { hotels: allHotels, sources: allSources, runLinks: allRunLinks })
      }
      setFavIds(new Set(getFavorites().map((h) => h.id)))
    } catch (err) {
      setError(String(err))
    } finally {
      clearInterval(interval)
      setLoading(false)
      setPendingSites(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.destination, params.checkIn, params.checkOut])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  const displayedHotels = showFavOnly ? hotels.filter((h) => favIds.has(h.id)) : hotels

  const nights = params.checkIn && params.checkOut
    ? Math.max(1, Math.round((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000))
    : 1

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />{t('res.back')}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
              {t('res.title')}{' '}<span className="text-amber-400">{params.destination}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {params.checkIn} → {params.checkOut} · {nights} {t('res.nights')} · {params.adults} {t('res.adults')}
              {params.famousPlace && <span className="text-amber-300/80"> · {t('res.near')} {params.famousPlace}</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LangCurrencySwitch />
            {!loading && hotels.length > 0 && (
              <>
                <button onClick={() => setShowFavOnly((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${showFavOnly ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}>
                  <Heart className={`w-4 h-4 ${showFavOnly ? 'fill-red-400' : ''}`} />
                  {t('res.favOnly')} {favIds.size > 0 && `(${favIds.size})`}
                </button>
                <ExportButton hotels={displayedHotels} params={params} />
              </>
            )}
            <button onClick={() => fetchHotels(true)} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition disabled:opacity-50"
              title={fromCache ? 'Kết quả từ cache — nhấn để tìm lại' : 'Tìm lại'}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {fromCache ? '⚡ Cache' : t('res.refresh')}
            </button>
          </div>
        </div>

        {/* Sources + run links */}
        {(sources.length > 0 || pendingSites > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-gray-500 text-sm">{t('res.sources')}</span>
            {sources.map((s) => {
              const run = runLinks.find((r) => r.site === s)
              return run ? (
                <a
                  key={s}
                  href={run.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-full text-xs font-medium transition"
                  title="Xem agent Tinyfish đang chạy"
                >
                  {s}
                  <span className="text-amber-400">↗</span>
                </a>
              ) : (
                <span key={s} className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                  {s}
                </span>
              )
            })}
            {pendingSites > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                {pendingSites} trang đang tìm…
              </span>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🏨</span>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">{loadingMessage}</p>
              <p className="text-gray-400 text-sm mt-1">
                {t('load.sub', { min: '2-3' })}
              </p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <div>
              <p className="text-white font-semibold text-xl mb-2">{t('res.error')}</p>
              <p className="text-gray-400 text-sm max-w-md">{error}</p>
            </div>
            <button
              onClick={() => fetchHotels(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition"
            >
              <RefreshCw className="w-4 h-4" />
              {t('res.refresh')}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && hotels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl">🔍</span>
            <p className="text-white font-semibold text-xl">{t('res.empty')}</p>
            <p className="text-gray-400 text-sm max-w-md">{t('res.empty.desc')}</p>
            <button onClick={() => router.back()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition">
              {t('res.searchAgain')}
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hotels.length > 0 && (
          <>
            {/* View toggle + count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">
                {t('res.found')}{' '}
                <span className="text-white font-semibold">{displayedHotels.length}</span>
                {' '}{t('res.hotels')}
                {showFavOnly && <span className="text-red-400"> ({t('res.favOnly').toLowerCase()})</span>}
              </p>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === 'list'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('res.list')}
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === 'map'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  {t('res.map')}
                </button>
              </div>
            </div>

            {/* List view */}
            {view === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    famousPlace={params.famousPlace}
                    onFavoriteChange={refreshFavs}
                  />
                ))}
              </div>
            )}

            {/* Map view */}
            {view === 'map' && (
              <MapView
                hotels={displayedHotels}
                destination={params.destination}
                famousPlace={params.famousPlace}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
