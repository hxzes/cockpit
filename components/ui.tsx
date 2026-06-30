'use client'

import { X } from 'lucide-react'

export function Card({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return <div className={`bg-[var(--card)] border rounded-[var(--r)] ${hover ? 'lift' : ''} ${className}`}>{children}</div>
}

export function StatCard({ label, value, sub, children, accent = false, dot }: {
  label: string; value: string; sub?: React.ReactNode; children?: React.ReactNode; accent?: boolean; dot?: boolean
}) {
  return (
    <div className="bg-[var(--card)] border rounded-[var(--r)] p-5 lift relative overflow-hidden">
      {accent && <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[rgba(155,232,112,.10)] to-transparent pointer-events-none" />}
      <div className="relative flex items-center gap-1.5">
        {dot && <span className="w-[7px] h-[7px] rounded-full bg-[var(--acc)] shadow-[0_0_0_3px_var(--acc-bg)] livedot" />}
        <p className="text-[12.5px] text-[var(--mut)]">{label}</p>
      </div>
      <p className="text-[32px] font-semibold tighter mt-2 leading-none tabular-nums">{value}</p>
      {sub && <div className="mt-1.5 text-[13px] relative">{sub}</div>}
      {children && <div className="mt-3.5 -mx-0.5 relative">{children}</div>}
    </div>
  )
}

const PILL: Record<string, string> = {
  paid: 'text-[var(--green)] bg-[var(--green-bg)]',
  active: 'text-[var(--green)] bg-[var(--green-bg)]',
  reply: 'text-[var(--green)] bg-[var(--green-bg)]',
  client: 'text-[var(--ink)] bg-[var(--acc-bg)]',
  pending: 'text-[var(--amber)] bg-[var(--amber-bg)]',
  sent: 'text-[var(--amber)] bg-[var(--amber-bg)]',
  lead: 'text-[var(--amber)] bg-[var(--amber-bg)]',
  new: 'text-[var(--ink)] bg-[var(--card-2)] border border-[var(--line)]',
  overdue: 'text-[var(--red)] bg-[var(--red-bg)]',
  churned: 'text-[var(--red)] bg-[var(--red-bg)]',
  paused: 'text-[var(--mut)] bg-[var(--card-2)]',
  done: 'text-[var(--mut)] bg-[var(--card-2)]',
}
export function Pill({ status, children }: { status: string; children?: React.ReactNode }) {
  return <span className={`inline-flex items-center text-[12px] font-medium px-2.5 py-1 rounded-full ${PILL[status] || 'text-[var(--mut)] bg-[var(--card-2)]'}`}>{children || status}</span>
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(11,11,12,.32)] backdrop-blur-[2px] p-4" onClick={onClose}>
      <div className="bg-white rounded-[22px] border w-full max-w-[440px] p-6 shadow-[var(--sh-pop)] pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[17px] tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 -mr-1 rounded-full grid place-items-center text-[var(--sub)] hover:text-[var(--ink)] hover:bg-[var(--card-2)] transition-colors"><X className="w-[18px] h-[18px]" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block mb-3.5"><span className="text-[13px] text-[var(--mut)] block mb-1.5 font-medium">{label}</span>{children}</label>
}

const FIELD_CLS = 'w-full h-10 px-3.5 rounded-[11px] bg-white border text-sm transition-colors focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[rgba(11,11,12,.06)]'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={FIELD_CLS} />
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={FIELD_CLS} />
}

export function Btn({ children, variant = 'primary', ...rest }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'accent' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = variant === 'primary'
    ? 'bg-[var(--ink)] text-white hover:opacity-90 active:scale-[.98]'
    : variant === 'accent'
    ? 'bg-[var(--acc)] text-[var(--ink)] hover:bg-[var(--acc-press)] active:scale-[.98]'
    : 'bg-white border hover:border-[var(--line-2)] hover:bg-[var(--card-2)] text-[var(--ink)] active:scale-[.98]'
  return <button {...rest} className={`h-10 px-4 rounded-[11px] text-sm font-medium transition-all ${cls}`}>{children}</button>
}
