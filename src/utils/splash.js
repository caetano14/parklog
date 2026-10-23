// Mantém o ecrã de arranque até a navegação estar pronta (os providers devolvem null
// enquanto carregam). require dentro de try: se o módulo nativo faltar na build, a app arranca na mesma.
const load = () => {
  try { return require('expo-splash-screen'); } catch { return null; }
};

export const keepSplash = () => Promise.resolve(load()?.preventAutoHideAsync()).catch(() => {});
export const hideSplash = () => Promise.resolve(load()?.hideAsync()).catch(() => {});
