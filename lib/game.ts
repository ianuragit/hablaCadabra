import { FlashcardItem, PronounKey, PRONOUN_KEYS, VerbEntry } from './types';

export function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Pick verbs for a given round (1-indexed).
 * Round 1 → ranks 1-50, Round 2 → ranks 51-100, etc.
 */
export function pickRoundVerbs(verbs: VerbEntry[], round: number, count = 50): VerbEntry[] {
  const start = (round - 1) * count;
  const end = start + count;
  // Slice by frequency rank (verbs should already be sorted by frequencyRank)
  const sorted = [...verbs].sort((a, b) => a.frequencyRank - b.frequencyRank);
  return sorted.slice(start, end);
}

/**
 * Build flashcard items for a round.
 * Each verb gets one card with a random pronoun.
 */
export function buildRoundCards(
  selectedVerbs: VerbEntry[],
  includeVosotros: boolean,
): FlashcardItem[] {
  const pronouns = includeVosotros
    ? [...PRONOUN_KEYS]
    : PRONOUN_KEYS.filter((p) => p !== 'vosotros');

  const cards: FlashcardItem[] = selectedVerbs.map((verb) => {
    const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    return { verb, pronoun };
  });

  // Shuffle using Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export interface RoundStats {
  correctCount: number;
  wrongCount: number;
  pronounStats: Record<PronounKey, { correct: number; total: number }>;
  pairStats: Record<string, { correct: number; wrong: number }>;
}

export function createEmptyStats(): RoundStats {
  const pronounStats = {} as Record<PronounKey, { correct: number; total: number }>;
  for (const key of PRONOUN_KEYS) {
    pronounStats[key] = { correct: 0, total: 0 };
  }
  return {
    correctCount: 0,
    wrongCount: 0,
    pronounStats,
    pairStats: {},
  };
}

export function recordAnswer(
  stats: RoundStats,
  verb: string,
  pronoun: PronounKey,
  isCorrect: boolean,
): RoundStats {
  const pairKey = `${verb}|${pronoun}`;
  const prevPair = stats.pairStats[pairKey] ?? { correct: 0, wrong: 0 };
  const prevPronoun = stats.pronounStats[pronoun];

  return {
    correctCount: stats.correctCount + (isCorrect ? 1 : 0),
    wrongCount: stats.wrongCount + (isCorrect ? 0 : 1),
    pronounStats: {
      ...stats.pronounStats,
      [pronoun]: {
        correct: prevPronoun.correct + (isCorrect ? 1 : 0),
        total: prevPronoun.total + 1,
      },
    },
    pairStats: {
      ...stats.pairStats,
      [pairKey]: {
        correct: prevPair.correct + (isCorrect ? 1 : 0),
        wrong: prevPair.wrong + (isCorrect ? 0 : 1),
      },
    },
  };
}

export function getFocusList(
  pairStats: Record<string, { correct: number; wrong: number }>,
  limit = 10,
): Array<{ verb: string; pronoun: string; wrong: number }> {
  return Object.entries(pairStats)
    .filter(([, s]) => s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, limit)
    .map(([key, s]) => {
      const [verb, pronoun] = key.split('|');
      return { verb, pronoun, wrong: s.wrong };
    });
}
