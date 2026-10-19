"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCamera } from "@/features/mission/useCamera"
import { useObjectScanner } from "@/features/mission/useObjectScanner"
import { useAlarmStore } from "@/features/alarm/store"
import { IconAlertTriangle, IconFocus2 } from "@tabler/icons-react"

function MissionContent() {
  const searchParams = useSearchParams()
  const target = searchParams.get("target") || "bottle"
  const alarmId = searchParams.get("alarmId")

  const router = useRouter()
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm)

  const { videoRef, hasPermission } = useCamera()
  const { isModelLoaded, isSuccess } = useObjectScanner(videoRef, target)

  useEffect(() => {
    if (isSuccess && alarmId) {
      toggleAlarm(alarmId).then(() => {
        router.push("/")
      })
    }
  }, [isSuccess, alarmId, toggleAlarm, router])

  if (hasPermission === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-4 border-foreground m-4">
        <IconAlertTriangle stroke={2} className="w-16 h-16 mb-4" />
        <h1 className="text-2xl font-extrabold uppercase">Akses Ditolak</h1>
        <p className="font-bold mt-2">Kamera diperlukan untuk menghentikan alarm.</p>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col p-4 md:p-8 max-w-xl mx-auto w-full gap-4">
      <header className="border-b-4 border-foreground pb-4 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase">Pindai Objek</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">AI Sedang Aktif</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-widest block mb-1">Target</span>
          <span className="text-xl font-extrabold uppercase bg-foreground text-background px-2 py-1">
            {target}
          </span>
        </div>
      </header>

      <div className="relative flex-1 border-4 border-foreground bg-muted overflow-hidden flex items-center justify-center min-h-96">
        {!isModelLoaded && (
          <div className="absolute inset-0 z-10 bg-background flex flex-col items-center justify-center p-4 text-center">
            <IconFocus2 stroke={2} className="w-12 h-12 mb-4 animate-spin" />
            <span className="font-extrabold uppercase tracking-widest animate-pulse">Memuat AI...</span>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {isModelLoaded && (
          <div className="absolute inset-0 border-8 border-transparent border-t-foreground border-b-foreground opacity-20 animate-pulse pointer-events-none" />
        )}
      </div>

      <button 
        onClick={() => router.push("/")}
        className="p-6 border-4 border-foreground font-extrabold text-xl uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
      >
        Menyerah (Penalti)
      </button>
    </main>
  )
}

export default function MissionPage() {
  return (
    <Suspense fallback={<div className="p-8 font-extrabold uppercase text-center animate-pulse mt-20">Memuat Sistem Misi...</div>}>
      <MissionContent />
    </Suspense>
  )
}