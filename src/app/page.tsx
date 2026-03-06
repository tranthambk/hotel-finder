'use client'

import SearchForm from '@/components/SearchForm'
import LangCurrencySwitch from '@/components/LangCurrencySwitch'
import { useApp } from '@/context/AppContext'

export default function HomePage() {
  const { t } = useApp()

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex justify-end px-6 pt-5">
        <LangCurrencySwitch />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm font-medium mb-6">
            <span>🇻🇳</span>
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            {t('hero.title1')}{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t('hero.title2')}
            </span>
            <br />
            <span className="text-3xl md:text-4xl font-bold text-white/80">{t('hero.title3')}</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('hero.desc', { sites: 'Booking, Agoda, Airbnb, Traveloka, Vntrip' })}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <SearchForm />
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { icon: '🔍', title: t('feat.search'), desc: t('feat.search.desc') },
            { icon: '🗺️', title: t('feat.map'), desc: t('feat.map.desc') },
            { icon: '❤️', title: t('feat.fav'), desc: t('feat.fav.desc') },
            { icon: '📊', title: t('feat.export'), desc: t('feat.export.desc') },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/10"
            >
              <span className="text-3xl mb-2">{f.icon}</span>
              <span className="text-white font-semibold text-sm">{f.title}</span>
              <span className="text-gray-400 text-xs mt-0.5">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
