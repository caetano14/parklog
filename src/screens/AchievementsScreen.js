import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useAchievements } from '../context/AchievementsContext';
import { useI18n } from '../i18n/I18nContext';
import { ACHIEVEMENTS, CATEGORIES } from '../achievements/definitions';
import { C, RADIUS } from '../constants';

const Row = ({ a, lang, res, unlocked }) => {
  const text = a[lang];
  const showProgress = !unlocked && res && res.target > 1;
  return (
    <View style={[s.card, !unlocked && s.cardLocked]}>
      <View style={[s.badge, unlocked ? s.badgeOn : s.badgeOff]}>
        <Ionicons name={unlocked ? a.icon : 'lock-closed'} size={22} color={unlocked ? C.onAccent : '#52525B'} />
      </View>
      <View style={s.body}>
        <Text style={[s.title, !unlocked && s.titleLocked]} numberOfLines={1}>{text.title}</Text>
        <Text style={[s.desc, !unlocked && s.descLocked]}>{text.desc}</Text>
        {showProgress ? (
          <View style={s.progressRow}>
            <View style={s.bar}>
              <View style={[s.fill, { width: `${(res.value / res.target) * 100}%` }]} />
            </View>
            <Text style={s.count}>{res.value}/{res.target}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default function AchievementsScreen() {
  const { t, lang } = useI18n();
  const { results, unlocked } = useAchievements();
  const done = Object.keys(unlocked).length;
  const total = ACHIEVEMENTS.length;

  // [cabeçalho da categoria, conquistas..., cabeçalho, conquistas...]
  const data = useMemo(
    () => CATEGORIES.flatMap((cat) => [
      { key: `h:${cat}`, header: cat },
      ...ACHIEVEMENTS.filter((a) => a.cat === cat).map((a) => ({ key: `a:${a.id}`, a })),
    ]),
    []
  );

  return (
    <View style={s.root}>
      <ScreenHeader title={t('ach.title')} badge={`${done}/${total}`} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        contentContainerStyle={s.list}
        initialNumToRender={12}
        windowSize={9}
        ListHeaderComponent={
          <View style={s.summary}>
            <Text style={s.sumBig}>{done}<Text style={s.sumSmall}> / {total}</Text></Text>
            <Text style={s.sumLabel}>{t('ach.summary')}</Text>
            <View style={[s.bar, s.sumBar]}>
              <View style={[s.fill, s.fillGold, { width: `${(done / total) * 100}%` }]} />
            </View>
          </View>
        }
        renderItem={({ item }) =>
          item.header ? (
            <Text style={s.catTitle}>{t(`ach.cat.${item.header}`)}</Text>
          ) : (
            <Row a={item.a} lang={lang} res={results[item.a.id]} unlocked={!!unlocked[item.a.id]} />
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingBottom: 32, gap: 10 },

  summary: { backgroundColor: C.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 6 },
  sumBig: { color: C.gold, fontSize: 40, fontWeight: '800', letterSpacing: -1.2 },
  sumSmall: { color: C.muted, fontSize: 20, fontWeight: '600', letterSpacing: 0 },
  sumLabel: { color: C.muted, fontSize: 14, marginTop: 2 },
  sumBar: { marginTop: 14 },

  catTitle: { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 14 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    backgroundColor: C.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: C.borderStrong,
  },
  cardLocked: { backgroundColor: '#111113', borderColor: C.border },
  badge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  badgeOn: { backgroundColor: C.gold },
  badgeOff: { backgroundColor: '#1C1C1F' },
  body: { flex: 1 },
  title: { color: C.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  titleLocked: { color: '#71717A' },
  desc: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  descLocked: { color: '#52525B' },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  bar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#1C1C1F', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: '#52525B' },
  fillGold: { backgroundColor: C.gold },
  count: { color: '#71717A', fontSize: 12, fontWeight: '700' },
});
