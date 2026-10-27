import { StyleSheet, View } from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/I18nContext';
import { C } from '../constants';

export default function ScreenHeader({ title, count, badge }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={[s.header, { paddingTop: insets.top + 12 }]}>
      <Text style={s.title}>{title}</Text>
      {count != null ? (
        <View style={s.counter}>
          <Text style={s.num}>{count}</Text>
          <Text style={s.lbl}>{t('unit.car', { count })}</Text>
        </View>
      ) : badge ? (
        <View style={s.counter}>
          <Text style={s.num}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  title: { fontFamily: 'display', color: C.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.2 },
  counter: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    borderWidth: 1.5, borderColor: C.accent, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  num: { fontFamily: 'display', color: C.accent, fontSize: 20, fontWeight: '800' },
  lbl: { color: C.muted, fontSize: 13, fontWeight: '600' },
});
