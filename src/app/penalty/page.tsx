"use client"

import { useRouter } from "next/navigation"
import { IconSkull } from "@tabler/icons-react"

export default function PenaltyPage() {
  const router = useRouter()

  return (
    <main className="flex-1 bg-foreground text-background flex flex-col items-center justify-center p-8 text-center min-h-screen animate-in fade-in duration-500">
      <IconSkull stroke={1.5} className="w-48 h-48 mb-8 animate-pulse" />
      <h1 className="text-7xl font-extrabold tracking-tighter uppercase mb-4">Misi Gagal</h1>
      
      <div className="border-4 border-background p-6 w-full max-w-sm mb-12">
        <p className="text-xl font-bold uppercase tracking-widest">
          Anda Memilih Menyerah
        </p>
      </div>

      <button 
        onClick={() => router.push("/")}
        className="w-full max-w-sm p-6 bg-background text-foreground font-extrabold text-2xl uppercase tracking-widest hover:opacity-80 transition-opacity focus:outline-none focus:ring-4 focus:ring-muted"
      >
        Terima Penalti
      </button>
    </main>
  )
}