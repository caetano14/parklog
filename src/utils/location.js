// Pede as coordenadas sem bloquear a interface. A Promise nunca falha: devolve null se não
// houver permissão, se o GPS falhar ou se demorar mais de 8 s.
// require dentro da função: se o módulo nativo faltar na build, só a localização fica de fora.
export const getPhotoLocation = async () => {
  try {
    const Location = require('expo-location');
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    return pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude } : null;
  } catch (e) {
    console.warn('Localização indisponível', e);
    return null;
  }
};
