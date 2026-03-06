import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { Hotel, SearchParams } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const hotels: Hotel[] = body.hotels || []
    const params: SearchParams = body.params

    // Build worksheet data
    const rows = hotels.map((h, i) => ({
      STT: i + 1,
      'Tên khách sạn': h.name,
      Nguồn: h.source,
      'Giá/đêm': h.price?.display || 'Chưa rõ',
      'Đánh giá': h.rating ? `${h.rating}/10` : 'N/A',
      'Số đánh giá': h.reviewCount || 0,
      'Địa chỉ': h.address || 'N/A',
      'Điện thoại': h.phone || 'N/A',
      'Khoảng cách': h.distance || 'N/A',
      'Link đặt phòng': h.link,
      'Google Maps': h.googleMapsLink || '',
      'Tiện ích': (h.amenities || []).join(', '),
    }))

    // Summary header
    const summary = [
      [`DANH SÁCH KHÁCH SẠN - ${(params?.destination || '').toUpperCase()}`],
      [`Check-in: ${params?.checkIn || ''}  |  Check-out: ${params?.checkOut || ''}`],
      [`Khách: ${params?.adults || ''} người lớn  |  Phòng: ${params?.rooms || ''}`],
      [`Địa điểm tham quan: ${params?.famousPlace || ''}`],
      [],
    ]

    const wb = XLSX.utils.book_new()
    const wsData = [...summary, Object.keys(rows[0] || {}), ...rows.map(Object.values)]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 12 },
      { wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 45 }, { wch: 45 }, { wch: 40 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Khách sạn')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Normalize filename to ASCII (strip Vietnamese diacritics)
    const asciiDest = (params?.destination || 'vietnam')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
    const filename = `khach-san-${asciiDest}-${Date.now()}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[export] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
