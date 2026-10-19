import { useEffect, useState, useRef } from "react"
import * as tf from "@tensorflow/tfjs"
import * as cocoSsd from "@tensorflow-models/coco-ssd"

export function useObjectScanner(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  targetObject: string
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    let model: cocoSsd.ObjectDetection | null = null
    let isActive = true

    async function loadModel() {
      await tf.ready()
      model = await cocoSsd.load({ base: "lite_mobilenet_v2" })
      if (isActive) setIsModelLoaded(true)
    }

    loadModel()

    async function detect() {
      if (!isActive || !model || !videoRef.current) return

      if (videoRef.current.readyState === 4) {
        const predictions = await model.detect(videoRef.current)
        const found = predictions.some(
          (p) => p.class === targetObject && p.score > 0.6
        )

        if (found) {
          setIsSuccess(true)
          isActive = false
          return
        }
      }

      if (isActive) {
        animationRef.current = requestAnimationFrame(detect)
      }
    }

    if (isModelLoaded && !isSuccess) {
      detect()
    }

    return () => {
      isActive = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [videoRef, targetObject, isModelLoaded, isSuccess])

  return { isModelLoaded, isSuccess }
}