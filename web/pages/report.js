// pages/report.js — pure server-side redirect, zero client render
import { PIN_META } from '../lib/pinMeta'

export async function getServerSideProps({ query }) {
  const { pin, q } = query
  // Was `pin && /^\d{6}$/.test(pin)`, which rejected any non-numeric area id
  // (e.g. Punjab's slug-keyed areas). PIN_META existence is the real check.
  if (pin && PIN_META[pin])
    return { redirect: { destination: `/report/${pin}`, permanent: false } }
  if (q) {
    const s = q.trim().toLowerCase()
    const match = Object.entries(PIN_META).find(([, meta]) => meta.name.toLowerCase().includes(s))
    if (match) return { redirect: { destination: `/report/${match[0]}`, permanent: false } }
  }
  return { redirect: { destination: '/', permanent: false } }
}

export default function Report() { return null }
