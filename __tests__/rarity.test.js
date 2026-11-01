import { calculateRarity } from '../src/utils/rarityEngine';

// [marca, modelo, raridade esperada]
describe('raridade pela marca', () => {
  test.each([
    ['Ferrari', '', 'Exótico'],
    ['Ferrari', 'Qualquer Modelo', 'Exótico'], // a marca é um mínimo: o modelo nunca baixa o nível
    ['Lamborghini', 'Huracán', 'Exótico'],
    ['McLaren', '720S', 'Exótico'],
    ['Bugatti', 'Chiron', 'Exótico'],
    ['Rolls-Royce', 'Ghost', 'Exótico'],
    ['Porsche', '', 'Raro'],
    ['Porsche', '911', 'Raro'],
    ['Maserati', 'Ghibli', 'Raro'],
    ['Toyota', 'Corolla', 'Comum'],
    ['Volkswagen', 'Polo', 'Comum'],
    ['Renault', 'Clio', 'Comum'],
    ['Marca Inventada', 'Modelo X', 'Comum'],
    ['', '', 'Comum'],
  ])('%s %s → %s', (brand, model, expected) => {
    expect(calculateRarity(brand, model)).toBe(expected);
  });
});

describe('o modelo pode subir o nível', () => {
  test.each([
    ['BMW', 'M3', 'Raro'],
    ['BMW', 'M5', 'Raro'],
    ['BMW', 'X5 M', 'Raro'],
    ['BMW', 'M1', 'Exótico'],
    ['BMW', 'Z8', 'Exótico'],
    ['Porsche', '918', 'Exótico'],
    ['Porsche', 'Carrera GT', 'Exótico'],
    ['Toyota', 'Supra', 'Raro'],
    ['Toyota', 'GR Yaris', 'Raro'],
    ['Toyota', '2000GT', 'Exótico'],
    ['Volkswagen', 'Golf GTI', 'Raro'],
    ['Volkswagen', 'Golf R', 'Raro'],
    ['Volkswagen', 'XL1', 'Exótico'],
    ['Subaru', 'Impreza WRX STI', 'Raro'],
    ['Mitsubishi', 'Lancer Evolution', 'Raro'],
    ['Mitsubishi', 'Lancer Evo X', 'Raro'],
    ['Abarth', '595 Competizione', 'Raro'],
    ['Ford', 'Focus RS', 'Raro'],
    ['Ford', 'Fiesta ST', 'Raro'],
    ['Ford', 'GT', 'Exótico'],
    ['Mercedes-Benz', 'A 45 AMG', 'Raro'],
    ['Hyundai', 'i30 N', 'Raro'],
    ['Kia', 'Stinger', 'Raro'],
  ])('%s %s → %s', (brand, model, expected) => {
    expect(calculateRarity(brand, model)).toBe(expected);
  });
});

describe('falsos positivos que as regras evitam', () => {
  test.each([
    ['BMW', '330i', 'Comum'],
    ['BMW', 'M340i', 'Comum'], // "M3" só conta como palavra inteira
    ['BMW', '320d M Sport', 'Comum'],
    ['Ford', 'Focus ST-Line', 'Comum'],
    ['Ford', 'Fiesta', 'Comum'],
    ['Hyundai', 'i30 N Line', 'Comum'],
    ['Hyundai', 'i30', 'Comum'],
    ['Kia', 'Ceed GT-Line', 'Comum'],
    ['Volkswagen', 'Golf R-Line', 'Comum'],
    ['Toyota', 'Yaris GR Sport', 'Comum'],
    ['Mercedes-Benz', 'A 180', 'Comum'],
    ['Subaru', 'Impreza', 'Comum'],
  ])('%s %s → %s', (brand, model, expected) => {
    expect(calculateRarity(brand, model)).toBe(expected);
  });
});

describe('normalização da entrada', () => {
  test('ignora maiúsculas, acentos e espaços à volta', () => {
    expect(calculateRarity('  FERRARI  ', '')).toBe('Exótico');
    expect(calculateRarity('bmw', 'm3')).toBe('Raro');
  });
  test('"Rolls-Royce", "rolls royce" e "ROLLSROYCE" são a mesma marca', () => {
    for (const b of ['Rolls-Royce', 'rolls royce', 'ROLLSROYCE']) {
      expect(calculateRarity(b, 'Phantom')).toBe('Exótico');
    }
  });
  test('apelidos como "VW" funcionam', () => {
    expect(calculateRarity('VW', 'Golf GTI')).toBe('Raro');
  });
  test('modelo em falta ou indefinido não rebenta', () => {
    expect(calculateRarity('BMW')).toBe('Comum');
    expect(calculateRarity('BMW', null)).toBe('Comum');
  });
});
