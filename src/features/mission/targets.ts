// Daftar objek misi. Semua `id` HARUS sama persis dengan label kelas COCO-SSD (80 kelas bawaan model).
// Pisau (knife) sengaja tidak dimasukkan: tidak aman menyuruh orang yang baru bangun mengambil benda tajam.

export type Zone = "dapur" | "kamar-mandi" | "ruang-tamu" | "kamar"

export interface QuestTarget {
  id: string // label kelas COCO-SSD
  label: string // nama tampilan (Indonesia)
  zone: Zone
  threshold: number // skor minimum agar dianggap cocok
}

export const QUEST_TARGETS: QuestTarget[] = [
  // Dapur
  { id: "bottle", label: "Botol Minum", zone: "dapur", threshold: 0.45 },
  { id: "cup", label: "Gelas / Cangkir", zone: "dapur", threshold: 0.45 },
  { id: "bowl", label: "Mangkuk", zone: "dapur", threshold: 0.4 },
  { id: "spoon", label: "Sendok", zone: "dapur", threshold: 0.3 },
  { id: "fork", label: "Garpu", zone: "dapur", threshold: 0.3 },
  { id: "refrigerator", label: "Kulkas", zone: "dapur", threshold: 0.4 },
  { id: "banana", label: "Pisang", zone: "dapur", threshold: 0.4 },
  { id: "orange", label: "Jeruk", zone: "dapur", threshold: 0.4 },

  // Kamar mandi
  { id: "toothbrush", label: "Sikat Gigi", zone: "kamar-mandi", threshold: 0.3 },
  { id: "sink", label: "Wastafel / Bak Cuci", zone: "kamar-mandi", threshold: 0.4 },

  // Ruang tamu / ruang keluarga
  { id: "tv", label: "Televisi", zone: "ruang-tamu", threshold: 0.4 },
  { id: "remote", label: "Remote", zone: "ruang-tamu", threshold: 0.3 },
  { id: "couch", label: "Sofa", zone: "ruang-tamu", threshold: 0.4 },
  { id: "chair", label: "Kursi", zone: "ruang-tamu", threshold: 0.4 },
  { id: "potted plant", label: "Tanaman Pot", zone: "ruang-tamu", threshold: 0.4 },
  { id: "clock", label: "Jam Dinding", zone: "ruang-tamu", threshold: 0.4 },
  { id: "umbrella", label: "Payung", zone: "ruang-tamu", threshold: 0.4 },
  { id: "backpack", label: "Tas Ransel", zone: "ruang-tamu", threshold: 0.4 },

  // Dekat kasur (mudah dijangkau tanpa bangun, jadi tidak dipakai untuk acak bila AWAY_FROM_BED_ONLY = true)
  { id: "cell phone", label: "Ponsel Lain", zone: "kamar", threshold: 0.45 },
  { id: "book", label: "Buku", zone: "kamar", threshold: 0.3 },
  { id: "laptop", label: "Laptop", zone: "kamar", threshold: 0.4 },
  { id: "mouse", label: "Mouse", zone: "kamar", threshold: 0.3 },
  { id: "scissors", label: "Gunting", zone: "kamar", threshold: 0.3 },
  { id: "teddy bear", label: "Boneka", zone: "kamar", threshold: 0.4 },
]

// true  = target acak hanya dari objek yang jauh dari kasur (memaksa pengguna berdiri dan berjalan)
// false = semua objek ikut, berguna saat testing di meja
export const AWAY_FROM_BED_ONLY = true

export function getTarget(id: string): QuestTarget | undefined {
  return QUEST_TARGETS.find((t) => t.id === id.trim().toLowerCase())
}

export function getTargetLabel(id: string): string {
  return getTarget(id)?.label ?? id
}

// alarm.targetObject = "random" -> acak; selain itu pakai objek spesifik (jika dikenali)
export function pickTarget(alarmTargetId?: string): QuestTarget {
  if (alarmTargetId && alarmTargetId !== "random") {
    const fixed = getTarget(alarmTargetId)
    if (fixed) return fixed
  }
  const pool = AWAY_FROM_BED_ONLY ? QUEST_TARGETS.filter((t) => t.zone !== "kamar") : QUEST_TARGETS
  return pool[Math.floor(Math.random() * pool.length)]
}