import { countryOfBrand } from '../data/carBrands';
import { norm } from './text';

export const NO_FILTERS = { rarity: null, year: null, country: null }; // null = Todas / Todos
export const FILTER_COUNTRIES = ['Alemanha', 'Itália', 'Japão', 'EUA', 'Reino Unido', 'França'];

// Intervalos de ano (as etiquetas estão nas traduções: filters.year.<chave>)
const YEAR_TESTS = {
  classic: (y) => y < 2000,
  y2000: (y) => y >= 2000 && y <= 2010,
  y2011: (y) => y >= 2011 && y <= 2020,
  y2021: (y) => y >= 2021,
};
export const YEAR_KEYS = Object.keys(YEAR_TESTS);

export const activeFilterCount = (f) => Object.values(f).filter(Boolean).length;

// Pesquisa em marca e modelo ao mesmo tempo, sem maiúsculas nem acentos. Cada palavra tem de
// aparecer em "marca modelo": "porsche 911", "911 porsche" e "PORSCHE" encontram o mesmo carro.
export const searchTerms = (query) => norm(query).split(/\s+/).filter(Boolean);
export const matchesQuery = (car, terms) => {
  if (!terms.length) return true;
  const haystack = norm(`${car.brand ?? ''} ${car.model ?? ''}`);
  return terms.every((term) => haystack.includes(term));
};

// O país é inferido pelo dicionário de marcas; só se a marca não estiver lá é que se usa o país guardado
export const countryOf = (car) => countryOfBrand(car.brand) ?? car.country ?? null;

export function matchesFilters(car, f) {
  if (f.rarity && car.rarity !== f.rarity) return false;
  if (f.country && countryOf(car) !== f.country) return false;
  if (f.year) {
    const y = Number(car.year);
    if (!y || !YEAR_TESTS[f.year](y)) return false; // carros sem ano ficam de fora deste filtro
  }
  return true;
}
