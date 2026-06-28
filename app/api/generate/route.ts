import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { name, city, problem, channel, mode } = await req.json()
    const prob = (problem || 'an outdated website').toLowerCase()
    let prompt: string
    if (mode === 'audit') {
      prompt = `Write a short website audit for "${name}"${city ? ` in ${city}` : ''} that moni.fyi can send as a free value teaser.
Main detected problem: ${prob}.
Cover, in 4-5 short bullet points: what likely hurts them now (mobile, speed, no online booking/menu, weak first impression), and what a video menu + modern site would fix. Concrete, plain Slovak, no diacritics, no fluff. End with one line offering a free sample. No markdown headers, just dash bullets.`
    } else {
      const igNote = channel === 'instagram' ? ' Keep it as a very short Instagram DM.' : ''
      prompt = `Write a short, friendly outreach message to "${name}"${city ? ` in ${city}` : ''}.
Their main website problem: ${prob}.
You are moni.fyi — you build websites and video menus for restaurants/SMBs.
Offer a free sample/audit. Casual, human, no corporate tone, Slovak without diacritics, max 4 sentences. End with a question about a quick call.${igNote}
Return only the message text.`
    }
    const message = (await gemini(prompt)).trim()
    return NextResponse.json({ message })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed' }, { status: 500 }) }
}
