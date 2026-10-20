"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { IconArrowLeft } from "@tabler/icons-react"
import { useToastStore } from "@/features/ui/toastStore"

export default function AuthPage() {
  const router = useRouter()
  const showToast = useToastStore((state) => state.showToast)
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        showToast("Berhasil masuk akun", "success")
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        showToast("Akun berhasil dibuat", "success")
      }
      router.push("/")
    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-xl mx-auto w-full flex flex-col pb-24">
      <header className="flex items-center gap-4 border-b-4 border-foreground pb-4 mt-4 mb-8">
        <Link href="/" className="p-2 border-2 border-transparent hover:border-foreground transition-colors">
          <IconArrowLeft stroke={2} className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase">
          {isLogin ? "Masuk Akun" : "Daftar Akun"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-widest">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-xl font-bold bg-transparent border-4 border-foreground p-4 focus:outline-none focus:ring-4 focus:ring-muted w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-widest">Kata Sandi</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="text-xl font-bold bg-transparent border-4 border-foreground p-4 focus:outline-none focus:ring-4 focus:ring-muted w-full"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="mt-4 p-5 bg-foreground text-background font-bold text-xl uppercase tracking-widest border-4 border-foreground hover:bg-background hover:text-foreground transition-colors focus:outline-none focus:ring-4 focus:ring-muted disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </button>
      </form>

      <div className="mt-8 text-center border-t-2 border-dashed border-border pt-8">
        <p className="font-bold uppercase tracking-widest text-sm mb-4">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
        </p>
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="p-3 border-2 border-foreground font-bold text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
        >
          {isLogin ? "Buat Akun Baru" : "Masuk dengan Akun"}
        </button>
      </div>
    </main>
  )
}