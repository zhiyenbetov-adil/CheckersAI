import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { SupportChat } from '@/components/support-chat'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: 'Checkers AI - Master Checkers with AI',
  description: 'The next generation AI-powered checkers platform. Train with advanced AI, compete globally, and dominate the board.',
  keywords: ['checkers', 'draughts', 'AI', 'strategy game', 'online checkers', 'learn checkers'],
  authors: [{ name: 'Checkers AI' }],
  openGraph: {
    title: 'Checkers AI - Master Checkers with AI',
    description: 'The next generation AI-powered checkers platform',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f6f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <SupportChat />
          </ThemeProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
