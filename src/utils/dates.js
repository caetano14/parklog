// Momento em que o carro foi registado (guardado em createdAt ao carregar em "Guardar",
// tanto com fotos da câmara como da galeria). Os carros antigos não têm createdAt: o id era
// um Date.now(), por isso serve de plano B. Devolve null se não houver uma data credível.
export const registeredAt = (car) => {
  const ms = Number.isFinite(car?.createdAt) ? car.createdAt : Number(car?.id);
  return Number.isFinite(ms) && ms > 946684800000 ? ms : null; // depois do ano 2000
};

const pad = (n) => String(n).padStart(2, '0');
const locale = (lang) => (lang === 'en' ? 'en-GB' : 'pt-PT');

// "27 de outubro de 2026" (PT) · "27 October 2026" (EN); plano B numérico se o Intl faltar
export function formatDate(ms, lang) {
  const d = new Date(ms);
  try {
    return d.toLocaleDateString(locale(lang), { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}

// "17:29" (hora local do telemóvel)
export function formatTime(ms, lang) {
  const d = new Date(ms);
  try {
    return d.toLocaleTimeString(locale(lang), { hour: '2-digit', minute: '2-digit' });
  } catch {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
