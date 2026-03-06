export type Lang = 'vi' | 'en'
export type Currency = 'VND' | 'USD'

const USD_TO_VND = 25000

export function convertPrice(amount: number, fromCurrency: string, toCurrency: Currency): number {
  const from = fromCurrency.toUpperCase()
  if (from === toCurrency) return amount
  if (from === 'USD' && toCurrency === 'VND') return Math.round(amount * USD_TO_VND)
  if (from === 'VND' && toCurrency === 'USD') return Math.round((amount / USD_TO_VND) * 100) / 100
  return amount
}

export function formatPrice(amount: number, fromCurrency: string, toCurrency: Currency): string {
  const converted = convertPrice(amount, fromCurrency, toCurrency)
  if (toCurrency === 'USD') return `$${converted.toLocaleString('en-US')}`
  return `${converted.toLocaleString('vi-VN')} ₫`
}

type TranslationMap = Record<string, string>

const vi: TranslationMap = {
  // Hero
  'hero.badge': 'Khám phá Việt Nam tuyệt vời',
  'hero.title1': 'Tìm',
  'hero.title2': 'Khách Sạn',
  'hero.title3': 'Cho Chuyến Du Lịch Của Bạn',
  'hero.desc': 'So sánh giá từ {sites} — tìm chỗ ở hoàn hảo gần mọi điểm tham quan tại Việt Nam.',

  // Features
  'feat.search': 'Tìm đa nguồn',
  'feat.search.desc': '5 trang web lớn',
  'feat.map': 'Bản đồ trực quan',
  'feat.map.desc': 'Xem vị trí thực tế',
  'feat.fav': 'Lưu yêu thích',
  'feat.fav.desc': 'Danh sách cá nhân',
  'feat.export': 'Xuất Excel',
  'feat.export.desc': 'Dễ chia sẻ & lưu trữ',

  // Form
  'form.destination': 'Điểm đến',
  'form.destination.ph': 'Ví dụ: Đà Lạt, Hội An...',
  'form.famous': 'Địa điểm muốn ghé thăm',
  'form.famous.ph': 'Ví dụ: Chợ Đêm Đà Lạt, Phố Cổ Hội An...',
  'form.checkin': 'Ngày check-in',
  'form.checkout': 'Ngày check-out',
  'form.adults': 'Người lớn',
  'form.children': 'Trẻ em',
  'form.rooms': 'Phòng',
  'form.limit': 'Số kết quả mỗi trang (mặc định: 3)',
  'form.limit.unit': 'kết quả',
  'form.priority': 'Ưu tiên theo',
  'form.priority.price': 'Giá thấp nhất',
  'form.priority.distance': 'Gần nhất',
  'form.priority.rating': 'Đánh giá cao',
  'form.sites': 'Tìm kiếm trên trang web',
  'form.submit': 'Tìm Khách Sạn Ngay',

  // Results
  'res.back': 'Quay lại',
  'res.title': 'Khách sạn tại',
  'res.nights': 'đêm',
  'res.adults': 'người lớn',
  'res.near': 'Gần',
  'res.sources': 'Kết quả từ:',
  'res.found': 'Tìm thấy',
  'res.hotels': 'khách sạn',
  'res.favOnly': 'Yêu thích',
  'res.list': 'Danh sách',
  'res.map': 'Bản đồ',
  'res.refresh': 'Tìm lại',
  'res.export': 'Xuất Excel',
  'res.empty': 'Không tìm thấy kết quả',
  'res.empty.desc': 'Thử thay đổi điểm đến hoặc chọn thêm trang web tìm kiếm',
  'res.searchAgain': 'Tìm kiếm lại',
  'res.error': 'Có lỗi xảy ra',

  // Loading
  'load.1': 'Tinyfish AI đang mở trang web...',
  'load.2': 'Đang tìm kiếm khách sạn...',
  'load.3': 'Đang điền ngày check-in/check-out...',
  'load.4': 'Đang đọc danh sách kết quả...',
  'load.5': 'Đang trích xuất thông tin...',
  'load.6': 'Đang tổng hợp dữ liệu...',
  'load.7': 'AI đang làm việc chăm chỉ...',
  'load.8': 'Vui lòng chờ, mất 2-3 phút...',
  'load.sub': 'Tinyfish AI đang duyệt web — mỗi trang mất {min} phút',

  // Hotel card
  'card.book': 'Đặt phòng',
  'card.gmaps': 'Google Maps',
  'card.reviews': 'đánh giá',
  'card.pernight': '/đêm',
  'card.distance.to': 'đến',

  // Export
  'export.btn': 'Xuất Excel',
  'export.loading': 'Đang xuất...',
  'export.error': 'Không thể xuất file. Vui lòng thử lại.',

  // Map
  'map.hint': 'Click vào khách sạn để xem khoảng cách đến điểm tham quan',
  'map.legend.attraction': 'Điểm tham quan',
  'map.legend.hotel': 'Khách sạn (có giá)',
  'map.legend.line': 'Khoảng cách khi click',
  'map.popup.attraction': 'Điểm tham quan chính',
  'map.popup.reviews': 'đánh giá',
  'map.popup.book': 'Đặt phòng',
  'map.popup.pernight': '/đêm',
  'map.pin.attraction': 'Điểm tham quan',
}

const en: TranslationMap = {
  // Hero
  'hero.badge': 'Discover amazing Vietnam',
  'hero.title1': 'Find',
  'hero.title2': 'Hotels',
  'hero.title3': 'For Your Trip',
  'hero.desc': 'Compare prices from {sites} — find the perfect stay near every attraction in Vietnam.',

  // Features
  'feat.search': 'Multi-source search',
  'feat.search.desc': '5 major websites',
  'feat.map': 'Interactive map',
  'feat.map.desc': 'See real locations',
  'feat.fav': 'Save favorites',
  'feat.fav.desc': 'Personal list',
  'feat.export': 'Export Excel',
  'feat.export.desc': 'Easy to share & store',

  // Form
  'form.destination': 'Destination',
  'form.destination.ph': 'E.g.: Da Lat, Hoi An...',
  'form.famous': 'Famous place to visit',
  'form.famous.ph': 'E.g.: Da Lat Night Market...',
  'form.checkin': 'Check-in date',
  'form.checkout': 'Check-out date',
  'form.adults': 'Adults',
  'form.children': 'Children',
  'form.rooms': 'Rooms',
  'form.limit': 'Results per page (default: 3)',
  'form.limit.unit': 'results',
  'form.priority': 'Sort by',
  'form.priority.price': 'Lowest price',
  'form.priority.distance': 'Nearest',
  'form.priority.rating': 'Top rated',
  'form.sites': 'Search on websites',
  'form.submit': 'Find Hotels Now',

  // Results
  'res.back': 'Back',
  'res.title': 'Hotels in',
  'res.nights': 'nights',
  'res.adults': 'adults',
  'res.near': 'Near',
  'res.sources': 'Results from:',
  'res.found': 'Found',
  'res.hotels': 'hotels',
  'res.favOnly': 'Favorites',
  'res.list': 'List',
  'res.map': 'Map',
  'res.refresh': 'Search again',
  'res.export': 'Export Excel',
  'res.empty': 'No results found',
  'res.empty.desc': 'Try changing the destination or selecting more websites',
  'res.searchAgain': 'Search again',
  'res.error': 'An error occurred',

  // Loading
  'load.1': 'Tinyfish AI is opening the website...',
  'load.2': 'Searching for hotels...',
  'load.3': 'Filling in check-in/check-out dates...',
  'load.4': 'Reading search results...',
  'load.5': 'Extracting hotel information...',
  'load.6': 'Aggregating data...',
  'load.7': 'AI is working hard...',
  'load.8': 'Please wait, takes 2-3 minutes...',
  'load.sub': 'Tinyfish AI is browsing the web — each site takes {min} minutes',

  // Hotel card
  'card.book': 'Book now',
  'card.gmaps': 'Google Maps',
  'card.reviews': 'reviews',
  'card.pernight': '/night',
  'card.distance.to': 'to',

  // Export
  'export.btn': 'Export Excel',
  'export.loading': 'Exporting...',
  'export.error': 'Cannot export file. Please try again.',

  // Map
  'map.hint': 'Click on a hotel to see distance to the attraction',
  'map.legend.attraction': 'Attraction',
  'map.legend.hotel': 'Hotel (with price)',
  'map.legend.line': 'Distance on click',
  'map.popup.attraction': 'Main attraction',
  'map.popup.reviews': 'reviews',
  'map.popup.book': 'Book now',
  'map.popup.pernight': '/night',
  'map.pin.attraction': 'Attraction',
}

export const translations: Record<Lang, TranslationMap> = { vi, en }

export function t(lang: Lang, key: string, vars?: Record<string, string>): string {
  let str = translations[lang][key] ?? translations['vi'][key] ?? key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v)
    })
  }
  return str
}
