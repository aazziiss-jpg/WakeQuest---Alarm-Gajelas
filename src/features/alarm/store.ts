import { create } from "zustand"
import { db } from "@/features/storage/db"
import { Alarm } from "@/types/database"
import { useAuthStore } from "@/features/auth/store"
import { supabase } from "@/lib/supabase"

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

const runCloudSync = async (promise: PromiseLike<any>) => {
  try {
    await promise
  } catch (err) {}
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

    const user = useAuthStore.getState().user
    if (user) {
      runCloudSync(
        supabase.from("alarms").insert({
          id: newAlarm.id,
          user_id: user.id,
          time: newAlarm.time,
          days: newAlarm.days,
          is_active: newAlarm.isActive,
          target_object: newAlarm.targetObject,
          ringtone: newAlarm.ringtone,
          created_at: newAlarm.createdAt,
          updated_at: newAlarm.updatedAt
        })
      )
    }
  },
  
  updateAlarm: async (id, updates) => {
    await db.alarms.update(id, { ...updates, updatedAt: Date.now() })
    await get().fetchAlarms()

    const user = useAuthStore.getState().user
    const updated = await db.alarms.get(id)
    if (user && updated) {
      runCloudSync(
        supabase.from("alarms").upsert({
          id: updated.id,
          user_id: user.id,
          time: updated.time,
          days: updated.days,
          is_active: updated.isActive,
          target_object: updated.targetObject,
          ringtone: updated.ringtone,
          created_at: updated.createdAt,
          updated_at: updated.updatedAt
        })
      )
    }
  },
  
  deleteAlarm: async (id) => {
    await db.alarms.delete(id)
    await get().fetchAlarms()

    const user = useAuthStore.getState().user
    if (user) {
      runCloudSync(supabase.from("alarms").delete().eq("id", id))
    }
  },
  
  toggleAlarm: async (id) => {
    const alarm = await db.alarms.get(id)
    if (alarm) {
      await db.alarms.update(id, { 
        isActive: !alarm.isActive,
        updatedAt: Date.now()
      })
      await get().fetchAlarms()

      const user = useAuthStore.getState().user
      const updated = await db.alarms.get(id)
      if (user && updated) {
        runCloudSync(
          supabase.from("alarms").upsert({
            id: updated.id,
            user_id: user.id,
            time: updated.time,
            days: updated.days,
            is_active: updated.isActive,
            target_object: updated.targetObject,
            ringtone: updated.ringtone,
            created_at: updated.createdAt,
            updated_at: updated.updatedAt
          })
        )
      }
    }
  },

  triggerAlarm: (id) => set({ ringingAlarmId: id }),
  
  clearRinging: () => set({ ringingAlarmId: null })
}))