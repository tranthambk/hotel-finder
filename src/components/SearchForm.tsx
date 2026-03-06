'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, Star, Compass } from 'lucide-react'
import { HOTEL_WEBSITES } from '@/types'
import { useApp } from '@/context/AppContext'

const PRIORITY_OPTIONS = [
  { value: 'price', icon: '💰', key: 'form.priority.price' },
  { value: 'distance', icon: '📍', key: 'form.priority.distance' },
  { value: 'rating', icon: '⭐', key: 'form.priority.rating' },
]

const VIETNAM_SUGGESTIONS = [
  'Đà Lạt', 'Hà Nội', 'Hội An', 'Đà Nẵng', 'Nha Trang',
  'Phú Quốc', 'Huế', 'Sa Pa', 'Hạ Long', 'Mũi Né',
]

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export default function SearchForm() {
  const router = useRouter()
  const { t, lang } = useApp()
  const [form, setForm] = useState({
    destination: '',
    checkIn: today,
    checkOut: tomorrow,
    adults: 2,
    children: 0,
    rooms: 1,
    famousPlace: '',
    limit: 3,
    priorities: ['price'],
    sites: ['booking', 'agoda'],
  })
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fillDemo = () => {
    const checkIn = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    const checkOut = new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0]
    setForm((f) => ({ ...f, destination: 'Đà Lạt', famousPlace: 'Chợ Đêm Đà Lạt', checkIn, checkOut }))
  }

  const filtered = VIETNAM_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(form.destination.toLowerCase()) && form.destination.length > 0
  )

  const togglePriority = (val: string) => {
    setForm((f) => ({
      ...f,
      priorities: f.priorities.includes(val) ? f.priorities.filter((p) => p !== val) : [...f.priorities, val],
    }))
  }

  const toggleSite = (val: string) => {
    setForm((f) => ({
      ...f,
      sites: f.sites.includes(val) ? f.sites.filter((s) => s !== val) : [...f.sites, val],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const qs = new URLSearchParams({
      destination: form.destination,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: String(form.adults),
      children: String(form.children),
      rooms: String(form.rooms),
      famousPlace: form.famousPlace,
      limit: String(form.limit),
      priorities: form.priorities.join(','),
      sites: form.sites.join(','),
    })
    router.push(`/results?${qs.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-white/50">
        <span>💡 {lang === 'vi' ? 'Thử ngay:' : 'Quick demo:'}</span>
        <button type="button" onClick={fillDemo}
          className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/40 hover:text-amber-200 transition font-medium text-xs">
          📍 Đà Lạt · Chợ Đêm Đà Lạt
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-amber-200 text-sm font-medium mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />{t('form.destination')}
          </label>
          <input
            type="text" required placeholder={t('form.destination.ph')} value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition"
          />
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute top-full mt-1 w-full bg-slate-800 border border-white/20 rounded-xl overflow-hidden z-50 shadow-2xl">
              {filtered.map((s) => (
                <li key={s} onMouseDown={() => setForm((f) => ({ ...f, destination: s }))}
                  className="px-4 py-2 hover:bg-amber-500/20 cursor-pointer text-white text-sm transition">
                  <MapPin className="inline w-3 h-3 mr-2 text-amber-400" />{s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-amber-200 text-sm font-medium mb-2">
            <Compass className="inline w-4 h-4 mr-1" />{t('form.famous')}
          </label>
          <input
            type="text" placeholder={t('form.famous.ph')} value={form.famousPlace}
            onChange={(e) => setForm((f) => ({ ...f, famousPlace: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['checkIn', 'checkOut'] as const).map((field) => (
          <div key={field}>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              {t(field === 'checkIn' ? 'form.checkin' : 'form.checkout')}
            </label>
            <input
              type="date" required value={form[field]}
              min={field === 'checkIn' ? today : form.checkIn}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400 transition [color-scheme:dark]"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(
          [
            { key: 'adults', labelKey: 'form.adults', min: 1 },
            { key: 'children', labelKey: 'form.children', min: 0 },
            { key: 'rooms', labelKey: 'form.rooms', min: 1 },
          ] as const
        ).map(({ key, labelKey, min }) => (
          <div key={key}>
            <label className="block text-amber-200 text-sm font-medium mb-2">
              <Users className="inline w-4 h-4 mr-1" />{t(labelKey)}
            </label>
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, [key]: Math.max(min, (f[key] as number) - 1) }))}
                className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-amber-500/30 transition font-bold text-lg flex items-center justify-center">−</button>
              <span className="flex-1 text-center text-white font-semibold text-lg">{form[key]}</span>
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, [key]: (f[key] as number) + 1 }))}
                className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-amber-500/30 transition font-bold text-lg flex items-center justify-center">+</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-amber-200 text-sm font-medium mb-2">{t('form.limit')}</label>
        <select value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: Number(e.target.value) }))}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400 transition [color-scheme:dark]">
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>{n} {t('form.limit.unit')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-amber-200 text-sm font-medium mb-3">
          <Star className="inline w-4 h-4 mr-1" />{t('form.priority')}
        </label>
        <div className="flex flex-wrap gap-3">
          {PRIORITY_OPTIONS.map((p) => (
            <button key={p.value} type="button" onClick={() => togglePriority(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                form.priorities.includes(p.value)
                  ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 border-white/20 text-white/70 hover:border-amber-400'
              }`}>
              {p.icon} {t(p.key)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-amber-200 text-sm font-medium mb-3">{t('form.sites')}</label>
        <div className="flex flex-wrap gap-3">
          {HOTEL_WEBSITES.map((s) => (
            <button key={s.id} type="button" onClick={() => toggleSite(s.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                form.sites.includes(s.id)
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 border-white/20 text-white/70 hover:border-blue-400'
              }`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={form.sites.length === 0}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
        <Search className="w-5 h-5" />{t('form.submit')}
      </button>
    </form>
  )
}
