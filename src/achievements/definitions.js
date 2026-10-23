import { canonicalBrand } from '../utils/brands';

const DAY = 86400000;

// Os carros antigos não têm createdAt: o id é um Date.now()
export const createdAt = (c) => c.createdAt ?? Number(c.id);

export const CATEGORIES = ['qty', 'brands', 'rarity', 'time', 'style'];

// Conjuntos das conquistas de marcas (ajusta à vontade)
const JAPAN = ['nissan', 'toyota', 'honda', 'mazda', 'subaru', 'mitsubishi', 'lexus', 'suzuki', 'infiniti', 'acura', 'datsun'];
const ITALY = ['alfaromeo', 'fiat', 'lancia', 'abarth', 'maserati', 'ferrari', 'lamborghini', 'pagani'];
const BRITISH = ['astonmartin', 'bentley', 'rollsroyce'];

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const bump = (o, k) => { o[k] = (o[k] ?? 0) + 1; };
const most = (o) => Math.max(0, ...Object.values(o));

// Resume a colecção em contadores; cada conquista é só uma comparação sobre estes números.
export function buildStats(cars, x) {
  const sorted = [...cars].sort((a, b) => createdAt(a) - createdAt(b));
  const year = new Date().getFullYear();
  const s = {
    total: cars.length, brands: {}, rarity: { Comum: 0, Raro: 0, Exótico: 0 },
    perDay: {}, perHour: {}, perWeekend: {}, rareDay: {}, exoticDay: {},
    daytime: 0, golden: 0, night: 0, dawn: 0, pure: 0, anon: 0, gps: 0,
    pre2000: 0, y2000s: 0, thisYear: 0, daily: 0, monopoly: 0, others: 0,
    photos: new Set(cars.map((c) => c.photo)).size,
    deleted: x.deleted, langChanges: x.langChanges, session: x.sessionAdds,
    ageDays: Math.floor((Date.now() - x.firstUseAt) / DAY),
  };
  const daily = canonicalBrand(x.dailyBrand);
  const dayStarts = [];
  let run = 0;
  let prev = null;

  for (const c of sorted) {
    const d = new Date(createdAt(c));
    const h = d.getHours();
    const dk = dayKey(d);
    const b = canonicalBrand(c.brand);
    const yr = Number(c.year);
    const dow = d.getDay();

    bump(s.brands, b);
    if (c.rarity in s.rarity) s.rarity[c.rarity] += 1;
    bump(s.perDay, dk);
    bump(s.perHour, `${dk}-${h}`);
    if (c.rarity === 'Exótico') bump(s.exoticDay, dk);
    if (c.rarity !== 'Comum') bump(s.rareDay, dk);
    if (dow === 6 || dow === 0) { // sábado e domingo do mesmo fim de semana partilham a chave do sábado
      bump(s.perWeekend, dayKey(dow === 6 ? d : new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)));
    }
    if (h >= 8 && h < 18) s.daytime += 1;
    if (h >= 18 && h < 20) s.golden += 1;
    if (h >= 20) s.night += 1;
    if (h >= 2 && h < 5) s.dawn += 1;
    if (c.brand && c.model && yr) s.pure += 1;
    if (c.brand && !c.model) s.anon += 1;
    if (c.location) s.gps += 1;
    if (yr && yr < 2000) s.pre2000 += 1;
    if (yr >= 2000 && yr <= 2010) s.y2000s += 1;
    if (yr === year) s.thisYear += 1;
    if (daily && b === daily) s.daily += 1;

    run = b === prev ? run + 1 : 1; // carros seguidos da mesma marca
    prev = b;
    s.monopoly = Math.max(s.monopoly, run);

    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (dayStarts[dayStarts.length - 1] !== start) dayStarts.push(start);
  }

  let streak = 0;
  s.streak = 0;
  dayStarts.forEach((t, i) => {
    streak = i && Math.round((t - dayStarts[i - 1]) / DAY) === 1 ? streak + 1 : 1;
    s.streak = Math.max(s.streak, streak);
  });
  s.brandsDistinct = Object.keys(s.brands).filter(Boolean).length;
  s.triple = sorted.some((c, i) => { // Comum + Raro + Exótico dentro de 24 h
    const kinds = new Set();
    for (let j = i; j < sorted.length && createdAt(sorted[j]) - createdAt(c) <= DAY; j++) kinds.add(sorted[j].rarity);
    return kinds.size >= 3;
  });
  return s;
}

// Cada teste devolve [valor atual, objectivo]
const n = (get, target) => (s) => [get(s), target];
const total = (target) => n((s) => s.total, target);
const fromBrands = (keys, target) => n((s) => keys.reduce((sum, k) => sum + (s.brands[k] ?? 0), 0), target);
const rarity = (name, target) => n((s) => s.rarity[name], target);

// [categoria, ícone, título PT, descrição PT, título EN, descrição EN, teste]
// A ordem define o id (1-50): não reordenar, para não trocar as conquistas já desbloqueadas.
const ROWS = [
  ['qty', 'flag', 'O Primeiro Registo', 'Adiciona o teu 1.º carro.', 'First Entry', 'Add your 1st car.', total(1)],
  ['qty', 'car-sport', 'Coleccionador Amador', 'Regista 10 carros.', 'Amateur Collector', 'Register 10 cars.', total(10)],
  ['qty', 'albums', 'Garagem Cheia', 'Regista 25 carros.', 'Full Garage', 'Register 25 cars.', total(25)],
  ['qty', 'car', 'Frota Privada', 'Regista 50 carros.', 'Private Fleet', 'Register 50 cars.', total(50)],
  ['qty', 'trophy', 'O Jay Leno Português', 'Regista 100 carros.', 'The Portuguese Jay Leno', 'Register 100 cars.', total(100)],
  ['qty', 'library', 'A Enciclopédia', 'Regista 250 carros.', 'The Encyclopedia', 'Register 250 cars.', total(250)],

  ['brands', 'construct', 'Engenharia Bávara', '5 BMWs na colecção.', 'Bavarian Engineering', '5 BMWs in your collection.', fromBrands(['bmw'], 5)],
  ['brands', 'speedometer', 'Especialista de Estugarda', '3 Porsches.', 'Stuttgart Specialist', '3 Porsches.', fromBrands(['porsche'], 3)],
  ['brands', 'star', 'O Sonho Americano', '3 Fords.', 'The American Dream', '3 Fords.', fromBrands(['ford'], 3)],
  ['brands', 'flame', 'Cavallino Rampante', '2 Ferraris.', 'Cavallino Rampante', '2 Ferraris.', fromBrands(['ferrari'], 2)],
  ['brands', 'flash', 'Touro Enraivecido', '2 Lamborghinis.', 'Raging Bull', '2 Lamborghinis.', fromBrands(['lamborghini'], 2)],
  ['brands', 'ellipse', 'O Senhor dos Anéis', '5 Audis.', 'Lord of the Rings', '5 Audis.', fromBrands(['audi'], 5)],
  ['brands', 'sparkles', 'Estrela de Prata', '5 Mercedes-Benz.', 'Silver Star', '5 Mercedes-Benz.', fromBrands(['mercedes'], 5)],
  ['brands', 'globe', 'JDM Fanboy', '5 carros de marcas japonesas.', 'JDM Fanboy', '5 cars from Japanese brands.', fromBrands(JAPAN, 5)],
  ['brands', 'rocket', 'Hot Hatch Boss', '3 Volkswagens.', 'Hot Hatch Boss', '3 Volkswagens.', fromBrands(['volkswagen'], 3)],
  ['brands', 'wine', 'Sangue Italiano', '5 carros italianos.', 'Italian Blood', '5 Italian cars.', fromBrands(ITALY, 5)],
  ['brands', 'barbell', 'Muscle Car Vibe', '2 Dodges.', 'Muscle Car Vibe', '2 Dodges.', fromBrands(['dodge'], 2)],
  ['brands', 'ribbon', 'Elite Britânica', '3 Aston Martin, Bentley ou Rolls-Royce.', 'British Elite', '3 Aston Martin, Bentley or Rolls-Royce.', fromBrands(BRITISH, 3)],
  ['brands', 'earth', 'Diversidade Cultural', 'Regista 10 marcas diferentes.', 'Cultural Diversity', 'Register 10 different brands.', n((s) => s.brandsDistinct, 10)],
  ['brands', 'link', 'Monopólio Automóvel', '10 carros seguidos da mesma marca.', 'Car Monopoly', '10 cars in a row from the same brand.', n((s) => s.monopoly, 10)],

  ['rarity', 'medal', 'O Primeiro Raro', 'Regista o teu 1.º carro Raro.', 'First Rare', 'Register your 1st Rare car.', rarity('Raro', 1)],
  ['rarity', 'diamond', 'O Primeiro Exótico', 'Regista o teu 1.º carro Exótico.', 'First Exotic', 'Register your 1st Exotic car.', rarity('Exótico', 1)],
  ['rarity', 'ribbon', 'Caçador de Prata', '10 carros Raros no total.', 'Silver Hunter', '10 Rare cars in total.', rarity('Raro', 10)],
  ['rarity', 'trophy', 'Caçador de Ouro', '10 carros Exóticos no total.', 'Gold Hunter', '10 Exotic cars in total.', rarity('Exótico', 10)],
  ['rarity', 'eye', 'Olho Clínico', '2 Exóticos registados no mesmo dia.', 'Sharp Eye', '2 Exotics registered on the same day.', n((s) => most(s.exoticDay), 2)],
  ['rarity', 'layers', 'Tripla Ameaça', 'Um Comum, um Raro e um Exótico em 24 horas.', 'Triple Threat', 'A Common, a Rare and an Exotic within 24 hours.', (s) => [s.triple ? 1 : 0, 1]],
  ['rarity', 'ticket', 'Dia de Sorte', '3 Raros ou Exóticos no mesmo dia.', 'Lucky Day', '3 Rares or Exotics on the same day.', n((s) => most(s.rareDay), 3)],
  ['rarity', 'shield', 'Lenda da Garagem', '25 carros Raros ou Exóticos no total.', 'Garage Legend', '25 Rare or Exotic cars in total.', n((s) => s.rarity.Raro + s.rarity.Exótico, 25)],

  ['time', 'hammer', 'Trabalhador Árduo', '1 carro por dia durante uma semana.', 'Hard Worker', '1 car a day for a week.', n((s) => s.streak, 7)],
  ['time', 'calendar', 'Fim de Semana Produtivo', '5 carros entre sábado e domingo.', 'Productive Weekend', '5 cars between Saturday and Sunday.', n((s) => most(s.perWeekend), 5)],
  ['time', 'sunny', 'Spotter Diurno', '10 carros entre as 08h e as 18h.', 'Daytime Spotter', '10 cars between 8am and 6pm.', n((s) => s.daytime, 10)],
  ['time', 'moon', 'Spotter Nocturno', '10 carros depois das 20h.', 'Night Spotter', '10 cars after 8pm.', n((s) => s.night, 10)],
  ['time', 'cafe', 'Insónia Automóvel', '1 carro de madrugada (02h–05h).', 'Car Insomnia', '1 car in the small hours (2–5am).', n((s) => s.dawn, 1)],
  ['time', 'camera', 'Frenesi Fotográfico', '3 carros na mesma hora.', 'Photo Frenzy', '3 cars within the same hour.', n((s) => most(s.perHour), 3)],
  ['time', 'rocket', 'Caçada Épica', '10 carros num único dia.', 'Epic Hunt', '10 cars in a single day.', n((s) => most(s.perDay), 10)],
  ['time', 'partly-sunny', 'Hora Dourada', '5 carros entre as 18h e as 20h.', 'Golden Hour', '5 cars between 6pm and 8pm.', n((s) => s.golden, 5)],
  ['time', 'hourglass', 'Olheiro Veterano', 'Usa a app durante 6 meses.', 'Veteran Scout', 'Use the app for 6 months.', n((s) => s.ageDays, 182)],
  ['time', 'infinite', 'Dedicação Absoluta', 'Completa 1 ano de colecção.', 'Absolute Dedication', 'Reach 1 year of collecting.', n((s) => s.ageDays, 365)],

  ['style', 'checkmark-done', 'Purista', '5 carros com marca, modelo e ano.', 'Purist', '5 cars with brand, model and year.', n((s) => s.pure, 5)],
  ['style', 'person', 'Anónimo', '5 carros só com a marca.', 'Anonymous', '5 cars with only the brand.', n((s) => s.anon, 5)],
  ['style', 'time', 'Dinossauro', 'Um carro anterior a 2000.', 'Dinosaur', 'A car made before 2000.', n((s) => s.pre2000, 1)],
  ['style', 'speedometer', 'Clássico Moderno', 'Um carro de 2000 a 2010.', 'Modern Classic', 'A car from 2000 to 2010.', n((s) => s.y2000s, 1)],
  ['style', 'timer', 'Máquina do Tempo', 'Um carro do ano corrente.', 'Time Machine', 'A car from the current year.', n((s) => s.thisYear, 1)],
  ['style', 'images', 'Paparazzi de Motores', '50 fotografias únicas.', 'Motor Paparazzi', '50 unique photos.', n((s) => s.photos, 50)],
  ['style', 'trash', 'O Limpador', 'Apaga um carro da caderneta.', 'The Cleaner', 'Delete a car from your collection.', n((s) => s.deleted, 1)],
  ['style', 'language', 'Indeciso', 'Muda o idioma 3 vezes.', 'Indecisive', 'Change the language 3 times.', n((s) => s.langChanges, 3)],
  ['style', 'locate', 'Foco Implacável', '3 carros seguidos sem fechar a app.', 'Relentless Focus', '3 cars in a row without closing the app.', n((s) => s.session, 3)],
  ['style', 'build', 'Mecânico de Bancada', 'Regista um carro da marca do teu carro do dia a dia (Perfil).', 'Bench Mechanic', "Register a car from your daily car's brand (Profile).", n((s) => s.daily, 1)],
  ['style', 'map', 'Cartógrafo', '5 carros com localização GPS.', 'Cartographer', '5 cars with a GPS location.', n((s) => s.gps, 5)],
  ['style', 'key', 'A Máquina Definitiva', 'Desbloqueia todas as outras conquistas.', 'The Ultimate Machine', 'Unlock every other achievement.', n((s) => s.others, 49)],
];

export const ACHIEVEMENTS = ROWS.map((r, i) => ({
  id: i + 1, cat: r[0], icon: r[1], pt: { title: r[2], desc: r[3] }, en: { title: r[4], desc: r[5] }, test: r[6],
}));

// Devolve { [id]: { value, target, unlocked } }. Quem já estava desbloqueado continua
// desbloqueado, mesmo que depois apagues carros.
export function evaluate(cars, extras, unlocked = {}) {
  const s = buildStats(cars, extras);
  const res = {};
  ACHIEVEMENTS.forEach((a) => {
    if (a.id === ACHIEVEMENTS.length) s.others = Object.values(res).filter((r) => r.unlocked).length;
    const [value, target] = a.test(s);
    res[a.id] = { value: Math.min(value, target), target, unlocked: !!unlocked[a.id] || value >= target };
  });
  return res;
}
