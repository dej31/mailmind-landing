export interface TeamPair {
  teamAId: string
  teamBId: string
}

const BYE = '__BYE__'

/** Construit les rounds d'un tournoi "round robin" via la méthode du
 * cercle : une équipe fixe, les autres tournent autour à chaque round.
 * Si le nombre d'équipes est impair, une équipe fictive BYE est ajoutée
 * (elle change de round en round, donc chaque équipe réelle "saute" un
 * round au maximum une fois). Retourne un tableau de rounds, chaque round
 * étant la liste des paires jouées simultanément (utile pour garantir
 * qu'aucune équipe ne joue deux fois dans un même round). */
export function circleMethodRounds(teamIds: string[]): TeamPair[][] {
  const ids = [...teamIds]
  if (ids.length % 2 !== 0) ids.push(BYE)

  const n = ids.length
  if (n < 2) return []

  const roundCount = n - 1
  const fixed = ids[0]
  let rotating = ids.slice(1)
  const rounds: TeamPair[][] = []

  for (let r = 0; r < roundCount; r++) {
    const arrangement = [fixed, ...rotating]
    const pairs: TeamPair[] = []
    for (let i = 0; i < n / 2; i++) {
      const a = arrangement[i]
      const b = arrangement[n - 1 - i]
      if (a !== BYE && b !== BYE) pairs.push({ teamAId: a, teamBId: b })
    }
    rounds.push(pairs)
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)]
  }

  return rounds
}

/** Round robin complet : chaque équipe rencontre toutes les autres une
 * fois. Nombre de matchs = n*(n-1)/2. */
export function generateRoundRobin(teamIds: string[]): TeamPair[] {
  return circleMethodRounds(teamIds).flat()
}

/** Round robin limité : ne conserve que les `matchesPerTeam` premiers
 * rounds, ce qui garantit à chaque équipe entre matchesPerTeam-1 et
 * matchesPerTeam rencontres (l'écart d'au plus 1 vient du "bye" tournant
 * quand le nombre d'équipes est impair), sans aucun doublon d'adversaire. */
export function generateLimitedPoolMatches(
  teamIds: string[],
  matchesPerTeam: number,
): TeamPair[] {
  const rounds = circleMethodRounds(teamIds)
  const roundsToKeep = Math.min(Math.max(matchesPerTeam, 0), rounds.length)
  return rounds.slice(0, roundsToKeep).flat()
}
