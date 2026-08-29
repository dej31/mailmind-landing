import { useEffect, useState } from 'react'
import { subscribeOfflineQueue } from '@/services/offlineQueue'

export function useOfflineQueueCount(): number {
  const [count, setCount] = useState(0)
  useEffect(() => subscribeOfflineQueue(setCount), [])
  return count
}
