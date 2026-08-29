export interface QualifiedTeam {
  teamId: string
  seed: 1 | 2 | 3 | 4
  source: 'auto' | 'manual'
}

export interface Bracket {
  qualified: QualifiedTeam[]
  semiFinal1: { teamAId: string; teamBId: string }
  semiFinal2: { teamAId: string; teamBId: string }
}
