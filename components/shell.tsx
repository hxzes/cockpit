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
  const [menu, setMenu] = useState(false)   // mobile nav sheet
  const [acct, setAcct] = useState(false)   // account dropdown

  useEffect(() => { if (ready && !user) router.replace('/login') }, [ready, user, router])
  useEffect(() => { setMenu(false); setAcct(false) }, [path])

  if (!ready) return (
    <div className="min-h-screen grid place-items-center">
      <Loader2 className="w-6 h-6 spin text-[var(--sub)]" />
    </div>
  )
  if (!user) return null

  const initial = (user.email?.[0] || 'S').toUpperCase()

  const link = (active: boolean) =>
    `text-[13.5px] font-medium px-3.5 py-2 rounded-full transition-colors ${
      active ? 'bg-[var(--acc-bg)] text-[var(--ink)]' : 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--card-2)]'
    }`

  return (
    <div className="min-h-screen">
      {/* ===== floating pill nav ===== */}
      <header className="sticky top-0 z-40 pt-3 md:pt-4 px-3 md:px-6">
        <div className="max-w-[1080px] mx-auto rise">
          <div className="flex items-center gap-2.5 bg-[rgba(255,255,255,.78)] backdrop-blur-xl border rounded-full shadow-[var(--sh-1)] pl-4 pr-2 py-2">
            {/* logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-[26px] h-[26px] rounded-lg bg-[var(--ink)] grid place-items-center text-white font-bold text-[13px]">m</div>
              <span className="font-semibold text-[14.5px] tracking-tight hidden sm:block">moni <span className="text-[var(--mut)] font-normal">cockpit</span></span>
            </Link>

            {/* desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 ml-4">
              {NAV.map(({ href, label }) => (
                <Link key={href} href={href} className={link(path === href)}>{label}</Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* account */}
            <div className="relative">
              <button onClick={() => setAcct(a => !a)}
                className="w-[34px] h-[34px] rounded-full bg-[var(--ink)] text-white grid place-items-center text-[13px] font-medium hover:opacity-90 transition-opacity">
                {initial}
              </button>
              {acct && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAcct(false)} />
                  <div className="absolute right-0 mt-2.5 w-60 bg-white border rounded-2xl shadow-[var(--sh-2)] p-1.5 z-50 pop">
                    <div className="px-3 py-2.5">
                      <p className="text-[11px] text-[var(--sub)] uppercase tracking-wider">Signed in</p>
                      <p className="text-[13px] font-medium truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="h-px bg-[var(--line)] my-1" />
                    <button onClick={() => { logout(); router.replace('/login') }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] text-[var(--mut)] hover:bg-[var(--card-2)] hover:text-[var(--ink)] transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* mobile menu toggle */}
            <button onClick={() => setMenu(m => !m)} className="md:hidden w-[34px] h-[34px] rounded-full border grid place-items-center text-[var(--ink)] bg-white">
              {menu ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>

          {/* mobile nav sheet */}
          {menu && (
            <div className="md:hidden mt-2 bg-white border rounded-3xl shadow-[var(--sh-2)] p-2 pop">
              {NAV.map(({ href, label, icon: Icon }) => {
                const on = path === href
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] mb-0.5 transition-colors ${on ? 'bg-[var(--acc-bg)] text-[var(--ink)] font-medium' : 'text-[var(--mut)]'}`}>
                    <Icon className="w-[18px] h-[18px]" /> {label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* ===== content ===== */}
      <main className="max-w-[1080px] mx-auto px-4 md:px-6 pt-6 md:pt-7 pb-24">{children}</main>

      <Chatbot />
    </div>
  )
}
