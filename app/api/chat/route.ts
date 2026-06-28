import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

/**
 * The browser sends the current data snapshot (clients, invoices, leads) plus the
 * chat history. Gemini answers in JSON: a reply + an optional proposed action that
 * the UI renders as a confirm button. Nothing is written without the user confirming.
 */
export async function POST(req: NextRequest) {
  try {
    const { message, history, snapshot } = await req.json()

    const sys = `You are "leo", the AI copilot inside "moni cockpit", an admin for Seb's web design business.

STYLE — very important:
- Always write in lowercase only. never capitalize, not even names or the start of sentences.
- Never use diacritics / accents. write slovak and english without any (e.g. "vytvorit fakturu", not "vytvoriť faktúru").
- Address the user as "seb".
- Be casual, short, friendly. like texting a friend who runs the business with you.

You can read Seb's data (provided below as JSON) and help with: business questions
(mrr, revenue, who churned, top leads), writing outreach/follow-up messages, and proposing
actions. match the user's language (slovak or english) but always lowercase + no diacritics.

DATA SNAPSHOT:
${JSON.stringify(snapshot).slice(0, 6000)}

You MUST reply with ONLY valid JSON in this shape:
{
  "reply": "your answer in lowercase, no diacritics",
  "action": null | {
    "type": "create_invoice" | "create_message" | "set_lead_status" | "set_invoice_status",
    "label": "short human description for a confirm button (lowercase, no diacritics)",
    "payload": { ...fields for the action... }
  }
}

Action payload rules:
- create_invoice: { clientName, amount (number, EUR), note }
- create_message: { leadOrClient, channel ("email"|"instagram"), text }
- set_lead_status: { leadName, status ("new"|"sent"|"reply"|"client") }
- set_invoice_status: { number, status ("paid"|"pending"|"overdue") }
Only include an action when seb clearly asks to DO something. Otherwise action = null.
Keep replies concise. Never invent data that's not in the snapshot.`

    const convo = (history || []).map((m: { role: string; text: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
    const prompt = `${sys}\n\nConversation so far:\n${convo}\n\nUser: ${message}\n\nJSON:`

    const raw = await gemini(prompt, true)
    let parsed: { reply: string; action: unknown }
    try { parsed = JSON.parse(raw) }
    catch { parsed = { reply: raw || 'Sorry, I could not parse that.', action: null } }
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ reply: e instanceof Error ? e.message : 'Chat failed', action: null }, { status: 200 })
  }
}
