import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cockpit — moni admin',
  description: 'Clients, projects, invoices and MRR for your web business.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body style={{ background: '#F6F6F4', color: '#0F0F10' }}>{children}</body>
    </html>
  )
}
