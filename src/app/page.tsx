"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAlarmStore } from "@/features/alarm/store"
import { useAuthStore } from "@/features/auth/store"
import { AlarmCard } from "@/features/alarm/AlarmCard"
import { IconPlus, IconHistory, IconUser, IconLogout } from "@tabler/icons-react"

export default function HomePage() {
  const { alarms, isLoaded, fetchAlarms } = useAlarmStore()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    fetchAlarms()
  }, [fetchAlarms])

  return (
    <main className="flex-1 p-4 md:p-8 max-w-xl mx-auto w-full flex flex-col gap-6 pb-24">
      <header className="flex justify-between items-end border-b-2 border-foreground pb-4 mt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">WakeQuest</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Misi Pagi Hari
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/history" 
            className="p-2 border-2 border-transparent hover:border-foreground transition-colors focus:outline-none focus:ring-4 focus:ring-muted"
            aria-label="Lihat Riwayat Misi"
          >
            <IconHistory stroke={2} className="w-6 h-6" />
          </Link>
          {user ? (
            <button 
              onClick={() => logout()}
              className="p-2 border-2 border-transparent hover:border-foreground transition-colors focus:outline-none focus:ring-4 focus:ring-muted text-red-500 hover:text-foreground"
              aria-label="Keluar Akun"
            >
              <IconLogout stroke={2} className="w-6 h-6" />
            </button>
          ) : (
            <Link 
              href="/auth" 
              className="p-2 border-2 border-transparent hover:border-foreground transition-colors focus:outline-none focus:ring-4 focus:ring-muted"
              aria-label="Masuk Akun"
            >
              <IconUser stroke={2} className="w-6 h-6" />
            </Link>
          )}
        </div>
      </header>

      {!isLoaded ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 border-2 border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : alarms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border text-muted-foreground mt-8">
          <p className="font-bold uppercase tracking-widest text-sm">Belum ada alarm</p>
          <p className="text-xs mt-2 font-medium">Tekan tombol + untuk menambahkan misi baru.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {alarms.map((alarm) => (
            <AlarmCard key={alarm.id} alarm={alarm} />
          ))}
        </div>
      )}

      <Link 
        href="/create"
        className="fixed bottom-6 right-6 w-16 h-16 bg-foreground text-background flex items-center justify-center border-2 border-foreground hover:bg-background hover:text-foreground transition-colors z-50 focus:outline-none focus:ring-4 focus:ring-muted"
        aria-label="Tambah Alarm Baru"
      >
        <IconPlus stroke={2} className="w-8 h-8" />
      </Link>
    </main>
  )
}