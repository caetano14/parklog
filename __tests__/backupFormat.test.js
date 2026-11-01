import { BACKUP_VERSION, carsFromBackup, safeName, sanitizeCar } from '../src/utils/backupFormat';

const valid = (over = {}) => ({
  id: '1700000000000', createdAt: 1700000000000, photo: 'car_1.jpg', brand: 'BMW', model: 'M3',
  year: '2016', country: 'Alemanha', rarity: 'Raro', location: { latitude: 38.7, longitude: -9.1 }, ...over,
});

describe('safeName (o ficheiro importado não é de confiança)', () => {
  test('mantém nomes normais', () => {
    expect(safeName('car_123.jpg')).toBe('car_123.jpg');
  });
  test('não deixa barras nem pontos no início (path traversal)', () => {
    const n = safeName('../../etc/passwd');
    expect(n).not.toContain('/');
    expect(n.startsWith('.')).toBe(false);
  });
  test('troca caracteres estranhos por _', () => {
    expect(safeName('foto bonita (1).jpg')).toBe('foto_bonita__1_.jpg');
  });
  test('valores que não são texto dão vazio', () => {
    expect(safeName(undefined)).toBe('');
    expect(safeName(42)).toBe('');
  });
  test('corta nomes muito compridos', () => {
    expect(safeName('a'.repeat(500)).length).toBeLessThanOrEqual(120);
  });
});

describe('sanitizeCar', () => {
  test('um carro válido passa quase igual', () => {
    expect(sanitizeCar(valid())).toEqual(valid());
  });
  test.each([[null], [undefined], ['texto'], [42], [{}]])('%p → null', (raw) => {
    expect(sanitizeCar(raw)).toBeNull();
  });
  test('exige id e marca', () => {
    expect(sanitizeCar(valid({ id: '' }))).toBeNull();
    expect(sanitizeCar(valid({ brand: '   ' }))).toBeNull();
    expect(sanitizeCar(valid({ id: undefined }))).toBeNull();
  });
  test('deita fora campos desconhecidos', () => {
    const out = sanitizeCar(valid({ hack: 'x', __proto__: { admin: true }, onClick: 'alert(1)' }));
    expect(out).not.toHaveProperty('hack');
    expect(out).not.toHaveProperty('onClick');
  });
  test('corta textos a 80 caracteres e tira espaços', () => {
    expect(sanitizeCar(valid({ brand: '  BMW  ' })).brand).toBe('BMW');
    expect(sanitizeCar(valid({ model: 'x'.repeat(300) })).model).toHaveLength(80);
  });
  test('raridade desconhecida vira "Comum"', () => {
    expect(sanitizeCar(valid({ rarity: 'Lendário' })).rarity).toBe('Comum');
    expect(sanitizeCar(valid({ rarity: 'Exótico' })).rarity).toBe('Exótico');
  });
  test('ano só é aceite com 4 dígitos', () => {
    expect(sanitizeCar(valid({ year: '2016' })).year).toBe('2016');
    expect(sanitizeCar(valid({ year: '16' })).year).toBe('');
    expect(sanitizeCar(valid({ year: 'abcd' })).year).toBe('');
    expect(sanitizeCar(valid({ year: 2016 })).year).toBe('2016'); // um número também serve, e fica em texto
  });
  test('localização só com coordenadas numéricas finitas', () => {
    expect(sanitizeCar(valid({ location: { latitude: 10, longitude: 20 } })).location).toEqual({ latitude: 10, longitude: 20 });
    expect(sanitizeCar(valid({ location: { latitude: '10', longitude: 20 } })).location).toBeNull();
    expect(sanitizeCar(valid({ location: { latitude: NaN, longitude: 20 } })).location).toBeNull();
    expect(sanitizeCar(valid({ location: { latitude: Infinity, longitude: 20 } })).location).toBeNull();
    expect(sanitizeCar(valid({ location: null })).location).toBeNull();
    expect(sanitizeCar(valid({ location: undefined })).location).toBeNull();
  });
  test('sem createdAt usa o id (carros antigos)', () => {
    expect(sanitizeCar(valid({ createdAt: undefined, id: '1600000000000' })).createdAt).toBe(1600000000000);
  });
});

describe('carsFromBackup', () => {
  const KEY = '@parklog/cars';
  test('aceita uma cópia do ParkLog', () => {
    const list = [valid()];
    expect(carsFromBackup({ app: 'ParkLog', version: BACKUP_VERSION, data: { [KEY]: list } }, KEY)).toEqual(list);
  });
  test('recusa ficheiros de outras apps ou sem lista de carros', () => {
    expect(carsFromBackup({ app: 'Outra', data: { [KEY]: [] } }, KEY)).toBeNull();
    expect(carsFromBackup({ app: 'ParkLog', data: {} }, KEY)).toBeNull();
    expect(carsFromBackup({ app: 'ParkLog', data: { [KEY]: 'não é lista' } }, KEY)).toBeNull();
    expect(carsFromBackup(null, KEY)).toBeNull();
    expect(carsFromBackup(undefined, KEY)).toBeNull();
  });
});
