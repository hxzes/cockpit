'use client'

import { useState } from 'react'
import { useStore, eur, type InvoiceStatus } from '@/lib/store'
import { Card, Pill, Modal, Field, Input, Select, Btn } from '@/components/ui'
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

  return (
    <div className="fade">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[26px] font-bold tracking-tight">Invoices</h1>
        <Btn onClick={() => setOpen(true)}><span className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> New invoice</span></Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="p-5"><p className="text-[13px] text-[var(--mut)]">Paid total</p><p className="text-[26px] font-bold mt-1">{eur(total)}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-[var(--mut)]">Outstanding</p><p className="text-[26px] font-bold mt-1">{eur(outstanding)}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-[var(--mut)]">Count</p><p className="text-[26px] font-bold mt-1">{data.invoices.length}</p></Card>
      </div>

      <Card className="overflow-hidden">
        {loading && data.invoices.length === 0 ? <div className="p-6 text-[var(--mut)] text-sm">Loading…</div>
        : data.invoices.length === 0 ? <div className="p-6 text-[var(--mut)] text-sm">No invoices yet.</div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[12px] text-[var(--sub)] border-b">
              <th className="font-medium px-5 py-2.5">Invoice</th><th className="font-medium px-3 py-2.5">Client</th>
              <th className="font-medium px-3 py-2.5">Amount</th><th className="font-medium px-3 py-2.5">Status</th><th className="font-medium px-5 py-2.5"></th>
            </tr></thead>
            <tbody>
              {data.invoices.map(i => (
                <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--bg)]">
                  <td className="px-5 py-3 font-medium">{i.number}</td>
                  <td className="px-3 py-3 text-[var(--mut)]">{i.clientName}</td>
                  <td className="px-3 py-3 font-medium">{eur(i.amount)}</td>
                  <td className="px-3 py-3">
                    <select value={i.status} onChange={e => setInvoiceStatus(i.id, e.target.value as InvoiceStatus)}
                      className="text-[12px] bg-transparent cursor-pointer focus:outline-none">
                      <option value="paid">paid</option><option value="pending">pending</option><option value="overdue">overdue</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => removeInvoice(i.id)} className="text-[var(--sub)] hover:text-[var(--red)]"><Trash2 className="w-4 h-4" /></button>
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
        <div className="flex gap-2 mt-4"><Btn onClick={submit}>Create invoice</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
