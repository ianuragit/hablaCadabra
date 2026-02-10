'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { VERBS } from '@/lib/verbs';
import { FlashcardItem, PronounKey, PRONOUN_KEYS, PRONOUN_LABELS } from '@/lib/types';
import {
  buildRoundCards,
  createEmptyStats,
  formatTime,
  getFocusList,
  pickRoundVerbs,
  recordAnswer,
  RoundStats,
} from '@/lib/game';

type Stage = 'setup' | 'round' | 'results';

const HINT_CARD_COUNT = 3; // Show instructional hints on the first N cards

export default function Home() {
  // ── Session state ──────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('setup');
  const [userName, setUserName] = useState('');
  const [includeVosotros, setIncludeVosotros] = useState(true);
  const [round, setRound] = useState(1);

  // ── Round state ────────────────────────────────────────────
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stats, setStats] = useState<RoundStats>(createEmptyStats());

  // ── UI toggles ─────────────────────────────────────────────
  const [showCheat, setShowCheat] = useState(false);

  const shareRef = useRef<HTMLDivElement>(null);
  const currentCard = cards[cardIndex] ?? null;
  const showHint = cardIndex < HINT_CARD_COUNT;

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'round') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => clearInterval(id);
  }, [stage, startedAt]);

  // ── Actions ────────────────────────────────────────────────
  const startRound = useCallback(() => {
    const roundVerbs = pickRoundVerbs(VERBS, round, 50);
    const newCards = buildRoundCards(roundVerbs, includeVosotros);
    setCards(newCards);
    setCardIndex(0);
    setRevealed(false);
    setFlipping(false);
    setStartedAt(Date.now());
    setElapsed(0);
    setStats(createEmptyStats());
    setStage('round');
  }, [round, includeVosotros]);

  const handleReveal = useCallback(() => {
    if (revealed || flipping) return;
    setFlipping(true);
    // After flip-out animation completes, show the answer
    setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, 200);
  }, [revealed, flipping]);

  const markAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentCard || !revealed) return;
      setStats((prev) =>
        recordAnswer(prev, currentCard.verb.infinitive, currentCard.pronoun, isCorrect),
      );

      if (cardIndex >= cards.length - 1) {
        setStage('results');
        return;
      }
      setCardIndex((i) => i + 1);
      setRevealed(false);
      setFlipping(false);
    },
    [currentCard, revealed, cardIndex, cards.length],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage !== 'round') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) handleReveal();
      }
      if (revealed && e.key.toLowerCase() === 'r') markAnswer(true);
      if (revealed && e.key.toLowerCase() === 'w') markAnswer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, revealed, handleReveal, markAnswer]);

  // ── Derived data ───────────────────────────────────────────
  const accuracy = cards.length
    ? Math.round((stats.correctCount / cards.length) * 100)
    : 0;

  const focusList = useMemo(() => getFocusList(stats.pairStats), [stats.pairStats]);

  const filteredPronounKeys = includeVosotros
    ? PRONOUN_KEYS
    : PRONOUN_KEYS.filter((p) => p !== 'vosotros');

  const downloadCard = async () => {
    if (!shareRef.current) return;
    const dataUrl = await toPng(shareRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `habla-cadabra-round-${round}.png`;
    link.href = dataUrl;
    link.click();
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pb-12 pt-6 sm:pt-10">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-700 sm:text-5xl">
          Habla Cadabra
        </h1>
        <p className="mt-1 text-sm text-slate-500">Spanish Verb Conjugation Trainer</p>
      </header>

      {/* ─── SETUP SCREEN ─────────────────────────────────── */}
      {stage === 'setup' && (
        <section className="space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <label className="block text-sm font-medium text-slate-700">
              Your name
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) startRound();
                }}
              />
            </label>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
              <span
                role="switch"
                aria-checked={includeVosotros}
                tabIndex={0}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${includeVosotros ? 'bg-brand-600' : 'bg-slate-300'}`}
                onClick={() => setIncludeVosotros((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIncludeVosotros((v) => !v);
                  }
                }}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${includeVosotros ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </span>
              <span className="text-slate-700">Include <strong>vosotros</strong> (Spain)</span>
            </label>

            <button
              onClick={startRound}
              disabled={!userName.trim()}
              className="mt-6 w-full rounded-xl bg-brand-600 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-40"
            >
              Start Round {round}
            </button>
          </div>
        </section>
      )}

      {/* ─── ROUND SCREEN ─────────────────────────────────── */}
      {stage === 'round' && currentCard && (
        <section className="space-y-4">
          {/* Progress bar + timer */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="font-medium">
              Card {cardIndex + 1} / {cards.length}
            </span>
            <span className="font-mono tabular-nums">{formatTime(elapsed)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${((cardIndex + (revealed ? 1 : 0.5)) / cards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard — Question side */}
          {!revealed && (
            <div
              className={`cursor-pointer rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100 transition-transform sm:p-8 ${flipping ? 'card-flip-out' : ''}`}
              onClick={handleReveal}
              role="button"
              tabIndex={0}
              aria-label="Click to reveal answer"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-600">
                  {currentCard.verb.type === 'ar' ? '-AR' : currentCard.verb.type === 'er' ? '-ER' : '-IR'}
                </span>
                <span className="text-xs text-slate-400">Present tense</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                {currentCard.verb.infinitive}
              </p>
              <p className="mt-1 text-base text-slate-500">{currentCard.verb.englishMeaning}</p>
              <div className="mt-6 rounded-xl bg-brand-50 p-4">
                <p className="text-sm font-medium text-slate-600">Conjugate for</p>
                <p className="mt-0.5 text-2xl font-bold text-brand-700">
                  {PRONOUN_LABELS[currentCard.pronoun]}
                </p>
              </div>

              {/* Hint for first few cards */}
              {showHint && (
                <p className="hint-pulse mt-4 text-center text-sm font-medium text-brand-500">
                  Tap this card to reveal the answer
                </p>
              )}
              {!showHint && (
                <p className="mt-4 text-center text-xs text-slate-400">
                  Tap card or press Space to reveal
                </p>
              )}
            </div>
          )}

          {/* Flashcard — Answer side */}
          {revealed && (
            <div className="card-flip-in rounded-2xl bg-white p-6 shadow-md ring-1 ring-emerald-200 sm:p-8">
              <p className="text-sm font-medium text-slate-500">
                {currentCard.verb.infinitive} — {PRONOUN_LABELS[currentCard.pronoun]}
              </p>
              <p className="mt-2 text-4xl font-extrabold text-emerald-600 sm:text-5xl">
                {currentCard.verb.presentConjugation[currentCard.pronoun]}
              </p>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-700">
                  {currentCard.verb.sampleSentence[currentCard.pronoun].es}
                </p>
                {currentCard.verb.sampleSentence[currentCard.pronoun].en && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {currentCard.verb.sampleSentence[currentCard.pronoun].en}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Right / Wrong buttons */}
          {revealed && (
            <div className="animate-fade-up grid grid-cols-2 gap-3">
              <button
                onClick={() => markAnswer(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
              >
                <span>Correct</span>
                <kbd className="rounded bg-emerald-500/50 px-1.5 py-0.5 text-xs">R</kbd>
              </button>
              <button
                onClick={() => markAnswer(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.97]"
              >
                <span>Wrong</span>
                <kbd className="rounded bg-rose-500/50 px-1.5 py-0.5 text-xs">W</kbd>
              </button>
            </div>
          )}

          {/* Hint below buttons for first few cards */}
          {revealed && showHint && (
            <p className="hint-pulse text-center text-sm font-medium text-brand-500">
              Did you get it right? Tap Correct or Wrong above
            </p>
          )}
        </section>
      )}

      {/* ─── RESULTS SCREEN ───────────────────────────────── */}
      {stage === 'results' && (
        <section className="space-y-5">
          {/* Score summary */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Round {round} Complete!</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-2xl font-bold text-emerald-700">{stats.correctCount}</p>
                <p className="text-xs text-emerald-600">Correct</p>
              </div>
              <div className="rounded-xl bg-brand-50 p-3">
                <p className="text-2xl font-bold text-brand-700">{accuracy}%</p>
                <p className="text-xs text-brand-600">Accuracy</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold text-slate-700">{formatTime(elapsed)}</p>
                <p className="text-xs text-slate-500">Time</p>
              </div>
            </div>
          </div>

          {/* Pronoun breakdown */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              By Pronoun
            </h3>
            <div className="space-y-2">
              {filteredPronounKeys.map((key) => {
                const s = stats.pronounStats[key];
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 font-medium text-slate-700">
                      {PRONOUN_LABELS[key]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right tabular-nums text-slate-500">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus list */}
          {focusList.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Focus List (Top {Math.min(focusList.length, 10)})
              </h3>
              <ol className="list-inside list-decimal space-y-1.5 text-sm">
                {focusList.map((item) => (
                  <li key={`${item.verb}-${item.pronoun}`} className="text-slate-700">
                    <span className="font-semibold">{item.verb}</span>
                    {' — '}
                    <span className="text-brand-600">
                      {PRONOUN_LABELS[item.pronoun as PronounKey]}
                    </span>
                    <span className="ml-1 text-rose-500">(wrong {item.wrong}x)</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Shareable progress card */}
          <div
            ref={shareRef}
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-fuchsia-600 p-6 text-white shadow-lg"
          >
            <p className="text-lg font-extrabold tracking-tight">Habla Cadabra</p>
            <p className="mt-0.5 text-sm text-white/80">
              {userName} &middot; Round {round} complete
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">
                {stats.correctCount}/{cards.length}
              </span>
              <span className="text-lg font-bold text-white/80">({accuracy}%)</span>
            </div>
            <p className="mt-1 text-sm text-white/70">Time: {formatTime(elapsed)}</p>
          </div>

          <button
            onClick={downloadCard}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
          >
            Download as PNG
          </button>

          {/* Next / Restart */}
          <div className="flex gap-3">
            {round < 10 && (
              <button
                onClick={() => {
                  setRound((r) => r + 1);
                  setStage('setup');
                }}
                className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Next Round
              </button>
            )}
            <button
              onClick={() => {
                setRound(1);
                setStage('setup');
                setUserName('');
                setCards([]);
                setStats(createEmptyStats());
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Restart Session
            </button>
          </div>
        </section>
      )}

      {/* ─── CHEAT SHEET (available on all screens) ─────── */}
      <div className="mt-6">
        <button
          onClick={() => setShowCheat((s) => !s)}
          className="mx-auto flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-800"
        >
          <span>{showCheat ? 'Hide' : 'Show'} Conjugation Cheat Sheet</span>
          <svg
            className={`h-4 w-4 transition-transform ${showCheat ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showCheat && (
          <div className="mt-3">
            <CheatSheet includeVosotros={includeVosotros} />
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Cheat Sheet Component ───────────────────────────────────────────

function CheatSheet({ includeVosotros }: { includeVosotros: boolean }) {
  const rows: Array<{ key: string; label: string }> = [
    { key: 'yo', label: 'yo' },
    { key: 'tu', label: 'tú' },
    { key: 'elEllaUsted', label: 'él/ella/usted' },
    { key: 'nosotros', label: 'nosotros' },
    ...(includeVosotros ? [{ key: 'vosotros', label: 'vosotros' }] : []),
    { key: 'ustedes', label: 'ustedes' },
  ];

  const arEndings = includeVosotros
    ? ['-o', '-as', '-a', '-amos', '-áis', '-an']
    : ['-o', '-as', '-a', '-amos', '-an'];
  const erEndings = includeVosotros
    ? ['-o', '-es', '-e', '-emos', '-éis', '-en']
    : ['-o', '-es', '-e', '-emos', '-en'];
  const irEndings = includeVosotros
    ? ['-o', '-es', '-e', '-imos', '-ís', '-en']
    : ['-o', '-es', '-e', '-imos', '-en'];

  return (
    <div className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Present Tense Endings
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 text-left font-medium text-slate-500">Pronoun</th>
              <th className="pb-2 text-center font-medium text-brand-600">-AR</th>
              <th className="pb-2 text-center font-medium text-brand-600">-ER</th>
              <th className="pb-2 text-center font-medium text-brand-600">-IR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className="border-b border-slate-50">
                <td className="py-2 font-medium text-slate-700">{row.label}</td>
                <td className="py-2 text-center text-slate-600">{arEndings[i]}</td>
                <td className="py-2 text-center text-slate-600">{erEndings[i]}</td>
                <td className="py-2 text-center text-slate-600">{irEndings[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Stem &amp; Irregular Hints</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Most verbs: remove -ar/-er/-ir ending, add the corresponding ending above.</li>
          <li>Some verbs are irregular (e.g., ser &rarr; soy, eres, es&hellip;)</li>
          <li>
            Some are stem-changing in the &ldquo;boot&rdquo; pattern (yo, t&uacute;,
            &eacute;l/ella/usted, ustedes):
            <br />
            <strong>e&rarr;ie</strong> (pensar &rarr; pienso), <strong>o&rarr;ue</strong>{' '}
            (contar &rarr; cuento), <strong>e&rarr;i</strong> (pedir &rarr; pido)
          </li>
          <li>
            &ldquo;-go&rdquo; verbs have irregular yo form: tener &rarr; tengo, venir &rarr;
            vengo, poner &rarr; pongo
          </li>
          <li>
            &ldquo;-zco&rdquo; verbs: conocer &rarr; conozco, producir &rarr; produzco
          </li>
        </ul>
      </div>
    </div>
  );
}
