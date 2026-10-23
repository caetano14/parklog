import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@parklog/settings';
const DEFAULTS = { saveToGallery: false, dailyBrand: '' }; // desligado por defeito: só guarda na galeria se o utilizador quiser

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
            dailyBrand: typeof saved.dailyBrand === 'string' ? saved.dailyBrand : '',
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
  const value = useMemo(() => ({ ...settings, setSetting }), [settings, setSetting]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
