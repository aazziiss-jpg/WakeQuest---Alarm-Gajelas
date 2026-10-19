"use client"

import { useEffect } from "react"
import { useWakeLock } from "@/hooks/useWakeLock"
import { useAlarmStore } from "@/features/alarm/store"
import { IconBolt } from "@tabler/icons-react"

export function WakeLockManager() {
  const alarms = useAlarmStore((state) => state.alarms)
  const hasActiveAlarm = alarms.some((a) => a.isActive)
  const { isLocked, requestLock, releaseLock } = useWakeLock()

  useEffect(() => {
    if (hasActiveAlarm && !isLocked) {
      requestLock()
    } else if (!hasActiveAlarm && isLocked) {
      releaseLock()
    }
  }, [hasActiveAlarm, isLocked, requestLock, releaseLock])

  if (!isLocked) return null

  return (
    <div className="fixed top-0 left-0 w-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 flex items-center justify-center gap-2 z-[9998]">
      <IconBolt stroke={2} className="w-3 h-3" />
      <span>Layar Tetap Menyala. Hubungkan Pengisi Daya.</span>
    </div>
  )
}