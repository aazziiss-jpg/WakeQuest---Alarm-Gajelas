import Dexie, { type Table } from "dexie"
import { Alarm, MissionHistory } from "@/types/database"

export class WakeQuestDB extends Dexie {
  alarms!: Table<Alarm, string>
  history!: Table<MissionHistory, string>

  constructor() {
    super("WakeQuestDB")
    this.version(1).stores({
      alarms: "id, time, isActive",
      history: "id, alarmId, status, completedAt"
    })
  }
}

export const db = new WakeQuestDB()