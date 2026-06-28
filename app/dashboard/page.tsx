'use client'

import { useStore, metrics, monthlySeries, eur } from '@/lib/store'
import { StatCard, Card, Pill } from '@/components/ui'
import { LineChart, Sparkline } from '@/components/charts'
import { ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
  const { data, loading } = useStore()
  const m = metrics(data)
  const mrrS = monthlySeries(data, 'mrr')
  const revS = monthlySeries(data, 'revenue')
  const mrrDelta = mrrS.length >= 2 ? mrrS[mrrS.length - 1].value - mrrS[mrrS.length - 2].value : 0

  return (
    <div className="fade">
      <h1 className="text-[26px] font-bold tracking-tight mb-5">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard label="MRR" value={eur(m.mrr)}
          sub={mrrDelta >= 0 ? <span className="text-[var(--green)] inline-flex items-center gap-0.5">{eur(mrrDelta)} <ArrowUpRight className="w-3.5 h-3.5" /></span> : <span className="text-[var(--red)]">{eur(mrrDelta)}</span>}>
          <Sparkline data={mrrS} />
        </StatCard>
        <StatCard label="Active clients" value={String(m.activeClients)} sub={<span className="text-[var(--mut)]">{m.totalClients} total</span>} />
        <StatCard label="Total revenue" value={eur(m.revenue)} sub={<span className="text-[var(--mut)]">paid invoices</span>} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Subscription conversion" value={`${m.conversion}%`} sub={<span className="text-[var(--mut)]">active / total clients</span>} />
        <StatCard label="Transactions" value={String(m.transactions)} sub={<span className="text-[var(--mut)]">{eur(m.outstanding)} outstanding</span>} />
        <StatCard label="Leads" value={String(m.leads)} sub={<span className="text-[var(--mut)]">{m.replyRate}% reply rate</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h2 className="font-semibold text-[16px]">Monthly recurring revenue</h2>
          <p className="text-[13px] text-[var(--mut)] mb-3">Active retainers, last 7 months.</p>
          <LineChart data={mrrS} color="#F59E0B" />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-[16px]">Total revenue</h2>
          <p className="text-[13px] text-[var(--mut)] mb-3">Paid invoices, last 7 months.</p>
          <LineChart data={revS} color="#FB923C" />
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b"><h2 className="font-semibold text-[15px]">Recent invoices</h2></div>
        {loading && data.invoices.length === 0 ? (
          <div className="p-6 text-[var(--mut)] text-sm">Loading…</div>
        ) : data.invoices.length === 0 ? (
          <div className="p-6 text-[var(--mut)] text-sm">No invoices yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[12px] text-[var(--sub)] border-b">
              <th className="font-medium px-5 py-2.5">Invoice</th><th className="font-medium px-3 py-2.5">Client</th>
              <th className="font-medium px-3 py-2.5">Amount</th><th className="font-medium px-3 py-2.5">Status</th>
            </tr></thead>
            <tbody>
              {data.invoices.slice(0, 6).map(i => (
                <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--bg)]">
                  <td className="px-5 py-3 font-medium">{i.number}</td>
                  <td className="px-3 py-3 text-[var(--mut)]">{i.clientName}</td>
                  <td className="px-3 py-3 font-medium">{eur(i.amount)}</td>
                  <td className="px-3 py-3"><Pill status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
