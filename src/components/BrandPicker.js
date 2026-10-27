import { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from './AppText';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import Sheet from './Sheet';
import { CAR_BRANDS } from '../data/carBrands';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS, flagOf } from '../constants';
import { norm } from '../utils/text';

// Seletor de marca com pesquisa (autocomplete). Só deixa escolher marcas da lista, por isso
// os dados ficam sempre consistentes e o motor de raridade nunca recebe "ferari".
export default function BrandPicker({ value, onChange, error }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const brands = useMemo(() => {
    const q = norm(query);
    return q ? CAR_BRANDS.filter((b) => norm(b.name).includes(q)) : CAR_BRANDS;
  }, [query]);

  const close = () => { setOpen(false); setQuery(''); };
  const pick = (name) => { onChange(name); close(); };

  return (
    <View style={s.group}>
      <Text style={s.label}>{t('add.brand')}</Text>
      <TouchableOpacity activeOpacity={0.85} style={[s.box, error && s.boxError]} onPress={() => setOpen(true)}>
        <Text style={[s.value, !value && s.placeholder]} numberOfLines={1}>{value || t('add.brandPick')}</Text>
        <Ionicons name="chevron-down" size={18} color={C.muted} />
      </TouchableOpacity>
      {error ? <Text style={s.error}>{error}</Text> : null}

      <Sheet visible={open} title={t('add.brand')} onClose={close} height="80%">
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('add.brandSearch')}
            placeholderTextColor={C.muted}
            selectionColor={C.text}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <View style={s.list}>
          <FlashList
            data={brands}
            keyExtractor={(b) => b.name}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={s.none}>{t('add.brandNone')}</Text>}
            renderItem={({ item }) => {
              const selected = item.name === value;
              return (
                <TouchableOpacity activeOpacity={0.7} style={s.row} onPress={() => pick(item.name)}>
                  <Text style={[s.name, selected && s.nameOn]}>{item.name}</Text>
                  <Text style={s.flag}>{flagOf(item.country)}</Text>
                  <View style={s.check}>{selected ? <Ionicons name="checkmark" size={18} color={C.text} /> : null}</View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  group: { gap: 8 },
  label: { color: C.text, fontSize: 14, fontWeight: '700' },
  box: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    backgroundColor: C.field, borderWidth: 1, borderColor: C.borderStrong, borderRadius: RADIUS.field,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  boxError: { borderColor: C.danger },
  value: { flex: 1, color: C.text, fontSize: 16 },
  placeholder: { color: C.muted },
  error: { color: C.danger, fontSize: 13 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 6,
    backgroundColor: C.field, borderWidth: 1, borderColor: C.borderStrong, borderRadius: RADIUS.field,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 16, paddingVertical: 12 },
  list: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4,
  },
  name: { flex: 1, color: C.text, fontSize: 16 },
  nameOn: { fontWeight: '800' },
  flag: { fontSize: 16 },
  check: { width: 20, alignItems: 'center' },
  none: { color: C.muted, fontSize: 15, textAlign: 'center', paddingVertical: 30 },
});
