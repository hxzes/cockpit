import { NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

// AI navrhne typy podnikov + mesta na targetovanie (SK), nech Seb nepise rucne.
export async function POST() {
  try {
    const prompt = `You help a Slovak web/video-menu agency find clients. Suggest the best LOCAL business types to target (those who need a website + would buy a video menu / online presence) and the best Slovak cities/towns.
Return ONLY JSON:
{"types":["restaurant","cafe","hotel","bar","pizzeria","bakery","gym","beauty salon","dentist"],"cities":["Bratislava","Nitra","Trnava","Nove Zamky","Sala","Kosice"]}
Order by opportunity (who most lacks good websites). Keep 8 types, 6 cities. English type names, Slovak city names without diacritics.`
    const raw = await gemini(prompt, true)
    let d: { types: string[]; cities: string[] }
    try { d = JSON.parse(raw) } catch {
      d = { types: ['restaurant','cafe','hotel','bar','pizzeria','bakery','gym','beauty salon'], cities: ['Bratislava','Nitra','Trnava','Nove Zamky','Sala','Kosice'] }
    }
    return NextResponse.json(d)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'suggest failed' }, { status: 500 })
  }
}
