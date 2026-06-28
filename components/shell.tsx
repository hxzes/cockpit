'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, ReceiptText, Radar, LogOut, Loader2, Menu, X } from 'lucide-react'
import { Chatbot } from './chatbot'
import { useAuth, logout } from '@/lib/auth'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: ReceiptText },
  { href: '/leadgen', label: 'Lead Gen', icon: Radar },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const { user, ready } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => { if (ready && !user) router.replace('/login') }, [ready, user, router])
  useEffect(() => { setOpen(false) }, [path])

  if (!ready) return <div className="min-h-screen grid place-items-center" style={{ background: '#F6F6F4' }}><Loader2 className="w-6 h-6 spin text-[var(--mut)]" /></div>
  if (!user) return null

  const SidebarInner = (
    <>
      <div className="h-[60px] flex items-center gap-2.5 px-5 border-b">
        <div className="w-7 h-7 rounded-lg bg-[#0F0F10] grid place-items-center text-white font-bold text-sm">m</div>
        <span className="font-semibold tracking-tight">moni <span className="text-[var(--mut)] font-normal">cockpit</span></span>
      </div>
      <nav className="p-3 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-[var(--sub)] px-3 mb-2 mt-2">Workspace</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = path === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] mb-0.5 transition-colors ${on ? 'bg-[var(--purple-bg)] text-[var(--purple)] font-medium' : 'text-[var(--mut)] hover:bg-[var(--bg)] hover:text-[var(--ink)]'}`}>
              <Icon className="w-[18px] h-[18px]" />{label}
            </Link>
          )
        })}
      </nav>
      <button onClick={() => { logout(); router.replace('/login') }}
        className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[var(--mut)] hover:bg-[var(--bg)] hover:text-[var(--ink)] transition-colors">
        <LogOut className="w-[18px] h-[18px]" /> Sign out
      </button>
      <div className="p-4 border-t text-[11px] text-[var(--sub)] truncate">{user.email}</div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside className="hidden md:flex w-[230px] shrink-0 bg-white border-r flex-col sticky top-0 h-screen">{SidebarInner}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-[260px] bg-white flex flex-col h-full fade">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-[var(--sub)]"><X className="w-5 h-5" /></button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="h-[60px] border-b bg-white flex items-center justify-between px-4 md:px-7 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="md:hidden text-[var(--ink)]"><Menu className="w-5 h-5" /></button>
            <span className="text-[var(--ink)] font-medium capitalize">{(path.split('/')[1] || 'dashboard').replace('leadgen', 'lead gen')}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F0F10] text-white grid place-items-center text-[13px] font-medium">{(user.email?.[0] || 'S').toUpperCase()}</div>
        </div>
        <div className="p-4 md:p-7 w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
      <Chatbot />
    </div>
  )
}
