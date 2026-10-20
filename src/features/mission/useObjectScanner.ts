import { useEffect, useState, useRef } from "react"
import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import { getTarget } from "./targets"

export interface Prediction {
  bbox: [number, number, number, number]
  class: string
  score: number
}

// Skor minimum yang dikembalikan model (bawaan library 0.5, itu yang membuat objek sering "tidak terlihat")
const MODEL_MIN_SCORE = 0.15
const DEFAULT_THRESHOLD = 0.4
// Abaikan hasil selama beberapa detik pertama setelah kamera siap
const WARMUP_MS = 2000
// Objek harus terdeteksi berturut-turut (±0,75 detik) agar tidak lolos karena noise
const REQUIRED_HITS = 5
const DETECT_INTERVAL = 150

export function useObjectScanner(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  targetObject: string
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [error, setError] = useState<string | null>(null)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)

  useEffect(() => {
    let active = true

    const loadModel = async () => {
      try {
        await tf.ready()
        const model = await cocoSsd.load({ base: "mobilenet_v2" })
        if (active) {
          modelRef.current = model
          setIsModelLoaded(true)
        }
      } catch (err) {
        console.error("[Scanner] Gagal memuat model:", err)
        if (active) setError("Model AI gagal dimuat. Periksa koneksi internet.")
      }
    }

    loadModel()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isModelLoaded) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let hits = 0
    let readyAt: number | null = null

    const target = targetObject.trim().toLowerCase()
    const threshold = getTarget(target)?.threshold ?? DEFAULT_THRESHOLD

    const detectFrame = async () => {
      if (cancelled) return
      const video = videoRef.current
      const model = modelRef.current

      if (!video || !model || video.readyState < 2 || video.videoWidth === 0) {
        timer = setTimeout(detectFrame, DETECT_INTERVAL)
        return
      }

      if (readyAt === null) readyAt = performance.now()

      try {
        const preds = await model.detect(video, 20, MODEL_MIN_SCORE)
        if (cancelled) return

        const list: Prediction[] = preds.map((p) => ({
          bbox: p.bbox as [number, number, number, number],
          class: p.class,
          score: p.score,
        }))
        setPredictions(list)

        // Log debugging, hapus jika sudah stabil
        console.log("[Scanner] target:", target, "|", list.map((p) => `${p.class}:${p.score.toFixed(2)}`).join(", ") || "kosong")

        const warmedUp = performance.now() - readyAt >= WARMUP_MS
        const matched = list.some((p) => p.class === target && p.score >= threshold)
        hits = warmedUp && matched ? hits + 1 : 0

        if (hits >= REQUIRED_HITS) {
          setIsSuccess(true)
          return
        }
      } catch (err) {
        console.error("[Scanner] Error saat deteksi:", err)
      }

      timer = setTimeout(detectFrame, DETECT_INTERVAL)
    }

    detectFrame()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [isModelLoaded, videoRef, targetObject])

  return { isModelLoaded, isSuccess, predictions, error }
}