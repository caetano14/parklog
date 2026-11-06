import { COLUMNS, VIEW_MODES, chunkRows } from '../src/utils/layout';

describe('chunkRows', () => {
  test('divide em linhas do tamanho pedido e a última pode ter menos', () => {
    expect(chunkRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkRows([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
  });
  test('lista vazia dá nenhuma linha', () => {
    expect(chunkRows([], 4)).toEqual([]);
  });
  test('tamanho inválido conta como 1 e não fica num ciclo infinito', () => {
    expect(chunkRows([1, 2], 0)).toEqual([[1], [2]]);
    expect(chunkRows([1, 2], NaN)).toEqual([[1], [2]]);
    expect(chunkRows([1, 2], -3)).toEqual([[1], [2]]);
  });
  test('não altera a lista original', () => {
    const a = [1, 2, 3];
    chunkRows(a, 2);
    expect(a).toEqual([1, 2, 3]);
  });
});

describe('COLUMNS', () => {
  test('o modo pequeno tem mais colunas do que o grande', () => {
    expect(COLUMNS.compact).toBeGreaterThan(COLUMNS.large);
    expect(VIEW_MODES).toEqual(['large', 'compact']);
  });
});
