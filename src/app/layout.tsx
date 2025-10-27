import type { Metadata } from "next"
import "./globals.css"
import "./fonts.css"
import "@/styles/nprogress-custom.css"
import { ConditionalLayout } from "@/components/ConditionalLayout"
import { AuthProvider } from '@/lib/supabase/auth'
import TopLoader from '@/components/TopLoader'

export const metadata: Metadata = {
  title: {
    default: "Digiafriq - Learn Digital Skills, Earn Affiliate Income",
    template: "%s | Digiafriq",
  },
  description:
    "Digiafriq empowers individuals to learn high-demand digital skills and earn 100% commission through our affiliate network.",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <TopLoader />
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
