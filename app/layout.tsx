import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthSessionProvider } from '@/components/providers/auth-session-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Computer Science Hub | CSH',
  description: 'La disrupción provoca innovación. Ecosistema evolutivo de Ciencias de la Computación: de comunidad educativa a mesa de ingeniería con identidad propia.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          {children}
          <Toaster />
          <Analytics />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
