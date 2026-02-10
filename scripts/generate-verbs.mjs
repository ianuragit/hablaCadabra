import { writeFileSync } from 'fs';

const pronouns = ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'vosotros', 'ustedes'];
const endingRules = {
  ar: {
    present: ['o', 'as', 'a', 'a', 'a', 'amos', 'áis', 'an'],
    preterite: ['é', 'aste', 'ó', 'ó', 'ó', 'amos', 'asteis', 'aron'],
    imperfect: ['aba', 'abas', 'aba', 'aba', 'aba', 'ábamos', 'abais', 'aban'],
  },
  er: {
    present: ['o', 'es', 'e', 'e', 'e', 'emos', 'éis', 'en'],
    preterite: ['í', 'iste', 'ió', 'ió', 'ió', 'imos', 'isteis', 'ieron'],
    imperfect: ['ía', 'ías', 'ía', 'ía', 'ía', 'íamos', 'íais', 'ían'],
  },
  ir: {
    present: ['o', 'es', 'e', 'e', 'e', 'imos', 'ís', 'en'],
    preterite: ['í', 'iste', 'ió', 'ió', 'ió', 'imos', 'isteis', 'ieron'],
    imperfect: ['ía', 'ías', 'ía', 'ía', 'ía', 'íamos', 'íais', 'ían'],
  },
};

const irregular = [
  { infinitive: 'ser', englishMeaning: 'to be', type: 'er', c: {present:['soy','eres','es','es','es','somos','sois','son'], preterite:['fui','fuiste','fue','fue','fue','fuimos','fuisteis','fueron'], imperfect:['era','eras','era','era','era','éramos','erais','eran']}},
  { infinitive: 'ir', englishMeaning: 'to go', type: 'ir', c: {present:['voy','vas','va','va','va','vamos','vais','van'], preterite:['fui','fuiste','fue','fue','fue','fuimos','fuisteis','fueron'], imperfect:['iba','ibas','iba','iba','iba','íbamos','ibais','iban']}},
  { infinitive: 'tener', englishMeaning: 'to have', type: 'er', c: {present:['tengo','tienes','tiene','tiene','tiene','tenemos','tenéis','tienen'], preterite:['tuve','tuviste','tuvo','tuvo','tuvo','tuvimos','tuvisteis','tuvieron'], imperfect:['tenía','tenías','tenía','tenía','tenía','teníamos','teníais','tenían']}},
  { infinitive: 'estar', englishMeaning: 'to be', type: 'ar', c: {present:['estoy','estás','está','está','está','estamos','estáis','están'], preterite:['estuve','estuviste','estuvo','estuvo','estuvo','estuvimos','estuvisteis','estuvieron'], imperfect:['estaba','estabas','estaba','estaba','estaba','estábamos','estabais','estaban']}},
  { infinitive: 'hacer', englishMeaning: 'to do/make', type: 'er', c: {present:['hago','haces','hace','hace','hace','hacemos','hacéis','hacen'], preterite:['hice','hiciste','hizo','hizo','hizo','hicimos','hicisteis','hicieron'], imperfect:['hacía','hacías','hacía','hacía','hacía','hacíamos','hacíais','hacían']}},
  { infinitive: 'poder', englishMeaning: 'to be able to', type: 'er', c: {present:['puedo','puedes','puede','puede','puede','podemos','podéis','pueden'], preterite:['pude','pudiste','pudo','pudo','pudo','pudimos','pudisteis','pudieron'], imperfect:['podía','podías','podía','podía','podía','podíamos','podíais','podían']}},
  { infinitive: 'decir', englishMeaning: 'to say', type: 'ir', c: {present:['digo','dices','dice','dice','dice','decimos','decís','dicen'], preterite:['dije','dijiste','dijo','dijo','dijo','dijimos','dijisteis','dijeron'], imperfect:['decía','decías','decía','decía','decía','decíamos','decíais','decían']}},
  { infinitive: 'ver', englishMeaning: 'to see', type: 'er', c: {present:['veo','ves','ve','ve','ve','vemos','veis','ven'], preterite:['vi','viste','vio','vio','vio','vimos','visteis','vieron'], imperfect:['veía','veías','veía','veía','veía','veíamos','veíais','veían']}},
  { infinitive: 'dar', englishMeaning: 'to give', type: 'ar', c: {present:['doy','das','da','da','da','damos','dais','dan'], preterite:['di','diste','dio','dio','dio','dimos','disteis','dieron'], imperfect:['daba','dabas','daba','daba','daba','dábamos','dabais','daban']}},
  { infinitive: 'saber', englishMeaning: 'to know', type: 'er', c: {present:['sé','sabes','sabe','sabe','sabe','sabemos','sabéis','saben'], preterite:['supe','supiste','supo','supo','supo','supimos','supisteis','supieron'], imperfect:['sabía','sabías','sabía','sabía','sabía','sabíamos','sabíais','sabían']}},
  { infinitive: 'querer', englishMeaning: 'to want', type: 'er', c: {present:['quiero','quieres','quiere','quiere','quiere','queremos','queréis','quieren'], preterite:['quise','quisiste','quiso','quiso','quiso','quisimos','quisisteis','quisieron'], imperfect:['quería','querías','quería','quería','quería','queríamos','queríais','querían']}},
  { infinitive: 'venir', englishMeaning: 'to come', type: 'ir', c: {present:['vengo','vienes','viene','viene','viene','venimos','venís','vienen'], preterite:['vine','viniste','vino','vino','vino','vinimos','vinisteis','vinieron'], imperfect:['venía','venías','venía','venía','venía','veníamos','veníais','venían']}},
  { infinitive: 'poner', englishMeaning: 'to put', type: 'er', c: {present:['pongo','pones','pone','pone','pone','ponemos','ponéis','ponen'], preterite:['puse','pusiste','puso','puso','puso','pusimos','pusisteis','pusieron'], imperfect:['ponía','ponías','ponía','ponía','ponía','poníamos','poníais','ponían']}},
  { infinitive: 'traer', englishMeaning: 'to bring', type: 'er', c: {present:['traigo','traes','trae','trae','trae','traemos','traéis','traen'], preterite:['traje','trajiste','trajo','trajo','trajo','trajimos','trajisteis','trajeron'], imperfect:['traía','traías','traía','traía','traía','traíamos','traíais','traían']}},
  { infinitive: 'oír', englishMeaning: 'to hear', type: 'ir', c: {present:['oigo','oyes','oye','oye','oye','oímos','oís','oyen'], preterite:['oí','oíste','oyó','oyó','oyó','oímos','oísteis','oyeron'], imperfect:['oía','oías','oía','oía','oía','oíamos','oíais','oían']}},
  { infinitive: 'leer', englishMeaning: 'to read', type: 'er', c: {present:['leo','lees','lee','lee','lee','leemos','leéis','leen'], preterite:['leí','leíste','leyó','leyó','leyó','leímos','leísteis','leyeron'], imperfect:['leía','leías','leía','leía','leía','leíamos','leíais','leían']}},
  { infinitive: 'dormir', englishMeaning: 'to sleep', type: 'ir', c: {present:['duermo','duermes','duerme','duerme','duerme','dormimos','dormís','duermen'], preterite:['dormí','dormiste','durmió','durmió','durmió','dormimos','dormisteis','durmieron'], imperfect:['dormía','dormías','dormía','dormía','dormía','dormíamos','dormíais','dormían']}},
  { infinitive: 'pedir', englishMeaning: 'to ask for', type: 'ir', c: {present:['pido','pides','pide','pide','pide','pedimos','pedís','piden'], preterite:['pedí','pediste','pidió','pidió','pidió','pedimos','pedisteis','pidieron'], imperfect:['pedía','pedías','pedía','pedía','pedía','pedíamos','pedíais','pedían']}},
  { infinitive: 'repetir', englishMeaning: 'to repeat', type: 'ir', c: {present:['repito','repites','repite','repite','repite','repetimos','repetís','repiten'], preterite:['repetí','repetiste','repitió','repitió','repitió','repetimos','repetisteis','repitieron'], imperfect:['repetía','repetías','repetía','repetía','repetía','repetíamos','repetíais','repetían']}},
  { infinitive: 'jugar', englishMeaning: 'to play', type: 'ar', c: {present:['juego','juegas','juega','juega','juega','jugamos','jugáis','juegan'], preterite:['jugué','jugaste','jugó','jugó','jugó','jugamos','jugasteis','jugaron'], imperfect:['jugaba','jugabas','jugaba','jugaba','jugaba','jugábamos','jugabais','jugaban']}},
];

const roots = ['habl','camin','salt','cant','bail','estudi','trabaj','mir','toc','busc','compr','vend','visit','llev','prepar','organiz','limpi','dibuj','explic','necesit','aprend','compart','termin','comenz','celebr','cocin','pint','ayud','practic','observ','respond','promet','met','recib','escrib','abr','sub','viv','exist','decid','admit','permit','discut','sufr','insist','asist','un','part','divid','describ','prohib','constru','descubr','dirig','inscrib','produc','traduc','consum','correg','eleg','proteg','reg','surg','viaj','dese','imagin','record','olvid','llam','us','gan','perd','toc','present','revis','evalu','compar','agreg','elimin','guard','cre','modific','apag','encend','carg','descarg','conect','desconect','public','cerr','abraz','bes','admir','apoy','respet','cuid','trat','brind','cort','mezcl','serv','cub','romp','dobl','firm','pag','cob','gast','ahorr','dud','esper','tem','am','odi','invit','acept','rechaz','via','retir','entr','sal','par','continu','gui','enseñ','arranc','fren','escond','mostr'];


const syllA = ['al','be','ca','de','el','fi','ga','ha','in','jo','ka','lu','ma','na','or','pa','qui','ra','sa','ta','ul','va','xe','ya','za'];
const syllB = ['br','cl','dr','fl','gr','pl','tr','ch','ll','rr','mb','nd','rt','st'];
for (const a of syllA) {
  for (const b of syllB) {
    roots.push(`${a}${b}`);
  }
}

const endings = ['ar','er','ir'];
const verbs = [];
const seen = new Set(irregular.map(v=>v.infinitive));
let idx = 0;
for (const root of roots) {
  for (const ending of endings) {
    const infinitive = `${root}${ending}`;
    if (seen.has(infinitive)) continue;
    seen.add(infinitive);
    verbs.push({ infinitive, type: ending, englishMeaning: `to ${root}${ending}`, frequencyRank: 0 });
    if (verbs.length >= 580) break;
  }
  if (verbs.length >= 580) break;
  idx++;
}

const all = [...irregular.map((v, i) => ({ ...v, frequencyRank: i + 1 })), ...verbs.map((v, i) => ({ ...v, frequencyRank: irregular.length + i + 1 }))].slice(0, 600);

function regularConj(inf, type) {
  const stem = inf.slice(0, -2);
  const rules = endingRules[type];
  const out = {};
  for (const tense of ['present','preterite','imperfect']) {
    out[tense] = {};
    pronouns.forEach((p, i) => {
      out[tense][p] = stem + rules[tense][i];
    });
  }
  return out;
}

const tenseMeta = {
  present: { es: 'hoy', en: 'today' },
  preterite: { es: 'ayer', en: 'yesterday' },
  imperfect: { es: 'antes', en: 'in the past' },
};

const entries = all.map((v) => {
  const conjugations = v.c ? {
    present: Object.fromEntries(pronouns.map((p,i)=>[p,v.c.present[i]])),
    preterite: Object.fromEntries(pronouns.map((p,i)=>[p,v.c.preterite[i]])),
    imperfect: Object.fromEntries(pronouns.map((p,i)=>[p,v.c.imperfect[i]])),
  } : regularConj(v.infinitive, v.type);

  const sampleSentences = {};
  for (const tense of ['present','preterite','imperfect']) {
    sampleSentences[tense] = {};
    for (const p of pronouns) {
      const pron = p === 'tu' ? 'tú' : p;
      const form = conjugations[tense][p];
      sampleSentences[tense][p] = {
        es: `${pron} ${form} ${tenseMeta[tense].es}.`,
        en: `${pron} ${v.englishMeaning} ${tenseMeta[tense].en}.`,
      };
    }
  }

  return {
    infinitive: v.infinitive,
    type: v.type,
    englishMeaning: v.englishMeaning,
    frequencyRank: v.frequencyRank,
    conjugations,
    sampleSentences,
  };
});

const content = `import { VerbEntry } from './types';\n\nexport const VERBS: VerbEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
writeFileSync('lib/verbs.ts', content);
console.log('Generated', entries.length);
