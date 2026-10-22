import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CarCard, { useCardWidth } from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

const RECENT_LIMIT = 9;

export default function HomeScreen({ navigation }) {
  const { t } = useI18n();
  const { cars, loaded, numberOf } = useCars();
  const width = useCardWidth();
  const recent = useMemo(() => cars.slice(0, RECENT_LIMIT), [cars]); // a lista já vem do mais recente

  const openCar = useCallback((id) => navigation.navigate('CarDetail', { id }), [navigation]);
  const keyExtractor = useCallback((c) => c.id, []);
  const renderItem = useCallback(
    ({ item }) => <CarCard car={item} no={numberOf(item.id)} width={width} onPress={openCar} />,
    [numberOf, width, openCar]
  );

  return (
    <View style={s.root}>
      <ScreenHeader title="ParkLog" count={cars.length} />
      <FlatList
        data={recent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={[s.list, !recent.length && s.grow]}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        ListHeaderComponent={recent.length ? <Text style={s.section}>{t('home.recent')}</Text> : null}
        ListEmptyComponent={
          loaded ? (
            <EmptyState
              icon="car-sport-outline"
              title={t('home.empty.title')}
              text={t('home.empty.text')}
              actionLabel={t('home.empty.action')}
              onAction={() => navigation.navigate('AddCar')}
            />
          ) : null
        }
        ListFooterComponent={
          cars.length > RECENT_LIMIT ? (
            <TouchableOpacity activeOpacity={0.85} style={s.more} onPress={() => navigation.navigate('Collection')}>
              <Text style={s.moreTxt}>{t('home.seeAll', { n: cars.length })}</Text>
              <Ionicons name="arrow-forward" size={16} color={C.text} />
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingBottom: 32 },
  grow: { flexGrow: 1 },
  row: { gap: 12, marginBottom: 14 },
  section: { color: C.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2, marginBottom: 14 },
  more: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 6,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: RADIUS.pill,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderStrong,
  },
  moreTxt: { color: C.text, fontSize: 14, fontWeight: '700' },
});
