import { File, Paths } from 'expo-file-system';

const isUri = (p) => /^(file|content|https?):/.test(p);

// A foto da câmara fica na cache (o sistema pode apagá-la): copio-a para a pasta
// de documentos e guardo só o nome do ficheiro.
export const persistPhoto = (uri) => {
    try {
        const ext = uri.split('?')[0].split('.').pop() || 'jpg';
        const name = `car_${Date.now()}.${ext}`;
        new File(uri).copy(new File(Paths.document, name));
        return name;
    } catch {
        return uri; // plano B: mantém a URI original
    }
};

export const photoUri = (p) => (isUri(p) ? p : new File(Paths.document, p).uri);

export const deletePhoto = (p) => {
    try { if (!isUri(p)) new File(Paths.document, p).delete(); } catch { }
};