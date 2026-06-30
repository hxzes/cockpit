'use client'

import { useStore, metrics, monthlySeries, eur } from '@/lib/store'
import { StatCard, Card, Pill } from '@/components/ui'
import { LineChart, Sparkline } from '@/components/charts'
import { TasksWidget } from '@/components/tasks'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function Dashboard() {
  const { data, loading } = useStore()
  const m = metrics(data)
  const mrrS = monthlySeries(data, 'mrr')
  const revS = monthlySeries(data, 'revenue')
  const mrrDelta = mrrS.length >= 2 ? mrrS[mrrS.length - 1].value - mrrS[mrrS.length - 2].value : 0
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const ratio = m.totalClients ? Math.round((m.activeClients / m.totalClients) * 100) : 0

  return (
    <div>
      <div className="rise d1 mb-6 md:mb-7">
        <h1 className="text-[34px] md:text-[42px] font-semibold tighter leading-[1.02]">Dashboard</h1>
        <p className="text-[var(--mut)] text-[14.5px] mt-2">{today} · everything at a glance.</p>
      </div>

      {/* hero stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5">
        <div className="rise d2">
          <StatCard label="Monthly recurring" value={eur(m.mrr)} accent dot
            sub={mrrDelta >= 0
              ? <span className="inline-flex items-center gap-1"><span className="inline-flex items-center gap-0.5 text-[var(--acc-text)] bg-[var(--acc-bg)] px-2 py-0.5 rounded-full font-medium tabular-nums">{eur(mrrDelta)}<ArrowUpRight className="w-3 h-3" /></span><span className="text-[var(--sub)]">vs last mo</span></span>
              : <span className="inline-flex items-center gap-1"><span className="inline-flex items-center gap-0.5 text-[var(--red)] bg-[var(--red-bg)] px-2 py-0.5 rounded-full font-medium tabular-nums">{eur(mrrDelta)}<ArrowDownRight className="w-3 h-3" /></span><span className="text-[var(--sub)]">vs last mo</span></span>}>
            <Sparkline data={mrrS} />
          </StatCard>
        </div>
        <div className="rise d3">
          <StatCard label="Active clients" value={String(m.activeClients)}
            sub={<span className="text-[var(--mut)]"><span className="text-[var(--ink)] font-medium">{m.totalClients}</span> total · {ratio}% on retainer</span>}>
            <div className="flex gap-1 mt-1">
              <div className="h-1.5 rounded-full bg-[var(--ink)]" style={{ flex: Math.max(m.activeClients, 1) }} />
              <div className="h-1.5 rounded-full bg-[var(--line)]" style={{ flex: Math.max(m.totalClients - m.activeClients, 1) }} />
            </div>
          </StatCard>
        </div>
        <div className="rise d4">
          <StatCard label="Total revenue" value={eur(m.revenue)} sub={<span className="text-[var(--mut)]">paid invoices · all time</span>}>
            <Sparkline data={revS} />
          </StatCard>
        </div>
      </div>

      {/* secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6 md:mb-7">
        {[
          { l: 'Conversion', v: `${m.conversion}%`, s: 'active / total clients', d: 'd4' },
          { l: 'Transactions', v: String(m.transactions), s: `${eur(m.outstanding)} outstanding`, d: 'd5' },
          { l: 'Leads', v: String(m.leads), s: `${m.replyRate}% reply rate`, d: 'd6' },
        ].map(c => (
          <div key={c.l} className={`rise ${c.d} bg-[var(--card)] border rounded-[var(--r)] p-[18px] px-5 lift`}>
            <p className="text-[12.5px] text-[var(--mut)]">{c.l}</p>
            <p className="text-[26px] font-semibold tighter mt-1.5 leading-none tabular-nums">{c.v}</p>
            <p className="text-[12.5px] text-[var(--sub)] mt-1.5">{c.s}</p>
          </div>
        ))}
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-6 md:mb-7">
        <Card className="p-5 md:p-[22px] rise d5">
          <h2 className="font-semibold text-[15.5px] tracking-tight">Monthly recurring revenue</h2>
          <p className="text-[13px] text-[var(--mut)] mb-4">Active retainers · last 7 months</p>
          <LineChart data={mrrS} fill="#9BE870" />
        </Card>
        <Card className="p-5 md:p-[22px] rise d6">
          <h2 className="font-semibold text-[15.5px] tracking-tight">Total revenue</h2>
          <p className="text-[13px] text-[var(--mut)] mb-4">Paid invoices · last 7 months</p>
          <LineChart data={revS} fill="#F1F1ED" />
        </Card>
      </div>

      {/* tasks + invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="rise d6"><TasksWidget /></div>

        <Card className="overflow-hidden rise d7">
          <div className="px-5 py-4 border-b"><h2 className="font-semibold text-[15px] tracking-tight">Recent invoices</h2></div>
          {loading && data.invoices.length === 0 ? (
            <div className="p-6 text-[var(--mut)] text-sm">Loading…</div>
          ) : data.invoices.length === 0 ? (
            <div className="p-6 text-[var(--mut)] text-sm">No invoices yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11.5px] text-[var(--sub)] border-b">
                <th className="font-medium px-5 py-2.5">Invoice</th><th className="font-medium px-3 py-2.5">Client</th>
                <th className="font-medium px-3 py-2.5">Amount</th><th className="font-medium px-3 py-2.5">Status</th>
              </tr></thead>
              <tbody>
                {data.invoices.slice(0, 6).map(i => (
                  <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--card-2)] transition-colors">
                    <td className="px-5 py-3 font-medium mono text-[13px]">{i.number}</td>
                    <td className="px-3 py-3 text-[var(--mut)]">{i.clientName}</td>
                    <td className="px-3 py-3 font-medium tabular-nums">{eur(i.amount)}</td>
                    <td className="px-3 py-3"><Pill status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
