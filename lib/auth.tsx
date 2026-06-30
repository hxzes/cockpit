'use client'

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User, type Auth } from 'firebase/auth'
import { getApps, initializeApp } from 'firebase/app'
import { useEffect, useState } from 'react'

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let _a: Auth | null = null, _tried = false
export function getAuthSafe(): Auth | null {
  if (_tried) return _a
  _tried = true
  if (typeof window === 'undefined' || !cfg.apiKey) return null
  try { _a = getAuth(getApps().length ? getApps()[0] : initializeApp(cfg)) } catch { _a = null }
  return _a
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const a = getAuthSafe()
    if (!a) { setReady(true); return }
    try { return onAuthStateChanged(a, u => { setUser(u); setReady(true) }) } catch { setReady(true) }
  }, [])
  return { user, ready }
}

export async function login(e: string, p: string) {
  const a = getAuthSafe(); if (!a) throw new Error('Firebase nie je nakonfigurovany — .env.local + restart')
  return signInWithEmailAndPassword(a, e, p)
}
export async function logout() { const a = getAuthSafe(); if (a) await signOut(a) }
