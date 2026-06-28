import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, limit,
} from 'firebase/firestore'

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(cfg)
export const db = getFirestore(app)

export async function colGet<T>(name: string, max = 300): Promise<T[]> {
  const q = query(collection(db, name), orderBy('createdAt', 'desc'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T))
}
export async function colAdd(name: string, data: Record<string, unknown>): Promise<string> {
  const ref = await addDoc(collection(db, name), { ...data, createdAt: data.createdAt || new Date().toISOString() })
  return ref.id
}
export async function colUpdate(name: string, id: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, name, id), data)
}
export async function colDelete(name: string, id: string): Promise<void> {
  await deleteDoc(doc(db, name, id))
}
