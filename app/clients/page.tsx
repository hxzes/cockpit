'use client'

import { useState } from 'react'
import { useStore, eur, type ClientStatus } from '@/lib/store'
import { Card, Modal, Field, Input, Select, Btn } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'

export default function Clients() {
  const { data, loading, addClient, setClientStatus, removeClient } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', monthly: '', status: 'active' as ClientStatus })

  const submit = async () => {
    if (!form.company.trim()) return
    await addClient({ name: form.name, company: form.company, email: form.email, monthly: Number(form.monthly) || 0, status: form.status })
    setForm({ name: '', company: '', email: '', monthly: '', status: 'active' }); setOpen(false)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6 md:mb-7 rise d1">
        <div>
          <h1 className="text-[34px] md:text-[42px] font-semibold tighter leading-[1.02]">Clients</h1>
          <p className="text-[var(--mut)] text-[14.5px] mt-2">{data.clients.length} total · your book of business.</p>
        </div>
        <Btn onClick={() => setOpen(true)}><span className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> New client</span></Btn>
      </div>

      <Card className="overflow-hidden rise d2">
        {loading && data.clients.length === 0 ? <div className="p-6 text-[var(--mut)] text-sm">Loading…</div>
        : data.clients.length === 0 ? <div className="p-10 text-center text-[var(--mut)] text-sm">No clients yet. Add your first one.</div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11.5px] text-[var(--sub)] border-b">
              <th className="font-medium px-5 py-3">Company</th><th className="font-medium px-3 py-3">Contact</th>
              <th className="font-medium px-3 py-3">Retainer</th><th className="font-medium px-3 py-3">Status</th><th className="font-medium px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {data.clients.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--card-2)] transition-colors">
                  <td className="px-5 py-3.5"><div className="font-medium">{c.company}</div></td>
                  <td className="px-3 py-3.5"><div>{c.name}</div><div className="text-[12px] text-[var(--sub)]">{c.email}</div></td>
                  <td className="px-3 py-3.5 font-medium tabular-nums">{c.monthly ? eur(c.monthly) + '/mo' : '—'}</td>
                  <td className="px-3 py-3.5">
                    <select value={c.status} onChange={e => setClientStatus(c.id, e.target.value as ClientStatus)}
                      className="text-[12px] bg-transparent cursor-pointer focus:outline-none">
                      <option value="active">active</option><option value="lead">lead</option><option value="churned">churned</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => removeClient(c.id)} className="text-[var(--sub)] hover:text-[var(--red)] transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New client">
        <Field label="Company"><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Bistro Zelená" /></Field>
        <Field label="Contact name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Martin Kováč" /></Field>
        <Field label="Email"><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="martin@bistroz.sk" /></Field>
        <Field label="Monthly retainer (€)"><Input type="number" value={form.monthly} onChange={e => setForm({ ...form, monthly: e.target.value })} placeholder="49" /></Field>
        <Field label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ClientStatus })}>
          <option value="active">active</option><option value="lead">lead</option><option value="churned">churned</option>
        </Select></Field>
        <div className="flex gap-2 mt-5"><Btn onClick={submit}>Add client</Btn><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn></div>
      </Modal>
    </div>
  )
}
