import { DAY_MS, daysSinceBackup } from '../src/utils/backupReminder';

const NOW = new Date('2026-11-06T12:00:00Z').getTime();

describe('daysSinceBackup', () => {
  test('nunca exportou dá null', () => {
    expect(daysSinceBackup(null, NOW)).toBeNull();
    expect(daysSinceBackup(undefined, NOW)).toBeNull();
    expect(daysSinceBackup(NaN, NOW)).toBeNull();
    expect(daysSinceBackup(0, NOW)).toBeNull();
  });
  test('hoje conta como 0 dias', () => {
    expect(daysSinceBackup(NOW, NOW)).toBe(0);
    expect(daysSinceBackup(NOW - 23 * 60 * 60 * 1000, NOW)).toBe(0);
  });
  test('conta dias inteiros', () => {
    expect(daysSinceBackup(NOW - DAY_MS, NOW)).toBe(1);
    expect(daysSinceBackup(NOW - 12 * DAY_MS - 5000, NOW)).toBe(12);
  });
  test('uma data no futuro nunca dá dias negativos', () => {
    expect(daysSinceBackup(NOW + 3 * DAY_MS, NOW)).toBe(0);
  });
});
