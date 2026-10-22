import { memo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, RADIUS, SHADOW, flagOf, rarityColor } from '../constants';
import { useI18n } from '../i18n/I18nContext';
import { photoUri } from '../utils/photos';

// Largura de um cartão numa grelha de 2 colunas (margens de 16 + espaço de 12)
export const useCardWidth = () => (useWindowDimensions().width - 44) / 2;

// onPress recebe o id do carro, para o handler poder ser estável e o memo funcionar
function CarCard({ car, no, width, onPress }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const color = rarityColor(car.rarity);
  const uri = photoUri(car.photo);
  // Os valores guardados continuam em português; só a etiqueta mostrada é traduzida
  const rarity = t(`rarity.${car.rarity}`, { defaultValue: car.rarity });
  const country = car.country ? t(`country.${car.country}`, { defaultValue: car.country }) : '';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(car.id)}
      style={[s.shadow, { width }]}
      accessibilityRole="button"
      accessibilityLabel={`${car.brand ?? ''} ${car.model ?? ''}, ${rarity}`.trim()}
    >
      <View style={s.card}>
        <View style={s.photoWrap}>
          {uri && !failed ? (
            <Image
              source={{ uri }}
              style={s.photo}
              resizeMode="cover"
              resizeMethod="resize" // Android: descodifica já ao tamanho do cartão
              onError={() => setFailed(true)}
            />
          ) : (
            <View style={[s.photo, s.placeholder]}>
              <Ionicons name="car-sport-outline" size={34} color={C.muted} />
            </View>
          )}
          <View style={s.numTag}>
            <Text style={s.numTxt}>{t('card.no', { n: String(no).padStart(3, '0') })}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: color }]}>
            <Text style={s.badgeTxt}>{rarity}</Text>
          </View>
        </View>

        <View style={[s.rule, { backgroundColor: color }]} />

        <View style={s.body}>
          <View>
            {car.model ? <Text style={s.brand} numberOfLines={1}>{car.brand}</Text> : null}
            {/* Sem modelo, a marca passa a ser o título principal */}
            <Text style={s.title} numberOfLines={1}>{car.model || car.brand || t('card.unnamed')}</Text>
          </View>
          {car.year || car.country ? (
            <View style={s.meta}>
              <Text style={s.metaTxt}>{car.year}</Text>
              {car.country ? (
                <Text style={[s.metaTxt, s.country]} numberOfLines={1}>{flagOf(car.country)} {country}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(CarCard);

const s = StyleSheet.create({
  // A sombra fica no contentor exterior; o interior corta os cantos com overflow
  shadow: { backgroundColor: C.card, borderRadius: RADIUS.card, ...SHADOW },
  card: { flex: 1, borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  photoWrap: { width: '100%', aspectRatio: 4 / 3 },
  photo: { width: '100%', height: '100%', backgroundColor: C.field },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  numTag: {
    position: 'absolute', top: 8, left: 8, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3, backgroundColor: 'rgba(10,10,10,0.78)',
  },
  numTxt: { color: C.text, fontSize: 11, fontWeight: '700' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt: { color: C.onAccent, fontSize: 11, fontWeight: '800' },
  rule: { height: 2 },
  body: { flex: 1, minHeight: 84, padding: 12, justifyContent: 'space-between', gap: 8 },
  brand: { color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  title: { color: C.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  metaTxt: { color: C.muted, fontSize: 12 },
  country: { flexShrink: 1 },
});
