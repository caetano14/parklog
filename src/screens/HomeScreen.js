import { useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/AppText';
import CarCard from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

const RECENT_LIMIT = 4;

export default function HomeScreen({ navigation }) {
  const { t } = useI18n();
  const { cars, loaded, numberOf } = useCars();
  const tabH = useBottomTabBarHeight(); // a lista passa por trás da barra de vidro
  const recent = useMemo(() => cars.slice(0, RECENT_LIMIT), [cars]); // a lista já vem do mais recente
  const listPad = useMemo(() => ({ paddingHorizontal: 10, paddingBottom: tabH + 16 }), [tabH]);

  const openCar = useCallback((id) => navigation.navigate('CarDetail', { id }), [navigation]);
  const keyExtractor = useCallback((c) => c.id, []);
  // A FlashList não tem espaçamento entre colunas: cada célula leva o seu próprio padding
  const renderItem = useCallback(
    ({ item }) => (
      <View style={s.cell}>
        <CarCard car={item} no={numberOf(item.id)} onPress={openCar} />
      </View>
    ),
    [numberOf, openCar]
  );

  return (
    <View style={s.root}>
      <ScreenHeader title="ParkLog" count={cars.length} />
      <FlashList
        data={recent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={listPad}
        drawDistance={200}
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
  cell: { padding: 6 },
  section: { fontFamily: 'display', color: C.text, fontSize: 20, fontWeight: '600', paddingHorizontal: 6, paddingTop: 16, paddingBottom: 10 },
  more: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 10,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: RADIUS.pill, backgroundColor: C.card,
  },
  moreTxt: { color: C.text, fontSize: 14, fontWeight: '700' },
});
