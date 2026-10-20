import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { db } from "@/features/storage/db"
import { useToastStore } from "@/features/ui/toastStore"

interface AuthState {
  user: User | null
  isInitialized: boolean
  initAuth: () => Promise<void>
  logout: () => Promise<void>
}

const restoreData = async (userId: string) => {
  let restored = false
  const alarmCount = await db.alarms.count()
  if (alarmCount === 0) {
    const { data: alarms } = await supabase.from("alarms").select("*").eq("user_id", userId)
    if (alarms && alarms.length > 0) {
      await db.alarms.bulkPut(
        alarms.map((a) => ({
          id: a.id,
          time: a.time,
          days: a.days,
          isActive: a.is_active,
          targetObject: a.target_object,
          ringtone: a.ringtone,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        }))
      )
      restored = true
    }
  }

  const historyCount = await db.history.count()
  if (historyCount === 0) {
    const { data: history } = await supabase.from("history").select("*").eq("user_id", userId)
    if (history && history.length > 0) {
      await db.history.bulkPut(
        history.map((h) => ({
          id: h.id,
          alarmId: h.alarm_id,
          status: h.status,
          scannedObject: h.scanned_object,
          completedAt: h.completed_at,
        }))
      )
      restored = true
    }
  }
  
  if (restored) {
    useToastStore.getState().showToast("Data cadangan berhasil dipulihkan", "success")
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  initAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, isInitialized: true })

    if (session?.user) {
      await restoreData(session.user.id)
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null })
      if (event === "SIGNED_IN" && session?.user) {
        await restoreData(session.user.id)
      }
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
    await db.alarms.clear()
    await db.history.clear()
    useToastStore.getState().showToast("Berhasil keluar akun", "info")
    window.location.href = "/"
  }
}))