// Lê o texto guardado no armazenamento sem nunca o dar como vazio por engano.
// corrupt = true quando existe texto mas não é uma lista de carros válida; nesse caso quem chama
// guarda uma cópia do texto antes de escrever seja o que for por cima.
export function parseStoredCars(raw) {
  if (raw == null) return { cars: [], corrupt: false };
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) {
      return { cars: value.filter((c) => c && typeof c === 'object' && !Array.isArray(c)), corrupt: false };
    }
  } catch {
    // cai para o resultado de "corrompido"
  }
  return { cars: [], corrupt: true };
}
