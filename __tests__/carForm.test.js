import { MIN_YEAR, deriveCar, normalizeCar, validateCarFields } from '../src/utils/carForm';

const t = (key, vars) => (vars ? `${key}:${vars.min}-${vars.max}` : key);
const NOW = new Date('2026-11-04');

describe('deriveCar', () => {
  test('marca da lista: o país vem da marca, mesmo que venha outro', () => {
    expect(deriveCar({ brand: 'Renault', model: 'Clio', country: 'Japão' })).toMatchObject({
      brandKnown: true, country: 'França',
    });
  });
  test('tolera maiúsculas, espaços e apelidos', () => {
    expect(deriveCar({ brand: '  bmw ', model: '' }).country).toBe('Alemanha');
    expect(deriveCar({ brand: 'VW', model: '' }).country).toBe('Alemanha');
  });
  test('marca desconhecida: usa o país escolhido', () => {
    expect(deriveCar({ brand: 'Marca Inventada', model: 'X', country: 'Portugal' })).toMatchObject({
      brandKnown: false, country: 'Portugal',
    });
  });
  test('marca desconhecida sem país escolhido fica vazio', () => {
    expect(deriveCar({ brand: 'Marca Inventada', model: '' }).country).toBe('');
  });
  test('a raridade vem sempre da marca e do modelo', () => {
    expect(deriveCar({ brand: 'Renault', model: 'Clio' }).rarity).toBe('Comum');
    expect(deriveCar({ brand: 'Ferrari', model: '' }).rarity).toBe('Exótico');
  });
  test('a raridade não depende do país escolhido', () => {
    expect(deriveCar({ brand: 'Marca Inventada', model: '', country: 'Itália' }).rarity).toBe('Comum');
  });
});

describe('validateCarFields', () => {
  test('marca é obrigatória', () => {
    expect(validateCarFields({ brand: '  ', year: '' }, t, NOW).brand).toBe('err.brand');
  });
  test('ano vazio é válido', () => {
    expect(validateCarFields({ brand: 'Audi', year: '' }, t, NOW)).toEqual({});
  });
  test('ano com 4 dígitos dentro do intervalo é válido', () => {
    expect(validateCarFields({ brand: 'Audi', year: '1999' }, t, NOW)).toEqual({});
    expect(validateCarFields({ brand: 'Audi', year: String(MIN_YEAR) }, t, NOW)).toEqual({});
    expect(validateCarFields({ brand: 'Audi', year: '2027' }, t, NOW)).toEqual({});
  });
  test('ano fora do intervalo ou mal formado é inválido', () => {
    expect(validateCarFields({ brand: 'Audi', year: '1700' }, t, NOW).year).toBe(`err.year:${MIN_YEAR}-2027`);
    expect(validateCarFields({ brand: 'Audi', year: '2028' }, t, NOW).year).toBeDefined();
    expect(validateCarFields({ brand: 'Audi', year: '99' }, t, NOW).year).toBeDefined();
  });
});

describe('normalizeCar', () => {
  test('recalcula país e raridade com as regras atuais e mantém o resto', () => {
    const car = { id: '1', createdAt: 5, photo: 'a.jpg', brand: 'Renault', model: 'Clio', year: '2010', country: 'Japão', rarity: 'Exótico' };
    expect(normalizeCar(car)).toEqual({ ...car, country: 'França', rarity: 'Comum' });
  });
  test('marca desconhecida mantém o país guardado', () => {
    expect(normalizeCar({ brand: 'Marca Inventada', model: '', country: 'Portugal', rarity: 'Raro' })).toMatchObject({
      country: 'Portugal', rarity: 'Comum',
    });
  });
  test('é idempotente', () => {
    const once = normalizeCar({ brand: 'Ferrari', model: '488', country: '', rarity: 'Comum' });
    expect(normalizeCar(once)).toEqual(once);
  });
  test('aguenta carros sem marca ou modelo', () => {
    expect(normalizeCar({ id: '2' })).toMatchObject({ id: '2', rarity: 'Comum' });
  });
});
