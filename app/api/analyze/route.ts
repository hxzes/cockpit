import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'
async function fetchSite(url: string): Promise<string> {
  if (!url) return ''
  const full = url.startsWith('http') ? url : `https://${url}`
  try {
    const res = await fetch(full, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cockpit/1.0)' }, signal: AbortSignal.timeout(7000) })
    if (!res.ok) return ''
    const html = await res.text()
    const sig = { hasViewport: /viewport/i.test(html), hasReservation: /(reserv|booking|objedna|rezerv)/i.test(html), hasPdfMenu: /\.pdf/i.test(html), isHttps: full.startsWith('https') }
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2500)
    return JSON.stringify({ ...sig, text })
  } catch { return '' }
}
export async function POST(req: NextRequest) {
  try {
    const { name, web } = await req.json()
    const site = await fetchSite(web)
    const prompt = `You are an expert on restaurant/SMB websites. Analyze "${name}".
${web ? `Website: ${web}` : 'NO website found — big opportunity.'}
${site ? `Signals (JSON): ${site}` : ''}
Score 0-100 (0=none/terrible, 100=perfect): speed, mobile, reservation, up-to-date menu (PDF=minus), HTTPS, CTA.
Identify ONE main problem in English (max 6 words).
Return ONLY JSON: {"score": number, "problem": "string"}`
    const raw = await gemini(prompt, true)
    let p: { score: number; problem: string }
    try { p = JSON.parse(raw) } catch { p = { score: web ? 55 : 20, problem: web ? 'Website needs work' : 'No website' } }
    return NextResponse.json({ score: Math.max(0, Math.min(100, Math.round(p.score ?? 50))), problem: p.problem || 'Website needs work' })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Analysis failed' }, { status: 500 }) }
}
