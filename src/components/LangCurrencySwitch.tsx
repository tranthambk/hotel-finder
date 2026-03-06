'use client'

import { useApp } from '@/context/AppContext'

export default function LangCurrencySwitch() {
  const { lang, setLang, currency, setCurrency } = useApp()

  return (
    <div className="flex items-center gap-2">
      {/* Language switcher */}
      <div className="flex items-center bg-white/8 border border-white/15 rounded-xl overflow-hidden">
        <button
          onClick={() => setLang('vi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
            lang === 'vi'
              ? 'bg-amber-500 text-white shadow-inner'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          🇻🇳 VI
        </button>
        <button
          onClick={() => setLang('en')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
            lang === 'en'
              ? 'bg-amber-500 text-white shadow-inner'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          🇺🇸 EN
        </button>
      </div>

      {/* Currency switcher */}
      <div className="flex items-center bg-white/8 border border-white/15 rounded-xl overflow-hidden">
        <button
          onClick={() => setCurrency('VND')}
          className={`px-3 py-1.5 text-xs font-semibold transition-all ${
            currency === 'VND'
              ? 'bg-emerald-600 text-white shadow-inner'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          ₫ VND
        </button>
        <button
          onClick={() => setCurrency('USD')}
          className={`px-3 py-1.5 text-xs font-semibold transition-all ${
            currency === 'USD'
              ? 'bg-emerald-600 text-white shadow-inner'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          $ USD
        </button>
      </div>
    </div>
  )
}
