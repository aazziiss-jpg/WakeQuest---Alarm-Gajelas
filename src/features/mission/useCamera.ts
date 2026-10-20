import { useEffect, useRef, useState } from "react"

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        // Cleanup sudah berjalan (mis. Strict Mode) saat izin kamera baru turun: matikan langsung
        if (cancelled) {
          s.getTracks().forEach((track) => track.stop())
          return
        }

        stream = s
        const video = videoRef.current
        if (video) {
          video.srcObject = s
          try {
            await video.play()
          } catch (err) {
            // AbortError terjadi bila srcObject diganti saat play() berjalan; aman diabaikan
            if (!(err instanceof DOMException && err.name === "AbortError")) {
              console.error("[Camera] Gagal memutar video:", err)
            }
          }
        }

        if (!cancelled) setHasPermission(true)
      } catch (err) {
        console.error("[Camera] Gagal mengakses kamera:", err)
        if (!cancelled) setHasPermission(false)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  return { videoRef, hasPermission }
}