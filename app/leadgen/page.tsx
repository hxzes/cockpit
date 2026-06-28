'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore, type LeadStatus, type Lead } from '@/lib/store'
import { Card, Btn } from '@/components/ui'
import { Bot, Loader2, Check, Copy, ExternalLink, Trash2, Search, UserPlus, Sparkles, FileText, ArrowUpDown, X, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const TYPES = ['restaurant', 'cafe', 'hotel', 'bar', 'pizzeria', 'bakery', 'gym', 'beauty salon']
const CITIES = ['Bratislava', 'Nitra', 'Trnava', 'Nove Zamky', 'Sala', 'Kosice', 'Trencin', 'Zilina']

export default function LeadGen() {
  const { data, addLead, updateLead, removeLead, addClient } = useStore()
  const [type, setType] = useState('restaurant')
  const [city, setCity] = useState('Bratislava')
  const [count, setCount] = useState(10)
  const [scraping, setScraping] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [sortByScore, setSortByScore] = useState(true)
  const [types, setTypes] = useState(TYPES)
  const [cities, setCities] = useState(CITIES)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const stopRef = useRef(false)

  // AI navrhne typy + mesta pri nacitani
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
    const query = `${type} ${city}`
    setScraping(true); setLog([`Scraping "${query}" (max ${count})...`])
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      const places: { name: string; city: string; web: string; phone: string; ig?: string; email?: string; fb?: string }[] = (d.results || []).slice(0, count)
      setLog(l => [...l, `Found ${d.count}, analyzing ${places.length}...`])
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
      setLog(l => [...l, stopRef.current ? `Zastavene · ${done} leadov pridanych` : `Hotovo · ${done} leadov pridanych`])
    } catch (e) { setLog(l => [...l, `Error: ${e instanceof Error ? e.message : 'failed'}`]) }
    finally { setScraping(false); stopRef.current = false }
  }

  const stop = () => { stopRef.current = true; setLog(l => [...l, 'Zastavujem...']) }

  // smart priorita: nizke skore = vacsia prilezitost (potrebuju web najviac), bez webu navrch
  const shown = [...data.leads].sort((a, b) => sortByScore
    ? (a.web === '' ? -1 : b.web === '' ? 1 : a.score - b.score)
    : 0)

  return (
    <div className="fade">
      <h1 className="text-[24px] md:text-[26px] font-bold tracking-tight mb-1">Lead Gen</h1>
      <p className="text-[var(--mut)] text-sm mb-5">Vyber typ podniku a mesto — AI ohodnoti weby a napise oslovenie. Ty len posles.</p>

      {/* FILTER BUILDER */}
      <Card className="p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-[12px] text-[var(--sub)]">
          <Sparkles className="w-3.5 h-3.5" /> {loadingSuggest ? 'AI navrhuje ciele...' : 'AI odporucania'}
        </div>
        <div className="mb-3">
          <p className="text-[12px] text-[var(--mut)] mb-1.5">Typ podniku</p>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${type === t ? 'bg-[var(--purple)] text-white border-[var(--purple)]' : 'bg-white text-[var(--mut)] hover:border-[var(--mut)]'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[12px] text-[var(--mut)] mb-1.5">Mesto</p>
          <div className="flex flex-wrap gap-1.5">
            {cities.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${city === c ? 'bg-[#0F0F10] text-white border-[#0F0F10]' : 'bg-white text-[var(--mut)] hover:border-[var(--mut)]'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[12px] text-[var(--mut)] mb-1.5">Pocet leadov</p>
          <div className="flex flex-wrap gap-1.5">
            {[5, 10, 15, 20].map(n => (
              <button key={n} onClick={() => setCount(n)} disabled={scraping}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${count === n ? 'bg-[var(--amber)] text-white border-[var(--amber)]' : 'bg-white text-[var(--mut)] hover:border-[var(--mut)]'}`}>{n}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[180px] flex items-center gap-2 h-10 px-3 rounded-lg bg-[var(--bg)] border text-sm text-[var(--mut)]">
            <Search className="w-4 h-4 text-[var(--sub)]" /> {type} {city} · {count}
          </div>
          {scraping ? (
            <button onClick={stop}
              className="h-10 px-5 rounded-lg bg-[var(--red)] text-white text-sm font-medium flex items-center gap-2">
              <X className="w-4 h-4" /> Stop
            </button>
          ) : (
            <button onClick={run}
              className="h-10 px-5 rounded-lg bg-[var(--amber)] text-white text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" /> Scrape
            </button>
          )}
        </div>
        {log.length > 0 && (
          <div className="mt-3 font-mono text-[12px] text-[var(--mut)] space-y-1">
            {log.map((l, i) => <div key={i} className="flex items-center gap-2">{i === log.length - 1 && scraping ? <Loader2 className="w-3 h-3 spin" /> : <Check className="w-3 h-3 text-[var(--green)]" />}{l}</div>)}
          </div>
        )}
      </Card>

      {data.leads.length > 0 && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 text-[13px] text-[var(--mut)]">
            <span>{data.leads.length} leadov</span>
            <span className="text-[var(--sub)]">·</span>
            <span>{data.leads.filter(l => l.phone || l.email || l.ig || l.fb).length} kontaktovatelnych</span>
            <span className="text-[var(--sub)]">·</span>
            <span title="Priemerny naklad na lead (Gemini AI analyza)">~€{(data.leads.length * 0.0008).toFixed(3)} / {data.leads.length} = €0.001/lead</span>
          </div>
          <button onClick={() => setSortByScore(s => !s)} className="text-[12px] text-[var(--mut)] flex items-center gap-1.5 hover:text-[var(--ink)]">
            <ArrowUpDown className="w-3.5 h-3.5" /> {sortByScore ? 'Priorita (najlepsie ciele)' : 'Najnovsie'}
          </button>
        </div>
      )}

      {data.leads.length === 0 ? (
        <Card className="p-10 text-center text-[var(--mut)] text-sm">Ziadne leady. Vyber typ + mesto a daj Scrape.</Card>
      ) : (
        <div className="space-y-2">
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
  const useSubject = () => { setTab('message'); if (brief && !msg) { /* prefill via message gen */ } }

  const ig = lead.ig ? `https://instagram.com/${lead.ig.replace('@', '')}` : ''
  const mail = lead.email ? `mailto:${lead.email}?subject=${encodeURIComponent(brief?.subject || ('moni — ' + lead.name))}&body=${encodeURIComponent(msg)}` : ''
  const copyOpen = async (url: string) => {
    try { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
    if (url) window.open(url, '_blank'); if (lead.status === 'new') onUpdate(lead.id, { status: 'sent' })
  }
  const channelIcon = (c: string) => c === 'email' ? '📧 Email' : c === 'instagram' ? '📸 Instagram' : '📞 Telefon'

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[14px] truncate">{lead.name}</div>
          <div className="text-[12px] text-[var(--sub)] truncate">{lead.city}{lead.web ? ` · ${lead.web}` : ' · no website'}</div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <ContactIcon active={!!lead.phone} title={lead.phone || 'ziadny telefon'} href={lead.phone ? `tel:${lead.phone}` : ''}><Phone className="w-[15px] h-[15px]" /></ContactIcon>
            <ContactIcon active={!!lead.email} title={lead.email || 'ziadny email'} href={lead.email ? `mailto:${lead.email}` : ''}><Mail className="w-[15px] h-[15px]" /></ContactIcon>
            <ContactIcon active={!!lead.ig} title={lead.ig || 'ziadny instagram'} href={lead.ig ? `https://instagram.com/${lead.ig.replace('@', '')}` : ''}><Instagram className="w-[15px] h-[15px]" /></ContactIcon>
            <ContactIcon active={!!lead.fb} title={lead.fb || 'ziadny facebook'} href={lead.fb ? `https://facebook.com/${lead.fb}` : ''}><Facebook className="w-[15px] h-[15px]" /></ContactIcon>
            <ContactIcon active={!!lead.web} title={lead.web || 'ziadny web'} href={lead.web ? `https://${lead.web}` : ''}><ExternalLink className="w-[15px] h-[15px]" /></ContactIcon>
          </div>
        </div>
        <div className="w-[56px] md:w-[64px] shrink-0">
          <div className="text-[11px] text-[var(--sub)] mb-1">{lead.score}/100</div>
          <div className="h-1 rounded-full bg-[var(--bd)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: scoreColor }} /></div>
        </div>
        <select value={lead.status} onChange={e => onUpdate(lead.id, { status: e.target.value as LeadStatus })}
          className="shrink-0 text-[12px] bg-transparent cursor-pointer focus:outline-none hidden sm:block">
          <option value="new">new</option><option value="sent">sent</option><option value="reply">reply</option><option value="client">client</option>
        </select>
        <Btn variant="ghost" onClick={open ? () => setOpen(false) : openCard}>{open ? 'Close' : 'Open'}</Btn>
        <button onClick={onConvert} title="Convert to client" className="text-[var(--sub)] hover:text-[var(--purple)] hidden sm:block"><UserPlus className="w-4 h-4" /></button>
        <button onClick={() => onDelete(lead.id)} className="text-[var(--sub)] hover:text-[var(--red)]"><Trash2 className="w-4 h-4" /></button>
      </div>

      {open && (
        <div className="border-t bg-[var(--bg)] fade">
          {/* tabs */}
          <div className="flex items-center gap-1 px-3 md:px-4 pt-3">
            <button onClick={() => setTab('brief')} className={`text-[12.5px] px-3 py-1.5 rounded-lg font-medium ${tab === 'brief' ? 'bg-white border text-[var(--ink)]' : 'text-[var(--mut)]'}`}>🧠 AI Brief</button>
            <button onClick={() => setTab('message')} className={`text-[12.5px] px-3 py-1.5 rounded-lg font-medium ${tab === 'message' ? 'bg-white border text-[var(--ink)]' : 'text-[var(--mut)]'}`}>✉️ Sprava</button>
          </div>

          {tab === 'brief' && (
            <div className="p-3 md:p-4">
              {briefLoading ? <div className="flex items-center gap-2 text-[var(--mut)] text-sm py-6 justify-center"><Loader2 className="w-4 h-4 spin" /> Leo analyzuje lead...</div>
              : !brief ? <div className="text-center py-6">
                  <p className="text-[13px] text-[var(--mut)] mb-3">Nechaj lea spravit kompletny sales brief — cena, sanca, namietky, call script.</p>
                  <button onClick={loadBrief} className="text-[13px] px-4 py-2 rounded-lg bg-[var(--purple)] text-white font-medium inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generovat AI brief</button>
                </div>
              : <div className="space-y-3">
                {/* top stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white border rounded-lg p-3"><p className="text-[11px] text-[var(--sub)]">Odhad ceny</p><p className="text-[15px] font-bold mt-0.5">{brief.priceMin}–{brief.priceMax} €</p></div>
                  <div className="bg-white border rounded-lg p-3"><p className="text-[11px] text-[var(--sub)]">Sanca uzavriet</p><p className="text-[15px] font-bold mt-0.5" style={{ color: brief.closeChance >= 70 ? 'var(--green)' : brief.closeChance >= 40 ? 'var(--amber)' : 'var(--red)' }}>{brief.closeChance}%</p></div>
                  <div className="bg-white border rounded-lg p-3"><p className="text-[11px] text-[var(--sub)]">Prvy kontakt</p><p className="text-[13px] font-semibold mt-0.5">{channelIcon(brief.bestChannel)}</p></div>
                  <div className="bg-white border rounded-lg p-3"><p className="text-[11px] text-[var(--sub)]">Skore webu</p><p className="text-[15px] font-bold mt-0.5">{lead.score}/100</p></div>
                </div>
                {/* points */}
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-[12px] text-[var(--sub)] mb-2">Co sme zistili</p>
                  <ul className="space-y-1">{brief.points.map((p, i) => <li key={i} className="text-[13px] flex gap-2"><span className="text-[var(--amber)]">•</span>{p}</li>)}</ul>
                </div>
                {/* biggest problem + subject */}
                <div className="grid md:grid-cols-2 gap-2">
                  <div className="bg-white border rounded-lg p-3"><p className="text-[11px] text-[var(--sub)] mb-1">Najvacsi problem</p><p className="text-[13px] font-medium">{brief.biggestProblem}</p></div>
                  <div className="bg-white border rounded-lg p-3">
                    <p className="text-[11px] text-[var(--sub)] mb-1">Odporucany predmet</p>
                    <p className="text-[13px] font-medium">"{brief.subject}"</p>
                  </div>
                </div>
                {/* objections */}
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-[12px] text-[var(--sub)] mb-2">Namietky + odpovede</p>
                  <div className="space-y-2">{brief.objections.map((o, i) => (
                    <div key={i} className="text-[13px]"><p className="font-medium">"{o.o}"</p><p className="text-[var(--mut)] flex gap-1.5 mt-0.5"><span className="text-[var(--green)]">→</span>{o.a}</p></div>
                  ))}</div>
                </div>
                {/* call script */}
                <details className="bg-white border rounded-lg p-3">
                  <summary className="text-[12px] text-[var(--sub)] cursor-pointer">📞 Call script (klikni)</summary>
                  <div className="mt-2 space-y-2 text-[13px]">
                    <p><b>Otvorenie:</b> {brief.callScript.opening}</p>
                    <div><b>Otazky:</b><ul className="mt-1 space-y-0.5">{brief.callScript.questions.map((q, i) => <li key={i} className="flex gap-1.5"><span className="text-[var(--purple)]">·</span>{q}</li>)}</ul></div>
                    <p><b>Pain:</b> {brief.callScript.pain}</p>
                    <p><b>Close:</b> {brief.callScript.close}</p>
                    <p><b>CTA:</b> {brief.callScript.cta}</p>
                  </div>
                </details>
                <div className="flex gap-2">
                  <button onClick={() => { setTab('message'); if (!msg) generate() }} className="text-[12px] px-3 py-2 rounded-lg bg-[var(--purple)] text-white font-medium">Napisat spravu →</button>
                  <button onClick={makeAudit} className="text-[12px] px-3 py-2 rounded-lg bg-white border hover:border-[var(--mut)] flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Audit text</button>
                </div>
              </div>}
            </div>
          )}

          {tab === 'message' && (
            <div className="p-3 md:p-4">
              {gen || audit ? <div className="flex items-center gap-2 text-[var(--mut)] text-sm py-3 justify-center"><Loader2 className="w-4 h-4 spin" /> {audit ? 'Leo pise audit...' : 'Leo pise spravu...'}</div>
              : !msg ? <div className="text-center py-6">
                  <p className="text-[13px] text-[var(--mut)] mb-3">Nechaj lea napisat oslovenie pre tento podnik.</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={generate} className="text-[13px] px-4 py-2 rounded-lg bg-[var(--purple)] text-white font-medium inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Napisat spravu</button>
                    <button onClick={makeAudit} className="text-[13px] px-4 py-2 rounded-lg bg-white border hover:border-[var(--mut)] inline-flex items-center gap-2"><FileText className="w-4 h-4" /> AI audit</button>
                  </div>
                </div>
              : <>
                <textarea value={msg} onChange={e => { setMsg(e.target.value); onUpdate(lead.id, { message: e.target.value }) }} rows={5}
                  className="w-full p-3 rounded-lg bg-white border text-[13px] leading-relaxed focus:outline-none focus:border-[var(--purple)] resize-y" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => copyOpen('')} className="text-[12px] px-3 py-1.5 rounded-lg bg-white border hover:border-[var(--mut)] flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-[var(--green)]" /> : <Copy className="w-3.5 h-3.5" />} Copy</button>
                  <button onClick={makeAudit} className="text-[12px] px-3 py-1.5 rounded-lg bg-white border hover:border-[var(--mut)] flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> AI audit</button>
                  {ig && <button onClick={() => copyOpen(ig)} className="text-[12px] px-3 py-1.5 rounded-lg bg-[var(--purple)] text-white flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> IG <ExternalLink className="w-3 h-3" /></button>}
                  {mail && <button onClick={() => copyOpen(mail)} className="text-[12px] px-3 py-1.5 rounded-lg bg-[var(--purple)] text-white flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Email <ExternalLink className="w-3 h-3" /></button>}
                  {lead.web && <button onClick={() => window.open(`https://${lead.web}`, '_blank')} className="text-[12px] px-3 py-1.5 rounded-lg bg-white border hover:border-[var(--mut)] flex items-center gap-1.5">Web <ExternalLink className="w-3 h-3" /></button>}
                </div>
              </>}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function ContactIcon({ active, title, href, children }: { active: boolean; title: string; href: string; children: React.ReactNode }) {
  if (active && href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" title={title}
      className="text-[var(--mut)] hover:text-[var(--purple)] transition-colors">{children}</a>
  }
  return <span title={title} className="text-[#D4D4D8] cursor-not-allowed">{children}</span>
}
