export interface Alarm {
    id: string
    time: string
    days: number[]
    isActive: boolean
    targetObject: string
    ringtone: string
    createdAt: number
    updatedAt: number
  }
  
  export interface MissionHistory {
    id: string
    alarmId: string
    status: "success" | "penalty"
    scannedObject: string
    completedAt: number
  }