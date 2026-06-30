'use client'

import { useEffect, useState, useCallback } from 'react'
import { colGet, colAdd, colUpdate, colDelete } from './fireclient'

export type ClientStatus = 'active' | 'lead' | 'churned'
export type InvoiceStatus = 'paid' | 'pending' | 'overdue'
export type LeadStatus = 'new' | 'sent' | 'reply' | 'client'

export interface Client { id: string; name: string; company: string; email: string; status: ClientStatus; monthly: number; createdAt: string }
export interface Invoice { id: string; clientName: string; number: string; amount: number; status: InvoiceStatus; createdAt: string }
export interface Project { id: string; clientName: string; name: string; status: 'active' | 'done' | 'paused'; price: number; createdAt: string }
export interface Lead { id: string; name: string; city: string; web: string; phone: string; email: string; ig: string; fb: string; score: number; problem: string; message: string; status: LeadStatus; createdAt: string }
export interface Task { id: string; text: string; done: boolean; due: string; priority: 'low' | 'med' | 'high'; createdAt: string }

export interface Snapshot { clients: Client[]; invoices: Invoice[]; projects: Project[]; leads: Lead[]; tasks: Task[] }

const CACHE = 'cockpit_cache_v1'

export function useStore() {
  const [data, setData] = useState<Snapshot>({ clients: [], invoices: [], projects: [], leads: [], tasks: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try { const c = localStorage.getItem(CACHE); if (c) setData(JSON.parse(c)) } catch {}
    let alive = true
    ;(async () => {
      try {
        const [clients, invoices, projects, leads, tasks] = await Promise.all([
          colGet('clients'), colGet('invoices'), colGet('projects'), colGet('leads'), colGet('tasks'),
        ])
        if (!alive) return
        const fresh = { clients, invoices, projects, leads, tasks } as Snapshot
        setData(fresh)
        try { localStorage.setItem(CACHE, JSON.stringify(fresh)) } catch {}
      } catch (e) { console.error('Firestore load (using cache):', e) }
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive = false }
  }, [])

  const cache = (d: Snapshot) => { try { localStorage.setItem(CACHE, JSON.stringify(d)) } catch {} }

  const addClient = useCallback(async (c: Omit<Client, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString()
    const tmpId = 'local-' + Math.random().toString(36).slice(2)
    setData(p => { const n = { ...p, clients: [{ id: tmpId, createdAt, ...c }, ...p.clients] }; cache(n); return n })
    try {
      const id = await colAdd('clients', { ...c, createdAt })
      setData(p => { const n = { ...p, clients: p.clients.map(x => x.id === tmpId ? { ...x, id } : x) }; cache(n); return n })
    } catch (e) { console.error('addClient Firestore write failed (kept locally):', e) }
  }, [])

  const addInvoice = useCallback(async (i: Omit<Invoice, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString()
    const tmpId = 'local-' + Math.random().toString(36).slice(2)
    setData(p => { const n = { ...p, invoices: [{ id: tmpId, createdAt, ...i }, ...p.invoices] }; cache(n); return n })
    try {
      const id = await colAdd('invoices', { ...i, createdAt })
      setData(p => { const n = { ...p, invoices: p.invoices.map(x => x.id === tmpId ? { ...x, id } : x) }; cache(n); return n })
      return id
    } catch (e) { console.error('addInvoice Firestore write failed (kept locally):', e); return tmpId }
  }, [])

  const addLead = useCallback(async (l: Omit<Lead, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString()
    const tmpId = 'local-' + Math.random().toString(36).slice(2)
    setData(p => { const n = { ...p, leads: [{ id: tmpId, createdAt, ...l }, ...p.leads] }; cache(n); return n })
    try {
      const id = await colAdd('leads', { ...l, createdAt })
      setData(p => { const n = { ...p, leads: p.leads.map(x => x.id === tmpId ? { ...x, id } : x) }; cache(n); return n })
      return id
    } catch (e) { console.error('addLead Firestore write failed (kept locally):', e); return tmpId }
  }, [])

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    setData(p => { const n = { ...p, leads: p.leads.map(x => x.id === id ? { ...x, ...patch } : x) }; cache(n); return n })
    colUpdate('leads', id, patch as Record<string, unknown>).catch(() => {})
  }, [])

  const setInvoiceStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    setData(p => { const n = { ...p, invoices: p.invoices.map(x => x.id === id ? { ...x, status } : x) }; cache(n); return n })
    colUpdate('invoices', id, { status }).catch(() => {})
  }, [])

  const setClientStatus = useCallback(async (id: string, status: ClientStatus) => {
    setData(p => { const n = { ...p, clients: p.clients.map(x => x.id === id ? { ...x, status } : x) }; cache(n); return n })
    colUpdate('clients', id, { status }).catch(() => {})
  }, [])

  const removeLead = useCallback(async (id: string) => {
    setData(p => { const n = { ...p, leads: p.leads.filter(x => x.id !== id) }; cache(n); return n })
    colDelete('leads', id).catch(() => {})
  }, [])

  const removeInvoice = useCallback(async (id: string) => {
    setData(p => { const n = { ...p, invoices: p.invoices.filter(x => x.id !== id) }; cache(n); return n })
    colDelete('invoices', id).catch(() => {})
  }, [])

  const removeClient = useCallback(async (id: string) => {
    setData(p => { const n = { ...p, clients: p.clients.filter(x => x.id !== id) }; cache(n); return n })
    colDelete('clients', id).catch(() => {})
  }, [])

  const addTask = useCallback(async (t: Omit<Task, 'id' | 'createdAt' | 'done'>) => {
    const createdAt = new Date().toISOString()
    const tmpId = 'local-' + Math.random().toString(36).slice(2)
    setData(p => { const n = { ...p, tasks: [{ id: tmpId, createdAt, done: false, ...t }, ...p.tasks] }; cache(n); return n })
    try {
      const id = await colAdd('tasks', { ...t, done: false, createdAt })
      setData(p => { const n = { ...p, tasks: p.tasks.map(x => x.id === tmpId ? { ...x, id } : x) }; cache(n); return n })
    } catch (e) { console.error('addTask write failed (kept locally):', e) }
  }, [])

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    setData(p => { const n = { ...p, tasks: p.tasks.map(x => x.id === id ? { ...x, done } : x) }; cache(n); return n })
    colUpdate('tasks', id, { done }).catch(() => {})
  }, [])

  const removeTask = useCallback(async (id: string) => {
    setData(p => { const n = { ...p, tasks: p.tasks.filter(x => x.id !== id) }; cache(n); return n })
    colDelete('tasks', id).catch(() => {})
  }, [])

  return { data, loading, addClient, addInvoice, addLead, updateLead, setInvoiceStatus, setClientStatus, removeLead, removeInvoice, removeClient, addTask, toggleTask, removeTask }
}

export const eur = (n: number) => '\u20AC' + (n || 0).toLocaleString('sk-SK', { maximumFractionDigits: 0 })

export function metrics(d: Snapshot) {
  const active = d.clients.filter(c => c.status === 'active')
  const mrr = active.reduce((s, c) => s + (c.monthly || 0), 0)
  const revenue = d.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = d.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const conversion = d.clients.length ? Math.round((active.length / d.clients.length) * 100) : 0
  const replied = d.leads.filter(l => l.status === 'reply' || l.status === 'client').length
  const contacted = d.leads.filter(l => l.status !== 'new').length
  const replyRate = contacted ? Math.round((replied / contacted) * 100) : 0
  return { mrr, revenue, outstanding, conversion, activeClients: active.length, totalClients: d.clients.length, transactions: d.invoices.length, leads: d.leads.length, replyRate }
}

export function monthlySeries(d: Snapshot, kind: 'revenue' | 'mrr') {
  const now = new Date()
  const out: { label: string; value: number }[] = []
  for (let k = 6; k >= 0; k--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - k, 1)
    let value = 0
    if (kind === 'revenue') {
      value = d.invoices.filter(i => i.status === 'paid').filter(i => { const x = new Date(i.createdAt); return x.getFullYear() === dt.getFullYear() && x.getMonth() === dt.getMonth() }).reduce((a, i) => a + i.amount, 0)
    } else {
      const cutoff = new Date(dt.getFullYear(), dt.getMonth() + 1, 0)
      value = d.clients.filter(c => c.status === 'active' && new Date(c.createdAt) <= cutoff).reduce((a, c) => a + (c.monthly || 0), 0)
    }
    out.push({ label: dt.toLocaleString('sk', { month: 'short' }), value })
  }
  return out
}
