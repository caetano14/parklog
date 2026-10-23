import { canonicalBrand } from '../utils/brands';

// As 40 marcas que se podem escolher no formulário (nada de texto livre, para não haver
// "ferari"). Inclui todas as marcas do motor de raridade. O país alimenta o filtro da
// Caderneta e a sugestão de país no formulário. Para acrescentar uma marca: nova linha aqui.
export const CAR_BRANDS = [
  { name: 'Alfa Romeo', country: 'Itália' },
  { name: 'Alpine', country: 'França' },
  { name: 'Aston Martin', country: 'Reino Unido' },
  { name: 'Audi', country: 'Alemanha' },
  { name: 'Bentley', country: 'Reino Unido' },
  { name: 'BMW', country: 'Alemanha' },
  { name: 'Bugatti', country: 'França' },
  { name: 'Chevrolet', country: 'EUA' },
  { name: 'Citroën', country: 'França' },
  { name: 'Dodge', country: 'EUA' },
  { name: 'Ferrari', country: 'Itália' },
  { name: 'Fiat', country: 'Itália' },
  { name: 'Ford', country: 'EUA' },
  { name: 'Honda', country: 'Japão' },
  { name: 'Hyundai', country: 'Coreia do Sul' },
  { name: 'Jaguar', country: 'Reino Unido' },
  { name: 'Kia', country: 'Coreia do Sul' },
  { name: 'Koenigsegg', country: 'Suécia' },
  { name: 'Lamborghini', country: 'Itália' },
  { name: 'Lexus', country: 'Japão' },
  { name: 'Lotus', country: 'Reino Unido' },
  { name: 'Maserati', country: 'Itália' },
  { name: 'Mazda', country: 'Japão' },
  { name: 'McLaren', country: 'Reino Unido' },
  { name: 'Mercedes-Benz', country: 'Alemanha' },
  { name: 'Mitsubishi', country: 'Japão' },
  { name: 'Nissan', country: 'Japão' },
  { name: 'Opel', country: 'Alemanha' },
  { name: 'Pagani', country: 'Itália' },
  { name: 'Peugeot', country: 'França' },
  { name: 'Porsche', country: 'Alemanha' },
  { name: 'Renault', country: 'França' },
  { name: 'Rolls-Royce', country: 'Reino Unido' },
  { name: 'Seat', country: 'Espanha' },
  { name: 'Škoda', country: 'Chéquia' },
  { name: 'Subaru', country: 'Japão' },
  { name: 'Tesla', country: 'EUA' },
  { name: 'Toyota', country: 'Japão' },
  { name: 'Volkswagen', country: 'Alemanha' },
  { name: 'Volvo', country: 'Suécia' },
];

const BY_KEY = new Map(CAR_BRANDS.map((b) => [canonicalBrand(b.name), b]));

// País de origem de uma marca (tolera maiúsculas, espaços e apelidos como "VW"); null se não conhecer
export const countryOfBrand = (brand) => BY_KEY.get(canonicalBrand(brand))?.country ?? null;
