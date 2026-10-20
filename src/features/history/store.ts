import { create } from "zustand"
import { db } from "@/features/storage/db"
import { MissionHistory } from "@/types/database"
import { useAuthStore } from "@/features/auth/store"
import { supabase } from "@/lib/supabase"

interface HistoryState {
  history: MissionHistory[]
  isLoaded: boolean
  fetchHistory: () => Promise<void>
  addHistory: (entry: Omit<MissionHistory, "id" | "completedAt">) => Promise<void>
}

const runCloudSync = async (promise: PromiseLike<any>) => {
  try {
    await promise
  } catch (err) {}
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  isLoaded: false,
  
  fetchHistory: async () => {
    const history = await db.history.orderBy("completedAt").reverse().toArray()
    set({ history, isLoaded: true })
  },
  
  addHistory: async (entry) => {
    const newEntry: MissionHistory = {
      ...entry,
      id: crypto.randomUUID(),
      completedAt: Date.now(),
    }
    await db.history.add(newEntry)
    await get().fetchHistory()

    const user = useAuthStore.getState().user
    if (user) {
      runCloudSync(
        supabase.from("history").insert({
          id: newEntry.id,
          user_id: user.id,
          alarm_id: newEntry.alarmId,
          status: newEntry.status,
          scanned_object: newEntry.scannedObject,
          completed_at: newEntry.completedAt
        })
      )
    }
  }
}))