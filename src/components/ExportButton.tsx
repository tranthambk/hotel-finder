'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Hotel, SearchParams } from '@/types'
import { useApp } from '@/context/AppContext'

interface Props {
  hotels: Hotel[]
  params: SearchParams
}

export default function ExportButton({ hotels, params }: Props) {
  const [loading, setLoading] = useState(false)
  const { t } = useApp()

  const handleExport = async () => {
    if (loading || hotels.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotels, params }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `khach-san-${params.destination}-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
      console.error(err)
      alert(t('export.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || hotels.length === 0}
      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-emerald-500/30"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? t('export.loading') : t('export.btn')}
    </button>
  )
}
