'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Check, Sparkles } from 'lucide-react'
import { useStore, metrics } from '@/lib/store'

type Msg = { role: 'user' | 'assistant'; text: string; action?: Action | null }
type Action = { type: string; label: string; payload: Record<string, unknown> }

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const { data, addInvoice, addLead, updateLead, setInvoiceStatus, addTask } = useStore()
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', text: 'čau seb, som leo. spýtaj sa ma na mrr, klientov, leady — alebo mi povedz napr. "napíš follow-up bistru zelená" alebo "vytvor faktúru 590 pre cafe nitra".' }])
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
        tasks: (data.tasks || []).map(t => ({ text: t.text, done: t.done, priority: t.priority, due: t.due })),
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
    } else if (a.type === 'create_task') {
      await addTask({ text: String(p.text || 'Task'), priority: (p.priority as 'low' | 'med' | 'high') || 'med', due: String(p.due || '') })
    }
    setMsgs(m => m.map((msg, i) => i === idx ? { ...msg, action: null, text: msg.text + '\n\n✓ hotovo.' } : msg))
  }

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--acc)] grid place-items-center transition-transform hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 10px 30px -8px rgba(155,232,112,.7), 0 4px 10px rgba(11,11,12,.12)' }}>
        {open ? <X className="w-6 h-6 text-[var(--ink)]" /> : <MessageSquare className="w-[22px] h-[22px] text-[var(--ink)]" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] bg-white border rounded-[22px] shadow-[var(--sh-pop)] flex flex-col pop overflow-hidden">
          <div className="px-4 py-3.5 border-b flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--acc)] grid place-items-center"><Sparkles className="w-[18px] h-[18px] text-[var(--ink)]" /></div>
            <div>
              <p className="text-[14px] font-semibold leading-none tracking-tight">leo</p>
              <p className="text-[11px] text-[var(--sub)] mt-1">vidí tvoje dáta · navrhuje akcie</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[16px] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[var(--ink)] text-white rounded-br-[5px]' : 'bg-[var(--card-2)] text-[var(--ink)] rounded-bl-[5px]'}`}>
                  {m.text}
                  {m.action && (
                    <button onClick={() => runAction(m.action!, i)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-[var(--acc)] text-[var(--ink)] text-[12.5px] font-semibold hover:bg-[var(--acc-press)] transition-colors">
                      <Check className="w-3.5 h-3.5" /> {m.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="bg-[var(--card-2)] rounded-[16px] px-3.5 py-2.5"><Loader2 className="w-4 h-4 spin text-[var(--mut)]" /></div></div>}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="napíš leovi…"
              className="flex-1 h-10 px-3.5 rounded-[11px] bg-[var(--card-2)] border text-sm focus:outline-none focus:border-[var(--ink)] focus:bg-white transition-colors" />
            <button onClick={send} disabled={busy} className="w-10 h-10 rounded-[11px] bg-[var(--ink)] text-white grid place-items-center disabled:opacity-50 hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
