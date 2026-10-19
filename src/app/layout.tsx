import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { PWAProvider } from "@/components/PWAProvider"
import { RingingOverlay } from "@/features/alarm/RingingOverlay"
import { AlarmEngine } from "@/features/alarm/AlarmEngine"
import { WakeLockManager } from "@/components/WakeLockManager"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export const metadata: Metadata = {
  title: "WakeQuest",
  description: "Object-scanning alarm application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WakeQuest",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans min-h-screen flex flex-col`}>
        <PWAProvider>
          <WakeLockManager />
          <AlarmEngine />
          <RingingOverlay />
          {children}
        </PWAProvider>
      </body>
    </html>
  )
}