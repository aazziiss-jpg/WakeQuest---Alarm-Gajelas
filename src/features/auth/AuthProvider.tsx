"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/features/auth/store"

const PUBLIC_ROUTES = ["/auth"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, user, isInitialized } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (!isInitialized) return
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (!user && !isPublic) {
      router.replace("/auth")
    } else if (user && isPublic) {
      router.replace("/")
    }
  }, [user, isInitialized, pathname, router])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <span className="font-extrabold uppercase tracking-widest text-xl animate-pulse">
          Memuat Sesi...
        </span>
      </div>
    )
  }

  return <>{children}</>
}