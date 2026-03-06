export interface Hotel {
  id: string
  name: string
  source: string // booking.com, agoda.com, etc.
  link: string
  googleMapsLink?: string
  phone?: string
  address?: string
  price?: {
    amount: number
    currency: string
    display: string
  }
  rating?: number
  reviewCount?: number
  distance?: string // distance to famous place
  coordinates?: {
    lat: number
    lng: number
  }
  image?: string
  amenities?: string[]
  description?: string
}

export interface SearchParams {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
  famousPlace: string
  limit: number
  priorities: string[]
}

export interface SearchResult {
  hotels: Hotel[]
  searchParams: SearchParams
  sources: string[]
  error?: string
}

export const VIETNAM_CITIES: Record<string, { lat: number; lng: number }> = {
  'đà lạt': { lat: 11.9404, lng: 108.4583 },
  'da lat': { lat: 11.9404, lng: 108.4583 },
  'dalat': { lat: 11.9404, lng: 108.4583 },
  'hà nội': { lat: 21.0278, lng: 105.8342 },
  'ha noi': { lat: 21.0278, lng: 105.8342 },
  'hanoi': { lat: 21.0278, lng: 105.8342 },
  'hồ chí minh': { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'hcm': { lat: 10.8231, lng: 106.6297 },
  'sài gòn': { lat: 10.8231, lng: 106.6297 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'danang': { lat: 16.0544, lng: 108.2022 },
  'hội an': { lat: 15.8801, lng: 108.338 },
  'hoi an': { lat: 15.8801, lng: 108.338 },
  'hoian': { lat: 15.8801, lng: 108.338 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  'nhatrang': { lat: 12.2388, lng: 109.1967 },
  'phú quốc': { lat: 10.2897, lng: 103.984 },
  'phu quoc': { lat: 10.2897, lng: 103.984 },
  'phuquoc': { lat: 10.2897, lng: 103.984 },
  'huế': { lat: 16.4674, lng: 107.5905 },
  'hue': { lat: 16.4674, lng: 107.5905 },
  'sa pa': { lat: 22.3364, lng: 103.8438 },
  'sapa': { lat: 22.3364, lng: 103.8438 },
  'hạ long': { lat: 20.9101, lng: 107.1839 },
  'ha long': { lat: 20.9101, lng: 107.1839 },
  'halong': { lat: 20.9101, lng: 107.1839 },
  'mũi né': { lat: 10.9296, lng: 108.2874 },
  'mui ne': { lat: 10.9296, lng: 108.2874 },
  'vũng tàu': { lat: 10.4113, lng: 107.1362 },
  'vung tau': { lat: 10.4113, lng: 107.1362 },
}

export const HOTEL_WEBSITES = [
  {
    id: 'booking',
    name: 'Booking.com',
    baseUrl: 'https://www.booking.com',
    buildSearchUrl: (p: SearchParams) => {
      const d = p.destination.replace(/ /g, '+')
      return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.destination)}&checkin=${p.checkIn}&checkout=${p.checkOut}&group_adults=${p.adults}&no_rooms=${p.rooms}&group_children=${p.children}`
    },
  },
  {
    id: 'agoda',
    name: 'Agoda.com',
    baseUrl: 'https://www.agoda.com',
    buildSearchUrl: (p: SearchParams) =>
      `https://www.agoda.com/search?city=${encodeURIComponent(p.destination)}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adults=${p.adults}&rooms=${p.rooms}`,
  },
  {
    id: 'airbnb',
    name: 'Airbnb.com',
    baseUrl: 'https://www.airbnb.com',
    buildSearchUrl: (p: SearchParams) =>
      `https://www.airbnb.com/s/${encodeURIComponent(p.destination)}--Vietnam/homes?checkin=${p.checkIn}&checkout=${p.checkOut}&adults=${p.adults}`,
  },
  {
    id: 'traveloka',
    name: 'Traveloka.com',
    baseUrl: 'https://www.traveloka.com',
    buildSearchUrl: (p: SearchParams) =>
      `https://www.traveloka.com/en-vn/hotel/search?destination=${encodeURIComponent(p.destination)}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adult=${p.adults}&room=${p.rooms}`,
  },
  {
    id: 'vntrip',
    name: 'Vntrip.vn',
    baseUrl: 'https://www.vntrip.vn',
    buildSearchUrl: (p: SearchParams) =>
      `https://www.vntrip.vn/khach-san?address=${encodeURIComponent(p.destination)}&start_date=${p.checkIn}&end_date=${p.checkOut}&num_adult=${p.adults}&num_room=${p.rooms}`,
  },
]
