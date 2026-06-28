'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, register, useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (ready && user) router.replace('/dashboard') }, [ready, user, router])

  const submit = async () => {
    setErr('')
    if (!email.trim()) { setErr('Zadaj email.'); return }
    if (pw.length < 6) { setErr('Heslo musi mat aspon 6 znakov.'); return }
    setBusy(true)
    try { mode === 'login' ? await login(email, pw) : await register(email, pw); router.replace('/dashboard') }
    catch (e) {
      const raw = e instanceof Error ? e.message : ''
      const map: Record<string, string> = {
        'email-already-in-use': 'Tento email uz existuje — prepni na Sign in.',
        'invalid-email': 'Neplatny email.',
        'weak-password': 'Heslo je prislabe (min. 6 znakov).',
        'invalid-credential': 'Zly email alebo heslo.',
        'wrong-password': 'Zle heslo.',
        'user-not-found': 'Ucet neexistuje — vytvor si ho cez Create one.',
        'too-many-requests': 'Prilis vela pokusov, skus o chvilu.',
        'operation-not-allowed': 'Email/heslo prihlasenie nie je zapnute vo Firebase.',
      }
      const code = Object.keys(map).find(k => raw.includes(k))
      setErr(code ? map[code] : raw.replace('Firebase:', '').trim() || 'Nepodarilo sa.')
    }
    finally { setBusy(false) }
  }
  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: '#F6F6F4' }}>
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#0F0F10] grid place-items-center text-white font-bold">m</div>
          <span className="font-semibold text-[18px] tracking-tight">moni <span className="text-[var(--mut)] font-normal">cockpit</span></span>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <h1 className="font-semibold text-[18px] mb-1">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-[13px] text-[var(--mut)] mb-5">{mode === 'login' ? 'Welcome back, Seb.' : 'Set up your admin login.'}</p>
          <label className="block mb-3"><span className="text-[13px] text-[var(--mut)] block mb-1.5">Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="seb@moni.fyi"
              className="w-full h-10 px-3 rounded-lg bg-white border text-sm focus:outline-none focus:border-[var(--purple)]" /></label>
          <label className="block mb-4"><span className="text-[13px] text-[var(--mut)] block mb-1.5">Password</span>
            <input value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="password" placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg bg-white border text-sm focus:outline-none focus:border-[var(--purple)]" /></label>
          {err && <p className="text-[13px] text-[var(--red)] mb-3">{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full h-10 rounded-lg bg-[var(--purple)] text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 spin" />}{mode === 'login' ? 'Sign in' : 'Create account'}</button>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }} className="w-full text-center text-[13px] text-[var(--mut)] mt-4 hover:text-[var(--ink)]">
            {mode === 'login' ? "No account yet? Create one" : 'Have an account? Sign in'}</button>
        </div>
      </div>
    </div>
  )
}
