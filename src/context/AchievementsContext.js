import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ACHIEVEMENTS, createdAt, evaluate } from '../achievements/definitions';
import { useCars } from './CarsContext';
import { useSettings } from './SettingsContext';
import { useI18n } from '../i18n/I18nContext';

const KEY = '@parklog/achievements';
const INITIAL = { unlocked: {}, deleted: 0, langChanges: 0, firstUseAt: 0, seeded: false };

const AchievementsContext = createContext(null);

// Avalia a colecção sempre que ela muda (carro novo, carro apagado...). Ouve o CarsContext
// em vez de ser chamado por ele, por isso guardar/apagar carros não precisa de saber de conquistas.
export function AchievementsProvider({ children }) {
  const { cars, loaded } = useCars();
  const { dailyBrand } = useSettings();
  const { t, lang } = useI18n();

  const [state, setState] = useState(INITIAL);
  const [results, setResults] = useState({});
  const [ready, setReady] = useState(false);
  const stateRef = useRef(INITIAL);  // último estado guardado (evita dependências circulares nos efeitos)
  const prevIds = useRef(null);      // carros da avaliação anterior
  const prevLang = useRef(lang);
  const session = useRef(0);         // carros adicionados desde que a app abriu

  const commit = (next) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : null;
        if (saved && typeof saved === 'object') {
          const next = { ...INITIAL, ...saved };
          stateRef.current = next;
          setState(next);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => { // conta as mudanças de idioma
    if (!ready || prevLang.current === lang) return;
    prevLang.current = lang;
    commit({ ...stateRef.current, langChanges: stateRef.current.langChanges + 1 });
  }, [lang, ready]);

  const notify = (list) =>
    list.slice(0, 3).forEach((a, i) =>
      setTimeout(
        () => Toast.show({
          type: 'achievement', position: 'top', visibilityTime: 3200,
          text1: a[lang].title, text2: a[lang].desc, props: { icon: a.icon, label: t('ach.unlocked') },
        }),
        i * 3400
      )
    );

  useEffect(() => {
    if (!loaded || !ready) return;
    const cur = stateRef.current;
    const ids = new Set(cars.map((c) => c.id));
    const next = { ...cur, unlocked: { ...cur.unlocked } };

    let added = 0;
    if (prevIds.current) { // diferença desde a última avaliação: carros apagados e adicionados
      prevIds.current.forEach((id) => { if (!ids.has(id)) next.deleted += 1; });
      added = cars.filter((c) => !prevIds.current.has(c.id)).length;
      if (added === 1) session.current += 1; // uma importação (vários de uma vez) não conta como sessão
    }
    prevIds.current = ids;
    if (!next.firstUseAt) next.firstUseAt = cars.length ? Math.min(...cars.map(createdAt)) : Date.now();

    const res = evaluate(
      cars,
      { deleted: next.deleted, langChanges: next.langChanges, sessionAdds: session.current, firstUseAt: next.firstUseAt, dailyBrand },
      next.unlocked
    );
    const fresh = ACHIEVEMENTS.filter((a) => res[a.id].unlocked && !next.unlocked[a.id]);
    fresh.forEach((a) => { next.unlocked[a.id] = Date.now(); });
    setResults(res);

    if (fresh.length || !cur.seeded || next.deleted !== cur.deleted || next.firstUseAt !== cur.firstUseAt) {
      commit({ ...next, seeded: true });
    }
    if (cur.seeded && added <= 1) notify(fresh); // sem avisos ao importar muitos carros // na 1.ª execução sincroniza em silêncio, sem uma enxurrada de avisos
  }, [cars, loaded, ready, dailyBrand, state.deleted, state.langChanges]);

  return (
    <AchievementsContext.Provider value={{ results, unlocked: state.unlocked }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export const useAchievements = () => useContext(AchievementsContext);
