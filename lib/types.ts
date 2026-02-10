export const PRONOUNS = ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'vosotros', 'ustedes'] as const;
export type PronounKey = (typeof PRONOUNS)[number];

export const TENSES = ['present', 'preterite', 'imperfect'] as const;
export type TenseKey = (typeof TENSES)[number];

export type ConjugationMap = Record<PronounKey, string>;

export interface SampleSentence {
  es: string;
  en: string;
}

export interface VerbEntry {
  infinitive: string;
  type: 'ar' | 'er' | 'ir';
  englishMeaning: string;
  frequencyRank: number;
  conjugations: Record<TenseKey, ConjugationMap>;
  sampleSentences: Record<TenseKey, Record<PronounKey, SampleSentence>>;
}

export interface FlashcardItem {
  verb: VerbEntry;
  pronoun: PronounKey;
  tense: TenseKey;
}
