import { useEffect, useState } from 'react'

/** Persistance légère côté téléphone (ex : équipe choisie dans "Mon
 * équipe", section 29 — jamais de compte requis). */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // stockage indisponible (navigation privée...) : on continue sans persister
    }
  }, [key, value])

  return [value, setValue] as const
}
