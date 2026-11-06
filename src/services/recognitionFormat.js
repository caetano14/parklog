import { CAR_BRANDS } from '../data/carBrands';
import { canonicalBrand } from '../utils/brands';

// Parte pura (sem React Native): valida e limpa a resposta do servidor de reconhecimento.
// Nunca se confia no que vem da rede: tudo é verificado antes de chegar ao formulário.
const CONFIDENCE = ['high', 'medium', 'low'];
const text = (v, max = 60) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const toYear = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1886 && n <= new Date().getFullYear() + 1 ? n : null;
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Devolve null se a resposta for inválida; { isCar: false } se não houver carro;
// caso contrário { isCar, brand (só se estiver na lista de marcas), brandText, model, yearFrom, yearTo, confidence }
export function normalizeRecognition(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.isCar !== 'boolean') return null;
  if (!raw.isCar) return { isCar: false };

  const brandText = text(raw.brand, 40);
  const known = brandText ? CAR_BRANDS.find((b) => canonicalBrand(b.name) === canonicalBrand(brandText)) : null;

  let model = text(raw.model, 40);
  if (brandText) model = model.replace(new RegExp(`^${escapeRegex(brandText)}\\s+`, 'i'), ''); // "BMW M3" → "M3"

  let from = toYear(raw.yearFrom);
  let to = toYear(raw.yearTo);
  if (from && !to) to = from;
  if (to && !from) from = to;
  if (from && to && from > to) [from, to] = [to, from];
  if (from && to && to - from > 15) { from = null; to = null; } // intervalo largo demais para ajudar

  return {
    isCar: true,
    brand: known ? known.name : null,
    brandText,
    model,
    yearFrom: from,
    yearTo: to,
    confidence: CONFIDENCE.includes(raw.confidence) ? raw.confidence : 'low',
  };
}

// Anos propostos como botões: só quando o intervalo é curto (um ano exato seria enganador)
export const yearOptions = (d) => {
  if (!d?.yearFrom || !d?.yearTo || d.yearTo - d.yearFrom > 7) return [];
  return Array.from({ length: d.yearTo - d.yearFrom + 1 }, (_, i) => d.yearFrom + i);
};

// O que fazer com uma resposta: 'fill' preenche o formulário (confiança alta e marca da lista);
// 'suggest' só mostra a sugestão com o botão "Aplicar" (confiança média ou baixa, ou marca fora da lista).
export const recognitionAction = (d) => (d?.brand && d.confidence === 'high' ? 'fill' : 'suggest');

// O ano, quando o modelo indicou um só (de e até iguais); null nos outros casos
export const singleYear = (d) => (Number.isInteger(d?.yearFrom) && d.yearFrom === d.yearTo ? d.yearFrom : null);
