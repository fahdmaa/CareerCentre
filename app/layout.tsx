import type { Metadata } from 'next'
import Script from 'next/script'
import ErrorBoundary from '../components/ErrorBoundary'
import './globals.css'
import './accessibility.css'

export const metadata: Metadata = {
  title: 'EMSI Career Center',
  description: 'EMSI Marrakech Career Center - Connecting students and alumni with career opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <main id="main-content">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  )
}