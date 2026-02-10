import { FlashcardItem, PronounKey, TenseKey, VerbEntry } from './types';

export const pronounLabels: Record<PronounKey, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él',
  ella: 'ella',
  usted: 'usted',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ustedes: 'ustedes',
};

export const tenseDetails: Record<TenseKey, { name: string; meaning: string }> = {
  present: { name: 'Present', meaning: 'current/general truth' },
  preterite: { name: 'Preterite (Simple Past)', meaning: 'completed action in the past' },
  imperfect: { name: 'Imperfect', meaning: 'ongoing/habitual past, background' },
};

export function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function getRoundRankFocus(round: number): { center: number; spread: number } {
  const t = (round - 1) / 9;
  return {
    center: Math.round(120 + t * 320),
    spread: Math.round(100 + t * 180),
  };
}

function weightedSampleWithoutReplacement<T>(items: T[], weights: number[], count: number): T[] {
  const pool = [...items];
  const ws = [...weights];
  const selected: T[] = [];
  while (selected.length < count && pool.length > 0) {
    const total = ws.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let acc = 0;
    let idx = 0;
    for (; idx < ws.length; idx++) {
      acc += ws[idx];
      if (r <= acc) break;
    }
    selected.push(pool[idx]);
    pool.splice(idx, 1);
    ws.splice(idx, 1);
  }
  return selected;
}

export function pickRoundVerbs(verbs: VerbEntry[], round: number, count = 50): VerbEntry[] {
  const { center, spread } = getRoundRankFocus(round);
  const weights = verbs.map((v) => {
    const dist = Math.abs(v.frequencyRank - center);
    const gaussian = Math.exp(-Math.pow(dist / spread, 2));
    const commonBoost = 1 / Math.sqrt(v.frequencyRank + round * 10);
    return gaussian * 0.7 + commonBoost * 0.3 + 0.0001;
  });
  return weightedSampleWithoutReplacement(verbs, weights, count);
}

export function buildRoundCards(
  selectedVerbs: VerbEntry[],
  includeVosotros: boolean,
  tenseMode: 'mixed' | TenseKey,
): FlashcardItem[] {
  const pronouns = (includeVosotros
    ? ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'vosotros', 'ustedes']
    : ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'ustedes']) as PronounKey[];
  const tenses = tenseMode === 'mixed' ? (['present', 'preterite', 'imperfect'] as TenseKey[]) : [tenseMode];
  const used = new Set<string>();
  const cards: FlashcardItem[] = [];

  selectedVerbs.forEach((verb) => {
    let attempts = 0;
    while (attempts < 40) {
      const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
      const tense = tenses[Math.floor(Math.random() * tenses.length)];
      const key = `${verb.infinitive}-${pronoun}-${tense}`;
      if (!used.has(key)) {
        used.add(key);
        cards.push({ verb, pronoun, tense });
        return;
      }
      attempts += 1;
    }
    for (const pronoun of pronouns) {
      for (const tense of tenses) {
        const key = `${verb.infinitive}-${pronoun}-${tense}`;
        if (!used.has(key)) {
          used.add(key);
          cards.push({ verb, pronoun, tense });
          return;
        }
      }
    }
  });

  return cards.sort(() => Math.random() - 0.5);
}
