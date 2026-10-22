import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CarCard, { useCardWidth } from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';
import { norm } from '../utils/text';

// Divide uma lista em linhas de 2 cartões
const chunk = (arr) => {
  const rows = [];
  for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
  return rows;
};

// Agrupa por marca (A-Z) e achata tudo numa lista única para a FlatList:
// [cabeçalho, linha, linha, cabeçalho, linha, ...]. `headers` guarda os índices
// dos cabeçalhos, que ficam colados ao topo ao fazer scroll.
function buildList(cars, query, lang, noBrand) {
  const q = norm(query);
  const groups = new Map();
  for (const c of cars) {
    if (q && !norm(c.brand).includes(q) && !norm(c.model).includes(q)) continue;
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
  const width = useCardWidth();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // mantém a escrita fluida em coleções grandes
  const noBrand = t('collection.noBrand');

  const { items, headers } = useMemo(
    () => buildList(cars, deferredQuery, lang, noBrand),
    [cars, deferredQuery, lang, noBrand]
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
            <CarCard key={car.id} car={car} no={numberOf(car.id)} width={width} onPress={openCar} />
          ))}
        </View>
      ),
    [numberOf, width, openCar]
  );

  return (
    <View style={s.root}>
      <ScreenHeader title={t('collection.title')} count={cars.length} />

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

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickyHeaderIndices={headers}
        contentContainerStyle={[s.list, !items.length && s.grow]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={7}
        ListEmptyComponent={
          !loaded ? null : cars.length ? (
            <EmptyState
              icon="search-outline"
              title={t('collection.noResults.title')}
              text={t('collection.noResults.text', { query: query.trim() })}
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
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, marginBottom: 4,
    paddingHorizontal: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.field,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 16, paddingVertical: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  grow: { flexGrow: 1 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingTop: 16, paddingBottom: 10, backgroundColor: C.bg, // opaco: o cabeçalho cola ao topo
  },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionCount: { color: C.muted, fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
});
