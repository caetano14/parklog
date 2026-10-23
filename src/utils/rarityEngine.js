import { norm } from './text';
import { canonicalBrand } from './brands';

// Níveis (os textos são os valores guardados nos carros)
const LEVELS = ['Comum', 'Raro', 'Exótico'];
const [COMUM, RARO, EXOTICO] = [0, 1, 2];

// Camada 1: a marca define a raridade base
const EXOTIC_BRANDS = new Set(['ferrari', 'lamborghini', 'mclaren', 'bugatti', 'pagani', 'koenigsegg', 'astonmartin', 'rollsroyce']);
const RARE_BRANDS = new Set(['porsche', 'maserati', 'lotus', 'bentley', 'alpine']);

// Camada 2: o modelo pode subir um carro "Comum" (tudo é comparado sem maiúsculas,
// acentos, espaços ou hífens). Um padrão em texto é uma palavra/frase inteira, para
// "R" não apanhar "R-Line" nem "M" apanhar "M Sport". Para famílias com números
// (M3, RS6, 350Z...) usa-se `word('regex')`.
const word = (body) => new RegExp(`(?:^|[^a-z0-9])(?:${body})(?:[^a-z0-9-]|$)`);
const phrase = (p) => word(norm(p).split(/[\s-]+/).join('[\\s-]*'));
const rule = (level, ...tests) => ({ level, tests: tests.map((t) => (typeof t === 'string' ? phrase(t) : t)) });

const AMERICAN = [rule(RARO, 'corvette', 'camaro zl1', 'viper', 'hellcat', 'demon')];

const MODEL_RULES = {
  honda: [rule(RARO, 'type r', 's2000'), rule(EXOTICO, 'nsx')],
  volkswagen: [rule(RARO, 'gti', 'r', 'clubsport', 'r32')],
  bmw: [rule(RARO, word('m[2-8]|x[3-7][\\s-]*m'), 'cs', 'csl', 'alpina')], // M2, M3... (não M340i nem "M Sport")
  mercedes: [rule(RARO, word('amg(?![\\s-]*line)'), 'black series'), rule(EXOTICO, 'amg one')],
  audi: [rule(RARO, word('rs[\\s-]*q?\\d{0,2}'), 'r8')],
  ford: [
    rule(RARO, word('rs\\d{0,3}'), 'cosworth', word('mustang(?![\\s-]*mach)'), 'shelby'),
    rule(EXOTICO, /^gt(?:[\s-]*40)?$/), // só o "GT" supercarro, não o "Mustang GT"
  ],
  nissan: [rule(RARO, 'gt-r', 'nismo', 'skyline', word('(?:\\d{3}[\\s-]*)?z'))],
  subaru: [rule(RARO, 'wrx', 'sti')],
  mitsubishi: [rule(RARO, 'evo', 'evolution')],
  mazda: [rule(RARO, 'rx-7', 'rx-8', 'mps')],
  alfaromeo: [rule(RARO, 'quadrifoglio', 'gta'), rule(EXOTICO, '8c', '33 stradale')],
  chevrolet: AMERICAN,
  dodge: AMERICAN,
  toyota: [rule(RARO, 'supra', 'celica gt-four', word('gr(?![\\s-]*sport)(?:\\d{2}|[\\s-]+(?:yaris|corolla|supra|86))?'))],
};

// Devolve 'Comum' | 'Raro' | 'Exótico'
export function calculateRarity(brand, model) {
  const key = canonicalBrand(brand);
  let level = EXOTIC_BRANDS.has(key) ? EXOTICO : RARE_BRANDS.has(key) ? RARO : COMUM;

  const m = norm(model);
  if (m && level < EXOTICO) {
    for (const { level: lv, tests } of MODEL_RULES[key] ?? []) {
      if (lv > level && tests.some((re) => re.test(m))) level = lv;
    }
  }
  return LEVELS[level];
}
