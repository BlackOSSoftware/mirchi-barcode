import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Mirchi Haldi Dhaniya — Barcode App',
  description: 'Offline-capable barcode label generator and scanner'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
