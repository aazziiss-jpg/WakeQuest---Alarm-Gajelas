"use client"

import { useToastStore } from "@/features/ui/toastStore"
import { IconX, IconCheck, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react"

export function ToastGlobal() {
  const toasts = useToastStore((state) => state.toasts)
  const hideToast = useToastStore((state) => state.hideToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => {
        const isError = toast.type === "error"
        const isSuccess = toast.type === "success"
        
        return (
          <div 
            key={toast.id}
            className={`border-4 p-4 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              isError ? "border-foreground bg-foreground text-background" : 
              isSuccess ? "border-foreground bg-background text-foreground" : 
              "border-foreground bg-muted text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              {isError && <IconAlertTriangle stroke={2} className="w-6 h-6" />}
              {isSuccess && <IconCheck stroke={2} className="w-6 h-6" />}
              {!isError && !isSuccess && <IconInfoCircle stroke={2} className="w-6 h-6" />}
              <span className="font-bold uppercase tracking-widest text-xs mt-0.5">{toast.message}</span>
            </div>
            <button 
              onClick={() => hideToast(toast.id)}
              className="p-1 hover:opacity-50 transition-opacity focus:outline-none"
            >
              <IconX stroke={2} className="w-5 h-5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}