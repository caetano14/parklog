import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/AppText';
import CarPhoto from '../components/CarPhoto';
import LocationMap from '../components/LocationMap';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS, RARITIES, flagOf } from '../constants';

export default function CarDetailScreen({ route, navigation }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const { cars, removeCar, numberOf } = useCars();
  const car = cars.find((c) => c.id === route.params.id);
  if (!car) return null; // já foi removido

  const color = RARITIES[car.rarity] ?? C.muted;
  const rarity = t(`rarity.${car.rarity}`, { defaultValue: car.rarity });
  const country = car.country ? t(`country.${car.country}`, { defaultValue: car.country }) : '';
  const rows = [
    [t('detail.year'), car.year || '—'],
    [t('detail.country'), car.country ? `${flagOf(car.country)} ${country}` : '—'],
    [t('detail.number'), String(numberOf(car.id)).padStart(3, '0')],
  ];

  const confirmRemove = () =>
    Alert.alert(`${car.brand} ${car.model || ''}`.trim(), t('detail.removeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => { navigation.goBack(); removeCar(car); } },
    ]);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Foto a toda a largura, por baixo do cabeçalho transparente, a desvanecer para o preto */}
      <View style={{ width, height: width * 0.9 }}>
        <CarPhoto photo={car.photo} id={car.id} style={StyleSheet.absoluteFill} transition={350} />
        <LinearGradient colors={['rgba(10,10,10,0.7)', 'transparent']} style={s.topFade} />
        <LinearGradient colors={['transparent', C.bg]} locations={[0.4, 1]} style={s.bottomFade} />
      </View>

      <View style={s.info}>
        <View style={[s.badge, { backgroundColor: color }]}>
          <Text style={s.badgeTxt}>{rarity}</Text>
        </View>
        {car.model ? <Text style={s.brand}>{car.brand}</Text> : null}
        <Text style={s.title}>{car.model || car.brand}</Text>

        <View style={s.rows}>
          {rows.map(([label, value]) => (
            <View key={label} style={s.row}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        {car.location ? <LocationMap location={car.location} color={color} title={t('detail.location')} /> : null}

        <TouchableOpacity activeOpacity={0.85} style={s.remove} onPress={confirmRemove}>
          <Text style={s.removeTxt}>{t('detail.remove')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 48 },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  info: { paddingHorizontal: 20, marginTop: -64 }, // sobe para cima do desvanecer da foto
  badge: { alignSelf: 'flex-start', borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 4 },
  badgeTxt: { color: C.onAccent, fontSize: 13, fontWeight: '800' },
  brand: { fontFamily: 'display', color: C.muted, fontSize: 16, fontWeight: '600', letterSpacing: 1, marginTop: 14 },
  title: { fontFamily: 'display', color: C.text, fontSize: 40, fontWeight: '700', letterSpacing: 0.3, marginTop: 2 },
  rows: { gap: 10, marginTop: 22 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.card, borderRadius: RADIUS.card, paddingHorizontal: 16, paddingVertical: 15,
  },
  label: { color: C.muted, fontSize: 15 },
  value: { color: C.text, fontSize: 15, fontWeight: '700' },
  remove: {
    marginTop: 32, paddingVertical: 14, borderRadius: RADIUS.card, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.danger,
  },
  removeTxt: { color: C.danger, fontSize: 16, fontWeight: '700' },
});
