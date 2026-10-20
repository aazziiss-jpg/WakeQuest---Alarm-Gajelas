"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCamera } from "@/features/mission/useCamera"
import { useObjectScanner } from "@/features/mission/useObjectScanner"
import { getTargetLabel } from "@/features/mission/targets"
import { useHistoryStore } from "@/features/history/store"
import { IconAlertTriangle, IconFocus2 } from "@tabler/icons-react"

function MissionContent() {
  const searchParams = useSearchParams()
  const target = searchParams.get("target") || "bottle"
  const alarmId = searchParams.get("alarmId")

  const router = useRouter()
  const addHistory = useHistoryStore((state) => state.addHistory)

  const { videoRef, hasPermission } = useCamera()
  const { isModelLoaded, isSuccess, predictions, error } = useObjectScanner(videoRef, target)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (isSuccess && alarmId) {
      // Alarm sekali pakai sudah dinonaktifkan oleh AlarmEngine saat berbunyi; alarm berulang harus tetap aktif.
      addHistory({ alarmId, status: "success", scannedObject: target }).then(() => {
        router.push("/")
      })
    }
  }, [isSuccess, alarmId, target, addHistory, router])

  useEffect(() => {
    const handleResize = () => {
      if (videoRef.current) {
        setVideoSize({
          width: videoRef.current.clientWidth,
          height: videoRef.current.clientHeight
        })
      }
    }

    window.addEventListener("resize", handleResize)
    const interval = setInterval(handleResize, 1000)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(interval)
    }
  }, [videoRef, isModelLoaded])

  const handleGiveUp = async () => {
    if (alarmId) {
      await addHistory({ alarmId, status: "penalty", scannedObject: "none" })
    }
    router.push("/penalty")
  }

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
            {getTargetLabel(target)}
          </span>
        </div>
      </header>

      <div 
        ref={containerRef}
        className="relative flex-1 border-4 border-foreground bg-muted overflow-hidden flex items-center justify-center min-h-96"
      >
        {error && (
          <div className="absolute inset-0 z-30 bg-background flex items-center justify-center p-4 text-center">
            <span className="font-extrabold uppercase tracking-widest">{error}</span>
          </div>
        )}

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

        {isModelLoaded && videoRef.current && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox={`0 0 ${videoRef.current.videoWidth || 640} ${videoRef.current.videoHeight || 480}`}
            preserveAspectRatio="xMidYMid slice"
          >
            {predictions.map((pred, i) => {
              const [x, y, width, height] = pred.bbox
              const isTarget = pred.class === target.toLowerCase()
              const percentage = Math.round(pred.score * 100)

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="none"
                    stroke={isTarget ? "#00ff00" : "#ff0000"}
                    strokeWidth="4"
                    className="animate-in fade-in duration-100"
                  />
                  <rect
                    x={x}
                    y={y > 24 ? y - 24 : y}
                    width={width > 120 ? 120 : width}
                    height="24"
                    fill={isTarget ? "#00ff00" : "#ff0000"}
                  />
                  <text
                    x={x + 4}
                    y={y > 24 ? y - 8 : y + 16}
                    fill={isTarget ? "#000000" : "#ffffff"}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pred.class.toUpperCase()} ({percentage}%)
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {isModelLoaded && (
          <div className="absolute inset-0 border-8 border-transparent border-t-foreground border-b-foreground opacity-20 animate-pulse pointer-events-none" />
        )}
      </div>

      <button 
        onClick={handleGiveUp}
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