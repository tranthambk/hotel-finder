import { Hotel, SearchParams } from '@/types'

const TINYFISH_API = 'https://agent.tinyfish.ai/v1/automation/run-sse'

function buildHotelSearchGoal(params: SearchParams, limit: number): string {
  return `Find ${limit} best hotels in ${params.destination} Vietnam. Check-in: ${params.checkIn}, check-out: ${params.checkOut}, ${params.adults} adults, ${params.rooms} room(s).

Return ONLY this JSON (no other text):
{"hotels":[{"name":"...","link":"...","price":"...","rating":"...","address":"...","phone":"..."}]}`
}

export async function searchHotelsOnSite(
  siteId: string,
  siteName: string,
  searchUrl: string,
  params: SearchParams,
  limit: number
): Promise<Hotel[]> {
  const apiKey = process.env.TINYFISH_API_KEY
  if (!apiKey) throw new Error('TINYFISH_API_KEY not configured')

  const goal = buildHotelSearchGoal(params, limit)
  console.log(`[tinyfish] Calling ${siteName}`)

  const response = await fetch(TINYFISH_API, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: searchUrl, goal }),
    signal: AbortSignal.timeout(360_000), // 6 minutes
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Tinyfish ${response.status}: ${text}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Check each line for COMPLETE event as we receive it
    const lines = buffer.split('\n')
    // Keep last incomplete line in buffer
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data) continue

      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'COMPLETE' && parsed.resultJson !== undefined) {
          console.log(`[tinyfish] ${siteName} COMPLETE. resultJson:`, JSON.stringify(parsed.resultJson).slice(0, 300))
          return parseHotels(parsed.resultJson, siteName, searchUrl)
        }
      } catch {
        // not JSON, continue
      }
    }
  }

  console.warn(`[tinyfish] ${siteName}: stream ended without COMPLETE event`)
  return []
}

function parseHotels(resultJson: unknown, siteName: string, siteUrl: string): Hotel[] {
  let arr: Array<Record<string, unknown>> = []

  if (Array.isArray(resultJson)) {
    arr = resultJson as Array<Record<string, unknown>>
  } else if (typeof resultJson === 'object' && resultJson !== null) {
    const obj = resultJson as Record<string, unknown>
    for (const key of ['hotels', 'results', 'items', 'data', 'list', 'properties']) {
      if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 0) {
        arr = obj[key] as Array<Record<string, unknown>>
        break
      }
    }
    if (arr.length === 0) {
      for (const val of Object.values(obj)) {
        if (Array.isArray(val) && val.length > 0) {
          arr = val as Array<Record<string, unknown>>
          break
        }
      }
    }
  } else if (typeof resultJson === 'string') {
    const match = (resultJson as string).match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) {
      try { return parseHotels(JSON.parse(match[0]), siteName, siteUrl) } catch {}
    }
  }

  if (arr.length === 0) return []

  const domain = (() => { try { return new URL(siteUrl).hostname } catch { return siteName } })()

  return arr.map((item, idx): Hotel => {
    const name = String(item.name || item.hotel_name || item.title || 'Khách sạn')
    const address = item.address ? String(item.address) : undefined
    const rawLink = item.link || item.url || item.booking_url
    const link = rawLink
      ? String(rawLink).startsWith('http') ? String(rawLink) : `https://${domain}${rawLink}`
      : '#'

    const priceRaw = item.price_amount || item.price
    const priceDisplay = String(item.price_display || item.price_text || item.price || '')
    const priceNum = priceRaw ? Number(String(priceRaw).replace(/[^\d.]/g, '')) : 0

    // Detect currency from display string or explicit field
    const detectedCurrency = (() => {
      if (item.currency) return String(item.currency).toUpperCase()
      if (/\$/.test(priceDisplay)) return 'USD'
      if (/€/.test(priceDisplay)) return 'EUR'
      if (/£/.test(priceDisplay)) return 'GBP'
      if (/₫|VND/i.test(priceDisplay)) return 'VND'
      return 'VND'
    })()

    // Build clean display string
    const cleanDisplay = (() => {
      if (priceDisplay) return priceDisplay
      if (!priceNum) return ''
      if (detectedCurrency === 'USD') return `$${priceNum.toLocaleString()}`
      if (detectedCurrency === 'EUR') return `€${priceNum.toLocaleString()}`
      return `${priceNum.toLocaleString()} ₫`
    })()

    const ratingRaw = item.rating || item.score || item.stars
    const rating = ratingRaw ? Number(String(ratingRaw).replace(/[^\d.]/g, '')) : undefined

    return {
      id: `${siteId(siteName)}-${idx}-${Date.now()}`,
      name,
      source: siteName,
      link,
      googleMapsLink: `https://www.google.com/maps/search/${encodeURIComponent([name, address, 'Vietnam'].filter(Boolean).join(' '))}`,
      phone: item.phone ? String(item.phone) : undefined,
      address,
      price: cleanDisplay
        ? {
            amount: priceNum,
            currency: detectedCurrency,
            display: cleanDisplay,
          }
        : undefined,
      rating: rating && !isNaN(rating) ? rating : undefined,
      reviewCount: item.review_count || item.reviews ? Number(item.review_count || item.reviews) : undefined,
      distance: item.distance_to_famous_place || item.distance ? String(item.distance_to_famous_place || item.distance) : undefined,
      image: item.image || item.photo || item.thumbnail ? String(item.image || item.photo || item.thumbnail) : undefined,
      amenities: Array.isArray(item.amenities) ? item.amenities.map(String) : undefined,
    }
  })
}

function siteId(siteName: string) {
  return siteName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)
}
