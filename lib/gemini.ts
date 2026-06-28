const KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

export async function gemini(prompt: string, json = false): Promise<string> {
  if (!KEY) throw new Error('GEMINI_API_KEY missing in .env.local (restart dev server)')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: json
          ? { temperature: 0.3, responseMimeType: 'application/json' }
          : { temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
