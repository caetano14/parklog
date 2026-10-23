export const BACKUP_VERSION = 2;

const RARITIES = ['Comum', 'Raro', 'Exótico'];
const text = (v, max = 80) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Nome de ficheiro seguro: o ficheiro importado não é de confiança
export const safeName = (name) => text(name, 120).replace(/[^\w.-]/g, '_').replace(/^\.+/, '');

// Valida e limpa um carro vindo de um ficheiro (só ficam os campos conhecidos).
// Devolve null se não tiver id ou marca.
export function sanitizeCar(c) {
  if (!c || typeof c !== 'object') return null;
  const id = text(c.id, 40);
  const brand = text(c.brand);
  if (!id || !brand) return null;
  const lat = finite(c.location?.latitude);
  const lng = finite(c.location?.longitude);
  return {
    id,
    createdAt: finite(c.createdAt) ?? (Number(id) || Date.now()),
    photo: text(c.photo, 120),
    brand,
    model: text(c.model),
    year: /^\d{4}$/.test(c.year) ? String(c.year) : '',
    country: text(c.country, 40),
    rarity: RARITIES.includes(c.rarity) ? c.rarity : 'Comum',
    location: lat !== null && lng !== null ? { latitude: lat, longitude: lng } : null,
  };
}

// Lista de carros do ficheiro, ou null se não for uma cópia do ParkLog
export function carsFromBackup(payload, carsKey) {
  if (payload?.app !== 'ParkLog') return null;
  const list = payload.data?.[carsKey];
  return Array.isArray(list) ? list : null;
}
