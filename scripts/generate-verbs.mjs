import { writeFileSync } from 'fs';

// Pronoun keys matching the app's type system
const pronounKeys = ['yo', 'tu', 'elEllaUsted', 'nosotros', 'vosotros', 'ustedes'];

// Standard present tense endings
const endings = {
  ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
  er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
  ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
};

// ─── Conjugation Helpers ─────────────────────────────────────────────

function conjugateRegular(infinitive, type) {
  const stem = infinitive.slice(0, -2);
  const ends = endings[type];
  const result = {};
  pronounKeys.forEach((key, i) => { result[key] = stem + ends[i]; });
  return result;
}

function applyStemChange(stem, from, to) {
  const idx = stem.lastIndexOf(from);
  if (idx === -1) return stem;
  return stem.slice(0, idx) + to + stem.slice(idx + from.length);
}

function conjugateStemChange(infinitive, type, from, to) {
  const stem = infinitive.slice(0, -2);
  const changedStem = applyStemChange(stem, from, to);
  const ends = endings[type];
  const result = {};
  pronounKeys.forEach((key, i) => {
    // Boot pattern: nosotros/vosotros keep original stem
    const s = (key === 'nosotros' || key === 'vosotros') ? stem : changedStem;
    result[key] = s + ends[i];
  });
  return result;
}

function conjugateZco(infinitive, type) {
  const base = conjugateRegular(infinitive, type);
  const stem = infinitive.slice(0, -2);
  // Replace -c with -zc for yo form (-cer → -zco, -cir → -zco)
  base.yo = stem.slice(0, -1) + 'zc' + 'o';
  return base;
}

// ─── Verb Definitions ────────────────────────────────────────────────
// Format for irregular: { inf, type, en, conj: [yo,tu,el,nos,vos,uds] }
// Format for stem-changing: { inf, type, en, sc: 'from>to' }
// Format for -zco: { inf, type, en, zco: true }
// Format for -go: { inf, type, en, conj: [...] } (provide explicit)
// Format for regular: { inf, type, en }

const verbDefs = [
  // ── Tier 1: Most common (rank 1-50) ───────────────────────
  // Fully irregular
  { inf: 'ser', type: 'er', en: 'to be (permanent)', conj: ['soy','eres','es','somos','sois','son'] },
  { inf: 'estar', type: 'ar', en: 'to be (temporary)', conj: ['estoy','estás','está','estamos','estáis','están'] },
  { inf: 'tener', type: 'er', en: 'to have', conj: ['tengo','tienes','tiene','tenemos','tenéis','tienen'] },
  { inf: 'hacer', type: 'er', en: 'to do / to make', conj: ['hago','haces','hace','hacemos','hacéis','hacen'] },
  { inf: 'poder', type: 'er', en: 'to be able to', conj: ['puedo','puedes','puede','podemos','podéis','pueden'] },
  { inf: 'ir', type: 'ir', en: 'to go', conj: ['voy','vas','va','vamos','vais','van'] },
  { inf: 'decir', type: 'ir', en: 'to say / to tell', conj: ['digo','dices','dice','decimos','decís','dicen'] },
  { inf: 'dar', type: 'ar', en: 'to give', conj: ['doy','das','da','damos','dais','dan'] },
  { inf: 'saber', type: 'er', en: 'to know (facts)', conj: ['sé','sabes','sabe','sabemos','sabéis','saben'] },
  { inf: 'querer', type: 'er', en: 'to want / to love', conj: ['quiero','quieres','quiere','queremos','queréis','quieren'] },
  { inf: 'haber', type: 'er', en: 'to have (auxiliary)', conj: ['he','has','ha','hemos','habéis','han'] },
  { inf: 'venir', type: 'ir', en: 'to come', conj: ['vengo','vienes','viene','venimos','venís','vienen'] },
  { inf: 'poner', type: 'er', en: 'to put / to place', conj: ['pongo','pones','pone','ponemos','ponéis','ponen'] },
  { inf: 'salir', type: 'ir', en: 'to leave / to go out', conj: ['salgo','sales','sale','salimos','salís','salen'] },
  { inf: 'ver', type: 'er', en: 'to see', conj: ['veo','ves','ve','vemos','veis','ven'] },
  { inf: 'traer', type: 'er', en: 'to bring', conj: ['traigo','traes','trae','traemos','traéis','traen'] },
  { inf: 'oír', type: 'ir', en: 'to hear', conj: ['oigo','oyes','oye','oímos','oís','oyen'] },
  { inf: 'caer', type: 'er', en: 'to fall', conj: ['caigo','caes','cae','caemos','caéis','caen'] },
  { inf: 'valer', type: 'er', en: 'to be worth', conj: ['valgo','vales','vale','valemos','valéis','valen'] },
  { inf: 'caber', type: 'er', en: 'to fit', conj: ['quepo','cabes','cabe','cabemos','cabéis','caben'] },

  // Common regular -ar
  { inf: 'hablar', type: 'ar', en: 'to speak' },
  { inf: 'llegar', type: 'ar', en: 'to arrive' },
  { inf: 'pasar', type: 'ar', en: 'to pass / to happen' },
  { inf: 'llamar', type: 'ar', en: 'to call' },
  { inf: 'tomar', type: 'ar', en: 'to take / to drink' },
  { inf: 'dejar', type: 'ar', en: 'to leave / to let' },
  { inf: 'llevar', type: 'ar', en: 'to carry / to wear' },
  { inf: 'esperar', type: 'ar', en: 'to wait / to hope' },
  { inf: 'buscar', type: 'ar', en: 'to search / to look for' },
  { inf: 'entrar', type: 'ar', en: 'to enter' },
  { inf: 'trabajar', type: 'ar', en: 'to work' },
  { inf: 'mirar', type: 'ar', en: 'to look at / to watch' },
  { inf: 'necesitar', type: 'ar', en: 'to need' },
  { inf: 'quedar', type: 'ar', en: 'to stay / to remain' },
  { inf: 'tratar', type: 'ar', en: 'to try / to treat' },

  // Stem-changing
  { inf: 'pensar', type: 'ar', en: 'to think', sc: 'e>ie' },
  { inf: 'encontrar', type: 'ar', en: 'to find', sc: 'o>ue' },
  { inf: 'volver', type: 'er', en: 'to return', sc: 'o>ue' },
  { inf: 'sentir', type: 'ir', en: 'to feel', sc: 'e>ie' },
  { inf: 'contar', type: 'ar', en: 'to count / to tell', sc: 'o>ue' },
  { inf: 'empezar', type: 'ar', en: 'to begin', sc: 'e>ie' },
  { inf: 'perder', type: 'er', en: 'to lose', sc: 'e>ie' },
  { inf: 'entender', type: 'er', en: 'to understand', sc: 'e>ie' },
  { inf: 'dormir', type: 'ir', en: 'to sleep', sc: 'o>ue' },
  { inf: 'pedir', type: 'ir', en: 'to ask for / to order', sc: 'e>i' },

  // -zco verbs
  { inf: 'conocer', type: 'er', en: 'to know (people/places)', zco: true },
  { inf: 'parecer', type: 'er', en: 'to seem', zco: true },
  { inf: 'producir', type: 'ir', en: 'to produce', zco: true },

  // Common regular -er/-ir
  { inf: 'deber', type: 'er', en: 'to owe / must' },
  { inf: 'creer', type: 'er', en: 'to believe' },
  { inf: 'vivir', type: 'ir', en: 'to live' },
  { inf: 'escribir', type: 'ir', en: 'to write' },

  // ── Tier 2 (rank 51-100) ──────────────────────────────────
  { inf: 'resultar', type: 'ar', en: 'to result / to turn out' },
  { inf: 'acabar', type: 'ar', en: 'to finish / to end' },
  { inf: 'ganar', type: 'ar', en: 'to win / to earn' },
  { inf: 'formar', type: 'ar', en: 'to form' },
  { inf: 'aceptar', type: 'ar', en: 'to accept' },
  { inf: 'realizar', type: 'ar', en: 'to carry out / to achieve' },
  { inf: 'explicar', type: 'ar', en: 'to explain' },
  { inf: 'preguntar', type: 'ar', en: 'to ask (a question)' },
  { inf: 'cambiar', type: 'ar', en: 'to change' },
  { inf: 'crear', type: 'ar', en: 'to create' },
  { inf: 'presentar', type: 'ar', en: 'to present / to introduce' },
  { inf: 'leer', type: 'er', en: 'to read' },
  { inf: 'comprender', type: 'er', en: 'to understand' },
  { inf: 'recibir', type: 'ir', en: 'to receive' },
  { inf: 'existir', type: 'ir', en: 'to exist' },
  { inf: 'terminar', type: 'ar', en: 'to finish / to end' },
  { inf: 'permitir', type: 'ir', en: 'to permit / to allow' },
  { inf: 'abrir', type: 'ir', en: 'to open' },
  { inf: 'considerar', type: 'ar', en: 'to consider' },
  { inf: 'partir', type: 'ir', en: 'to depart / to divide' },
  { inf: 'lograr', type: 'ar', en: 'to achieve' },
  { inf: 'tocar', type: 'ar', en: 'to touch / to play (instrument)' },
  { inf: 'estudiar', type: 'ar', en: 'to study' },
  { inf: 'correr', type: 'er', en: 'to run' },
  { inf: 'utilizar', type: 'ar', en: 'to use / to utilize' },
  { inf: 'pagar', type: 'ar', en: 'to pay' },
  { inf: 'comprar', type: 'ar', en: 'to buy' },
  { inf: 'intentar', type: 'ar', en: 'to try / to attempt' },
  { inf: 'usar', type: 'ar', en: 'to use' },
  { inf: 'olvidar', type: 'ar', en: 'to forget' },
  { inf: 'sacar', type: 'ar', en: 'to take out / to remove' },

  // More stem-changing
  { inf: 'comenzar', type: 'ar', en: 'to begin / to start', sc: 'e>ie' },
  { inf: 'servir', type: 'ir', en: 'to serve', sc: 'e>i' },
  { inf: 'recordar', type: 'ar', en: 'to remember', sc: 'o>ue' },
  { inf: 'convertir', type: 'ir', en: 'to convert / to become', sc: 'e>ie' },
  { inf: 'morir', type: 'ir', en: 'to die', sc: 'o>ue' },
  { inf: 'repetir', type: 'ir', en: 'to repeat', sc: 'e>i' },
  { inf: 'jugar', type: 'ar', en: 'to play (a game)', sc: 'u>ue' },
  { inf: 'cerrar', type: 'ar', en: 'to close', sc: 'e>ie' },
  { inf: 'mostrar', type: 'ar', en: 'to show', sc: 'o>ue' },
  { inf: 'preferir', type: 'ir', en: 'to prefer', sc: 'e>ie' },

  // More -zco
  { inf: 'ofrecer', type: 'er', en: 'to offer', zco: true },
  { inf: 'aparecer', type: 'er', en: 'to appear', zco: true },
  { inf: 'reconocer', type: 'er', en: 'to recognize', zco: true },
  { inf: 'nacer', type: 'er', en: 'to be born', zco: true },
  { inf: 'establecer', type: 'er', en: 'to establish', zco: true },
  { inf: 'conducir', type: 'ir', en: 'to drive / to lead', zco: true },
  { inf: 'traducir', type: 'ir', en: 'to translate', zco: true },

  // -go compound verbs
  { inf: 'mantener', type: 'er', en: 'to maintain / to keep', conj: ['mantengo','mantienes','mantiene','mantenemos','mantenéis','mantienen'] },
  { inf: 'obtener', type: 'er', en: 'to obtain / to get', conj: ['obtengo','obtienes','obtiene','obtenemos','obtenéis','obtienen'] },
  { inf: 'suponer', type: 'er', en: 'to suppose', conj: ['supongo','supones','supone','suponemos','suponéis','suponen'] },
  { inf: 'componer', type: 'er', en: 'to compose', conj: ['compongo','compones','compone','componemos','componéis','componen'] },
  { inf: 'proponer', type: 'er', en: 'to propose', conj: ['propongo','propones','propone','proponemos','proponéis','proponen'] },

  // -guir verbs (drop u in yo form)
  { inf: 'seguir', type: 'ir', en: 'to follow / to continue', conj: ['sigo','sigues','sigue','seguimos','seguís','siguen'] },
  { inf: 'conseguir', type: 'ir', en: 'to get / to achieve', conj: ['consigo','consigues','consigue','conseguimos','conseguís','consiguen'] },
  { inf: 'distinguir', type: 'ir', en: 'to distinguish', conj: ['distingo','distingues','distingue','distinguimos','distinguís','distinguen'] },

  // -ger/-gir verbs (g→j in yo form)
  { inf: 'proteger', type: 'er', en: 'to protect', conj: ['protejo','proteges','protege','protegemos','protegéis','protegen'] },
  { inf: 'recoger', type: 'er', en: 'to pick up / to collect', conj: ['recojo','recoges','recoge','recogemos','recogéis','recogen'] },
  { inf: 'escoger', type: 'er', en: 'to choose', conj: ['escojo','escoges','escoge','escogemos','escogéis','escogen'] },
  { inf: 'dirigir', type: 'ir', en: 'to direct / to lead', conj: ['dirijo','diriges','dirige','dirigimos','dirigís','dirigen'] },
  { inf: 'elegir', type: 'ir', en: 'to choose / to elect', conj: ['elijo','eliges','elige','elegimos','elegís','eligen'] },
  { inf: 'exigir', type: 'ir', en: 'to demand', conj: ['exijo','exiges','exige','exigimos','exigís','exigen'] },
  { inf: 'corregir', type: 'ir', en: 'to correct', conj: ['corrijo','corriges','corrige','corregimos','corregís','corrigen'] },

  // ── Tier 3 (rank 101-200) ─────────────────────────────────
  { inf: 'caminar', type: 'ar', en: 'to walk' },
  { inf: 'cantar', type: 'ar', en: 'to sing' },
  { inf: 'bailar', type: 'ar', en: 'to dance' },
  { inf: 'cocinar', type: 'ar', en: 'to cook' },
  { inf: 'descansar', type: 'ar', en: 'to rest' },
  { inf: 'escuchar', type: 'ar', en: 'to listen' },
  { inf: 'enseñar', type: 'ar', en: 'to teach' },
  { inf: 'dibujar', type: 'ar', en: 'to draw' },
  { inf: 'nadar', type: 'ar', en: 'to swim' },
  { inf: 'pintar', type: 'ar', en: 'to paint' },
  { inf: 'practicar', type: 'ar', en: 'to practice' },
  { inf: 'viajar', type: 'ar', en: 'to travel' },
  { inf: 'visitar', type: 'ar', en: 'to visit' },
  { inf: 'ayudar', type: 'ar', en: 'to help' },
  { inf: 'celebrar', type: 'ar', en: 'to celebrate' },
  { inf: 'comparar', type: 'ar', en: 'to compare' },
  { inf: 'preparar', type: 'ar', en: 'to prepare' },
  { inf: 'limpiar', type: 'ar', en: 'to clean' },
  { inf: 'invitar', type: 'ar', en: 'to invite' },
  { inf: 'contestar', type: 'ar', en: 'to answer' },
  { inf: 'observar', type: 'ar', en: 'to observe' },
  { inf: 'notar', type: 'ar', en: 'to notice' },
  { inf: 'saltar', type: 'ar', en: 'to jump' },
  { inf: 'gritar', type: 'ar', en: 'to shout' },
  { inf: 'cortar', type: 'ar', en: 'to cut' },
  { inf: 'regalar', type: 'ar', en: 'to give (as a gift)' },
  { inf: 'ahorrar', type: 'ar', en: 'to save (money)' },
  { inf: 'mandar', type: 'ar', en: 'to send / to order' },
  { inf: 'tirar', type: 'ar', en: 'to throw / to pull' },
  { inf: 'organizar', type: 'ar', en: 'to organize' },
  { inf: 'imaginar', type: 'ar', en: 'to imagine' },
  { inf: 'indicar', type: 'ar', en: 'to indicate' },
  { inf: 'participar', type: 'ar', en: 'to participate' },
  { inf: 'recuperar', type: 'ar', en: 'to recover' },
  { inf: 'separar', type: 'ar', en: 'to separate' },
  { inf: 'publicar', type: 'ar', en: 'to publish' },
  { inf: 'ocupar', type: 'ar', en: 'to occupy' },
  { inf: 'instalar', type: 'ar', en: 'to install' },
  { inf: 'programar', type: 'ar', en: 'to program' },
  { inf: 'comunicar', type: 'ar', en: 'to communicate' },
  { inf: 'funcionar', type: 'ar', en: 'to function / to work' },
  { inf: 'mejorar', type: 'ar', en: 'to improve' },
  { inf: 'importar', type: 'ar', en: 'to matter / to import' },
  { inf: 'durar', type: 'ar', en: 'to last' },
  { inf: 'informar', type: 'ar', en: 'to inform' },
  { inf: 'operar', type: 'ar', en: 'to operate' },
  { inf: 'adoptar', type: 'ar', en: 'to adopt' },
  { inf: 'desarrollar', type: 'ar', en: 'to develop' },

  // -er regulars
  { inf: 'beber', type: 'er', en: 'to drink' },
  { inf: 'comer', type: 'er', en: 'to eat' },
  { inf: 'aprender', type: 'er', en: 'to learn' },
  { inf: 'vender', type: 'er', en: 'to sell' },
  { inf: 'responder', type: 'er', en: 'to respond' },
  { inf: 'meter', type: 'er', en: 'to put in / to insert' },
  { inf: 'prometer', type: 'er', en: 'to promise' },
  { inf: 'temer', type: 'er', en: 'to fear' },
  { inf: 'romper', type: 'er', en: 'to break' },
  { inf: 'barrer', type: 'er', en: 'to sweep' },

  // -ir regulars
  { inf: 'decidir', type: 'ir', en: 'to decide' },
  { inf: 'subir', type: 'ir', en: 'to go up / to upload' },
  { inf: 'sufrir', type: 'ir', en: 'to suffer' },
  { inf: 'discutir', type: 'ir', en: 'to discuss / to argue' },
  { inf: 'admitir', type: 'ir', en: 'to admit' },
  { inf: 'compartir', type: 'ir', en: 'to share' },
  { inf: 'cumplir', type: 'ir', en: 'to fulfill / to turn (age)' },
  { inf: 'descubrir', type: 'ir', en: 'to discover' },
  { inf: 'insistir', type: 'ir', en: 'to insist' },
  { inf: 'añadir', type: 'ir', en: 'to add' },
  { inf: 'asistir', type: 'ir', en: 'to attend' },
  { inf: 'cubrir', type: 'ir', en: 'to cover' },
  { inf: 'unir', type: 'ir', en: 'to unite / to join' },
  { inf: 'ocurrir', type: 'ir', en: 'to occur / to happen' },
  { inf: 'consumir', type: 'ir', en: 'to consume' },

  // More stem-changing
  { inf: 'despertar', type: 'ar', en: 'to wake up', sc: 'e>ie' },
  { inf: 'sentar', type: 'ar', en: 'to sit down', sc: 'e>ie' },
  { inf: 'negar', type: 'ar', en: 'to deny', sc: 'e>ie' },
  { inf: 'recomendar', type: 'ar', en: 'to recommend', sc: 'e>ie' },
  { inf: 'gobernar', type: 'ar', en: 'to govern', sc: 'e>ie' },
  { inf: 'calentar', type: 'ar', en: 'to heat up', sc: 'e>ie' },
  { inf: 'confesar', type: 'ar', en: 'to confess', sc: 'e>ie' },
  { inf: 'defender', type: 'er', en: 'to defend', sc: 'e>ie' },
  { inf: 'encender', type: 'er', en: 'to turn on / to light', sc: 'e>ie' },
  { inf: 'mover', type: 'er', en: 'to move', sc: 'o>ue' },
  { inf: 'devolver', type: 'er', en: 'to return (something)', sc: 'o>ue' },
  { inf: 'resolver', type: 'er', en: 'to resolve / to solve', sc: 'o>ue' },
  { inf: 'doler', type: 'er', en: 'to hurt / to ache', sc: 'o>ue' },
  { inf: 'soler', type: 'er', en: 'to usually do', sc: 'o>ue' },
  { inf: 'soñar', type: 'ar', en: 'to dream', sc: 'o>ue' },
  { inf: 'volar', type: 'ar', en: 'to fly', sc: 'o>ue' },
  { inf: 'probar', type: 'ar', en: 'to try / to taste', sc: 'o>ue' },
  { inf: 'costar', type: 'ar', en: 'to cost', sc: 'o>ue' },
  { inf: 'almorzar', type: 'ar', en: 'to have lunch', sc: 'o>ue' },
  { inf: 'colgar', type: 'ar', en: 'to hang', sc: 'o>ue' },
  { inf: 'mentir', type: 'ir', en: 'to lie', sc: 'e>ie' },
  { inf: 'divertir', type: 'ir', en: 'to entertain / to amuse', sc: 'e>ie' },
  { inf: 'invertir', type: 'ir', en: 'to invest', sc: 'e>ie' },
  { inf: 'advertir', type: 'ir', en: 'to warn', sc: 'e>ie' },
  { inf: 'sugerir', type: 'ir', en: 'to suggest', sc: 'e>ie' },
  { inf: 'vestir', type: 'ir', en: 'to dress', sc: 'e>i' },
  { inf: 'medir', type: 'ir', en: 'to measure', sc: 'e>i' },
  { inf: 'competir', type: 'ir', en: 'to compete', sc: 'e>i' },
  { inf: 'despedir', type: 'ir', en: 'to fire / to say goodbye', sc: 'e>i' },
  { inf: 'impedir', type: 'ir', en: 'to prevent / to impede', sc: 'e>i' },

  // More -zco
  { inf: 'pertenecer', type: 'er', en: 'to belong', zco: true },
  { inf: 'agradecer', type: 'er', en: 'to thank', zco: true },
  { inf: 'crecer', type: 'er', en: 'to grow', zco: true },
  { inf: 'desaparecer', type: 'er', en: 'to disappear', zco: true },
  { inf: 'merecer', type: 'er', en: 'to deserve', zco: true },
  { inf: 'obedecer', type: 'er', en: 'to obey', zco: true },
  { inf: 'permanecer', type: 'er', en: 'to remain / to stay', zco: true },
  { inf: 'favorecer', type: 'er', en: 'to favor', zco: true },
  { inf: 'reducir', type: 'ir', en: 'to reduce', zco: true },
  { inf: 'introducir', type: 'ir', en: 'to introduce / to insert', zco: true },

  // Special: reír (e→i + accent changes)
  { inf: 'reír', type: 'ir', en: 'to laugh', conj: ['río','ríes','ríe','reímos','reís','ríen'] },
  { inf: 'sonreír', type: 'ir', en: 'to smile', conj: ['sonrío','sonríes','sonríe','sonreímos','sonreís','sonríen'] },

  // Irregular: construir, destruir, huir (y-insertion)
  { inf: 'construir', type: 'ir', en: 'to build', conj: ['construyo','construyes','construye','construimos','construís','construyen'] },
  { inf: 'destruir', type: 'ir', en: 'to destroy', conj: ['destruyo','destruyes','destruye','destruimos','destruís','destruyen'] },
  { inf: 'huir', type: 'ir', en: 'to flee', conj: ['huyo','huyes','huye','huimos','huís','huyen'] },
  { inf: 'incluir', type: 'ir', en: 'to include', conj: ['incluyo','incluyes','incluye','incluimos','incluís','incluyen'] },
  { inf: 'contribuir', type: 'ir', en: 'to contribute', conj: ['contribuyo','contribuyes','contribuye','contribuimos','contribuís','contribuyen'] },
  { inf: 'sustituir', type: 'ir', en: 'to substitute', conj: ['sustituyo','sustituyes','sustituye','sustituimos','sustituís','sustituyen'] },
  { inf: 'influir', type: 'ir', en: 'to influence', conj: ['influyo','influyes','influye','influimos','influís','influyen'] },
  { inf: 'concluir', type: 'ir', en: 'to conclude', conj: ['concluyo','concluyes','concluye','concluimos','concluís','concluyen'] },
  { inf: 'distribuir', type: 'ir', en: 'to distribute', conj: ['distribuyo','distribuyes','distribuye','distribuimos','distribuís','distribuyen'] },
  { inf: 'disminuir', type: 'ir', en: 'to diminish', conj: ['disminuyo','disminuyes','disminuye','disminuimos','disminuís','disminuyen'] },

  // ── Tier 4 (rank 201-350) ─────────────────────────────────
  { inf: 'andar', type: 'ar', en: 'to walk / to go' },
  { inf: 'luchar', type: 'ar', en: 'to fight / to struggle' },
  { inf: 'llorar', type: 'ar', en: 'to cry' },
  { inf: 'cenar', type: 'ar', en: 'to have dinner' },
  { inf: 'desayunar', type: 'ar', en: 'to have breakfast' },
  { inf: 'disfrutar', type: 'ar', en: 'to enjoy' },
  { inf: 'eliminar', type: 'ar', en: 'to eliminate' },
  { inf: 'guardar', type: 'ar', en: 'to keep / to save' },
  { inf: 'investigar', type: 'ar', en: 'to investigate' },
  { inf: 'planear', type: 'ar', en: 'to plan' },
  { inf: 'regresar', type: 'ar', en: 'to return' },
  { inf: 'reservar', type: 'ar', en: 'to reserve' },
  { inf: 'respirar', type: 'ar', en: 'to breathe' },
  { inf: 'solucionar', type: 'ar', en: 'to solve' },
  { inf: 'desear', type: 'ar', en: 'to desire / to wish' },
  { inf: 'determinar', type: 'ar', en: 'to determine' },
  { inf: 'dominar', type: 'ar', en: 'to dominate' },
  { inf: 'señalar', type: 'ar', en: 'to point out / to signal' },
  { inf: 'controlar', type: 'ar', en: 'to control' },
  { inf: 'conservar', type: 'ar', en: 'to conserve / to preserve' },
  { inf: 'colaborar', type: 'ar', en: 'to collaborate' },
  { inf: 'completar', type: 'ar', en: 'to complete' },
  { inf: 'decorar', type: 'ar', en: 'to decorate' },
  { inf: 'dedicar', type: 'ar', en: 'to dedicate' },
  { inf: 'cultivar', type: 'ar', en: 'to cultivate' },
  { inf: 'examinar', type: 'ar', en: 'to examine' },
  { inf: 'faltar', type: 'ar', en: 'to lack / to be missing' },
  { inf: 'gustar', type: 'ar', en: 'to be pleasing / to like' },
  { inf: 'habitar', type: 'ar', en: 'to inhabit' },
  { inf: 'montar', type: 'ar', en: 'to ride / to assemble' },
  { inf: 'pelear', type: 'ar', en: 'to fight' },
  { inf: 'solicitar', type: 'ar', en: 'to request / to apply' },
  { inf: 'transformar', type: 'ar', en: 'to transform' },
  { inf: 'verificar', type: 'ar', en: 'to verify' },
  { inf: 'votar', type: 'ar', en: 'to vote' },
  { inf: 'robar', type: 'ar', en: 'to steal / to rob' },
  { inf: 'soplar', type: 'ar', en: 'to blow' },
  { inf: 'reparar', type: 'ar', en: 'to repair' },
  { inf: 'avanzar', type: 'ar', en: 'to advance' },
  { inf: 'desperdiciar', type: 'ar', en: 'to waste' },
  { inf: 'generar', type: 'ar', en: 'to generate' },
  { inf: 'manejar', type: 'ar', en: 'to drive / to handle' },
  { inf: 'demostrar', type: 'ar', en: 'to demonstrate', sc: 'o>ue' },
  { inf: 'renovar', type: 'ar', en: 'to renovate / to renew', sc: 'o>ue' },
  { inf: 'aprobar', type: 'ar', en: 'to approve / to pass', sc: 'o>ue' },
  { inf: 'rogar', type: 'ar', en: 'to beg / to pray', sc: 'o>ue' },
  { inf: 'acostar', type: 'ar', en: 'to lay down / to put to bed', sc: 'o>ue' },
  { inf: 'apostar', type: 'ar', en: 'to bet', sc: 'o>ue' },
  { inf: 'forzar', type: 'ar', en: 'to force', sc: 'o>ue' },
  { inf: 'llover', type: 'er', en: 'to rain', sc: 'o>ue' },
  { inf: 'morder', type: 'er', en: 'to bite', sc: 'o>ue' },
  { inf: 'torcer', type: 'er', en: 'to twist', sc: 'o>ue' },
  { inf: 'envolver', type: 'er', en: 'to wrap', sc: 'o>ue' },
  { inf: 'atravesar', type: 'ar', en: 'to cross', sc: 'e>ie' },
  { inf: 'regar', type: 'ar', en: 'to water (plants)', sc: 'e>ie' },
  { inf: 'tropezar', type: 'ar', en: 'to trip / to stumble', sc: 'e>ie' },
  { inf: 'apretar', type: 'ar', en: 'to tighten / to squeeze', sc: 'e>ie' },
  { inf: 'sembrar', type: 'ar', en: 'to sow / to plant', sc: 'e>ie' },
  { inf: 'temblar', type: 'ar', en: 'to tremble', sc: 'e>ie' },
  { inf: 'herir', type: 'ir', en: 'to wound / to hurt', sc: 'e>ie' },
  { inf: 'hervir', type: 'ir', en: 'to boil', sc: 'e>ie' },
  { inf: 'rendir', type: 'ir', en: 'to yield / to give up', sc: 'e>i' },
  { inf: 'gemir', type: 'ir', en: 'to groan / to moan', sc: 'e>i' },

  // More -zco and special
  { inf: 'enriquecer', type: 'er', en: 'to enrich', zco: true },
  { inf: 'fortalecer', type: 'er', en: 'to strengthen', zco: true },
  { inf: 'oscurecer', type: 'er', en: 'to darken', zco: true },
  { inf: 'empobrecer', type: 'er', en: 'to impoverish', zco: true },
  { inf: 'carecer', type: 'er', en: 'to lack', zco: true },
  { inf: 'complacer', type: 'er', en: 'to please', zco: true },
  { inf: 'envejecer', type: 'er', en: 'to age / to grow old', zco: true },
  { inf: 'embellecer', type: 'er', en: 'to beautify', zco: true },
  { inf: 'amanecer', type: 'er', en: 'to dawn', zco: true },
  { inf: 'atardecer', type: 'er', en: 'to become dusk', zco: true },
  { inf: 'anochecer', type: 'er', en: 'to become nightfall', zco: true },
  { inf: 'humedecer', type: 'er', en: 'to moisten', zco: true },
  { inf: 'rejuvenecer', type: 'er', en: 'to rejuvenate', zco: true },
  { inf: 'deducir', type: 'ir', en: 'to deduce', zco: true },
  { inf: 'reproducir', type: 'ir', en: 'to reproduce', zco: true },
  { inf: 'seducir', type: 'ir', en: 'to seduce', zco: true },

  // More -er regulars
  { inf: 'coser', type: 'er', en: 'to sew' },
  { inf: 'tejer', type: 'er', en: 'to knit / to weave' },
  { inf: 'toser', type: 'er', en: 'to cough' },
  { inf: 'deber', type: 'er', en: 'to owe / should' },
  { inf: 'sorprender', type: 'er', en: 'to surprise' },
  { inf: 'depender', type: 'er', en: 'to depend' },
  { inf: 'suspender', type: 'er', en: 'to suspend / to fail (exam)' },
  { inf: 'ofender', type: 'er', en: 'to offend' },
  { inf: 'pretender', type: 'er', en: 'to intend / to try' },
  { inf: 'absorber', type: 'er', en: 'to absorb' },
  { inf: 'esconder', type: 'er', en: 'to hide' },
  { inf: 'ceder', type: 'er', en: 'to yield / to give way' },
  { inf: 'proceder', type: 'er', en: 'to proceed' },
  { inf: 'exceder', type: 'er', en: 'to exceed' },
  { inf: 'acceder', type: 'er', en: 'to access / to agree' },
  { inf: 'poseer', type: 'er', en: 'to possess' },
  { inf: 'recorrer', type: 'er', en: 'to travel through / to cover' },

  // More -ir regulars
  { inf: 'resistir', type: 'ir', en: 'to resist' },
  { inf: 'dividir', type: 'ir', en: 'to divide' },
  { inf: 'prohibir', type: 'ir', en: 'to prohibit' },
  { inf: 'describir', type: 'ir', en: 'to describe' },
  { inf: 'imprimir', type: 'ir', en: 'to print' },
  { inf: 'transmitir', type: 'ir', en: 'to transmit' },
  { inf: 'emitir', type: 'ir', en: 'to emit / to broadcast' },
  { inf: 'omitir', type: 'ir', en: 'to omit' },
  { inf: 'percibir', type: 'ir', en: 'to perceive' },
  { inf: 'presumir', type: 'ir', en: 'to presume / to show off' },
  { inf: 'sacudir', type: 'ir', en: 'to shake' },
  { inf: 'aplaudir', type: 'ir', en: 'to applaud' },
  { inf: 'confundir', type: 'ir', en: 'to confuse' },
  { inf: 'fundir', type: 'ir', en: 'to melt / to fuse' },

  // ── Tier 5 (rank 351-500+) ────────────────────────────────
  { inf: 'abandonar', type: 'ar', en: 'to abandon' },
  { inf: 'abrazar', type: 'ar', en: 'to hug / to embrace' },
  { inf: 'acompañar', type: 'ar', en: 'to accompany' },
  { inf: 'acumular', type: 'ar', en: 'to accumulate' },
  { inf: 'admirar', type: 'ar', en: 'to admire' },
  { inf: 'adornar', type: 'ar', en: 'to adorn / to decorate' },
  { inf: 'agradar', type: 'ar', en: 'to please' },
  { inf: 'alimentar', type: 'ar', en: 'to feed' },
  { inf: 'amenazar', type: 'ar', en: 'to threaten' },
  { inf: 'analizar', type: 'ar', en: 'to analyze' },
  { inf: 'animar', type: 'ar', en: 'to encourage / to cheer up' },
  { inf: 'anunciar', type: 'ar', en: 'to announce' },
  { inf: 'apoyar', type: 'ar', en: 'to support' },
  { inf: 'arreglar', type: 'ar', en: 'to fix / to arrange' },
  { inf: 'asegurar', type: 'ar', en: 'to assure / to insure' },
  { inf: 'asociar', type: 'ar', en: 'to associate' },
  { inf: 'aumentar', type: 'ar', en: 'to increase' },
  { inf: 'beneficiar', type: 'ar', en: 'to benefit' },
  { inf: 'besar', type: 'ar', en: 'to kiss' },
  { inf: 'borrar', type: 'ar', en: 'to erase / to delete' },
  { inf: 'calcular', type: 'ar', en: 'to calculate' },
  { inf: 'cancelar', type: 'ar', en: 'to cancel' },
  { inf: 'capturar', type: 'ar', en: 'to capture' },
  { inf: 'causar', type: 'ar', en: 'to cause' },
  { inf: 'chatear', type: 'ar', en: 'to chat' },
  { inf: 'circular', type: 'ar', en: 'to circulate' },
  { inf: 'clasificar', type: 'ar', en: 'to classify' },
  { inf: 'cobrar', type: 'ar', en: 'to charge / to collect' },
  { inf: 'comentar', type: 'ar', en: 'to comment' },
  { inf: 'confirmar', type: 'ar', en: 'to confirm' },
  { inf: 'conquistar', type: 'ar', en: 'to conquer' },
  { inf: 'consultar', type: 'ar', en: 'to consult' },
  { inf: 'contaminar', type: 'ar', en: 'to contaminate / to pollute' },
  { inf: 'cooperar', type: 'ar', en: 'to cooperate' },
  { inf: 'copiar', type: 'ar', en: 'to copy' },
  { inf: 'criticar', type: 'ar', en: 'to criticize' },
  { inf: 'cuidar', type: 'ar', en: 'to take care of' },
  { inf: 'dañar', type: 'ar', en: 'to damage' },
  { inf: 'declarar', type: 'ar', en: 'to declare' },
  { inf: 'descargar', type: 'ar', en: 'to download' },
  { inf: 'disculpar', type: 'ar', en: 'to excuse / to forgive' },
  { inf: 'diseñar', type: 'ar', en: 'to design' },
  { inf: 'disparar', type: 'ar', en: 'to shoot / to fire' },
  { inf: 'doblar', type: 'ar', en: 'to fold / to turn' },
  { inf: 'dudar', type: 'ar', en: 'to doubt' },
  { inf: 'echar', type: 'ar', en: 'to throw / to pour' },
  { inf: 'ejecutar', type: 'ar', en: 'to execute / to carry out' },
  { inf: 'empujar', type: 'ar', en: 'to push' },
  { inf: 'encantar', type: 'ar', en: 'to enchant / to love' },
  { inf: 'entregar', type: 'ar', en: 'to deliver / to hand over' },
  { inf: 'equipar', type: 'ar', en: 'to equip' },
  { inf: 'escapar', type: 'ar', en: 'to escape' },
  { inf: 'estacionar', type: 'ar', en: 'to park' },
  { inf: 'evaluar', type: 'ar', en: 'to evaluate' },
  { inf: 'evitar', type: 'ar', en: 'to avoid' },
  { inf: 'explorar', type: 'ar', en: 'to explore' },
  { inf: 'exportar', type: 'ar', en: 'to export' },
  { inf: 'expresar', type: 'ar', en: 'to express' },
  { inf: 'fascinar', type: 'ar', en: 'to fascinate' },
  { inf: 'festejar', type: 'ar', en: 'to celebrate / to party' },
  { inf: 'financiar', type: 'ar', en: 'to finance' },
  { inf: 'firmar', type: 'ar', en: 'to sign' },
  { inf: 'fracasar', type: 'ar', en: 'to fail' },
  { inf: 'gastar', type: 'ar', en: 'to spend (money)' },
  { inf: 'girar', type: 'ar', en: 'to turn / to rotate' },
  { inf: 'golpear', type: 'ar', en: 'to hit / to strike' },
  { inf: 'grabar', type: 'ar', en: 'to record' },
  { inf: 'ignorar', type: 'ar', en: 'to ignore' },
  { inf: 'iluminar', type: 'ar', en: 'to illuminate' },
  { inf: 'impulsar', type: 'ar', en: 'to propel / to drive' },
  { inf: 'inaugurar', type: 'ar', en: 'to inaugurate' },
  { inf: 'inspirar', type: 'ar', en: 'to inspire' },
  { inf: 'juntar', type: 'ar', en: 'to join / to gather' },
  { inf: 'lanzar', type: 'ar', en: 'to throw / to launch' },
  { inf: 'liberar', type: 'ar', en: 'to liberate / to free' },
  { inf: 'limitar', type: 'ar', en: 'to limit' },
  { inf: 'marcar', type: 'ar', en: 'to mark / to score' },
  { inf: 'modificar', type: 'ar', en: 'to modify' },
  { inf: 'multiplicar', type: 'ar', en: 'to multiply' },
  { inf: 'negociar', type: 'ar', en: 'to negotiate' },
  { inf: 'numerar', type: 'ar', en: 'to number' },
  { inf: 'obligar', type: 'ar', en: 'to force / to oblige' },
  { inf: 'perfeccionar', type: 'ar', en: 'to perfect' },
  { inf: 'perdonar', type: 'ar', en: 'to forgive' },
  { inf: 'pilotar', type: 'ar', en: 'to pilot' },
  { inf: 'reciclar', type: 'ar', en: 'to recycle' },
  { inf: 'reclamar', type: 'ar', en: 'to claim / to demand' },
  { inf: 'repasar', type: 'ar', en: 'to review' },
  { inf: 'representar', type: 'ar', en: 'to represent' },
  { inf: 'respetar', type: 'ar', en: 'to respect' },
  { inf: 'revelar', type: 'ar', en: 'to reveal' },
  { inf: 'sumar', type: 'ar', en: 'to add up / to sum' },
  { inf: 'superar', type: 'ar', en: 'to overcome / to surpass' },
  { inf: 'valorar', type: 'ar', en: 'to value' },
  // Additional -er
  { inf: 'convencer', type: 'er', en: 'to convince' },
  { inf: 'competer', type: 'er', en: 'to be incumbent upon' },
  { inf: 'conceder', type: 'er', en: 'to concede / to grant' },
  // Additional -ir
  { inf: 'aburrir', type: 'ir', en: 'to bore' },
  { inf: 'acudir', type: 'ir', en: 'to attend / to go to' },
  { inf: 'batir', type: 'ir', en: 'to beat / to whisk' },
  { inf: 'coincidir', type: 'ir', en: 'to coincide' },
  { inf: 'concurrir', type: 'ir', en: 'to concur / to attend' },
  { inf: 'definir', type: 'ir', en: 'to define' },
  { inf: 'difundir', type: 'ir', en: 'to spread / to broadcast' },
  { inf: 'evadir', type: 'ir', en: 'to evade' },
  { inf: 'invadir', type: 'ir', en: 'to invade' },
  { inf: 'nutrir', type: 'ir', en: 'to nourish' },
  { inf: 'pulir', type: 'ir', en: 'to polish' },
  { inf: 'recurrir', type: 'ir', en: 'to resort to / to appeal' },
  { inf: 'resumir', type: 'ir', en: 'to summarize' },
  { inf: 'surgir', type: 'ir', en: 'to arise / to emerge', conj: ['surjo','surges','surge','surgimos','surgís','surgen'] },
  // More compound/derived -go verbs
  { inf: 'contener', type: 'er', en: 'to contain', conj: ['contengo','contienes','contiene','contenemos','contenéis','contienen'] },
  { inf: 'detener', type: 'er', en: 'to stop / to detain', conj: ['detengo','detienes','detiene','detenemos','detenéis','detienen'] },
  { inf: 'entretener', type: 'er', en: 'to entertain', conj: ['entretengo','entretienes','entretiene','entretenemos','entretenéis','entretienen'] },
  { inf: 'disponer', type: 'er', en: 'to arrange / to have available', conj: ['dispongo','dispones','dispone','disponemos','disponéis','disponen'] },
  { inf: 'oponer', type: 'er', en: 'to oppose', conj: ['opongo','opones','opone','oponemos','oponéis','oponen'] },
  { inf: 'exponer', type: 'er', en: 'to expose / to exhibit', conj: ['expongo','expones','expone','exponemos','exponéis','exponen'] },
  { inf: 'convenir', type: 'ir', en: 'to be suitable / to agree', conj: ['convengo','convienes','conviene','convenimos','convenís','convienen'] },
  { inf: 'prevenir', type: 'ir', en: 'to prevent', conj: ['prevengo','previenes','previene','prevenimos','prevenís','previenen'] },
  { inf: 'intervenir', type: 'ir', en: 'to intervene', conj: ['intervengo','intervienes','interviene','intervenimos','intervenís','intervienen'] },
  { inf: 'atraer', type: 'er', en: 'to attract', conj: ['atraigo','atraes','atrae','atraemos','atraéis','atraen'] },
  { inf: 'distraer', type: 'er', en: 'to distract', conj: ['distraigo','distraes','distrae','distraemos','distraéis','distraen'] },
  { inf: 'extraer', type: 'er', en: 'to extract', conj: ['extraigo','extraes','extrae','extraemos','extraéis','extraen'] },
  // More regular -ar to reach 500+
  { inf: 'aceptar', type: 'ar', en: 'to accept' },
  { inf: 'acercar', type: 'ar', en: 'to bring closer' },
  { inf: 'aconsejar', type: 'ar', en: 'to advise' },
  { inf: 'adivinar', type: 'ar', en: 'to guess' },
  { inf: 'alcanzar', type: 'ar', en: 'to reach / to achieve' },
  { inf: 'amar', type: 'ar', en: 'to love' },
  { inf: 'apagar', type: 'ar', en: 'to turn off' },
  { inf: 'aportar', type: 'ar', en: 'to contribute' },
  { inf: 'aprovechar', type: 'ar', en: 'to take advantage of' },
  { inf: 'arrastrar', type: 'ar', en: 'to drag' },
  { inf: 'bajar', type: 'ar', en: 'to go down / to download' },
  { inf: 'bañar', type: 'ar', en: 'to bathe' },
  { inf: 'brillar', type: 'ar', en: 'to shine' },
  { inf: 'cargar', type: 'ar', en: 'to load / to charge' },
  { inf: 'chocar', type: 'ar', en: 'to crash / to collide' },
  { inf: 'cocinar', type: 'ar', en: 'to cook' },
  { inf: 'coleccionar', type: 'ar', en: 'to collect' },
  { inf: 'combinar', type: 'ar', en: 'to combine' },
  { inf: 'congelar', type: 'ar', en: 'to freeze' },
  { inf: 'conectar', type: 'ar', en: 'to connect' },
  { inf: 'considerar', type: 'ar', en: 'to consider' },
  { inf: 'curar', type: 'ar', en: 'to cure / to heal' },
  { inf: 'debilitar', type: 'ar', en: 'to weaken' },
  { inf: 'demandar', type: 'ar', en: 'to sue / to demand' },
  { inf: 'denunciar', type: 'ar', en: 'to report / to denounce' },
  { inf: 'derramar', type: 'ar', en: 'to spill' },
  { inf: 'desconectar', type: 'ar', en: 'to disconnect' },
  { inf: 'despertar', type: 'ar', en: 'to wake up' },
  { inf: 'detallar', type: 'ar', en: 'to detail' },
  { inf: 'editar', type: 'ar', en: 'to edit' },
  { inf: 'elaborar', type: 'ar', en: 'to elaborate / to make' },
  { inf: 'embarcar', type: 'ar', en: 'to board / to embark' },
  { inf: 'empacar', type: 'ar', en: 'to pack' },
  { inf: 'enfocar', type: 'ar', en: 'to focus' },
  { inf: 'enriquecer', type: 'er', en: 'to enrich' },
  { inf: 'especificar', type: 'ar', en: 'to specify' },
  { inf: 'estimar', type: 'ar', en: 'to estimate / to esteem' },
  { inf: 'estimular', type: 'ar', en: 'to stimulate' },
  { inf: 'fabricar', type: 'ar', en: 'to manufacture' },
  { inf: 'facilitar', type: 'ar', en: 'to facilitate' },
  { inf: 'filtrar', type: 'ar', en: 'to filter' },
  { inf: 'fotografiar', type: 'ar', en: 'to photograph' },
  { inf: 'frotar', type: 'ar', en: 'to rub' },
  { inf: 'gobernar', type: 'ar', en: 'to govern' },
  { inf: 'hervir', type: 'ir', en: 'to boil' },
  { inf: 'honrar', type: 'ar', en: 'to honor' },
  { inf: 'identificar', type: 'ar', en: 'to identify' },
  { inf: 'implementar', type: 'ar', en: 'to implement' },
  { inf: 'intercambiar', type: 'ar', en: 'to exchange' },
  { inf: 'interpretar', type: 'ar', en: 'to interpret' },
  { inf: 'justificar', type: 'ar', en: 'to justify' },
  { inf: 'lamentar', type: 'ar', en: 'to lament / to regret' },
  { inf: 'lograr', type: 'ar', en: 'to achieve' },
  { inf: 'masticar', type: 'ar', en: 'to chew' },
  { inf: 'negociar', type: 'ar', en: 'to negotiate' },
  { inf: 'nivelar', type: 'ar', en: 'to level' },
  { inf: 'optar', type: 'ar', en: 'to choose / to opt' },
  { inf: 'otorgar', type: 'ar', en: 'to grant / to award' },
  { inf: 'penetrar', type: 'ar', en: 'to penetrate' },
  { inf: 'plantar', type: 'ar', en: 'to plant' },
  { inf: 'proclamar', type: 'ar', en: 'to proclaim' },
  { inf: 'quejar', type: 'ar', en: 'to complain' },
  { inf: 'recaudar', type: 'ar', en: 'to collect (funds)' },
  { inf: 'reforzar', type: 'ar', en: 'to reinforce', sc: 'o>ue' },
  { inf: 'relatar', type: 'ar', en: 'to narrate / to relate' },
  { inf: 'restar', type: 'ar', en: 'to subtract' },
  { inf: 'rezar', type: 'ar', en: 'to pray' },
  { inf: 'rodear', type: 'ar', en: 'to surround' },
  { inf: 'saborear', type: 'ar', en: 'to savor' },
  { inf: 'secar', type: 'ar', en: 'to dry' },
  { inf: 'suplicar', type: 'ar', en: 'to beg / to plead' },
  { inf: 'tapar', type: 'ar', en: 'to cover / to block' },
  { inf: 'tragar', type: 'ar', en: 'to swallow' },
  { inf: 'ubicar', type: 'ar', en: 'to locate' },
  { inf: 'vaciar', type: 'ar', en: 'to empty' },
  { inf: 'vincular', type: 'ar', en: 'to link / to bind' },
  { inf: 'zigzaguear', type: 'ar', en: 'to zigzag' },
];

// ─── Build Verb Entries ──────────────────────────────────────────────

// Deduplicate (some verbs appear twice in the lists)
const seen = new Set();
const uniqueVerbs = [];
for (const v of verbDefs) {
  if (seen.has(v.inf)) continue;
  seen.add(v.inf);
  uniqueVerbs.push(v);
}

// Assign frequency ranks
const entries = uniqueVerbs.map((v, i) => {
  const rank = i + 1;

  // Determine conjugation
  let conjugation;
  if (v.conj) {
    // Explicit conjugation array
    conjugation = {};
    pronounKeys.forEach((key, idx) => { conjugation[key] = v.conj[idx]; });
  } else if (v.zco) {
    conjugation = conjugateZco(v.inf, v.type);
  } else if (v.sc) {
    const [from, to] = v.sc.split('>');
    conjugation = conjugateStemChange(v.inf, v.type, from, to);
  } else {
    conjugation = conjugateRegular(v.inf, v.type);
  }

  // Generate sample sentences
  const pronounDisplay = {
    yo: 'Yo',
    tu: 'Tú',
    elEllaUsted: 'Él',
    nosotros: 'Nosotros',
    vosotros: 'Vosotros',
    ustedes: 'Ustedes',
  };

  const adverbs = [
    { es: 'mucho', en: 'a lot' },
    { es: 'bien', en: 'well' },
    { es: 'todos los días', en: 'every day' },
    { es: 'siempre', en: 'always' },
    { es: 'a veces', en: 'sometimes' },
    { es: 'con frecuencia', en: 'often' },
  ];

  const sampleSentence = {};
  pronounKeys.forEach((key, idx) => {
    const form = conjugation[key];
    const adv = adverbs[idx % adverbs.length];
    const subj = pronounDisplay[key];
    // Strip "to " prefix from English meaning for sentence construction
    const enVerb = v.en.replace(/^to /, '').replace(/ \/.+$/, '').replace(/ \(.+\)$/, '');
    sampleSentence[key] = {
      es: `${subj} ${form} ${adv.es}.`,
      en: `${subj === 'Yo' ? 'I' : subj === 'Tú' ? 'You' : subj === 'Él' ? 'He/She' : subj === 'Nosotros' ? 'We' : subj === 'Vosotros' ? 'You all' : 'They'} ${enVerb}${subj === 'Él' ? 's' : ''} ${adv.en}.`,
    };
  });

  return {
    infinitive: v.inf,
    type: v.type,
    englishMeaning: v.en,
    frequencyRank: rank,
    presentConjugation: conjugation,
    sampleSentence,
  };
});

console.log(`Generated ${entries.length} verbs`);

// Write the TypeScript file
const tsContent = `import { VerbEntry } from './types';

export const VERBS: VerbEntry[] = ${JSON.stringify(entries, null, 2)};
`;

writeFileSync('lib/verbs.ts', tsContent);
console.log('Written to lib/verbs.ts');
