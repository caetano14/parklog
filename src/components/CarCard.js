import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './AppText';
import CarPhoto from './CarPhoto';
import { C, RADIUS, flagOf, rarityColor } from '../constants';
import { useI18n } from '../i18n/I18nContext';

// A foto desvanece para o preto do cartão (#0A0A0A) e o texto assenta nessa transição: sem linhas
// de separação. A largura vem de `style` (célula da grelha ou linha). Em memo: só volta a
// desenhar quando o carro, o número ou o idioma mudam.
function CarCard({ car, no, onPress, style }) {
  const { t } = useI18n();
  const color = rarityColor(car.rarity);
  const rarity = t(`rarity.${car.rarity}`, { defaultValue: car.rarity });
  const country = car.country ? t(`country.${car.country}`, { defaultValue: car.country }) : '';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(car.id)}
      style={[s.card, { borderColor: color + '66' }, style]}
      accessibilityRole="button"
      accessibilityLabel={`${car.brand ?? ''} ${car.model ?? ''}, ${rarity}`.trim()}
    >
      <View style={s.photoWrap}>
        <CarPhoto photo={car.photo} id={car.id} style={s.photo} />
        <LinearGradient colors={['transparent', C.bg]} locations={[0.35, 1]} style={s.fade} />
        <View style={s.numTag}>
          <Text style={s.numTxt}>{t('card.no', { n: String(no).padStart(3, '0') })}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: color }]}>
          <Text style={s.badgeTxt}>{rarity}</Text>
        </View>
      </View>

      <View style={s.body}>
        {car.model ? <Text style={s.brand} numberOfLines={1}>{car.brand}</Text> : null}
        {/* Sem modelo, a marca passa a ser o título principal */}
        <Text style={s.title} numberOfLines={1}>{car.model || car.brand || t('card.unnamed')}</Text>
        <View style={s.meta}>
          <Text style={s.metaTxt}>{car.year}</Text>
          {car.country ? <Text style={[s.metaTxt, s.country]} numberOfLines={1}>{flagOf(car.country)} {country}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(CarCard);

const s = StyleSheet.create({
  card: { backgroundColor: C.bg, borderRadius: RADIUS.card, borderWidth: 1, overflow: 'hidden' },
  photoWrap: { width: '100%', aspectRatio: 4 / 3 },
  photo: { ...StyleSheet.absoluteFillObject },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%', pointerEvents: 'none' },
  numTag: {
    position: 'absolute', top: 8, left: 8, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3, backgroundColor: 'rgba(10,10,10,0.7)',
  },
  numTxt: { color: C.text, fontSize: 11, fontWeight: '700' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt: { color: C.onAccent, fontSize: 11, fontWeight: '800' },
  // Altura fixa: todos os cartões ficam iguais e a FlashList não precisa de os medir; a margem
  // negativa faz o texto subir para cima da transição da foto
  body: { height: 86, marginTop: -24, paddingHorizontal: 12, paddingBottom: 12, justifyContent: 'flex-end' },
  brand: { fontFamily: 'display', color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.6 },
  title: { fontFamily: 'display', color: C.text, fontSize: 19, fontWeight: '700', letterSpacing: 0.2 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 4, minHeight: 16 },
  metaTxt: { color: C.muted, fontSize: 12 },
  country: { flexShrink: 1 },
});
