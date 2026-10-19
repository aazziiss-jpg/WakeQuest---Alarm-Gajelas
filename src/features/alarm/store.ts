import { create } from "zustand"
import { db } from "@/features/storage/db"
import { Alarm } from "@/types/database"

interface AlarmState {
  alarms: Alarm[]
  isLoaded: boolean
  ringingAlarmId: string | null
  fetchAlarms: () => Promise<void>
  addAlarm: (alarm: Omit<Alarm, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>
  deleteAlarm: (id: string) => Promise<void>
  toggleAlarm: (id: string) => Promise<void>
  triggerAlarm: (id: string) => void
  clearRinging: () => void
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  isLoaded: false,
  ringingAlarmId: null,
  
  fetchAlarms: async () => {
    const alarms = await db.alarms.toArray()
    set({ alarms, isLoaded: true })
  },
  
  addAlarm: async (alarmData) => {
    const newAlarm: Alarm = {
      ...alarmData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.alarms.add(newAlarm)
    await get().fetchAlarms()
  },
  
  updateAlarm: async (id, updates) => {
    await db.alarms.update(id, { ...updates, updatedAt: Date.now() })
    await get().fetchAlarms()
  },
  
  deleteAlarm: async (id) => {
    await db.alarms.delete(id)
    await get().fetchAlarms()
  },
  
  toggleAlarm: async (id) => {
    const alarm = await db.alarms.get(id)
    if (alarm) {
      await db.alarms.update(id, { 
        isActive: !alarm.isActive,
        updatedAt: Date.now()
      })
      await get().fetchAlarms()
    }
  },

  triggerAlarm: (id) => set({ ringingAlarmId: id }),
  
  clearRinging: () => set({ ringingAlarmId: null })
}))