"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAlarmStore } from "@/features/alarm/store"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

const DAYS = ["M", "S", "S", "R", "K", "J", "S"]

export default function CreateAlarmPage() {
  const router = useRouter()
  const addAlarm = useAlarmStore((state) => state.addAlarm)

  const [time, setTime] = useState("05:00")
  const [days, setDays] = useState<number[]>([])

  const toggleDay = (index: number) => {
    setDays((prev) => 
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addAlarm({
      time,
      days,
      isActive: true,
      targetObject: "random",
      ringtone: "/default-ringtone.mp3"
    })
    router.push("/")
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-xl mx-auto w-full flex flex-col pb-24">
      <header className="flex items-center gap-4 border-b-2 border-foreground pb-4 mt-4 mb-8">
        <Link href="/" className="p-2 border-2 border-transparent hover:border-foreground transition-colors">
          <IconArrowLeft stroke={2} className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase">Misi Baru</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-widest">Waktu Alarm</label>
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="text-6xl font-extrabold bg-transparent border-2 border-foreground p-4 focus:outline-none focus:ring-4 focus:ring-muted w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-widest">Hari Aktif (Opsional)</label>
          <div className="flex gap-2 w-full justify-between">
            {DAYS.map((day, index) => {
              const isSelected = days.includes(index)
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold border-2 transition-colors ${isSelected ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"}`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <button 
          type="submit"
          className="mt-4 p-5 bg-foreground text-background font-bold text-xl uppercase tracking-widest border-2 border-foreground hover:bg-background hover:text-foreground transition-colors focus:outline-none focus:ring-4 focus:ring-muted"
        >
          Simpan Alarm
        </button>
      </form>
    </main>
  )
}