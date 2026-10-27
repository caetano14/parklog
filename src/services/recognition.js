import { File } from 'expo-file-system';
import { normalizeRecognition } from './recognitionFormat';

// Reconhecimento do carro pela fotografia. O ecrã só conhece esta função: o servidor (hoje um
// proxy para um modelo de visão) pode ser trocado por um modelo Core ML no telemóvel sem mexer no resto.
// URL e token vêm do ficheiro .env (variáveis EXPO_PUBLIC_*, lidas no arranque do Metro).
const URL = process.env.EXPO_PUBLIC_RECOGNITION_URL;
const TOKEN = process.env.EXPO_PUBLIC_RECOGNITION_TOKEN;

export const isRecognitionConfigured = () => Boolean(URL);

const fail = (code) => Object.assign(new Error(code), { code });

const readBase64 = async (uri) => {
  const file = new File(uri);
  if (typeof file.base64 === 'function') return file.base64();
  if (typeof file.base64Sync === 'function') return file.base64Sync();
  return require('expo-file-system/legacy').readAsStringAsync(uri, { encoding: 'base64' });
};

// Só envia a foto (já reduzida). A localização nunca sai do telemóvel.
// Erros com `code`: disabled | read | timeout | network | rate | server | invalid
export async function recognizeCar(uri, { timeoutMs = 25000 } = {}) {
  if (!URL) throw fail('disabled');

  let image;
  try { image = await readBase64(uri); } catch { throw fail('read'); }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-parklog-key': TOKEN ?? '' },
      body: JSON.stringify({ image, mediaType: 'image/jpeg' }),
    });
    if (!res.ok) throw fail(res.status === 429 ? 'rate' : 'server');
    const result = normalizeRecognition(await res.json());
    if (!result) throw fail('invalid');
    return result;
  } catch (e) {
    if (e?.code) throw e;
    throw fail(e?.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}
