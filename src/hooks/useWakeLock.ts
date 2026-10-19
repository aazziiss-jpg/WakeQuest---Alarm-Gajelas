import { useState, useEffect, useRef, useCallback } from "react"

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
        setIsLocked(true)
        
        wakeLockRef.current.addEventListener("release", () => {
          setIsLocked(false)
        })
      }
    } catch (err) {
      setIsLocked(false)
    }
  }, [])

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsLocked(false)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === "visible") {
        requestLock()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [requestLock])

  return { isLocked, requestLock, releaseLock }
}