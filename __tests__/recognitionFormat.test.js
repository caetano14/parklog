import { normalizeRecognition, yearOptions } from '../src/services/recognitionFormat';

const car = (over = {}) => ({ isCar: true, brand: 'BMW', model: 'M3', yearFrom: 2014, yearTo: 2018, confidence: 'high', ...over });

describe('normalizeRecognition: respostas inválidas', () => {
  test.each([[null], [undefined], ['texto'], [42], [{}], [{ isCar: 'sim' }], [[]]])('%p → null', (raw) => {
    expect(normalizeRecognition(raw)).toBeNull();
  });
  test('sem carro devolve só isCar: false', () => {
    expect(normalizeRecognition({ isCar: false, brand: 'Ignorada' })).toEqual({ isCar: false });
  });
});

describe('normalizeRecognition: marca e modelo', () => {
  test('marca da lista fica reconhecida', () => {
    const r = normalizeRecognition(car());
    expect(r.isCar).toBe(true);
    expect(r.brand).toBe('BMW');
    expect(r.model).toBe('M3');
  });
  test('compara a marca pela forma canónica', () => {
    expect(normalizeRecognition(car({ brand: 'mercedes benz' })).brand).toBe('Mercedes-Benz');
  });
  test('marca fora da lista: brand fica null e o texto é guardado', () => {
    const r = normalizeRecognition(car({ brand: 'Marca Inventada' }));
    expect(r.brand).toBeNull();
    expect(r.brandText).toBe('Marca Inventada');
  });
  test('tira a marca do início do modelo ("BMW M3" → "M3")', () => {
    expect(normalizeRecognition(car({ model: 'BMW M3' })).model).toBe('M3');
  });
  test('limpa espaços e corta textos muito compridos', () => {
    expect(normalizeRecognition(car({ model: '  M3    Competition ' })).model).toBe('M3 Competition');
    expect(normalizeRecognition(car({ model: 'x'.repeat(200) })).model).toHaveLength(40);
  });
  test('valores que não são texto viram vazio', () => {
    expect(normalizeRecognition(car({ model: 123 })).model).toBe('');
  });
});

describe('normalizeRecognition: anos', () => {
  test('mantém um intervalo válido', () => {
    const r = normalizeRecognition(car({ yearFrom: 2014, yearTo: 2018 }));
    expect([r.yearFrom, r.yearTo]).toEqual([2014, 2018]);
  });
  test('troca anos invertidos', () => {
    const r = normalizeRecognition(car({ yearFrom: 2018, yearTo: 2014 }));
    expect([r.yearFrom, r.yearTo]).toEqual([2014, 2018]);
  });
  test('com um só ano, usa-o nos dois', () => {
    expect(normalizeRecognition(car({ yearFrom: 2016, yearTo: null })).yearTo).toBe(2016);
    expect(normalizeRecognition(car({ yearFrom: null, yearTo: 2016 })).yearFrom).toBe(2016);
  });
  test('descarta intervalos com mais de 15 anos', () => {
    const r = normalizeRecognition(car({ yearFrom: 1990, yearTo: 2020 }));
    expect([r.yearFrom, r.yearTo]).toEqual([null, null]);
  });
  test('descarta anos impossíveis', () => {
    const r = normalizeRecognition(car({ yearFrom: 1700, yearTo: 3000 }));
    expect([r.yearFrom, r.yearTo]).toEqual([null, null]);
  });
  test('descarta anos que não são números inteiros', () => {
    expect(normalizeRecognition(car({ yearFrom: 2014.5, yearTo: 'abc' })).yearFrom).toBeNull();
  });
});

describe('normalizeRecognition: confiança', () => {
  test.each(['high', 'medium', 'low'])('aceita "%s"', (c) => {
    expect(normalizeRecognition(car({ confidence: c })).confidence).toBe(c);
  });
  test.each([['certeza'], [undefined], [5]])('valor inválido %p vira "low"', (c) => {
    expect(normalizeRecognition(car({ confidence: c })).confidence).toBe('low');
  });
});

describe('yearOptions', () => {
  test('intervalo curto dá um botão por ano', () => {
    expect(yearOptions({ yearFrom: 2014, yearTo: 2016 })).toEqual([2014, 2015, 2016]);
  });
  test('intervalo largo (mais de 7 anos) não dá opções', () => {
    expect(yearOptions({ yearFrom: 2000, yearTo: 2010 })).toEqual([]);
  });
  test('sem anos ou sem dados não dá opções', () => {
    expect(yearOptions({ yearFrom: null, yearTo: null })).toEqual([]);
    expect(yearOptions(null)).toEqual([]);
  });
});
