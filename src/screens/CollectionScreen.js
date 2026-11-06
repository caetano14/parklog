import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../components/AppText';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CarCard from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import FiltersSheet from '../components/FiltersSheet';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useSettings } from '../context/SettingsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';
import { NO_FILTERS, activeFilterCount, matchesFilters, matchesQuery, searchTerms } from '../utils/filters';
import { COLUMNS, chunkRows } from '../utils/layout';
import { norm } from '../utils/text';

// Filtra (pesquisa + filtros) e agrupa por marca (A-Z). Cada grupo é uma secção cujas linhas
// são listas de `columns` cartões. O cabeçalho da secção cola ao topo: usa a SectionList nativa,
// que faz isto de forma fiável (os cabeçalhos colados da FlashList falhavam no topo da lista).
function buildSections(cars, query, filters, lang, noBrand, columns) {
  const terms = searchTerms(query);
  const groups = new Map();
  for (const c of cars) {
    if (!matchesQuery(c, terms) || !matchesFilters(c, filters)) continue;
    const key = norm(c.brand) || '-';
    if (!groups.has(key)) groups.set(key, { key, title: c.brand || noBrand, cars: [] });
    groups.get(key).cars.push(c);
  }

  return [...groups.values()]
    .sort((a, b) => a.title.localeCompare(b.title, lang, { sensitivity: 'base' }))
    .map((g) => ({ key: g.key, title: g.title, count: g.cars.length, data: chunkRows(g.cars, columns) }));
}

export default function CollectionScreen({ navigation }) {
  const { t, lang } = useI18n();
  const { cars, loaded, numberOf } = useCars();
  const { collectionView, setSetting } = useSettings();
  const compact = collectionView === 'compact';
  const columns = COLUMNS[compact ? 'compact' : 'large'];
  const tabH = useBottomTabBarHeight(); // a lista passa por trás da barra de vidro
  const listPad = useMemo(() => ({ paddingHorizontal: 16, paddingBottom: tabH + 16 }), [tabH]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const deferredQuery = useDeferredValue(query); // mantém a escrita fluida em coleções grandes
  const noBrand = t('collection.noBrand');
  const activeCount = activeFilterCount(filters);

  const sections = useMemo(
    () => buildSections(cars, deferredQuery, filters, lang, noBrand, columns),
    [cars, deferredQuery, filters, lang, noBrand, columns]
  );

  const openCar = useCallback((id) => navigation.navigate('CarDetail', { id }), [navigation]);
  const keyExtractor = useCallback((row) => row[0].id, []);
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{section.title}</Text>
        <Text style={s.sectionCount}>{section.count}</Text>
      </View>
    ),
    []
  );
  const renderItem = useCallback(
    ({ item: row }) => (
      <View style={[s.row, compact && s.rowCompact]}>
        {row.map((car) => (
          <CarCard key={car.id} car={car} no={numberOf(car.id)} compact={compact} style={s.flex} onPress={openCar} />
        ))}
        {/* células vazias: os cartões da última linha mantêm a largura dos outros */}
        {Array.from({ length: columns - row.length }, (_, i) => <View key={`pad${i}`} style={s.flex} />)}
      </View>
    ),
    [numberOf, openCar, compact, columns]
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
          style={s.filterBtn}
          onPress={() => setSetting('collectionView', compact ? 'large' : 'compact')}
          accessibilityRole="button"
          accessibilityLabel={compact ? t('collection.viewLarge') : t('collection.viewCompact')}
        >
          <Ionicons name={compact ? 'grid-outline' : 'apps-outline'} size={22} color={C.text} />
        </TouchableOpacity>

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

      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={listPad}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        windowSize={7}
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
  rowCompact: { gap: 8, paddingBottom: 8 },
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
