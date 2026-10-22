// Ignora maiúsculas e acentos (pesquisa, agrupamento por marca, marcas únicas)
export const norm = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
