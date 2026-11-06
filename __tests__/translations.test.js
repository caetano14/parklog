import { translations } from '../src/i18n/translations';

const { pt, en } = translations;

describe('traduções', () => {
  test('PT e EN têm exatamente as mesmas chaves', () => {
    const onlyPt = Object.keys(pt).filter((k) => !(k in en));
    const onlyEn = Object.keys(en).filter((k) => !(k in pt));
    expect({ onlyPt, onlyEn }).toEqual({ onlyPt: [], onlyEn: [] });
  });
  test('nenhum texto está vazio', () => {
    const empty = [...Object.entries(pt), ...Object.entries(en)].filter(([, v]) => !String(v).trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });
  test('os parâmetros {{x}} são os mesmos nas duas línguas', () => {
    const params = (v) => (String(v).match(/\{\{\w+\}\}/g) ?? []).sort().join(',');
    const diff = Object.keys(pt).filter((k) => k in en && params(pt[k]) !== params(en[k]));
    expect(diff).toEqual([]);
  });
  test('os plurais têm as duas formas, _one e _other', () => {
    for (const dict of [pt, en]) {
      for (const k of Object.keys(dict)) {
        if (k.endsWith('_one')) expect(k.replace(/_one$/, '_other') in dict).toBe(true);
        if (k.endsWith('_other')) expect(k.replace(/_other$/, '_one') in dict).toBe(true);
      }
    }
  });
});
