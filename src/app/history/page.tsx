"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useHistoryStore } from "@/features/history/store"
import { IconArrowLeft, IconCheck, IconSkull } from "@tabler/icons-react"

export default function HistoryPage() {
  const { history, isLoaded, fetchHistory } = useHistoryStore()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp))
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-xl mx-auto w-full flex flex-col pb-24">
      <header className="flex items-center gap-4 border-b-4 border-foreground pb-4 mt-4 mb-8">
        <Link href="/" className="p-2 border-2 border-transparent hover:border-foreground transition-colors">
          <IconArrowLeft stroke={2} className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase">Riwayat Misi</h1>
      </header>

      {!isLoaded ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 border-2 border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border text-muted-foreground mt-8">
          <p className="font-bold uppercase tracking-widest text-sm">Belum ada riwayat</p>
          <p className="text-xs mt-2 font-medium">Riwayat akan muncul setelah alarm berbunyi.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((entry) => {
            const isSuccess = entry.status === "success"
            return (
              <div 
                key={entry.id} 
                className={`border-4 p-5 flex items-center justify-between transition-colors ${
                  isSuccess 
                    ? "border-foreground bg-background text-foreground" 
                    : "border-foreground bg-foreground text-background"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {formatDate(entry.completedAt)}
                  </span>
                  <span className="text-2xl font-extrabold uppercase">
                    {isSuccess ? entry.scannedObject : "Menyerah"}
                  </span>
                </div>
                
                <div className="p-2">
                  {isSuccess ? (
                    <IconCheck stroke={3} className="w-8 h-8" />
                  ) : (
                    <IconSkull stroke={2} className="w-8 h-8 animate-pulse" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}