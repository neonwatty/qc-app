import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import PageTransition from '@/components/ui/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quality Control - Relationship Check-in App',
  description: 'A thoughtful approach to relationship wellness through regular check-ins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <ThemeProvider>
          <div className="flex h-screen">
            {/* Desktop Sidebar Navigation */}
            <Navigation />
            
            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col">
              <Header />
              
              {/* Page Content */}
              <main className="flex-1 overflow-auto pb-16 lg:pb-0 px-4 sm:px-6 lg:px-8 py-6">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}