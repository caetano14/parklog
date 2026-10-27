import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../components/AppText';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CarCard from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import FiltersSheet from '../components/FiltersSheet';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';
import { NO_FILTERS, activeFilterCount, matchesFilters, matchesQuery, searchTerms } from '../utils/filters';
import { norm } from '../utils/text';

// Divide uma lista em linhas de 2 cartões
const chunk = (arr) => {
  const rows = [];
  for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
  return rows;
};

// Filtra (pesquisa + filtros), agrupa por marca (A-Z) e achata tudo numa lista única para a
// FlashList: [cabeçalho, linha, linha, cabeçalho, ...]. `headers` guarda os índices dos
// cabeçalhos, que ficam colados ao topo ao fazer scroll.
function buildList(cars, query, filters, lang, noBrand) {
  const terms = searchTerms(query);
  const groups = new Map();
  for (const c of cars) {
    if (!matchesQuery(c, terms) || !matchesFilters(c, filters)) continue;
    const key = norm(c.brand) || '-';
    if (!groups.has(key)) groups.set(key, { key, title: c.brand || noBrand, cars: [] });
    groups.get(key).cars.push(c);
  }

  const items = [];
  const headers = [];
  [...groups.values()]
    .sort((a, b) => a.title.localeCompare(b.title, lang, { sensitivity: 'base' }))
    .forEach((g) => {
      headers.push(items.length);
      items.push({ key: `h:${g.key}`, type: 'header', title: g.title, count: g.cars.length });
      chunk(g.cars).forEach((row) => items.push({ key: `r:${row[0].id}`, type: 'row', cars: row }));
    });
  return { items, headers };
}

export default function CollectionScreen({ navigation }) {
  const { t, lang } = useI18n();
  const { cars, loaded, numberOf } = useCars();
  const tabH = useBottomTabBarHeight(); // a lista passa por trás da barra de vidro
  const listPad = useMemo(() => ({ paddingHorizontal: 16, paddingBottom: tabH + 16 }), [tabH]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const deferredQuery = useDeferredValue(query); // mantém a escrita fluida em coleções grandes
  const noBrand = t('collection.noBrand');
  const activeCount = activeFilterCount(filters);

  const { items, headers } = useMemo(
    () => buildList(cars, deferredQuery, filters, lang, noBrand),
    [cars, deferredQuery, filters, lang, noBrand]
  );

  const openCar = useCallback((id) => navigation.navigate('CarDetail', { id }), [navigation]);
  const keyExtractor = useCallback((item) => item.key, []);
  const renderItem = useCallback(
    ({ item }) =>
      item.type === 'header' ? (
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>{item.title}</Text>
          <Text style={s.sectionCount}>{item.count}</Text>
        </View>
      ) : (
        <View style={s.row}>
          {item.cars.map((car) => (
            <CarCard key={car.id} car={car} no={numberOf(car.id)} style={s.flex} onPress={openCar} />
          ))}
          {item.cars.length === 1 ? <View style={s.flex} /> : null /* mantém a largura de um cartão */}
        </View>
      ),
    [numberOf, openCar]
  );

  return (
    <View style={s.root}>
      <ScreenHeader title={t('collection.title')} count={cars.length} />

      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('collection.search')}
            placeholderTextColor={C.muted}
            selectionColor={C.text}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={t('collection.clear')}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[s.filterBtn, activeCount > 0 && s.filterBtnOn]}
          onPress={() => setSheetOpen(true)}
          accessibilityLabel={t('filters.title')}
        >
          <Ionicons name="options-outline" size={22} color={activeCount > 0 ? C.onAccent : C.text} />
          {activeCount > 0 ? (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeTxt}>{activeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <FiltersSheet
        visible={sheetOpen}
        filters={filters}
        onApply={(f) => { setFilters(f); setSheetOpen(false); }}
        onClose={() => setSheetOpen(false)}
      />

      <FlashList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickyHeaderIndices={headers}
        contentContainerStyle={listPad}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        getItemType={(item) => item.type}
        drawDistance={200}
        ListEmptyComponent={
          !loaded ? null : cars.length ? (
            <EmptyState
              icon="search-outline"
              title={t('collection.noResults.title')}
              text={
                query.trim()
                  ? t('collection.noResults.text', { query: query.trim() })
                  : t('collection.noResultsFilters')
              }
            />
          ) : (
            <EmptyState
              icon="albums-outline"
              title={t('collection.empty.title')}
              text={t('collection.empty.text')}
              actionLabel={t('collection.empty.action')}
              onAction={() => navigation.navigate('AddCar')}
            />
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1,
    paddingHorizontal: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.field,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 16, paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  grow: { flexGrow: 1 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingTop: 16, paddingBottom: 10, backgroundColor: C.bg, // opaco: o cabeçalho cola ao topo
  },
  sectionTitle: { fontFamily: 'display', color: C.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionCount: { color: C.muted, fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, paddingBottom: 14 }, // padding e não margem: a FlashList mede a célula
  flex: { flex: 1 },

  searchRow: { flexDirection: 'row', gap: 10, margin: 16, marginBottom: 4 },
  filterBtn: {
    width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.field,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  filterBtnOn: { backgroundColor: C.accent, borderColor: C.accent },
  filterBadge: {
    position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, backgroundColor: C.gold,
  },
  filterBadgeTxt: { color: C.onAccent, fontSize: 11, fontWeight: '800' },
});
