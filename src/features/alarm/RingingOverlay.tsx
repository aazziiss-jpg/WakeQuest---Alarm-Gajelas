"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAlarmStore } from "@/features/alarm/store"
import { IconBellRinging, IconFocus2 } from "@tabler/icons-react"

export function RingingOverlay() {
  const ringingAlarmId = useAlarmStore((state) => state.ringingAlarmId)
  const alarms = useAlarmStore((state) => state.alarms)
  const clearRinging = useAlarmStore((state) => state.clearRinging)
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const activeAlarm = alarms.find((a) => a.id === ringingAlarmId)

  useEffect(() => {
    if (ringingAlarmId && activeAlarm) {
      audioRef.current = new Audio(activeAlarm.ringtone || "/default-ringtone.mp3")
      audioRef.current.loop = true
      audioRef.current.play().catch(() => {})
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [ringingAlarmId, activeAlarm])

  if (!ringingAlarmId || !activeAlarm) return null

  const handleStartMission = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    clearRinging()
    router.push(`/mission?target=${activeAlarm.targetObject}&alarmId=${activeAlarm.id}`)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-foreground text-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center animate-pulse mb-12">
        <IconBellRinging stroke={1.5} className="w-32 h-32 mb-6" />
        <h1 className="text-8xl font-extrabold tracking-tighter">{activeAlarm.time}</h1>
        <p className="text-xl font-bold uppercase tracking-widest mt-4">Waktunya Bangun</p>
      </div>

      <div className="flex flex-col items-center gap-2 mb-12 border-2 border-background p-6 w-full max-w-sm">
        <span className="text-sm font-bold uppercase tracking-widest opacity-70">Target Pindai</span>
        <span className="text-3xl font-extrabold uppercase flex items-center gap-3">
          <IconFocus2 stroke={2} className="w-8 h-8" />
          {activeAlarm.targetObject}
        </span>
      </div>

      <button
        onClick={handleStartMission}
        className="w-full max-w-sm p-6 bg-background text-foreground font-extrabold text-2xl uppercase tracking-widest border-4 border-transparent hover:border-background hover:bg-foreground hover:text-background transition-colors"
      >
        Mulai Misi
      </button>
    </div>
  )
}