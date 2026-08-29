import type { Match } from '@/models'
import { updateMatch } from '@/repositories'

/** File d'attente locale pour les écritures de match qui échouent faute de
 * réseau (section 21/40) : "Connexion perdue — résultat conservé sur ce
 * téléphone, nouvelle tentative en cours." On ne perd jamais une saisie de
 * score parce que le wifi de la fête a flanché. */

interface QueuedWrite {
  id: string
  matchId: string
  patch: Partial<Match>
  queuedAt: number
}

const STORAGE_KEY = 'halleback:offline-queue'
const listeners = new Set<(count: number) => void>()

function readQueue(): QueuedWrite[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedWrite[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch {
    // stockage indisponible : tant pis, on reste en mémoire pour cette session
  }
  for (const listener of listeners) listener(queue.length)
}

export function subscribeOfflineQueue(listener: (count: number) => void): () => void {
  listeners.add(listener)
  listener(readQueue().length)
  return () => listeners.delete(listener)
}

export function enqueueMatchWrite(matchId: string, patch: Partial<Match>) {
  const queue = readQueue()
  // On fusionne avec une écriture déjà en attente pour le même match plutôt
  // que d'empiler (seul le dernier état compte pour un score).
  const existing = queue.find((q) => q.matchId === matchId)
  if (existing) {
    existing.patch = { ...existing.patch, ...patch }
    existing.queuedAt = Date.now()
  } else {
    queue.push({ id: crypto.randomUUID(), matchId, patch, queuedAt: Date.now() })
  }
  writeQueue(queue)
}

export async function flushOfflineQueue(): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) return

  const remaining: QueuedWrite[] = []
  for (const item of queue) {
    try {
      await updateMatch(item.matchId, item.patch)
    } catch {
      remaining.push(item)
    }
  }
  writeQueue(remaining)
}

let started = false

/** À appeler une fois au démarrage de l'app : retente les écritures en
 * attente dès que la connexion revient, et périodiquement en secours. */
export function startOfflineQueueSync() {
  if (started) return
  started = true
  window.addEventListener('online', () => void flushOfflineQueue())
  setInterval(() => void flushOfflineQueue(), 15_000)
  void flushOfflineQueue()
}
