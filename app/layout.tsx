import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PHProvider } from './providers/PostHogProvider'
import { PageViewTracker } from './providers/PageViewTracker'
import { StagePlotProvider } from '@/providers/StagePlotProvider'
import { Header } from '@/components/Header'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_ENV === 'production'
      ? 'https://miked.live'
      : process.env.VERCEL_ENV
        ? 'https://dev.miked.live'
        : 'http://localhost:3000'
  ),
  title: 'miked.live',
  description: 'Create a professional technical rider and stage plot in 5 minutes. No account needed.',
  alternates: {
    canonical: 'https://miked.live',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Your Tech Rider. Done in 5 Minutes.',
    description: 'Create professional 3D stage plots and technical riders instantly. Drag, drop, and download.',
    url: 'https://miked.live',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 675,
        alt: 'Miked.live - Professional Stage Plot Designer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Tech Rider. Done in 5 Minutes.',
    description: 'Create professional 3D stage plots and technical riders instantly.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'miked.live',
              url: 'https://miked.live',
              description: 'Create a professional technical rider and stage plot in 5 minutes. No account needed.',
              applicationCategory: 'MusicApplication',
              operatingSystem: 'Web',
            }),
          }}
        />
      </head>
      <body className="bg-white text-slate-900">
        <StagePlotProvider>
          <PHProvider>
            <PageViewTracker />
            <div className="h-dvh overflow-hidden flex flex-col">
              <Header />
              <main className="flex-1 min-h-0 overflow-auto flex flex-col">
                {children}
              </main>
            </div>
          </PHProvider>
        </StagePlotProvider>
      </body>
    </html>
  )
}
