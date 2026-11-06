import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@parklog/settings';
// Desligado por defeito: só guarda na galeria / envia fotos para reconhecer se o utilizador quiser.
// onboarded: undefined = nunca decidido · false = ver a introdução outra vez · true = já viu
// recPromptDismissed: o utilizador disse "Agora não" ao convite do reconhecimento
// collectionView: 'large' (2 cartões por linha) ou 'compact' (4) na Caderneta
// lastBackupAt: quando (ms) foi a última exportação
const DEFAULTS = { saveToGallery: false, dailyBrand: '', autoRecognize: false, recPromptDismissed: false, onboarded: undefined, lastBackupAt: null, collectionView: 'large' };

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (saved && typeof saved === 'object') {
          setSettings({
            ...DEFAULTS,
            saveToGallery: saved.saveToGallery === true,
            autoRecognize: saved.autoRecognize === true,
            dailyBrand: typeof saved.dailyBrand === 'string' ? saved.dailyBrand : '',
            recPromptDismissed: saved.recPromptDismissed === true,
            onboarded: typeof saved.onboarded === 'boolean' ? saved.onboarded : undefined,
            collectionView: saved.collectionView === 'compact' ? 'compact' : 'large',
            lastBackupAt: Number.isFinite(saved.lastBackupAt) ? saved.lastBackupAt : null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Só guarda depois de carregar, para nunca apagar as definições por engano
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const setSetting = useCallback((key, value) => setSettings((p) => ({ ...p, [key]: value })), []);
  const value = useMemo(() => ({ ...settings, loaded, setSetting }), [settings, loaded, setSetting]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
