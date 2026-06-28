import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Server-side Firestore via Admin SDK. Uses a service account from env.
// If you don't set a service account, it falls back to the client SDK route (see lib/fireclient.ts).
let app: App | null = null

function getApp(): App | null {
  if (app) return app
  if (getApps().length) { app = getApps()[0]; return app }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) return null
  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return app
}

export function adminDB() {
  const a = getApp()
  if (!a) return null
  return getFirestore(a)
}
