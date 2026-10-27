import { canonicalBrand } from '../utils/brands';
import { norm } from '../utils/text';

// Marcas que se podem escolher no formulário (com pesquisa). O país alimenta o filtro da
// Caderneta e a sugestão de país no formulário. Para acrescentar uma marca: escreve o nome
// na lista do país certo (o país tem de existir em COUNTRIES, em constants.js).
// A lista é ordenada sozinha; se faltar uma marca, o formulário também deixa usar outra.
const G = (country, names) => names.map((name) => ({ name, country }));

const LIST = [
  ...G('Alemanha', [
    'Alpina', 'Audi', 'BMW', 'Brabus', 'Maybach', 'Mercedes-Benz', 'Opel', 'Porsche', 'Ruf', 'Smart', 'Trabant', 'Volkswagen',
  ]),
  ...G('Itália', [
    'Abarth', 'Alfa Romeo', 'De Tomaso', 'Ferrari', 'Fiat', 'Lamborghini', 'Lancia', 'Maserati', 'Pagani',
  ]),
  ...G('Reino Unido', [
    'AC', 'Ariel', 'Aston Martin', 'Austin', 'Bentley', 'Caterham', 'DeLorean', 'Jaguar', 'Land Rover', 'Lotus', 'McLaren',
    'MG', 'Mini', 'Morgan', 'Noble', 'Radical', 'Rolls-Royce', 'Rover', 'Triumph', 'TVR', 'Vauxhall',
  ]),
  ...G('França', ['Alpine', 'Bugatti', 'Citroën', 'DS', 'Peugeot', 'Renault']),
  ...G('Espanha', ['Cupra', 'Seat']),
  ...G('Chéquia', ['Škoda']),
  ...G('Suécia', ['Koenigsegg', 'Polestar', 'Saab', 'Volvo']),
  ...G('Roménia', ['Dacia']),
  ...G('Países Baixos', ['Spyker']),
  ...G('Croácia', ['Rimac']),
  ...G('Dinamarca', ['Zenvo']),
  ...G('Portugal', ['UMM']),
  ...G('EUA', [
    'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Fisker', 'Ford', 'GMC', 'Hennessey', 'Hummer', 'Jeep', 'Lincoln',
    'Lucid', 'Mercury', 'Oldsmobile', 'Plymouth', 'Pontiac', 'Ram', 'Rivian', 'Saleen', 'Shelby', 'SSC', 'Tesla',
  ]),
  ...G('Japão', [
    'Acura', 'Daihatsu', 'Datsun', 'Honda', 'Infiniti', 'Isuzu', 'Lexus', 'Mazda', 'Mitsubishi', 'Nissan', 'Subaru', 'Suzuki', 'Toyota',
  ]),
  ...G('Coreia do Sul', ['Daewoo', 'Genesis', 'Hyundai', 'Kia', 'SsangYong']),
  ...G('China', [
    'BYD', 'Chery', 'Geely', 'Great Wall', 'Haval', 'Hongqi', 'Li Auto', 'Lynk & Co', 'Nio', 'Xpeng', 'Zeekr',
  ]),
  ...G('Índia', ['Mahindra', 'Tata']),
  ...G('Rússia', ['Lada']),
  ...G('Austrália', ['Holden']),
];

export const CAR_BRANDS = LIST.sort((a, b) => {
  const x = norm(a.name);
  const y = norm(b.name);
  return x < y ? -1 : x > y ? 1 : 0;
});

const BY_KEY = new Map(CAR_BRANDS.map((b) => [canonicalBrand(b.name), b]));

// Marca da lista (tolera maiúsculas, espaços e apelidos como "VW"); null se não conhecer
export const findBrand = (brand) => BY_KEY.get(canonicalBrand(brand)) ?? null;

// País de origem de uma marca; null se não conhecer
export const countryOfBrand = (brand) => findBrand(brand)?.country ?? null;
