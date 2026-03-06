import { NextRequest, NextResponse } from 'next/server'
import { SearchParams, HOTEL_WEBSITES } from '@/types'
import { searchHotelsOnSite } from '@/lib/tinyfish'

export const maxDuration = 300 // 5 minutes for Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const params: SearchParams = body.params
    const selectedSites: string[] = body.sites || ['booking', 'agoda']

    if (!params.destination || !params.checkIn || !params.checkOut) {
      return NextResponse.json({ error: 'Thiếu thông tin tìm kiếm' }, { status: 400 })
    }

    const sites = HOTEL_WEBSITES.filter((s) => selectedSites.includes(s.id))
    if (sites.length === 0) {
      return NextResponse.json({ error: 'Không có trang web nào được chọn' }, { status: 400 })
    }

    // Search all sites in parallel
    const results = await Promise.allSettled(
      sites.map((site) =>
        searchHotelsOnSite(site.id, site.name, site.buildSearchUrl(params), params, params.limit)
          .then((hotels) => ({ site, hotels }))
      )
    )

    const allHotels: import('@/types').Hotel[] = []
    const successfulSites: string[] = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allHotels.push(...result.value.hotels)
        successfulSites.push(result.value.site.name)
        console.log(`[search] ${result.value.site.name}: ${result.value.hotels.length} hotels`)
      } else {
        console.error(`[search] site failed:`, result.reason)
      }
    }

    // Sort by priority
    if (params.priorities.includes('price')) {
      allHotels.sort((a, b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity))
    } else if (params.priorities.includes('rating')) {
      allHotels.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    }

    return NextResponse.json({
      hotels: allHotels,
      searchParams: params,
      sources: successfulSites,
    })
  } catch (err) {
    console.error('[search] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
