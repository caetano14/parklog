import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Chip from './Chip';
import Sheet from './Sheet';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS, RARITIES, flagOf } from '../constants';
import { FILTER_COUNTRIES, NO_FILTERS, YEAR_KEYS } from '../utils/filters';

const Group = ({ title, children }) => (
  <View style={s.group}>
    <Text style={s.label}>{title}</Text>
    <View style={s.chips}>{children}</View>
  </View>
);

// Trabalha num rascunho: os filtros só mudam quando carregas em "Aplicar"
export default function FiltersSheet({ visible, filters, onApply, onClose }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(filters);
  useEffect(() => { if (visible) setDraft(filters); }, [visible, filters]);
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <Sheet visible={visible} title={t('filters.title')} onClose={onClose}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Group title={t('filters.rarity')}>
          <Chip label={t('filters.allF')} active={!draft.rarity} onPress={() => set('rarity', null)} />
          {Object.entries(RARITIES).map(([name, color]) => (
            <Chip key={name} label={t(`rarity.${name}`)} color={color} active={draft.rarity === name} onPress={() => set('rarity', name)} />
          ))}
        </Group>

        <Group title={t('filters.year')}>
          <Chip label={t('filters.all')} active={!draft.year} onPress={() => set('year', null)} />
          {YEAR_KEYS.map((key) => (
            <Chip key={key} label={t(`filters.year.${key}`)} active={draft.year === key} onPress={() => set('year', key)} />
          ))}
        </Group>

        <Group title={t('filters.country')}>
          <Chip label={t('filters.all')} active={!draft.country} onPress={() => set('country', null)} />
          {FILTER_COUNTRIES.map((c) => (
            <Chip key={c} label={`${flagOf(c)} ${t(`country.${c}`)}`} active={draft.country === c} onPress={() => set('country', c)} />
          ))}
        </Group>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity activeOpacity={0.85} style={s.clear} onPress={() => setDraft(NO_FILTERS)}>
          <Text style={s.clearTxt}>{t('filters.clear')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={s.apply} onPress={() => onApply(draft)}>
          <Text style={s.applyTxt}>{t('filters.apply')}</Text>
        </TouchableOpacity>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 0 },
  content: { gap: 20, paddingBottom: 8 },
  group: { gap: 10 },
  label: { color: C.text, fontSize: 14, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 14 },
  clear: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.field,
    backgroundColor: C.field, borderWidth: 1, borderColor: C.borderStrong,
  },
  clearTxt: { color: C.text, fontSize: 15, fontWeight: '800' },
  apply: { flex: 2, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.field, backgroundColor: C.accent },
  applyTxt: { color: C.onAccent, fontSize: 15, fontWeight: '800' },
});
