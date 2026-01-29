import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Keap Contact Viewer',
  description: 'Simple contact viewer for Keap CRM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
