import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/AppText';
import CarPhoto from '../components/CarPhoto';
import LocationMap from '../components/LocationMap';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS, RARITIES, flagOf } from '../constants';
import { formatDate, formatTime, registeredAt } from '../utils/dates';

export default function CarDetailScreen({ route, navigation }) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { cars, removeCar, numberOf } = useCars();
  const car = cars.find((c) => c.id === route.params.id);
  if (!car) return null; // já foi removido

  const color = RARITIES[car.rarity] ?? C.muted;
  const rarity = t(`rarity.${car.rarity}`, { defaultValue: car.rarity });
  const country = car.country ? t(`country.${car.country}`, { defaultValue: car.country }) : '';
  const when = registeredAt(car); // dia e hora a que o carro foi registado
  const rows = [
    [t('detail.year'), car.year || '—'],
    [t('detail.country'), car.country ? `${flagOf(car.country)} ${country}` : '—'],
    [t('detail.number'), String(numberOf(car.id)).padStart(3, '0')],
    ...(when ? [[t('detail.date'), formatDate(when, lang)], [t('detail.time'), formatTime(when, lang)]] : []),
  ];

  const confirmRemove = () =>
    Alert.alert(`${car.brand} ${car.model || ''}`.trim(), t('detail.removeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => { navigation.goBack(); removeCar(car); } },
    ]);

  return (
    <View style={s.root}>
      {/* Sem cabeçalho nativo: com ele transparente o iOS deslocava o conteúdo e a foto ficava cortada
          em cima. O botão de voltar é desenhado aqui, por cima da foto. */}
      <ScrollView
        style={s.root}
        contentContainerStyle={s.content}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
      >
        {/* Foto a toda a largura, no topo do ecrã, a desvanecer para o preto */}
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

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        style={[s.back, { top: insets.top + 8 }]}
      >
        <Ionicons name="chevron-back" size={24} color={C.text} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 48 },
  back: {
    position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,10,10,0.6)',
    borderWidth: 1, borderColor: C.border,
  },
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
  value: { color: C.text, fontSize: 15, fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  remove: {
    marginTop: 32, paddingVertical: 14, borderRadius: RADIUS.card, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.danger,
  },
  removeTxt: { color: C.danger, fontSize: 16, fontWeight: '700' },
});
