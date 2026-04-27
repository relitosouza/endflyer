import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlyerLocal',
  description: 'Adicione endereços nos seus flyers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
