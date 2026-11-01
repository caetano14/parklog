import { ACHIEVEMENTS, evaluate } from '../src/achievements/definitions';

const extras = { deleted: 0, langChanges: 0, sessionAdds: 0, firstUseAt: Date.now(), dailyBrand: '' };
const car = (i, over = {}) => ({
  id: String(1700000000000 + i), createdAt: 1700000000000 + i * 1000, photo: `p${i}.jpg`,
  brand: 'Toyota', model: 'Corolla', year: '2010', rarity: 'Comum', location: null, ...over,
});

describe('definições', () => {
  test('há 50 conquistas com ids 1 a 50, sem saltos nem repetidos', () => {
    expect(ACHIEVEMENTS).toHaveLength(50);
    ACHIEVEMENTS.forEach((a, i) => expect(a.id).toBe(i + 1));
  });
  test('todas têm título e descrição nos dois idiomas', () => {
    for (const a of ACHIEVEMENTS) {
      for (const lang of ['pt', 'en']) {
        expect(a[lang].title.length).toBeGreaterThan(0);
        expect(a[lang].desc.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('evaluate', () => {
  test('sem carros não desbloqueia nada', () => {
    const res = evaluate([], extras);
    expect(Object.values(res).filter((r) => r.unlocked)).toHaveLength(0);
  });
  test('o primeiro carro desbloqueia "O Primeiro Registo"', () => {
    expect(evaluate([car(1)], extras)[1].unlocked).toBe(true);
  });
  test('o valor nunca passa do objetivo', () => {
    const cars = Array.from({ length: 30 }, (_, i) => car(i));
    for (const r of Object.values(evaluate(cars, extras))) {
      expect(r.value).toBeLessThanOrEqual(r.target);
    }
  });
  test('10 carros desbloqueiam a conquista dos 10, 9 não', () => {
    const nine = Array.from({ length: 9 }, (_, i) => car(i));
    expect(evaluate(nine, extras)[2].unlocked).toBe(false);
    expect(evaluate([...nine, car(9)], extras)[2].unlocked).toBe(true);
  });
  test('quem já desbloqueou continua desbloqueado depois de apagar os carros', () => {
    expect(evaluate([], extras, { 1: Date.now() })[1].unlocked).toBe(true);
  });
});
