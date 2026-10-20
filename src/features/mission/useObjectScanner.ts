import { useEffect, useState, useRef } from "react"
import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import * as cocoSsd from "@tensorflow-models/coco-ssd"

export interface Prediction {
  bbox: [number, number, number, number]
  class: string
  score: number
}

export function useObjectScanner(videoRef: React.RefObject<HTMLVideoElement | null>, targetObject: string) {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const requestRef = useRef<number | null>(null)
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
      } catch (err) {}
    }

    loadModel()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return

    const video = videoRef.current
    let detectFrame = async () => {
      if (video.readyState < 2 || !modelRef.current) {
        requestRef.current = requestAnimationFrame(detectFrame)
        return
      }

      try {
        const preds = await modelRef.current.detect(video)
        
        const validPredictions = preds.map(p => ({
          bbox: p.bbox as [number, number, number, number],
          class: p.class,
          score: p.score
        }))

        setPredictions(validPredictions)

        const match = validPredictions.find(
          (p) => p.class === targetObject.toLowerCase() && p.score >= 0.45
        )

        if (match) {
          setIsSuccess(true)
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current)
          }
          return
        }
      } catch (err) {}

      requestRef.current = requestAnimationFrame(detectFrame)
    }

    detectFrame()

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isModelLoaded, videoRef, targetObject])

  return { isModelLoaded, isSuccess, predictions }
}