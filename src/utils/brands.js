import { norm } from './text';

const ALIASES = { vw: 'volkswagen', mercedesbenz: 'mercedes', mercedesamg: 'mercedes', mb: 'mercedes', chevy: 'chevrolet' };

// Chave única por marca, sem maiúsculas, acentos, espaços nem hífens:
// "Rolls-Royce", "rolls royce" e "ROLLSROYCE" dão todos "rollsroyce".
export const canonicalBrand = (brand) => {
  const key = norm(brand).replace(/[^a-z0-9]/g, '');
  return ALIASES[key] ?? key;
};
