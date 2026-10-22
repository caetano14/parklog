import { File, Paths } from 'expo-file-system';

const MAX_WIDTH = 1080; // nítido no ecrã de detalhes e leve para a memória
const QUALITY = 0.75;

const isUri = (p) => /^(file|content|https?):/.test(p);

// Apaga um ficheiro temporário (cache); nunca lança erros
export const discardTemp = (uri) => {
  try { if (uri && isUri(uri)) new File(uri).delete(); } catch {}
};

// Redimensiona (largura máx. 1080 px, sem ampliar fotos pequenas) e comprime para JPEG.
// Devolve a URI da nova imagem e liberta a memória nativa.
export const compressPhoto = async (uri, width) => {
  // require dentro da função: se o módulo nativo não existir (versão errada ou Expo Go
  // desatualizado), falha só a compressão (o AddCarScreen usa a foto original) e a app abre.
  const { ImageManipulator, SaveFormat } = require('expo-image-manipulator');
  const ctx = ImageManipulator.manipulate(uri);
  try {
    if (!width || width > MAX_WIDTH) ctx.resize({ width: MAX_WIDTH });
    const image = await ctx.renderAsync();
    try {
      const out = await image.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY });
      if (out.uri !== uri) discardTemp(uri); // já não precisamos da foto original, pesada
      return out.uri;
    } finally {
      image.release?.();
    }
  } finally {
    ctx.release?.();
  }
};

// A cache pode ser limpa pelo sistema: copio a foto para a pasta de documentos
// e guardo só o nome do ficheiro.
export const persistPhoto = (uri) => {
  try {
    const ext = uri.split('?')[0].split('.').pop() || 'jpg';
    const name = `car_${Date.now()}.${ext}`;
    new File(uri).copy(new File(Paths.document, name));
    discardTemp(uri);
    return name;
  } catch {
    return uri; // plano B: mantém a URI original
  }
};

export const photoUri = (p) => {
  if (!p) return null;
  if (isUri(p)) return p;
  try { return new File(Paths.document, p).uri; } catch { return null; }
};

export const deletePhoto = (p) => {
  try { if (p && !isUri(p)) new File(Paths.document, p).delete(); } catch {}
};

// ---- Cópia na galeria do dispositivo (opção do Perfil) ----
// require dentro das funções: se o módulo nativo ainda não estiver na build,
// só esta opção falha e a app continua a funcionar.
export const requestGalleryPermission = () =>
  require('expo-media-library').requestPermissionsAsync(true); // true = só adicionar fotos

export const saveCopyToGallery = async (uri) => {
  const MediaLibrary = require('expo-media-library');
  const perm = await MediaLibrary.getPermissionsAsync(true);
  if (!perm.granted) throw new Error('Sem permissão para guardar na galeria');
  await MediaLibrary.saveToLibraryAsync(uri);
};
