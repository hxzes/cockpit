'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (ready && user) router.replace('/dashboard') }, [ready, user, router])

  const submit = async () => {
    setErr('')
    if (!email.trim()) { setErr('Zadaj email.'); return }
    if (pw.length < 6) { setErr('Heslo musí mať aspoň 6 znakov.'); return }
    setBusy(true)
    try { await login(email, pw); router.replace('/dashboard') }
    catch (e) {
      const raw = e instanceof Error ? e.message : ''
      const map: Record<string, string> = {
        'invalid-email': 'Neplatný email.',
        'invalid-credential': 'Zlý email alebo heslo.',
        'wrong-password': 'Zlé heslo.',
        'user-not-found': 'Účet neexistuje.',
        'too-many-requests': 'Príliš veľa pokusov, skús o chvíľu.',
        'operation-not-allowed': 'Email/heslo prihlásenie nie je zapnuté vo Firebase.',
      }
      const code = Object.keys(map).find(k => raw.includes(k))
      setErr(code ? map[code] : raw.replace('Firebase:', '').trim() || 'Nepodarilo sa.')
    }
    finally { setBusy(false) }
  }
  const fieldCls = 'w-full h-11 px-3.5 rounded-[11px] bg-white border text-sm transition-colors focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[rgba(11,11,12,.06)]'

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-[380px] rise">
        <div className="flex items-center gap-2.5 justify-center mb-7">
          <div className="w-9 h-9 rounded-xl bg-[var(--ink)] grid place-items-center text-white font-bold">m</div>
          <span className="font-semibold text-[18px] tracking-tight">moni <span className="text-[var(--mut)] font-normal">cockpit</span></span>
        </div>
        <div className="bg-white border rounded-[22px] p-7 shadow-[var(--sh-1)]">
          <h1 className="font-semibold text-[20px] tracking-tight mb-1">Sign in</h1>
          <p className="text-[13.5px] text-[var(--mut)] mb-6">Welcome back, Seb.</p>
          <label className="block mb-3.5"><span className="text-[13px] text-[var(--mut)] font-medium block mb-1.5">Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="seb@moni.fyi" className={fieldCls} /></label>
          <label className="block mb-5"><span className="text-[13px] text-[var(--mut)] font-medium block mb-1.5">Password</span>
            <input value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="••••••••" className={fieldCls} /></label>
          {err && <p className="text-[13px] text-[var(--red)] mb-3.5 bg-[var(--red-bg)] px-3 py-2 rounded-[10px]">{err}</p>}
          <button onClick={submit} disabled={busy}
            className="w-full h-11 rounded-[11px] bg-[var(--ink)] text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 active:scale-[.99] transition-all">
            {busy && <Loader2 className="w-4 h-4 spin" />}Sign in</button>
        </div>
        <p className="text-center text-[11px] text-[var(--sub)] mt-5">moni.fyi · private admin</p>
      </div>
    </div>
  )
}
