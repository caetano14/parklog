export const DAY_MS = 24 * 60 * 60 * 1000;

// Dias desde a última exportação (null se nunca houve). Nunca é negativo.
export function daysSinceBackup(lastBackupAt, now = Date.now()) {
  if (!Number.isFinite(lastBackupAt) || lastBackupAt <= 0) return null;
  return Math.max(0, Math.floor((now - lastBackupAt) / DAY_MS));
}
