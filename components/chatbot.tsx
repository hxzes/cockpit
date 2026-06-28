'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Check } from 'lucide-react'
import { useStore, metrics } from '@/lib/store'

type Msg = { role: 'user' | 'assistant'; text: string; action?: Action | null }
type Action = { type: string; label: string; payload: Record<string, unknown> }

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const { data, addInvoice, addLead, updateLead, setInvoiceStatus } = useStore()
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', text: 'cau seb, som leo. spytaj sa ma na mrr, klientov, leady — alebo mi povedz napr. "napis follow-up bistru zelena" alebo "vytvor fakturu 590 pre cafe nitra".' }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, open])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const next = [...msgs, { role: 'user' as const, text }]
    setMsgs(next)
    setBusy(true)
    try {
      const m = metrics(data)
      const snapshot = {
        metrics: m,
        clients: data.clients.map(c => ({ company: c.company, name: c.name, status: c.status, monthly: c.monthly })),
        invoices: data.invoices.map(i => ({ number: i.number, clientName: i.clientName, amount: i.amount, status: i.status })),
        leads: data.leads.map(l => ({ name: l.name, city: l.city, score: l.score, problem: l.problem, status: l.status })),
      }
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: next.slice(-8), snapshot }),
      })
      const d = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: d.reply || '...', action: d.action || null }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'chyba spojenia.' }])
    } finally { setBusy(false) }
  }

  const runAction = async (a: Action, idx: number) => {
    const p = a.payload || {}
    if (a.type === 'create_invoice') {
      await addInvoice({ clientName: String(p.clientName || 'Client'), number: 'FA-' + Date.now().toString().slice(-6), amount: Number(p.amount || 0), status: 'pending' })
    } else if (a.type === 'set_invoice_status') {
      const inv = data.invoices.find(i => i.number === p.number)
      if (inv) await setInvoiceStatus(inv.id, p.status as 'paid' | 'pending' | 'overdue')
    } else if (a.type === 'set_lead_status') {
      const lead = data.leads.find(l => l.name === p.leadName)
      if (lead) await updateLead(lead.id, { status: p.status as 'new' | 'sent' | 'reply' | 'client' })
    } else if (a.type === 'create_message') {
      try { await navigator.clipboard.writeText(String(p.text || '')) } catch {}
    }
    setMsgs(m => m.map((msg, i) => i === idx ? { ...msg, action: null, text: msg.text + '\n\n✓ hotovo.' } : msg))
  }

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--purple)] text-white grid place-items-center shadow-lg hover:scale-105 transition-transform">
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] bg-white border rounded-2xl shadow-2xl flex flex-col fade overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--purple)] grid place-items-center text-white"><MessageSquare className="w-4 h-4" /></div>
            <div><p className="text-[14px] font-semibold leading-none">leo</p><p className="text-[11px] text-[var(--sub)] mt-0.5">vidi tvoje data · navrhuje akcie</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[var(--purple)] text-white' : 'bg-[var(--bg)] text-[var(--ink)]'}`}>
                  {m.text}
                  {m.action && (
                    <button onClick={() => runAction(m.action!, i)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[var(--amber)] text-white text-[12.5px] font-medium hover:brightness-95">
                      <Check className="w-3.5 h-3.5" /> {m.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="bg-[var(--bg)] rounded-2xl px-3.5 py-2.5"><Loader2 className="w-4 h-4 spin text-[var(--mut)]" /></div></div>}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="napis leovi..."
              className="flex-1 h-9 px-3 rounded-lg bg-[var(--bg)] border text-sm focus:outline-none focus:border-[var(--purple)]" />
            <button onClick={send} disabled={busy} className="w-9 h-9 rounded-lg bg-[var(--purple)] text-white grid place-items-center disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
