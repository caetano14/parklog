// Vista da caderneta: cartões grandes (2 por linha) ou pequenos (4 por linha).
// Para outro número de colunas no modo pequeno, basta mudar o valor de `compact`.
export const COLUMNS = { large: 2, compact: 4 };
export const VIEW_MODES = Object.keys(COLUMNS);

// Divide uma lista em linhas de `size` elementos (a última pode ter menos)
export function chunkRows(arr, size) {
  const n = Math.max(1, Math.floor(size) || 1);
  const rows = [];
  for (let i = 0; i < arr.length; i += n) rows.push(arr.slice(i, i + n));
  return rows;
}
