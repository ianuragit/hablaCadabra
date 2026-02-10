'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { VERBS } from '@/lib/verbs';
import { FlashcardItem, PronounKey, TenseKey } from '@/lib/types';
import { buildRoundCards, formatTime, pickRoundVerbs, pronounLabels, tenseDetails } from '@/lib/game';

type Stage = 'setup' | 'round' | 'results';
type TenseMode = 'mixed' | TenseKey;

interface Stat { correct: number; total: number }

export default function Home() {
  const [stage, setStage] = useState<Stage>('setup');
  const [userName, setUserName] = useState('');
  const [includeVosotros, setIncludeVosotros] = useState(true);
  const [tenseMode, setTenseMode] = useState<TenseMode>('mixed');
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [tenseStats, setTenseStats] = useState<Record<TenseKey, Stat>>({ present: { correct: 0, total: 0 }, preterite: { correct: 0, total: 0 }, imperfect: { correct: 0, total: 0 } });
  const [pronounStats, setPronounStats] = useState<Record<PronounKey, Stat>>({ yo: { correct: 0, total: 0 }, tu: { correct: 0, total: 0 }, el: { correct: 0, total: 0 }, ella: { correct: 0, total: 0 }, usted: { correct: 0, total: 0 }, nosotros: { correct: 0, total: 0 }, vosotros: { correct: 0, total: 0 }, ustedes: { correct: 0, total: 0 } });
  const [tripletStats, setTripletStats] = useState<Record<string, { wrong: number; seen: number }>>({});
  const [showCheat, setShowCheat] = useState(false);
  const [cheatTense, setCheatTense] = useState<TenseKey>('present');
  const shareRef = useRef<HTMLDivElement>(null);

  const currentCard = cards[cardIndex];

  useEffect(() => {
    if (stage !== 'round') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [stage, startedAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage !== 'round') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      }
      if (revealed && e.key.toLowerCase() === 'r') markAnswer(true);
      if (revealed && e.key.toLowerCase() === 'w') markAnswer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const startRound = () => {
    const roundVerbs = pickRoundVerbs(VERBS, round, 50);
    setCards(buildRoundCards(roundVerbs, includeVosotros, tenseMode));
    setCardIndex(0);
    setRevealed(false);
    setStartedAt(Date.now());
    setElapsed(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTripletStats({});
    setTenseStats({ present: { correct: 0, total: 0 }, preterite: { correct: 0, total: 0 }, imperfect: { correct: 0, total: 0 } });
    setPronounStats({ yo: { correct: 0, total: 0 }, tu: { correct: 0, total: 0 }, el: { correct: 0, total: 0 }, ella: { correct: 0, total: 0 }, usted: { correct: 0, total: 0 }, nosotros: { correct: 0, total: 0 }, vosotros: { correct: 0, total: 0 }, ustedes: { correct: 0, total: 0 } });
    setStage('round');
  };

  const markAnswer = (isCorrect: boolean) => {
    if (!currentCard) return;
    setTenseStats((prev) => ({ ...prev, [currentCard.tense]: { total: prev[currentCard.tense].total + 1, correct: prev[currentCard.tense].correct + (isCorrect ? 1 : 0) } }));
    setPronounStats((prev) => ({ ...prev, [currentCard.pronoun]: { total: prev[currentCard.pronoun].total + 1, correct: prev[currentCard.pronoun].correct + (isCorrect ? 1 : 0) } }));
    const key = `${currentCard.verb.infinitive}|${currentCard.pronoun}|${currentCard.tense}`;
    setTripletStats((prev) => ({ ...prev, [key]: { seen: (prev[key]?.seen ?? 0) + 1, wrong: (prev[key]?.wrong ?? 0) + (isCorrect ? 0 : 1) } }));
    if (isCorrect) setCorrectCount((c) => c + 1); else setWrongCount((c) => c + 1);

    if (cardIndex >= cards.length - 1) {
      setStage('results');
      return;
    }
    setCardIndex((i) => i + 1);
    setRevealed(false);
  };

  const focusList = useMemo(() => Object.entries(tripletStats)
    .sort((a, b) => b[1].wrong - a[1].wrong || b[1].seen - a[1].seen)
    .slice(0, 10), [tripletStats]);

  const accuracy = cards.length ? Math.round((correctCount / cards.length) * 100) : 0;

  const downloadCard = async () => {
    if (!shareRef.current) return;
    const dataUrl = await toPng(shareRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `habla-cadabra-round-${round}.png`;
    link.href = dataUrl;
    link.click();
  };

  const pronounOrder = (includeVosotros ? ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'vosotros', 'ustedes'] : ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'ustedes']) as PronounKey[];

  return <main className="mx-auto min-h-screen max-w-4xl p-4 sm:p-8">
    <header className="mb-6 text-center">
      <h1 className="text-4xl font-extrabold text-indigo-700">Habla Cadabra</h1>
      <p className="text-slate-600">Spanish Verb Conjugation Trainer</p>
    </header>

    {stage === 'setup' && <section className="space-y-4 rounded-2xl bg-white p-6 shadow">
      <label className="block text-sm font-medium">Your name
        <input value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1 w-full rounded-lg border p-3" required />
      </label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={includeVosotros} onChange={(e) => setIncludeVosotros(e.target.checked)} /> Include vosotros (Spain)</label>
      <fieldset className="space-y-2">
        <legend className="font-medium">Tense selection</legend>
        {[
          ['mixed', 'Mixed (Present + Preterite + Imperfect)'],
          ['present', 'Present only'],
          ['preterite', 'Preterite only'],
          ['imperfect', 'Imperfect only'],
        ].map(([value, label]) => (
          <label key={value} className="flex items-center gap-2"><input type="radio" checked={tenseMode === value} onChange={() => setTenseMode(value as TenseMode)} /> {label}</label>
        ))}
      </fieldset>
      <button onClick={startRound} disabled={!userName.trim()} className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">Start Round {round}</button>
      <button onClick={() => setShowCheat((s) => !s)} className="text-indigo-700 underline">{showCheat ? 'Hide' : 'Show'} Conjugation Cheat Sheet</button>
      {showCheat && <CheatSheet includeVosotros={includeVosotros} tense={cheatTense} onChangeTense={setCheatTense} />}
    </section>}

    {stage === 'round' && currentCard && <section className="space-y-4">
      <div className="flex justify-between text-sm text-slate-600"><span>Card {cardIndex + 1} / {cards.length}</span><span>{formatTime(elapsed)}</span></div>
      <button aria-label="flashcard" onClick={() => !revealed && setRevealed(true)} className={`w-full rounded-2xl border-2 bg-white p-8 text-left shadow transition ${revealed ? 'border-emerald-500' : 'border-indigo-200 hover:border-indigo-400'}`}>
        <p className="text-sm uppercase text-slate-500">Infinitive</p>
        <p className="text-3xl font-bold">{currentCard.verb.infinitive}</p>
        <p className="mb-4 text-slate-600">{currentCard.verb.englishMeaning}</p>
        <p className="font-semibold">Conjugate for <span className="text-indigo-700">{pronounLabels[currentCard.pronoun]}</span></p>
        {!revealed && tenseMode === 'mixed' && <p className="mt-2 text-xs text-slate-400">Tense hidden in mixed mode</p>}
        {revealed && <div className="mt-6 space-y-2 border-t pt-4">
          <p className="text-sm text-slate-500">Correct form</p>
          <p className="text-4xl font-extrabold text-emerald-700">{currentCard.verb.conjugations[currentCard.tense][currentCard.pronoun]}</p>
          <p className="text-sm text-slate-700">{tenseDetails[currentCard.tense].name}: {tenseDetails[currentCard.tense].meaning}</p>
          <p className="text-sm">{currentCard.verb.sampleSentences[currentCard.tense][currentCard.pronoun].es}</p>
          <p className="text-sm text-slate-600">{currentCard.verb.sampleSentences[currentCard.tense][currentCard.pronoun].en}</p>
        </div>}
      </button>
      {revealed && <div className="grid grid-cols-2 gap-3">
        <button onClick={() => markAnswer(true)} className="rounded-xl bg-emerald-600 py-3 font-bold text-white">✅ Right (R)</button>
        <button onClick={() => markAnswer(false)} className="rounded-xl bg-rose-600 py-3 font-bold text-white">❌ Wrong (W)</button>
      </div>}
    </section>}

    {stage === 'results' && <section className="space-y-5">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">Round {round} complete</h2>
        <p className="text-slate-700">{correctCount} / {cards.length} correct ({accuracy}%) in {formatTime(elapsed)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsBlock title="By tense" items={(Object.keys(tenseStats) as TenseKey[]).map((k) => ({ label: tenseDetails[k].name, ...tenseStats[k] }))} />
        <StatsBlock title="By pronoun" items={pronounOrder.map((k) => ({ label: pronounLabels[k], ...pronounStats[k] }))} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-2 font-bold">Focus list (top 10)</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {focusList.map(([key, value]) => {
            const [verb, pronoun, tense] = key.split('|');
            return <li key={key}>{verb} • {pronounLabels[pronoun as PronounKey]} • {tenseDetails[tense as TenseKey].name} — wrong {value.wrong}x</li>;
          })}
        </ol>
      </div>

      <div ref={shareRef} className="rounded-2xl bg-gradient-to-br from-indigo-700 to-fuchsia-600 p-6 text-white shadow-lg">
        <p className="text-xl font-bold">Habla Cadabra</p>
        <p>{userName} • Round {round} complete</p>
        <p className="mt-2 text-3xl font-extrabold">{correctCount}/{cards.length} ({accuracy}%)</p>
        <p>Time: {formatTime(elapsed)}</p>
        <p className="mt-2 text-sm">Present {pct(tenseStats.present)}% • Preterite {pct(tenseStats.preterite)}% • Imperfect {pct(tenseStats.imperfect)}%</p>
      </div>
      <button onClick={downloadCard} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white">Download as PNG</button>

      <div className="flex gap-3">
        <button disabled={round >= 10} onClick={() => { setRound((r) => r + 1); setStage('setup'); }} className="rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">Next Round</button>
        <button onClick={() => { setRound(1); setStage('setup'); setUserName(''); }} className="rounded-xl border px-4 py-2">Restart session</button>
      </div>
    </section>}
  </main>;
}

function pct(stat: Stat): number { return stat.total ? Math.round((stat.correct / stat.total) * 100) : 0; }

function StatsBlock({ title, items }: { title: string; items: Array<{ label: string; correct: number; total: number }> }) {
  return <div className="rounded-2xl bg-white p-5 shadow">
    <h3 className="mb-2 font-bold">{title}</h3>
    <ul className="space-y-1 text-sm">{items.map((item) => <li key={item.label} className="flex justify-between"><span>{item.label}</span><span>{item.correct}/{item.total} ({pct(item)}%)</span></li>)}</ul>
  </div>;
}

function CheatSheet({ includeVosotros, tense, onChangeTense }: { includeVosotros: boolean; tense: TenseKey; onChangeTense: (t: TenseKey) => void }) {
  const rows = [
    { key: 'yo', label: 'yo' },
    { key: 'tu', label: 'tú' },
    { key: 'el', label: 'él' },
    { key: 'ella', label: 'ella' },
    { key: 'usted', label: 'usted' },
    { key: 'nosotros', label: 'nosotros' },
    ...(includeVosotros ? [{ key: 'vosotros', label: 'vosotros' }] : []),
    { key: 'ustedes', label: 'ustedes' },
  ];

  const endings = {
    present: { ar: ['o', 'as', 'a', 'a', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'e', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'e', 'e', 'imos', 'ís', 'en'] },
    preterite: { ar: ['é', 'aste', 'ó', 'ó', 'ó', 'amos', 'asteis', 'aron'], er: ['í', 'iste', 'ió', 'ió', 'ió', 'imos', 'isteis', 'ieron'], ir: ['í', 'iste', 'ió', 'ió', 'ió', 'imos', 'isteis', 'ieron'] },
    imperfect: { ar: ['aba', 'abas', 'aba', 'aba', 'aba', 'ábamos', 'abais', 'aban'], er: ['ía', 'ías', 'ía', 'ía', 'ía', 'íamos', 'íais', 'ían'], ir: ['ía', 'ías', 'ía', 'ía', 'ía', 'íamos', 'íais', 'ían'] },
  } as const;

  return <div className="rounded-xl border bg-slate-50 p-4">
    <div className="mb-3 flex gap-2">{(['present', 'preterite', 'imperfect'] as TenseKey[]).map((t) => <button key={t} onClick={() => onChangeTense(t)} className={`rounded px-3 py-1 text-sm ${tense === t ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{tenseDetails[t].name}</button>)}</div>
    <table className="w-full text-sm">
      <thead><tr><th className="text-left">Pronoun</th><th>-AR</th><th>-ER</th><th>-IR</th></tr></thead>
      <tbody>{rows.map((r) => { const idx = ['yo','tu','el','ella','usted','nosotros','vosotros','ustedes'].indexOf(r.key); return <tr key={r.key}><td className="py-1">{r.label}</td><td>{endings[tense].ar[idx]}</td><td>{endings[tense].er[idx]}</td><td>{endings[tense].ir[idx]}</td></tr>; })}</tbody>
    </table>
    <div className="mt-3 rounded bg-white p-3 text-sm">
      <p className="font-semibold">Stem & irregular hints</p>
      <ul className="list-disc pl-5 text-slate-600">
        <li>Watch for e→ie and o→ue stem changes in present tense.</li>
        <li>Many preterite irregulars change stem entirely (tener→tuv-, decir→dij-).</li>
        <li>Imperfect is mostly regular except ser, ir, ver.</li>
      </ul>
    </div>
  </div>;
}
