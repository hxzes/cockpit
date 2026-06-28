import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

// AI Sales Brief — komplet karta pred oslovenim/predajom leadu.
export async function POST(req: NextRequest) {
  try {
    const { name, city, web, problem, score, phone, ig } = await req.json()
    const prompt = `You are a sales strategist for moni.fyi (websites + video menus for Slovak SMBs/restaurants).
Build a SALES BRIEF for this lead:
- Name: ${name}
- City: ${city || 'unknown'}
- Website: ${web || 'NONE'}
- Detected problem: ${problem || 'unknown'}
- Site score: ${score}/100
- Phone: ${phone || 'n/a'} ${ig ? '· IG ' + ig : ''}

Return ONLY JSON:
{
  "points": ["4-6 short factual observations about their online presence, Slovak no diacritics"],
  "priceMin": number (EUR, realistic one-off web project for this type),
  "priceMax": number,
  "closeChance": number (0-100, based on how badly they need it + how reachable),
  "bestChannel": "email" | "instagram" | "phone",
  "subject": "recommended first-contact subject line, Slovak no diacritics, curiosity not salesy",
  "biggestProblem": "one line, Slovak no diacritics",
  "objections": [{"o":"likely objection (Slovak no diacritics)","a":"recommended answer (Slovak no diacritics)"}],
  "callScript": {"opening":"...","questions":["..."],"pain":"...","close":"...","cta":"..."}
}
Be concrete and realistic for the Slovak market. 3 objections, 3 questions.`
    const raw = await gemini(prompt, true)
    let d: unknown
    try { d = JSON.parse(raw) } catch { return NextResponse.json({ error: 'parse failed', raw }, { status: 200 }) }
    return NextResponse.json(d)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'brief failed' }, { status: 500 })
  }
}
