import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

const LANG_KEY = '@parklog/lang';
export const LANGUAGES = ['pt', 'en'];

const I18nContext = createContext(null);

// Idioma inicial: o do telemóvel (português → PT, qualquer outro → EN)
const detectLang = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    return locale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'pt';
  }
};

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);
  const [ready, setReady] = useState(false);

  // A escolha do utilizador (se existir) tem prioridade sobre o idioma do telemóvel
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((saved) => { if (LANGUAGES.includes(saved)) setLangState(saved); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
  }, []);

  // t('chave', { n: 3 })  ·  t('unit.car', { count }) escolhe _one / _other
  // Se faltar a chave: usa o PT; depois params.defaultValue; por fim a própria chave.
  const t = useCallback(
    (key, params) => {
      const dict = translations[lang];
      let str;
      if (params && typeof params.count === 'number') {
        const suffix = params.count === 1 ? '_one' : '_other';
        str = dict[key + suffix] ?? translations.pt[key + suffix];
      }
      str = str ?? dict[key] ?? translations.pt[key];
      if (str == null) return params?.defaultValue ?? key;
      return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params?.[k] ?? ''));
    },
    [lang]
  );

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  if (!ready) return null; // evita mostrar um instante no idioma errado
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
