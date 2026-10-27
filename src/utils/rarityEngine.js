import { norm } from './text';
import { canonicalBrand } from './brands';

// Níveis (os textos são os valores guardados nos carros)
const LEVELS = ['Comum', 'Raro', 'Exótico'];
const [COMUM, RARO, EXOTICO] = [0, 1, 2];

// Camada 1: a marca define a raridade base (as chaves são as de canonicalBrand: sem acentos, espaços nem hífens)
const EXOTIC_BRANDS = new Set([
  'ferrari', 'lamborghini', 'mclaren', 'bugatti', 'pagani', 'koenigsegg', 'astonmartin', 'rollsroyce',
  'maybach', 'rimac', 'zenvo', 'spyker', 'ssc', 'ruf', 'detomaso',
]);
const RARE_BRANDS = new Set([
  'porsche', 'maserati', 'lotus', 'bentley', 'alpine', 'alpina', 'brabus', 'morgan', 'caterham', 'ariel', 'tvr',
  'radical', 'noble', 'ac', 'delorean', 'triumph', 'austin', 'pontiac', 'plymouth', 'oldsmobile', 'mercury',
  'hummer', 'saleen', 'shelby', 'hennessey', 'rivian', 'lucid', 'fisker', 'trabant', 'umm',
]);

// Camada 2: o modelo pode subir um carro (tudo é comparado sem maiúsculas, acentos, espaços
// ou hífens). Um padrão em texto é uma palavra/frase inteira, para "R" não apanhar "R-Line"
// nem "M" apanhar "M Sport". Para famílias com números (M3, RS6, 350Z...) usa-se `word('regex')`.
// Só sobe: o nível final é o mais alto entre a marca e as regras que o modelo cumpre.
const word = (body) => new RegExp(`(?:^|[^a-z0-9])(?:${body})(?:[^a-z0-9-]|$)`);
const phrase = (p) => word(norm(p).split(/[\s-]+/).join('[\\s-]*'));
const rule = (level, ...tests) => ({ level, tests: tests.map((t) => (typeof t === 'string' ? phrase(t) : t)) });

const MODEL_RULES = {
  abarth: [rule(RARO, 'biposto', 'tributo', 'competizione', 'esseesse', '124')],
  acura: [rule(RARO, 'type s', 'type r'), rule(EXOTICO, 'nsx')],
  alfaromeo: [rule(RARO, 'quadrifoglio', 'gta', '4c', 'montreal', 'sz', 'tz', 'zagato'), rule(EXOTICO, '8c', '33 stradale')],
  audi: [
    rule(RARO, word('rs[\\s-]*q?\\d{0,2}'), 'r8', 'e-tron gt', /^(?:ur[\s-]*)?quattro$/),
    rule(EXOTICO, 'sport quattro'),
  ],
  bentley: [rule(EXOTICO, 'bacalar', 'batur', 'blower')],
  bmw: [
    rule(RARO, word('m[2-8]|x[3-7][\\s-]*m'), 'cs', 'csl', 'alpina', 'i8', '1m', 'xm', 'z1'), // M2, M3... (não M340i nem "M Sport")
    rule(EXOTICO, 'm1', 'z8', '507'),
  ],
  cadillac: [rule(RARO, word('(?:cts|ats|ct4|ct5|xts|escalade)[\\s-]*v(?:[\\s-]*(?:series|blackwing))?'), 'blackwing', 'v-series')],
  chevrolet: [
    rule(RARO, 'corvette', 'z06', 'zr1', 'camaro zl1', 'camaro z28', 'chevelle ss', 'el camino ss', 'impala ss', 'nova ss', 'bel air', 'corvair'),
  ],
  chrysler: [rule(RARO, 'srt', 'prowler')],
  citroen: [rule(RARO, 'vts', 'sm', 'mehari', 'traction avant', word('ds[\\s-]*(?:19|21|23)'))],
  cupra: [rule(RARO, 'vz5', 'vz')],
  dodge: [rule(RARO, 'viper', 'hellcat', 'demon', 'redeye', 'srt', 'scat pack', 'super bee', 'daytona', 'stealth')],
  fiat: [rule(RARO, 'barchetta', 'x1/9', 'coupe', 'dino', 'topolino', 'spider')],
  ford: [
    rule(RARO,
      word('rs\\d{0,3}'), 'cosworth', word('mustang(?![\\s-]*mach)'), 'shelby', 'cobra', 'gt350', 'gt500', 'boss 302', 'mach 1',
      'raptor', 'lightning', word('st(?![\\s-]*line)(?:[\\s-]*\\d{3})?')), // Fiesta ST, Focus ST (não "ST-Line")
    rule(EXOTICO, /^gt(?:[\s-]*40)?$/, 'rs200'), // só o "GT" supercarro, não o "Mustang GT"
  ],
  gmc: [rule(RARO, 'hummer', 'typhoon', 'syclone')],
  honda: [rule(RARO, 'type r', 's2000', 's800', 'civic si'), rule(EXOTICO, 'nsx')],
  hyundai: [rule(RARO, word('n(?![\\s-]*line)'), 'genesis coupe')], // i30 N, Kona N (não "N Line")
  infiniti: [rule(RARO, 'eau rouge')],
  isuzu: [rule(RARO, '117 coupe', 'piazza', 'vehicross')],
  jaguar: [
    rule(RARO,
      word('f[\\s-]*type'), word('xk[\\s-]*(?:r|8|120|140|150)?'), word('xkr[\\s-]*s'), 'xjs', 'e-type', 'svr', 'xfr', 'xjr', 'project 8'),
    rule(EXOTICO, 'xj220', 'd-type', 'c-type', 'ss100', 'type 00'),
  ],
  jeep: [rule(RARO, 'trackhawk', 'srt', '392', 'willys', word('cj[\\s-]*\\d'))],
  kia: [rule(RARO, 'stinger', word('gt(?![\\s-]*line)'))], // Ceed GT (não "GT-Line")
  lancia: [
    rule(RARO, 'integrale', 'fulvia', 'flavia', 'montecarlo', 'thema 8.32', 'aurelia', 'flaminia'),
    rule(EXOTICO, 'stratos', '037', 'delta s4'),
  ],
  landrover: [rule(RARO, 'svr', 'works v8', 'series i', 'series 1', 'series ii', 'series iii', 'range rover classic')],
  lexus: [
    rule(RARO, word('(?:is|gs|rc)[\\s-]*f(?![\\s-]*sport)'), word('lc(?:[\\s-]*(?:500h?|f))?')),
    rule(EXOTICO, 'lfa'),
  ],
  lotus: [rule(EXOTICO, 'evija')],
  maserati: [rule(EXOTICO, 'mc12', 'mc20', 'mcxtrema', 'bora', 'khamsin', 'merak')],
  mazda: [rule(RARO, word('rx[\\s-]*[2-9]'), 'mps', 'cosmo')],
  mercedes: [
    rule(RARO,
      word('amg(?![\\s-]*line)'), 'black series', 'evo', '500 e', '500e',
      word('[a-z]{1,3}[\\s-]*(?:35|43|45|53|55|63|65)(?:[\\s-]*s)?'), // A 45, C 63, G 63, CLA 35...
      word('(?:classe|class)[\\s-]*g|g[\\s-]*class|g[\\s-]*wagen|g[\\s-]*wagon|g[\\s-]*(?:350|400|500|550|580)')),
    rule(EXOTICO, 'amg one', 'sls', 'slr', 'maybach', '300 sl'),
  ],
  mg: [rule(RARO, 'mgb', 'cyberster', 'tf', 'mgf', 'xpower', 'midget', 'mgc'), rule(EXOTICO, '6r4')],
  mini: [rule(RARO, 'jcw', 'john cooper works', 'gp')],
  mitsubishi: [rule(RARO, 'evo', 'evolution', 'gto', '3000gt', 'stealth', 'fto', 'starion', 'ralliart')],
  nissan: [
    rule(RARO,
      'gt-r', 'nismo', 'skyline', word('(?:\\d{3}[\\s-]*)?zx?'), 'silvia', '180sx', '200sx', '240sx', word('s1[345]'),
      word('r3[2-5]'), 'figaro', 'pao', 'be-1'),
  ],
  noble: [rule(EXOTICO, 'm600')],
  opel: [rule(RARO, 'opc', 'speedster', 'gsi', 'calibra turbo', 'manta gte', /^gt$/)],
  peugeot: [rule(RARO, word('gti(?:[\\s-]*\\d+)?'), 'rcz', 'rallye'), rule(EXOTICO, 't16', 'turbo 16')],
  plymouth: [rule(EXOTICO, 'superbird')],
  polestar: [rule(RARO, /^1$/)],
  porsche: [rule(EXOTICO, '918', 'carrera gt', '959', 'gt2', 'gt1', '911 r', '550 spyder')],
  ram: [rule(RARO, 'trx')],
  renault: [
    rule(RARO, word('rs(?![\\s-]*line)'), 'trophy', 'williams', 'clio v6', 'r5 turbo', 'twingo gordini', 'alpine', 'r26', 'spider'),
    rule(EXOTICO, 'sport spider'),
  ],
  rover: [rule(RARO, 'sd1', 'p5', 'p6')],
  saab: [rule(RARO, 'viggen', 'sonett', 'aero', 'turbo', 'carlsson')],
  saleen: [rule(EXOTICO, 's7')],
  seat: [rule(RARO, 'cupra')],
  shelby: [rule(EXOTICO, 'cobra', 'daytona', 'super snake')],
  skoda: [rule(RARO, word('v?rs(?![\\s-]*line)'), '130 rs', '110 r')],
  smart: [rule(RARO, 'roadster', 'brabus', 'crossblade')],
  subaru: [rule(RARO, 'wrx', 'sti', 'brz', 'svx', 'baja', 'brat'), rule(EXOTICO, '22b')],
  suzuki: [rule(RARO, 'cappuccino', 'swift sport', 'x-90')],
  tesla: [rule(RARO, 'plaid', 'roadster', 'cybertruck', 'semi')],
  toyota: [
    rule(RARO,
      'supra', 'celica gt-four', 'gt86', 'ae86', '86', 'mr2', 'mr-s', 'soarer', 'sera',
      word('gr(?![\\s-]*sport)(?:\\d{2}|[\\s-]+(?:yaris|corolla|supra|86))?')),
    rule(EXOTICO, '2000gt', 'gr010'),
  ],
  tvr: [rule(EXOTICO, 'speed 12')],
  vauxhall: [rule(RARO, 'vxr', 'vxr8', 'monaro')],
  volkswagen: [
    rule(RARO, 'gti', 'r', 'clubsport', 'r32', 'w12', 'vr6', 'g60', 'corrado', 'karmann ghia'),
    rule(EXOTICO, 'xl1'),
  ],
  volvo: [
    rule(RARO,
      'polestar', 't5-r', 't-5r', 'p1800', 'amazon', 'pv544', '242 turbo', '240 turbo', 'c30 t5',
      word('(?:850|v70|s60|v60|s40|v40|c30|xc70)[\\s-]*r(?![\\s-]*design)')),
  ],
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
