'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore, type LeadStatus, type Lead } from '@/lib/store'
import { Card } from '@/components/ui'
import { Bot, Loader2, Check, Copy, ExternalLink, Trash2, UserPlus, Sparkles, FileText, ArrowUpDown, X, Phone, Mail, Instagram, Facebook, ChevronDown, Globe, Plus } from 'lucide-react'

const TYPES = ['restaurant', 'cafe', 'hotel', 'bar', 'pizzeria', 'bakery', 'gym', 'beauty salon']
const CITIES = ['Bratislava', 'Nitra', 'Trnava', 'Nove Zamky', 'Sala', 'Kosice', 'Trencin', 'Zilina']
const REGIONS = [
  { code: 'SK', label: 'Slovensko' }, { code: 'CZ', label: 'Česko' }, { code: 'AT', label: 'Rakúsko' },
  { code: 'DE', label: 'Nemecko' }, { code: 'HU', label: 'Maďarsko' }, { code: 'PL', label: 'Poľsko' },
  { code: 'GB', label: 'UK' }, { code: 'US', label: 'USA' }, { code: '', label: 'Celý svet' },
]
const LANGS = [
  { code: 'sk', label: 'Slovenčina' }, { code: 'cs', label: 'Čeština' }, { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' }, { code: 'hu', label: 'Magyar' }, { code: 'pl', label: 'Polski' },
]

type Opt = { value: string; label: string }
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)
function Filter({ value, options, onChange, disabled, icon, suffix, custom, customPh }: { value: string; options: Opt[]; onChange: (v: string) => void; disabled?: boolean; icon?: React.ReactNode; suffix?: string; custom?: 'text' | 'number'; customPh?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  const current = options.find(o => o.value === value)
  const [cv, setCv] = useState('')
  const apply = () => {
    const t = cv.trim(); if (!t) return
    if (custom === 'number') { const n = Math.floor(Number(t)); if (!n || n < 1) return; onChange(String(n)) }
    else onChange(t)
    setCv(''); setOpen(false)
  }
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)} disabled={disabled}
        className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] text-[14px] font-medium text-[var(--ink)] transition-colors disabled:opacity-50 ${open ? 'bg-[var(--fill)]' : 'hover:bg-[var(--fill)]'}`}>
        {icon}
        <span className="max-w-[160px] truncate">{current?.label ?? value}{suffix && <span className="text-[var(--sub)] font-normal"> {suffix}</span>}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--sub)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-1.5 min-w-[190px] max-h-[300px] overflow-auto bg-white border rounded-[12px] shadow-[var(--sh-2)] p-1.5 pop">
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[8px] text-[13.5px] text-left transition-colors ${o.value === value ? 'text-[var(--ink)] font-medium' : 'text-[var(--mut)]'} hover:bg-[var(--fill)] hover:text-[var(--ink)]`}>
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check className="w-3.5 h-3.5 text-[var(--acc-text)] shrink-0" />}
            </button>
          ))}
          {custom && (
            <div className="mt-1 pt-1.5 border-t flex items-center gap-1.5 px-0.5 pb-0.5">
              <input type={custom} value={cv} onChange={e => setCv(e.target.value)} placeholder={customPh}
                onKeyDown={e => { if (e.key === 'Enter') apply() }}
                className="flex-1 min-w-0 h-9 px-2.5 rounded-[8px] bg-[var(--fill)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[rgba(11,11,12,.06)]" />
              <button type="button" onClick={apply} className="h-9 w-9 rounded-[8px] bg-[var(--ink)] text-white grid place-items-center shrink-0 hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LeadGen() {
  const { data, addLead, updateLead, removeLead, addClient } = useStore()
  const [type, setType] = useState('restaurant')
  const [city, setCity] = useState('Bratislava')
  const [count, setCount] = useState(10)
  const [region, setRegion] = useState('SK')
  const [lang, setLang] = useState('sk')
  const [minRating, setMinRating] = useState(0)
  const [customQuery, setCustomQuery] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [sortByScore, setSortByScore] = useState(true)
  const [types, setTypes] = useState(TYPES)
  const [cities, setCities] = useState(CITIES)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const stopRef = useRef(false)

  useEffect(() => {
    setLoadingSuggest(true)
    fetch('/api/suggest', { method: 'POST' }).then(r => r.json()).then(d => {
      if (d.types?.length) { setTypes(d.types); setType(d.types[0]) }
      if (d.cities?.length) { setCities(d.cities); setCity(d.cities[0]) }
    }).catch(() => {}).finally(() => setLoadingSuggest(false))
  }, [])

  const run = async () => {
    if (scraping) return
    stopRef.current = false
    const query = advanced && customQuery.trim() ? customQuery.trim() : `${type} ${city}`
    setScraping(true); setLog([`Hľadám "${query}"${region ? ' · ' + region : ' · svet'} (max ${count})…`])
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, region, count, minRating, lang }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      const places: { name: string; city: string; web: string; phone: string; ig?: string; email?: string; fb?: string }[] = (d.results || []).slice(0, count)
      setLog(l => [...l, `Nájdených ${d.count}, analyzujem ${places.length}…`])
      let i = 0, done = 0
      const work = async () => {
        while (i < places.length) {
          if (stopRef.current) return
          const p = places[i++]
          let score = p.web ? 50 : 20, problem = p.web ? 'Website needs work' : 'No website'
          try {
            const a = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p.name, web: p.web }) })
            const ad = await a.json(); if (a.ok) { score = ad.score; problem = ad.problem }
          } catch {}
          if (stopRef.current) return
          await addLead({ name: p.name, city: p.city, web: p.web, phone: p.phone, email: p.email || '', ig: p.ig || '', fb: p.fb || '', score, problem, message: '', status: 'new' })
          done++
        }
      }
      await Promise.all(Array.from({ length: Math.min(5, places.length) }, work))
      setLog(l => [...l, stopRef.current ? `Zastavené · ${done} leadov pridaných` : `Hotovo · ${done} leadov pridaných`])
    } catch (e) { setLog(l => [...l, `Error: ${e instanceof Error ? e.message : 'failed'}`]) }
    finally { setScraping(false); stopRef.current = false }
  }

  const stop = () => { stopRef.current = true; setLog(l => [...l, 'Zastavujem…']) }

  const shown = [...data.leads].sort((a, b) => sortByScore
    ? (a.web === '' ? -1 : b.web === '' ? 1 : a.score - b.score)
    : 0)
  const contactable = data.leads.filter(l => l.phone || l.email || l.ig || l.fb).length
  const sugg: { t: string; c: string }[] = []
  if (types[0] && cities[0]) sugg.push({ t: types[0], c: cities[0] })
  if (types[1] && cities[0]) sugg.push({ t: types[1], c: cities[0] })
  if (types[0] && cities[1]) sugg.push({ t: types[0], c: cities[1] })

  return (
    <div>
      <div className="rise d1 mb-6 md:mb-7">
        <h1 className="text-[34px] md:text-[42px] font-semibold tighter leading-[1.02]">Lead Gen</h1>
        <p className="text-[var(--mut)] text-[14.5px] mt-2">Vyber typ a mesto — AI ohodnotí weby a napíše oslovenie. Ty len pošleš.</p>
      </div>

      {/* COMMAND BAR */}
      <div className="rise d2 relative z-30 flex items-center gap-1 bg-white border rounded-[16px] shadow-[var(--sh-1)] p-2.5 pl-3 flex-wrap">
        <div className="w-9 h-9 rounded-[10px] bg-[var(--acc-bg)] grid place-items-center shrink-0">
          <Sparkles className="w-[18px] h-[18px] text-[var(--acc-text)]" />
        </div>
        {advanced ? (
          <input value={customQuery} onChange={e => setCustomQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} disabled={scraping}
            placeholder="napr. zubné ambulancie Košice, plumber London…"
            className="flex-1 min-w-[200px] h-10 px-2 bg-transparent text-[14px] focus:outline-none placeholder:text-[var(--sub)]" />
        ) : (
          <>
            <Filter value={type} onChange={setType} options={types.map(t => ({ value: t, label: cap(t) }))} />
            <span className="text-[var(--sub)] text-[13.5px] px-0.5 shrink-0">v</span>
            <Filter value={city} onChange={setCity} custom="text" customPh="Vlastné mesto…" options={cities.map(c => ({ value: c, label: c }))} />
          </>
        )}
        <span className="w-px h-5 bg-[var(--line)] mx-1.5 shrink-0" />
        <Filter value={region} disabled={scraping} onChange={setRegion} icon={<Globe className="w-[15px] h-[15px] text-[var(--mut)]" />} options={REGIONS.map(r => ({ value: r.code, label: r.label }))} />
        {advanced && (
          <>
            <span className="w-px h-5 bg-[var(--line)] mx-1.5 shrink-0" />
            <Filter value={lang} disabled={scraping} onChange={setLang} options={LANGS.map(l => ({ value: l.code, label: l.label }))} />
            <span className="w-px h-5 bg-[var(--line)] mx-1.5 shrink-0" />
            <Filter value={String(minRating)} disabled={scraping} onChange={v => setMinRating(Number(v))}
              options={[{ value: '0', label: 'Všetky hodnotenia' }, { value: '3', label: '3★ a viac' }, { value: '3.5', label: '3.5★ a viac' }, { value: '4', label: '4★ a viac' }, { value: '4.5', label: '4.5★ a viac' }]} />
          </>
        )}
        <span className="w-px h-5 bg-[var(--line)] mx-1.5 shrink-0" />
        <Filter value={String(count)} disabled={scraping} onChange={v => setCount(Number(v))} suffix="leadov" custom="number" customPh="Vlastný počet…" options={[5, 10, 15, 20].map(n => ({ value: String(n), label: String(n) }))} />
        <div className="flex-1 min-w-[8px]" />
        {scraping ? (
          <button onClick={stop} className="h-11 px-5 rounded-[12px] bg-[var(--red)] text-white text-[14.5px] font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
            <X className="w-4 h-4" /> Stop
          </button>
        ) : (
          <button onClick={run} className="h-11 px-5 rounded-[12px] bg-[var(--acc)] text-[var(--ink)] text-[14.5px] font-semibold flex items-center gap-2 hover:bg-[var(--acc-press)] active:scale-[.98] transition-all shrink-0">
            <Bot className="w-4 h-4" /> Scrape
          </button>
        )}
      </div>

      {/* AI suggestions */}
      <div className="rise d2 flex items-center gap-2 flex-wrap mt-3.5">
        <span className="text-[12.5px] text-[var(--sub)] inline-flex items-center gap-1.5 mr-0.5">
          {loadingSuggest ? <Loader2 className="w-3.5 h-3.5 spin" /> : <Sparkles className="w-3.5 h-3.5 text-[var(--acc-text)]" />}
          {loadingSuggest ? 'AI navrhuje ciele…' : 'Návrhy AI'}
        </span>
        {!loadingSuggest && sugg.map((sg, i) => (
          <button key={i} onClick={() => { setAdvanced(false); setType(sg.t); setCity(sg.c) }}
            className="text-[13px] px-3 py-1.5 rounded-full bg-[var(--fill)] text-[var(--mut)] border border-transparent hover:bg-white hover:text-[var(--ink)] hover:border-[var(--line-2)] transition-all">
            {cap(sg.t)} {sg.c}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => setAdvanced(a => !a)} className="text-[12.5px] font-medium text-[var(--mut)] hover:text-[var(--ink)] transition-colors px-1 py-1.5 shrink-0">
          {advanced ? '← Jednoduchý' : 'Vlastný dopyt →'}
        </button>
      </div>

      {log.length > 0 && (
        <div className="rise mt-4 bg-[var(--fill)] rounded-[12px] p-3.5 mono text-[12px] text-[var(--mut)] space-y-1">
          {log.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              {i === log.length - 1 && scraping ? <Loader2 className="w-3 h-3 spin shrink-0" /> : <Check className="w-3 h-3 text-[var(--acc-text)] shrink-0" />}{l}
            </div>
          ))}
        </div>
      )}

      {data.leads.length > 0 && (
        <div className="flex items-center justify-between mt-8 mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-[18px] text-[13px]">
            <span><b className="font-semibold tabular-nums">{data.leads.length}</b> <span className="text-[var(--mut)]">leadov</span></span>
            <span><b className="font-semibold tabular-nums">{contactable}</b> <span className="text-[var(--mut)]">kontaktovateľných</span></span>
            <span className="text-[var(--sub)] text-[12px] tabular-nums hidden sm:inline" title="Priemerný náklad na lead (Gemini AI analýza)">~€{(data.leads.length * 0.0008).toFixed(3)} · €0.001/lead</span>
          </div>
          <button onClick={() => setSortByScore(s => !s)}
            className="text-[12.5px] font-medium text-[var(--mut)] bg-white border px-3 py-1.5 rounded-full hover:text-[var(--ink)] hover:border-[var(--line-2)] transition-colors inline-flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" /> {sortByScore ? 'Priorita (najlepšie ciele)' : 'Najnovšie'}
          </button>
        </div>
      )}

      {data.leads.length === 0 ? (
        <Card className="p-12 text-center text-[var(--mut)] text-sm mt-8">Žiadne leady. Vyber typ + mesto a daj Scrape.</Card>
      ) : (
        <div className="space-y-2.5">
          {shown.map(l => <LeadRow key={l.id} lead={l} onUpdate={updateLead} onDelete={removeLead} onConvert={() => {
            addClient({ name: '', company: l.name, email: l.email, monthly: 0, status: 'active' }); updateLead(l.id, { status: 'client' })
          }} />)}
        </div>
      )}
    </div>
  )
}

interface Brief {
  points: string[]; priceMin: number; priceMax: number; closeChance: number
  bestChannel: string; subject: string; biggestProblem: string
  objections: { o: string; a: string }[]
  callScript: { opening: string; questions: string[]; pain: string; close: string; cta: string }
}

function LeadRow({ lead, onUpdate, onDelete, onConvert }: {
  lead: Lead; onUpdate: (id: string, p: Partial<Lead>) => void; onDelete: (id: string) => void; onConvert: () => void
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'brief' | 'message'>('brief')
  const [gen, setGen] = useState(false)
  const [audit, setAudit] = useState(false)
  const [msg, setMsg] = useState(lead.message)
  const [copied, setCopied] = useState(false)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const scoreColor = lead.score >= 80 ? 'var(--green)' : lead.score >= 60 ? 'var(--amber)' : 'var(--red)'

  const loadBrief = async () => {
    if (brief || briefLoading) return
    setBriefLoading(true)
    try {
      const r = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, city: lead.city, web: lead.web, problem: lead.problem, score: lead.score, phone: lead.phone, ig: lead.ig }) })
      const d = await r.json()
      if (r.ok && d.points) setBrief(d)
    } catch {} finally { setBriefLoading(false) }
  }
  const openCard = () => { setOpen(true); setTab('brief') }

  const generate = async () => {
    setTab('message'); if (msg) return
    setGen(true)
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: lead.name, city: lead.city, problem: lead.problem }) })
      const d = await r.json(); const text = r.ok ? d.message : d.error
      setMsg(text); onUpdate(lead.id, { message: text })
    } catch { setMsg('Generation failed') } finally { setGen(false) }
  }
  const makeAudit = async () => {
    setTab('message'); setAudit(true)
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: lead.name, city: lead.city, problem: lead.problem, mode: 'audit' }) })
      const d = await r.json(); const text = r.ok ? d.message : d.error
      setMsg(text); onUpdate(lead.id, { message: text })
    } catch { setMsg('Audit failed') } finally { setAudit(false) }
  }

  const ig = lead.ig ? `https://instagram.com/${lead.ig.replace('@', '')}` : ''
  const mail = lead.email ? `mailto:${lead.email}?subject=${encodeURIComponent(brief?.subject || ('moni — ' + lead.name))}&body=${encodeURIComponent(msg)}` : ''
  const copyOpen = async (url: string) => {
    try { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
    if (url) window.open(url, '_blank'); if (lead.status === 'new') onUpdate(lead.id, { status: 'sent' })
  }
  const channelIcon = (c: string) => c === 'email' ? '📧 Email' : c === 'instagram' ? '📸 Instagram' : '📞 Telefón'

  return (
    <div className={`bg-[var(--card)] border rounded-[16px] overflow-hidden transition-all ${open ? 'shadow-[var(--sh-2)] border-[var(--line-2)]' : 'lift'}`}>
      <div className="flex items-center gap-3 md:gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] truncate">{lead.name}</div>
          <div className="text-[12.5px] text-[var(--sub)] truncate mt-0.5">{lead.city}{lead.web ? ` · ${lead.web}` : ' · no website'}</div>
          <div className="flex items-center gap-[13px] mt-2.5">
            <ContactIcon active={!!lead.phone} title={lead.phone || 'žiadny telefón'} href={lead.phone ? `tel:${lead.phone}` : ''}><Phone className="w-4 h-4" /></ContactIcon>
            <ContactIcon active={!!lead.email} title={lead.email || 'žiadny email'} href={lead.email ? `mailto:${lead.email}` : ''}><Mail className="w-4 h-4" /></ContactIcon>
            <ContactIcon active={!!lead.ig} title={lead.ig || 'žiadny instagram'} href={lead.ig ? `https://instagram.com/${lead.ig.replace('@', '')}` : ''}><Instagram className="w-4 h-4" /></ContactIcon>
            <ContactIcon active={!!lead.fb} title={lead.fb || 'žiadny facebook'} href={lead.fb ? `https://facebook.com/${lead.fb}` : ''}><Facebook className="w-4 h-4" /></ContactIcon>
            <ContactIcon active={!!lead.web} title={lead.web || 'žiadny web'} href={lead.web ? `https://${lead.web}` : ''}><ExternalLink className="w-4 h-4" /></ContactIcon>
          </div>
        </div>
        <div className="text-right shrink-0 w-12">
          <div className="text-[19px] font-semibold tabular-nums leading-none" style={{ color: scoreColor }}>{lead.score}</div>
          <div className="text-[10px] text-[var(--sub)] mt-0.5">score</div>
          <div className="h-1 w-12 rounded-full bg-[var(--line)] overflow-hidden mt-1.5"><div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: scoreColor }} /></div>
        </div>
        <select value={lead.status} onChange={e => onUpdate(lead.id, { status: e.target.value as LeadStatus })}
          className="shrink-0 text-[12px] bg-[var(--fill)] border rounded-[8px] px-2.5 py-1.5 cursor-pointer focus:outline-none hidden sm:block">
          <option value="new">new</option><option value="sent">sent</option><option value="reply">reply</option><option value="client">client</option>
        </select>
        <button onClick={open ? () => setOpen(false) : openCard}
          className={`shrink-0 text-[13px] font-medium px-3.5 py-2 rounded-[10px] transition-all active:scale-[.98] ${open ? 'bg-[var(--ink)] text-white' : 'bg-white border hover:border-[var(--line-2)] hover:bg-[var(--card-2)]'}`}>
          {open ? 'Close' : 'Open'}
        </button>
        <button onClick={onConvert} title="Convert to client" className="shrink-0 text-[var(--sub)] hover:text-[var(--acc-text)] transition-colors hidden sm:block"><UserPlus className="w-[17px] h-[17px]" /></button>
        <button onClick={() => onDelete(lead.id)} className="shrink-0 text-[var(--sub)] hover:text-[var(--red)] transition-colors"><Trash2 className="w-[17px] h-[17px]" /></button>
      </div>

      {open && (
        <div className="border-t bg-[var(--fill)] pop">
          <div className="flex items-center gap-1 px-4 pt-4">
            <div className="inline-flex gap-0.5 bg-[var(--card-2)] border p-0.5 rounded-[11px]">
              <button onClick={() => setTab('brief')} className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[8px] transition-all ${tab === 'brief' ? 'bg-white border shadow-[var(--sh-1)] text-[var(--ink)]' : 'text-[var(--mut)] border border-transparent'}`}>🧠 AI Brief</button>
              <button onClick={() => setTab('message')} className={`text-[12.5px] font-medium px-3.5 py-1.5 rounded-[8px] transition-all ${tab === 'message' ? 'bg-white border shadow-[var(--sh-1)] text-[var(--ink)]' : 'text-[var(--mut)] border border-transparent'}`}>✉️ Správa</button>
            </div>
          </div>

          {tab === 'brief' && (
            <div className="p-4">
              {briefLoading ? <div className="flex items-center gap-2 text-[var(--mut)] text-sm py-6 justify-center"><Loader2 className="w-4 h-4 spin" /> Leo analyzuje lead…</div>
              : !brief ? <div className="text-center py-8">
                  <p className="text-[13px] text-[var(--mut)] mb-3.5">Nechaj lea spraviť kompletný sales brief — cena, šanca, námietky, call script.</p>
                  <button onClick={loadBrief} className="text-[13px] px-4 py-2.5 rounded-[11px] bg-[var(--acc)] text-[var(--ink)] font-semibold inline-flex items-center gap-2 hover:bg-[var(--acc-press)] transition-colors"><Sparkles className="w-4 h-4" /> Generovať AI brief</button>
                </div>
              : <div className="space-y-2.5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white border rounded-[12px] p-3"><p className="text-[11px] text-[var(--sub)]">Odhad ceny</p><p className="text-[16px] font-semibold mt-1 tabular-nums">{brief.priceMin}–{brief.priceMax} €</p></div>
                  <div className="bg-white border rounded-[12px] p-3"><p className="text-[11px] text-[var(--sub)]">Šanca uzavrieť</p><p className="text-[16px] font-semibold mt-1 tabular-nums" style={{ color: brief.closeChance >= 70 ? 'var(--green)' : brief.closeChance >= 40 ? 'var(--amber)' : 'var(--red)' }}>{brief.closeChance}%</p></div>
                  <div className="bg-white border rounded-[12px] p-3"><p className="text-[11px] text-[var(--sub)]">Prvý kontakt</p><p className="text-[13px] font-semibold mt-1">{channelIcon(brief.bestChannel)}</p></div>
                  <div className="bg-white border rounded-[12px] p-3"><p className="text-[11px] text-[var(--sub)]">Skóre webu</p><p className="text-[16px] font-semibold mt-1 tabular-nums">{lead.score}/100</p></div>
                </div>
                <div className="bg-white border rounded-[12px] p-3.5">
                  <p className="text-[11px] text-[var(--sub)] mb-2">Čo sme zistili</p>
                  <ul className="space-y-1.5">{brief.points.map((p, i) => <li key={i} className="text-[13px] flex gap-2"><span className="text-[var(--acc-text)]">•</span>{p}</li>)}</ul>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <div className="bg-white border rounded-[12px] p-3.5"><p className="text-[11px] text-[var(--sub)] mb-1">Najväčší problém</p><p className="text-[13px] font-medium">{brief.biggestProblem}</p></div>
                  <div className="bg-white border rounded-[12px] p-3.5"><p className="text-[11px] text-[var(--sub)] mb-1">Odporúčaný predmet</p><p className="text-[13px] font-medium">"{brief.subject}"</p></div>
                </div>
                <div className="bg-white border rounded-[12px] p-3.5">
                  <p className="text-[11px] text-[var(--sub)] mb-2">Námietky + odpovede</p>
                  <div className="space-y-2">{brief.objections.map((o, i) => (
                    <div key={i} className="text-[13px]"><p className="font-medium">"{o.o}"</p><p className="text-[var(--mut)] flex gap-1.5 mt-0.5"><span className="text-[var(--green)]">→</span>{o.a}</p></div>
                  ))}</div>
                </div>
                <details className="bg-white border rounded-[12px] p-3.5">
                  <summary className="text-[12px] text-[var(--sub)] cursor-pointer select-none">📞 Call script (klikni)</summary>
                  <div className="mt-2 space-y-2 text-[13px]">
                    <p><b>Otvorenie:</b> {brief.callScript.opening}</p>
                    <div><b>Otázky:</b><ul className="mt-1 space-y-0.5">{brief.callScript.questions.map((q, i) => <li key={i} className="flex gap-1.5"><span className="text-[var(--acc-text)]">·</span>{q}</li>)}</ul></div>
                    <p><b>Pain:</b> {brief.callScript.pain}</p>
                    <p><b>Close:</b> {brief.callScript.close}</p>
                    <p><b>CTA:</b> {brief.callScript.cta}</p>
                  </div>
                </details>
                <div className="flex gap-2 pt-0.5">
                  <button onClick={() => { setTab('message'); if (!msg) generate() }} className="text-[12.5px] px-4 py-2.5 rounded-[10px] bg-[var(--ink)] text-white font-medium hover:opacity-90 transition-opacity">Napísať správu →</button>
                  <button onClick={makeAudit} className="text-[12.5px] px-4 py-2.5 rounded-[10px] bg-white border hover:border-[var(--line-2)] hover:bg-[var(--card-2)] flex items-center gap-1.5 transition-colors"><FileText className="w-3.5 h-3.5" /> Audit text</button>
                </div>
              </div>}
            </div>
          )}

          {tab === 'message' && (
            <div className="p-4">
              {gen || audit ? <div className="flex items-center gap-2 text-[var(--mut)] text-sm py-3 justify-center"><Loader2 className="w-4 h-4 spin" /> {audit ? 'Leo píše audit…' : 'Leo píše správu…'}</div>
              : !msg ? <div className="text-center py-8">
                  <p className="text-[13px] text-[var(--mut)] mb-3.5">Nechaj lea napísať oslovenie pre tento podnik.</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={generate} className="text-[13px] px-4 py-2.5 rounded-[11px] bg-[var(--acc)] text-[var(--ink)] font-semibold inline-flex items-center gap-2 hover:bg-[var(--acc-press)] transition-colors"><Sparkles className="w-4 h-4" /> Napísať správu</button>
                    <button onClick={makeAudit} className="text-[13px] px-4 py-2.5 rounded-[11px] bg-white border hover:border-[var(--line-2)] inline-flex items-center gap-2 transition-colors"><FileText className="w-4 h-4" /> AI audit</button>
                  </div>
                </div>
              : <>
                <textarea value={msg} onChange={e => { setMsg(e.target.value); onUpdate(lead.id, { message: e.target.value }) }} rows={5}
                  className="w-full p-3.5 rounded-[11px] bg-white border text-[13px] leading-relaxed focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[rgba(11,11,12,.06)] resize-y transition-colors" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => copyOpen('')} className="text-[12px] px-3 py-2 rounded-[10px] bg-white border hover:border-[var(--line-2)] flex items-center gap-1.5 transition-colors">{copied ? <Check className="w-3.5 h-3.5 text-[var(--acc-text)]" /> : <Copy className="w-3.5 h-3.5" />} Copy</button>
                  <button onClick={makeAudit} className="text-[12px] px-3 py-2 rounded-[10px] bg-white border hover:border-[var(--line-2)] flex items-center gap-1.5 transition-colors"><FileText className="w-3.5 h-3.5" /> AI audit</button>
                  {ig && <button onClick={() => copyOpen(ig)} className="text-[12px] px-3 py-2 rounded-[10px] bg-[var(--ink)] text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"><Copy className="w-3.5 h-3.5" /> IG <ExternalLink className="w-3 h-3" /></button>}
                  {mail && <button onClick={() => copyOpen(mail)} className="text-[12px] px-3 py-2 rounded-[10px] bg-[var(--ink)] text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"><Copy className="w-3.5 h-3.5" /> Email <ExternalLink className="w-3 h-3" /></button>}
                  {lead.web && <button onClick={() => window.open(`https://${lead.web}`, '_blank')} className="text-[12px] px-3 py-2 rounded-[10px] bg-white border hover:border-[var(--line-2)] flex items-center gap-1.5 transition-colors">Web <ExternalLink className="w-3 h-3" /></button>}
                </div>
              </>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContactIcon({ active, title, href, children }: { active: boolean; title: string; href: string; children: React.ReactNode }) {
  if (active && href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" title={title}
      className="text-[var(--mut)] hover:text-[var(--ink)] transition-colors">{children}</a>
  }
  return <span title={title} className="text-[#D8D7D1] cursor-not-allowed">{children}</span>
}
