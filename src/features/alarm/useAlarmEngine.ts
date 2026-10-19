import { useEffect, useRef } from "react"
import { useAlarmStore } from "@/features/alarm/store"

export function useAlarmEngine() {
  const alarms = useAlarmStore((state) => state.alarms)
  const triggerAlarm = useAlarmStore((state) => state.triggerAlarm)
  const ringingAlarmId = useAlarmStore((state) => state.ringingAlarmId)
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm)

  const lastTriggered = useRef<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (ringingAlarmId) return

      const now = new Date()
      const currentHours = now.getHours().toString().padStart(2, "0")
      const currentMinutes = now.getMinutes().toString().padStart(2, "0")
      const currentTime = `${currentHours}:${currentMinutes}`
      const currentDay = now.getDay()

      if (lastTriggered.current === currentTime) return

      const activeAlarm = alarms.find((alarm) => {
        if (!alarm.isActive || alarm.time !== currentTime) return false
        if (alarm.days.length === 0) return true
        return alarm.days.includes(currentDay)
      })

      if (activeAlarm) {
        triggerAlarm(activeAlarm.id)
        lastTriggered.current = currentTime
        
        if (activeAlarm.days.length === 0) {
          toggleAlarm(activeAlarm.id)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [alarms, ringingAlarmId, triggerAlarm, toggleAlarm])
}