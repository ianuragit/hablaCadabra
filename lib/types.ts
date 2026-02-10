export const PRONOUN_KEYS = ['yo', 'tu', 'elEllaUsted', 'nosotros', 'vosotros', 'ustedes'] as const;
export type PronounKey = (typeof PRONOUN_KEYS)[number];

export const PRONOUN_LABELS: Record<PronounKey, string> = {
  yo: 'yo',
  tu: 'tú',
  elEllaUsted: 'él/ella/usted',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ustedes: 'ustedes',
};

export interface VerbEntry {
  infinitive: string;
  type: 'ar' | 'er' | 'ir';
  englishMeaning: string;
  frequencyRank: number;
  presentConjugation: Record<PronounKey, string>;
  sampleSentence: Record<PronounKey, { es: string; en?: string }>;
}

export interface FlashcardItem {
  verb: VerbEntry;
  pronoun: PronounKey;
}
