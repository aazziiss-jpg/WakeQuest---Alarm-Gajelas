import { Alarm } from "@/types/database"
import { useAlarmStore } from "@/features/alarm/store"
import { IconTrash, IconTarget } from "@tabler/icons-react"

interface AlarmCardProps {
  alarm: Alarm
}

const DAYS = ["M", "S", "S", "R", "K", "J", "S"]

export function AlarmCard({ alarm }: AlarmCardProps) {
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm)
  const deleteAlarm = useAlarmStore((state) => state.deleteAlarm)

  return (
    <div className={`border-2 p-5 flex flex-col gap-5 transition-colors ${alarm.isActive ? "border-foreground bg-background text-foreground" : "border-border bg-muted text-muted-foreground"}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-6xl font-extrabold tracking-tighter">{alarm.time}</h2>
          <div className="flex items-center gap-2 mt-1">
            <IconTarget stroke={2} className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">{alarm.targetObject}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => deleteAlarm(alarm.id)}
            className="p-2 border-2 border-transparent hover:border-foreground transition-colors"
          >
            <IconTrash stroke={2} className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleAlarm(alarm.id)}
            className={`w-14 h-7 flex border-2 p-0.5 transition-colors ${alarm.isActive ? "border-foreground bg-foreground" : "border-muted-foreground bg-transparent"}`}
          >
            <div className={`w-5 h-5 transition-transform ${alarm.isActive ? "translate-x-7 bg-background" : "translate-x-0 bg-muted-foreground"}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {DAYS.map((day, index) => {
          const isActiveDay = alarm.days.includes(index)
          return (
            <div 
              key={index} 
              className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 transition-colors ${isActiveDay && alarm.isActive ? "border-foreground bg-foreground text-background" : isActiveDay && !alarm.isActive ? "border-muted-foreground text-muted-foreground" : "border-transparent text-muted-foreground opacity-30"}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}