import { NextResponse } from 'next/server'
export async function GET() {
  const fb = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
  return NextResponse.json({
    FIREBASE_API_KEY: fb ? `present (${fb.length} chars, starts ${fb.slice(0,6)})` : 'MISSING',
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `present (${process.env.GEMINI_API_KEY.length} chars)` : 'MISSING',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? `present (${process.env.GOOGLE_MAPS_API_KEY.length} chars)` : 'MISSING',
    hint: 'FIREBASE_API_KEY ma mat ~39 znakov a zacinat AIzaSy. Ak MISSING/zle: skontroluj .env.local, ziadne uvodzovky/medzery, a restartni dev server.',
  })
}
