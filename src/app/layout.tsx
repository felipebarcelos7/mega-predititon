import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MegaFortuna520',
  description: 'Gerador de números para a MegaSena com filtros e regras personalizáveis',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="container mx-auto px-4 py-1">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
