import { NextRequest, NextResponse } from 'next/server'
const KEY = process.env.GOOGLE_MAPS_API_KEY

function cityFrom(addr?: string): string {
  if (!addr) return ''
  const parts = addr.split(',').map(s => s.trim())
  for (const p of parts) { const m = p.match(/^\d{3}\s?\d{2}\s+(.+)$/); if (m) return m[1] }
  return parts[parts.length - 2] || ''
}

// Pull IG handle + email + facebook from the business's OWN website (public contact info).
async function contactsFromSite(url: string): Promise<{ ig: string; email: string; fb: string }> {
  if (!url) return { ig: '', email: '', fb: '' }
  const full = url.startsWith('http') ? url : `https://${url}`
  try {
    const res = await fetch(full, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cockpit/1.0)' }, signal: AbortSignal.timeout(6000) })
    if (!res.ok) return { ig: '', email: '', fb: '' }
    const html = await res.text()
    const igMatch = html.match(/instagram\.com\/([A-Za-z0-9_.]+)/i)
    const ig = igMatch && !['p', 'reel', 'explore', 'accounts'].includes(igMatch[1].toLowerCase()) ? '@' + igMatch[1].replace(/\/$/, '') : ''
    const fbMatch = html.match(/facebook\.com\/([A-Za-z0-9_.\-]+)/i)
    const fb = fbMatch && !['sharer', 'plugins', 'tr', 'dialog', 'profile.php'].includes(fbMatch[1].toLowerCase()) ? fbMatch[1].replace(/\/$/, '') : ''
    const mailMatch = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
    const email = mailMatch ? mailMatch[0] : ''
    return { ig, email, fb }
  } catch { return { ig: '', email: '', fb: '' } }
}

export async function POST(req: NextRequest) {
  try {
    if (!KEY) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY missing in .env.local (restart dev server)' }, { status: 500 })
    const body = await req.json()
    const query: string = body.query
    const region: string = (body.region || '').toUpperCase()   // napr. SK, CZ, AT, DE, US...
    const count: number = Math.min(Math.max(Number(body.count) || 20, 1), 20)
    const minRating: number = Number(body.minRating) || 0       // 0 = bez filtra
    const lang: string = body.lang || 'en'
    if (!query?.trim()) return NextResponse.json({ error: 'Zadaj co hladat, napr. "restauracie"' }, { status: 400 })

    const reqBody: Record<string, unknown> = {
      textQuery: query,
      languageCode: lang,
      maxResultCount: count,
    }
    // obmedz na krajinu (ak je zadana) — Google bias na region
    if (region) reqBody.regionCode = region
    // min rating filter (Places podporuje minRating)
    if (minRating > 0) reqBody.minRating = minRating

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber' },
      body: JSON.stringify(reqBody),
    })
    if (!res.ok) return NextResponse.json({ error: `Places API ${res.status}: ${await res.text()}` }, { status: 500 })
    const data = await res.json()
    interface Place { name: string; city: string; web: string; phone: string; rating: number; reviews: number; igSeed: string; fbSeed: string }
    const places: Place[] = (data.places || []).map((p: Record<string, unknown>) => {
      const rawUri = (p.websiteUri as string) || ''
      const lower = rawUri.toLowerCase()
      const igFromUri = lower.includes('instagram.com') ? rawUri.match(/instagram\.com\/([A-Za-z0-9_.]+)/i) : null
      const fbFromUri = lower.includes('facebook.com') ? rawUri.match(/facebook\.com\/([A-Za-z0-9_.\-]+)/i) : null
      const isSocialOnly = !!igFromUri || !!fbFromUri
      return {
        name: (p.displayName as { text: string })?.text || 'Unknown',
        city: cityFrom(p.formattedAddress as string),
        web: rawUri && !isSocialOnly ? rawUri.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
        phone: (p.nationalPhoneNumber as string) || '',
        rating: (p.rating as number) || 0,
        reviews: (p.userRatingCount as number) || 0,
        igSeed: igFromUri ? '@' + igFromUri[1].replace(/\/$/, '') : '',
        fbSeed: fbFromUri ? fbFromUri[1].replace(/\/$/, '') : '',
      }
    })
    const enriched = await Promise.all(places.map(async (pl: Place) => {
      const c = await contactsFromSite(pl.web)
      return {
        name: pl.name, city: pl.city, web: pl.web, phone: pl.phone,
        rating: pl.rating, reviews: pl.reviews,
        ig: c.ig || pl.igSeed,
        fb: c.fb || pl.fbSeed,
        email: c.email,
      }
    }))
    return NextResponse.json({ count: enriched.length, results: enriched })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Scrape failed' }, { status: 500 }) }
}
