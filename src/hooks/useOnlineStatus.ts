import { useEffect, useState } from 'react'

/** Suit la connectivité navigateur (section 40 : indication discrète hors
 * ligne). Ce n'est qu'un signal best-effort — `navigator.onLine` peut être
 * vrai même sans accès réel à Supabase, mais suffit pour l'indication
 * visuelle demandée. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
