import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import PageTransition from '@/components/ui/PageTransition'
import SwipeNavigation from '@/components/ui/SwipeGestures'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quality Control - Relationship Check-in App',
  description: 'A thoughtful approach to relationship wellness through regular check-ins',
  keywords: 'relationship, wellness, check-in, couples, mental health, communication',
  authors: [{ name: 'Quality Control Team' }],
  creator: 'Quality Control',
  publisher: 'Quality Control',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://qc-app.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Quality Control - Relationship Check-in App',
    description: 'A thoughtful approach to relationship wellness through regular check-ins',
    url: 'https://qc-app.com',
    siteName: 'Quality Control',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quality Control - Relationship Wellness App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Control - Relationship Check-in App',
    description: 'A thoughtful approach to relationship wellness through regular check-ins',
    images: ['/og-image.png'],
    creator: '@qualitycontrol',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quality Control',
    startupImage: [
      '/apple-splash-2048-2732.jpg',
      '/apple-splash-1668-2224.jpg',
      '/apple-splash-1536-2048.jpg',
      '/apple-splash-1125-2436.jpg',
      '/apple-splash-1242-2208.jpg',
      '/apple-splash-750-1334.jpg',
      '/apple-splash-640-1136.jpg',
    ],
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} gradient-romantic min-h-screen antialiased touch-manipulation`}>
          <div className="flex min-h-screen lg:h-screen safe-area-inset">
            {/* Desktop Sidebar Navigation */}
            <Navigation />
            
            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col">
              <Header />
              
              {/* Page Content */}
              <main className="flex-1 overflow-auto pb-16 lg:pb-0 px-4 sm:px-6 lg:px-8 py-6 safe-area-bottom scroll-smooth">
                <div className="lg:hidden">
                  <SwipeNavigation className="min-h-full" enableBackSwipe disabled={false}>
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </SwipeNavigation>
                </div>
                <div className="hidden lg:block">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
              </main>
            </div>
          </div>
        
        {/* PWA Install Prompt Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
              
              // PWA Install Prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                // Show custom install button if needed
              });
              
              // Handle app installed
              window.addEventListener('appinstalled', (evt) => {
                console.log('QC App installed');
              });
            `,
          }}
        />
      </body>
    </html>
  )
}