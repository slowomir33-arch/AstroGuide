/** Deterministyczny podgląd „napięcie vs harmonia” dla wybranej daty (placeholder do podmiany tranzytami). */
export function getDayTransitSeries(dateStr: string, profileId: string) {
  let h = 2166136261
  const mix = (s: string) => {
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
    return h >>> 0
  }
  mix(dateStr)
  mix(profileId)
  let seed = h
  const rnd = () => {
    seed = (Math.imul(seed, 48271) % 0x7fffffff) >>> 0
    return seed / 0x7fffffff
  }
  const points = Array.from({ length: 12 }, (_, i) => {
    const label = `${String(i * 2).padStart(2, '0')}:00`
    return {
      t: label,
      napięcie: Math.round(25 + rnd() * 55),
      harmonia: Math.round(20 + rnd() * 50),
      pole: Math.round(15 + rnd() * 60),
    }
  })
  return points
}
