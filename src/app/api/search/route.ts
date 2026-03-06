import { NextRequest } from 'next/server'
import { SearchParams, HOTEL_WEBSITES } from '@/types'
import { searchHotelsOnSite } from '@/lib/tinyfish'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const body = await req.json()
  const params: SearchParams = body.params
  const selectedSites: string[] = body.sites || ['booking', 'agoda']

  if (!params.destination || !params.checkIn || !params.checkOut) {
    return new Response(JSON.stringify({ error: 'Thiếu thông tin tìm kiếm' }), { status: 400 })
  }

  const sites = HOTEL_WEBSITES.filter((s) => selectedSites.includes(s.id))
  if (sites.length === 0) {
    return new Response(JSON.stringify({ error: 'Không có trang web nào được chọn' }), { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      // Run all sites concurrently, stream each result as it completes
      await Promise.allSettled(
        sites.map(async (site) => {
          try {
            const { hotels, runId } = await searchHotelsOnSite(
              site.id,
              site.name,
              site.buildSearchUrl(params),
              params,
              params.limit
            )
            const runUrl = runId ? `https://agent.tinyfish.ai/runs/${runId}` : undefined
            console.log(`[search] ${site.name}: ${hotels.length} hotels, runId=${runId}`)
            send({ type: 'site_result', site: site.name, hotels, runUrl })
          } catch (err) {
            console.error(`[search] ${site.name} failed:`, err)
            send({ type: 'site_error', site: site.name, error: String(err) })
          }
        })
      )

      send({ type: 'done' })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
