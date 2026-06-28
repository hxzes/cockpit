'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border rounded-xl ${className}`}>{children}</div>
}

export function StatCard({ label, value, sub, children }: { label: string; value: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-[13px] text-[var(--mut)]">{label}</p>
      <p className="text-[30px] font-bold tracking-tight mt-1 leading-none">{value}</p>
      {sub && <div className="mt-1.5 text-[13px]">{sub}</div>}
      {children && <div className="mt-3 -mx-1">{children}</div>}
    </div>
  )
}

const PILL: Record<string, string> = {
  paid: 'text-[var(--green)] bg-[var(--green-bg)]',
  active: 'text-[var(--green)] bg-[var(--green-bg)]',
  client: 'text-[var(--purple)] bg-[var(--purple-bg)]',
  pending: 'text-[var(--amber)] bg-amber-50',
  sent: 'text-[var(--amber)] bg-amber-50',
  lead: 'text-[var(--amber)] bg-amber-50',
  new: 'text-blue-600 bg-blue-50',
  reply: 'text-[var(--green)] bg-[var(--green-bg)]',
  overdue: 'text-[var(--red)] bg-red-50',
  churned: 'text-[var(--red)] bg-red-50',
  paused: 'text-[var(--mut)] bg-zinc-100',
  done: 'text-[var(--mut)] bg-zinc-100',
}
export function Pill({ status, children }: { status: string; children?: React.ReactNode }) {
  return <span className={`inline-flex items-center text-[12px] font-medium px-2.5 py-1 rounded-full ${PILL[status] || 'text-[var(--mut)] bg-zinc-100'}`}>{children || status}</span>
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border w-full max-w-[440px] p-5 fade" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[16px]">{title}</h3>
          <button onClick={onClose} className="text-[var(--sub)] hover:text-[var(--ink)]"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block mb-3"><span className="text-[13px] text-[var(--mut)] block mb-1.5">{label}</span>{children}</label>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full h-9 px-3 rounded-lg bg-white border text-sm focus:outline-none focus:border-[var(--purple)]" />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full h-9 px-3 rounded-lg bg-white border text-sm focus:outline-none focus:border-[var(--purple)]" />
}

export function Btn({ children, variant = 'primary', ...rest }: { children: React.ReactNode; variant?: 'primary' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = variant === 'primary'
    ? 'bg-[var(--amber)] hover:brightness-95 text-white'
    : 'bg-white border hover:border-[var(--mut)] text-[var(--ink)]'
  return <button {...rest} className={`h-9 px-4 rounded-lg text-sm font-medium transition-all ${cls}`}>{children}</button>
}
