import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vietnam Hotel Finder – Tìm Khách Sạn Việt Nam',
  description: 'Tìm khách sạn, resort, villa tốt nhất tại các điểm du lịch Việt Nam. So sánh giá, khoảng cách và đánh giá từ nhiều nguồn.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
