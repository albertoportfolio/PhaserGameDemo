export interface ScoreEntry {
  score: number
  date:  string   // formato DD/MM/YYYY
  result: 'victory' | 'gameover'
}

const KEY      = 'highscores'
const MAX_ENTRIES = 10

export const ScoreManager = {

  // Guarda un score nuevo y devuelve la posición que ocupó (1-based), o null si no entró
  save(score: number, result: 'victory' | 'gameover'): number | null {
    const all = this.load()

    const now   = new Date()
    const day   = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year  = now.getFullYear()

    const entry: ScoreEntry = {
      score,
      date: `${day}/${month}/${year}`,
      result,
    }

    all.push(entry)
    all.sort((a, b) => b.score - a.score)

    const top = all.slice(0, MAX_ENTRIES)
    localStorage.setItem(KEY, JSON.stringify(top))

    // Devuelve la posición (1-based) del score guardado
    const pos = top.findIndex(e => e === entry)
    return pos === -1 ? null : pos + 1
  },

  load(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw) as ScoreEntry[]
    } catch (_) {}
    return []
  },

  clear() {
    localStorage.removeItem(KEY)
  },
}