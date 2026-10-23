import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { STORAGE_KEY as CARS_KEY } from '../context/CarsContext';
import { BACKUP_VERSION, carsFromBackup, safeName, sanitizeCar } from './backupFormat';

// Formato: um .zip com   data.json  (todos os dados do AsyncStorage)
//                        photos/    (uma fotografia por carro)
// Os módulos nativos/pesados (jszip, expo-sharing, expo-document-picker) são carregados
// só quando precisam, para a app não depender deles no arranque.

const FILE_URI = /^(file|content):/;

const readBytes = async (file) => (typeof file.bytes === 'function' ? file.bytes() : file.bytesSync());
const readText = async (file) => (typeof file.text === 'function' ? file.text() : file.textSync());

// Ficheiro da foto de um carro (nome na pasta de documentos, ou uma URI antiga); null se não existir
const photoSource = (p) => {
  if (!p) return null;
  try {
    const f = FILE_URI.test(p) ? new File(p) : new File(Paths.document, p);
    return f.exists ? f : null;
  } catch {
    return null;
  }
};

export const exportGarage = async () => {
  const Sharing = require('expo-sharing');
  const JSZip = require('jszip');

  const keys = await AsyncStorage.getAllKeys();
  const data = {};
  for (const [key, raw] of await AsyncStorage.multiGet(keys)) {
    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
  }

  // Cada foto vai para photos/ dentro do .zip e o carro passa a apontar para esse nome
  const zip = new JSZip();
  const cars = Array.isArray(data[CARS_KEY]) ? data[CARS_KEY] : [];
  data[CARS_KEY] = [];
  for (const car of cars) {
    const src = photoSource(car.photo);
    const name = src ? safeName(FILE_URI.test(car.photo) ? `${car.id}.jpg` : car.photo) : '';
    if (src) zip.file(`photos/${name}`, await readBytes(src), { binary: true });
    data[CARS_KEY].push({ ...car, photo: name });
  }

  const now = new Date();
  zip.file('data.json', JSON.stringify({ app: 'ParkLog', version: BACKUP_VERSION, exportedAt: now.toISOString(), data }, null, 2));
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'STORE' }); // JPEG já vem comprimido

  const file = new File(Paths.cache, `parklog-backup-${now.toISOString().slice(0, 10)}.zip`);
  if (file.exists) file.delete();
  file.create();
  file.write(bytes);
  try {
    if (!(await Sharing.isAvailableAsync())) throw new Error('Partilha indisponível neste dispositivo');
    await Sharing.shareAsync(file.uri, { mimeType: 'application/zip', UTI: 'public.zip-archive', dialogTitle: 'ParkLog' });
  } finally {
    try { file.delete(); } catch {} // a cópia temporária já não é precisa
  }
};

// Copia a foto do .zip para a pasta de documentos. Devolve o nome do ficheiro, ou '' se não houver foto.
const restorePhoto = async (zip, name) => {
  if (!name) return '';
  const entry = zip?.file(`photos/${name}`);
  if (!entry) return !zip && photoSource(name) ? name : ''; // cópia antiga (só .json): só serve se a foto ainda existir aqui

  let finalName = safeName(name) || `${Date.now()}.jpg`;
  if (new File(Paths.document, finalName).exists) finalName = `imp_${Date.now()}_${finalName}`;
  const out = new File(Paths.document, finalName);
  out.create();
  out.write(await entry.async('uint8array')); // uma foto de cada vez, para não encher a memória
  return finalName;
};

// Escolhe um ficheiro, valida-o e restaura as fotos dos carros que ainda não existem.
// Devolve { cars, skipped, missingPhotos } ou null se o utilizador cancelar. Nunca apaga nada.
export const importGarage = async (existingCars) => {
  const DocumentPicker = require('expo-document-picker');
  const JSZip = require('jszip');

  const picked = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  const asset = picked.canceled ? null : picked.assets?.[0];
  if (!asset?.uri) return null;

  const source = new File(asset.uri);
  try {
    let zip = null;
    let payload;
    try {
      zip = await JSZip.loadAsync(await readBytes(source));
      payload = JSON.parse(await zip.file('data.json').async('string'));
    } catch {
      zip = null; // cópia antiga: só um .json, sem fotografias
      payload = JSON.parse(await readText(source));
    }

    const list = carsFromBackup(payload, CARS_KEY);
    if (!list) throw new Error('Ficheiro inválido');

    const have = new Set(existingCars.map((c) => c.id));
    const cars = [];
    let skipped = 0;
    let missingPhotos = 0;
    for (const raw of list) {
      const car = sanitizeCar(raw);
      if (!car || have.has(car.id)) { skipped += 1; continue; }
      have.add(car.id);
      car.photo = await restorePhoto(zip, car.photo);
      if (!car.photo) missingPhotos += 1;
      cars.push(car);
    }
    return { cars, skipped, missingPhotos };
  } finally {
    try { source.delete(); } catch {} // cópia temporária que o seletor deixou na cache
  }
};
