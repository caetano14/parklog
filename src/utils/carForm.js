import { countryOfBrand, findBrand } from '../data/carBrands';
import { calculateRarity } from './rarityEngine';

export const MIN_YEAR = 1886;

// País e raridade nunca se escolhem à mão com uma marca da lista: o país vem da marca e a
// raridade da marca e do modelo. O país escolhido só conta quando a marca não é reconhecida.
export function deriveCar({ brand, model, country }) {
  const b = String(brand ?? '').trim();
  const known = Boolean(findBrand(b));
  return {
    brandKnown: known,
    country: known ? (countryOfBrand(b) ?? '') : (country ?? ''),
    rarity: calculateRarity(b, String(model ?? '').trim()),
  };
}

// Erros do formulário (marca obrigatória, ano opcional mas válido). `t` traduz as mensagens.
export function validateCarFields({ brand, year }, t, now = new Date()) {
  const errors = {};
  const y = String(year ?? '').trim();
  const maxYear = now.getFullYear() + 1;
  if (!String(brand ?? '').trim()) errors.brand = t('err.brand');
  if (y && (!/^\d{4}$/.test(y) || +y < MIN_YEAR || +y > maxYear)) {
    errors.year = t('err.year', { min: MIN_YEAR, max: maxYear });
  }
  return errors;
}

// País e raridade de um carro já guardado (ou importado), recalculados com as regras atuais.
// Idempotente: aplicá-la duas vezes dá o mesmo resultado.
export function normalizeCar(car) {
  const { country, rarity } = deriveCar({ brand: car.brand, model: car.model, country: car.country });
  return { ...car, country, rarity };
}
