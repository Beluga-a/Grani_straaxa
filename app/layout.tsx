import type { Metadata } from 'next'
import Script from 'next/script'
import { Cormorant_Garamond, Montserrat, DM_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/auth'
import { QuestProvider } from '@/lib/quests'
import { ThemeProvider } from '@/lib/theme'
import Header from '@/components/layout/Header'
import Toast from '@/components/ui/Toast'
import CursorLoader from '@/components/ui/CursorLoader'

const serif = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
})

const sans = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'ГРАНИ СТРАХА — Horror Quest World',
  description: 'Премиальные хоррор-квесты с живыми актёрами. Только для смельчаков. 18+',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="dark" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`try{var t=localStorage.getItem('gs_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`}</Script>
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <QuestProvider>
              <CursorLoader />
<Toast />
              <Header />
              {children}
            </QuestProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
