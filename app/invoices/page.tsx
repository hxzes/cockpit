'use client'

import { useState } from 'react'
import { useStore, eur, type InvoiceStatus } from '@/lib/store'
import { Card, Modal, Field, Input, Select, Btn } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'

export default function Invoices() {
  const { data, loading, addInvoice, setInvoiceStatus, removeInvoice } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ clientName: '', amount: '', status: 'pending' as InvoiceStatus })

  const total = data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = data.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const submit = async () => {
    if (!form.clientName.trim() || !form.amount) return
    await addInvoice({ clientName: form.clientName, number: 'FA-' + Date.now().toString().slice(-6), amount: Number(form.amount), status: form.status })
    setForm({ clientName: '', amount: '', status: 'pending' }); setOpen(false)
  }

  const stats = [
    { l: 'Paid total', v: eur(total), accent: true },
    { l: 'Outstanding', v: eur(outstanding) },
    { l: 'Count', v: String(data.invoices.length) },
  ]

  return (
    <div>
      <div className="flex items-end justify-between mb-6 md:mb-7 rise d1">
        <div>
          <h1 className="text-[34px] md:text-[42px] font-semibold tighter leading-[1.02]">Invoices</h1>
          <p className="text-[var(--mut)] text-[14.5px] mt-2">Billing across all clients.</p>
        </div>
        <Btn onClick={() => setOpen(true)}><span className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> New invoice</span></Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        {stats.map((s, idx) => (
          <div key={s.l} className={`rise d${idx + 2} bg-[var(--card)] border rounded-[var(--r)] p-5 lift relative overflow-hidden`}>
            {s.accent && <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[rgba(155,232,112,.10)] to-transparent pointer-events-none" />}
            <p className="text-[12.5px] text-[var(--mut)] relative">{s.l}</p>
            <p className="text-[28px] font-semibold tighter mt-1.5 leading-none tabular-nums relative">{s.v}</p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden rise d4">
        {loading && data.invoices.length === 0 ? <div className="p-6 text-[var(--mut)] text-sm">Loading…</div>
        : data.invoices.length === 0 ? <div className="p-10 text-center text-[var(--mut)] text-sm">No invoices yet.</div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11.5px] text-[var(--sub)] border-b">
              <th className="font-medium px-5 py-3">Invoice</th><th className="font-medium px-3 py-3">Client</th>
              <th className="font-medium px-3 py-3">Amount</th><th className="font-medium px-3 py-3">Status</th><th className="font-medium px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {data.invoices.map(i => (
                <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--card-2)] transition-colors">
                  <td className="px-5 py-3.5 font-medium mono text-[13px]">{i.number}</td>
                  <td className="px-3 py-3.5 text-[var(--mut)]">{i.clientName}</td>
                  <td className="px-3 py-3.5 font-medium tabular-nums">{eur(i.amount)}</td>
                  <td className="px-3 py-3.5">
                    <select value={i.status} onChange={e => setInvoiceStatus(i.id, e.target.value as InvoiceStatus)}
                      className="text-[12px] bg-transparent cursor-pointer focus:outline-none">
                      <option value="paid">paid</option><option value="pending">pending</option><option value="overdue">overdue</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => removeInvoice(i.id)} className="text-[var(--sub)] hover:text-[var(--red)] transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New invoice">
        <Field label="Client"><Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Bistro Zelená" /></Field>
        <Field label="Amount (€)"><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="590" /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
          <option value="pending">pending</option><option value="paid">paid</option><option value="overdue">overdue</option>
        </Select></Field>
        <div className="flex gap-2 mt-5"><Btn onClick={submit}>Create invoice</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
