import { CAR_BRANDS, countryOfBrand, findBrand } from '../src/data/carBrands';
import { CAR_MODELS, modelSuggestions } from '../src/data/carModels';
import { canonicalBrand } from '../src/utils/brands';
import { matchesFilters, matchesQuery, searchTerms } from '../src/utils/filters';
import { norm } from '../src/utils/text';

describe('norm e canonicalBrand', () => {
  test('norm tira acentos e maiúsculas', () => {
    expect(norm('  Citroën  ')).toBe('citroen');
    expect(norm(null)).toBe('');
  });
  test.each([
    ['Rolls-Royce', 'rollsroyce'],
    ['rolls royce', 'rollsroyce'],
    ['VW', 'volkswagen'],
    ['Mercedes-Benz', 'mercedes'],
    ['Mercedes-AMG', 'mercedes'],
    ['Fiat Abarth', 'abarth'],
    ['Land Rover', 'landrover'],
    ['Range Rover', 'landrover'],
  ])('%s → %s', (input, key) => {
    expect(canonicalBrand(input)).toBe(key);
  });
});

describe('listas de marcas e modelos', () => {
  test('tem as marcas esperadas, sem repetidas', () => {
    expect(CAR_BRANDS.length).toBeGreaterThanOrEqual(100);
    const keys = CAR_BRANDS.map((b) => canonicalBrand(b.name));
    expect(new Set(keys).size).toBe(keys.length);
  });
  test('findBrand tolera maiúsculas, espaços e apelidos', () => {
    expect(findBrand('abarth').name).toBe('Abarth');
    expect(findBrand('vw').name).toBe('Volkswagen');
    expect(findBrand('marca inventada')).toBeNull();
  });
  test('countryOfBrand', () => {
    expect(countryOfBrand('Abarth')).toBe('Itália');
    expect(countryOfBrand('Toyota')).toBe('Japão');
    expect(countryOfBrand('Marca Inventada')).toBeNull();
  });
  test('toda a marca com modelos existe na lista de marcas', () => {
    for (const brand of Object.keys(CAR_MODELS)) {
      expect(findBrand(brand)).not.toBeNull();
    }
  });
});

describe('modelSuggestions', () => {
  test('com o campo vazio mostra os mais conhecidos', () => {
    const s = modelSuggestions('BMW', '');
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(6);
  });
  test('marca desconhecida não sugere nada', () => {
    expect(modelSuggestions('Marca Inventada', 'M3')).toEqual([]);
  });
  test('ignora acentos, espaços e pontuação ("serie3" encontra "Série 3")', () => {
    expect(modelSuggestions('BMW', 'serie3')).toContain('Série 3');
  });
  test('não volta a sugerir o texto exato, mas sugere variantes', () => {
    const s = modelSuggestions('BMW', 'M3');
    expect(s).not.toContain('M3');
    expect(s).toContain('M3 Competition');
  });
  test('respeita o limite', () => {
    expect(modelSuggestions('BMW', 'M', 3).length).toBeLessThanOrEqual(3);
  });
});

describe('pesquisa e filtros', () => {
  const porsche = { brand: 'Porsche', model: '911 Carrera', year: '2005', rarity: 'Raro', country: 'Alemanha' };
  const clio = { brand: 'Renault', model: 'Clio', year: '', rarity: 'Comum', country: 'França' };

  test('qualquer ordem e sem acentos encontra o mesmo carro', () => {
    for (const q of ['porsche 911', '911 porsche', 'PORSCHE', 'carrera']) {
      expect(matchesQuery(porsche, searchTerms(q))).toBe(true);
    }
    expect(matchesQuery(porsche, searchTerms('ferrari'))).toBe(false);
  });
  test('pesquisa vazia aceita tudo', () => {
    expect(matchesQuery(clio, searchTerms('   '))).toBe(true);
  });
  test('filtro de raridade', () => {
    expect(matchesFilters(porsche, { rarity: 'Raro' })).toBe(true);
    expect(matchesFilters(clio, { rarity: 'Raro' })).toBe(false);
  });
  test('filtro de país usa o país da marca', () => {
    expect(matchesFilters(porsche, { country: 'Alemanha' })).toBe(true);
    expect(matchesFilters(porsche, { country: 'Japão' })).toBe(false);
  });
  test('filtro de ano e carros sem ano', () => {
    expect(matchesFilters(porsche, { year: 'y2000' })).toBe(true);
    expect(matchesFilters(porsche, { year: 'classic' })).toBe(false);
    expect(matchesFilters(clio, { year: 'y2000' })).toBe(false); // sem ano fica de fora
    expect(matchesFilters(clio, {})).toBe(true);
  });
});
