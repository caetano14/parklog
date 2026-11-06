import { parseStoredCars } from '../src/utils/storedCars';

describe('parseStoredCars', () => {
  test('sem nada guardado (primeira abertura) dá lista vazia e não é corrupto', () => {
    expect(parseStoredCars(null)).toEqual({ cars: [], corrupt: false });
    expect(parseStoredCars(undefined)).toEqual({ cars: [], corrupt: false });
  });
  test('lista válida', () => {
    const cars = [{ id: '1', brand: 'Audi' }];
    expect(parseStoredCars(JSON.stringify(cars))).toEqual({ cars, corrupt: false });
  });
  test('lista vazia guardada não é corrupta', () => {
    expect(parseStoredCars('[]')).toEqual({ cars: [], corrupt: false });
  });
  test('JSON partido é corrupto', () => {
    expect(parseStoredCars('[{"id":"1","brand":')).toEqual({ cars: [], corrupt: true });
  });
  test('JSON válido mas que não é uma lista é corrupto', () => {
    expect(parseStoredCars('{"id":"1"}').corrupt).toBe(true);
    expect(parseStoredCars('"texto"').corrupt).toBe(true);
    expect(parseStoredCars('42').corrupt).toBe(true);
  });
  test('texto vazio é corrupto (existe, mas não se lê)', () => {
    expect(parseStoredCars('').corrupt).toBe(true);
  });
  test('descarta entradas que não são objetos', () => {
    expect(parseStoredCars('[null, 3, "x", [], {"id":"1"}]').cars).toEqual([{ id: '1' }]);
  });
});
