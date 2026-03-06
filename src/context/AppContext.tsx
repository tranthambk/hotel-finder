'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, Currency, t as translate, formatPrice as fp } from '@/lib/translations'

interface AppContextType {
  lang: Lang
  setLang: (l: Lang) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  t: (key: string, vars?: Record<string, string>) => string
  formatPrice: (amount: number, fromCurrency: string) => string
}

const AppContext = createContext<AppContextType>({
  lang: 'vi',
  setLang: () => {},
  currency: 'VND',
  setCurrency: () => {},
  t: (key) => key,
  formatPrice: (amount) => String(amount),
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi')
  const [currency, setCurrencyState] = useState<Currency>('VND')

  // Persist to localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('hf_lang') as Lang | null
    const savedCurrency = localStorage.getItem('hf_currency') as Currency | null
    if (savedLang === 'vi' || savedLang === 'en') setLangState(savedLang)
    if (savedCurrency === 'VND' || savedCurrency === 'USD') setCurrencyState(savedCurrency)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('hf_lang', l)
  }
  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('hf_currency', c)
  }

  const tFn = (key: string, vars?: Record<string, string>) => translate(lang, key, vars)
  const formatPriceFn = (amount: number, fromCurrency: string) => fp(amount, fromCurrency, currency)

  return (
    <AppContext.Provider value={{ lang, setLang, currency, setCurrency, t: tFn, formatPrice: formatPriceFn }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
