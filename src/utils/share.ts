export async function shareOrCopy(data: {
  title: string
  text?: string
  url: string
}): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch {
      return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(data.url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
