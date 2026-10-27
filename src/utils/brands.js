import { norm } from './text';

// Apelidos → chave canónica (a chave de uma marca é o nome sem acentos, espaços ou hífens)
const ALIASES = {
  vw: 'volkswagen',
  mercedesbenz: 'mercedes', mercedesamg: 'mercedes', mb: 'mercedes',
  mercedesmaybach: 'maybach',
  chevy: 'chevrolet',
  fiatabarth: 'abarth',
  dsautomobiles: 'ds', dsautomobile: 'ds',
  minicooper: 'mini',
  shelbyamerican: 'shelby',
  bydauto: 'byd',
  kgm: 'ssangyong', kgmobility: 'ssangyong',
  lynkandco: 'lynkco',
  rangerover: 'landrover',
  morrisgarages: 'mg',
};

// Chave única por marca, sem maiúsculas, acentos, espaços nem hífens:
// "Rolls-Royce", "rolls royce" e "ROLLSROYCE" dão todos "rollsroyce".
export const canonicalBrand = (brand) => {
  const key = norm(brand).replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
  return ALIASES[key] ?? key;
};
