import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import Chip from './Chip';
import { useI18n } from '../i18n/I18nContext';
import { C, COUNTRIES, RADIUS, flagOf, rarityColor } from '../constants';
import { deriveCar } from '../utils/carForm';

// País e raridade do formulário (usado ao adicionar e ao editar um carro).
// Marca da lista: o país e a raridade aparecem só para ler. Marca desconhecida: avisa e deixa
// escolher o país (a raridade continua automática).
export default function CountryRarity({ brand, model, country, onCountry }) {
  const { t } = useI18n();
  if (!String(brand ?? '').trim()) return null;

  const d = deriveCar({ brand, model, country });
  const rarity = t(`rarity.${d.rarity}`, { defaultValue: d.rarity });

  return (
    <>
      <View style={s.group}>
        <Text style={s.label}>{t('add.country')}</Text>
        {d.brandKnown ? (
          <>
            <View style={s.fixed}>
              <Text style={s.fixedTxt}>
                {d.country ? `${flagOf(d.country)} ${t(`country.${d.country}`, { defaultValue: d.country })}` : '—'}
              </Text>
            </View>
            <Text style={s.hint}>{t('add.countryAuto')}</Text>
          </>
        ) : (
          <>
            <View style={s.warn}>
              <Ionicons name="alert-circle-outline" size={20} color={C.gold} />
              <Text style={s.warnTxt}>{t('add.brandUnknown')}</Text>
            </View>
            <View style={s.chips}>
              {COUNTRIES.map((c) => (
                <Chip
                  key={c.name}
                  label={`${c.flag} ${t(`country.${c.name}`, { defaultValue: c.name })}`}
                  active={country === c.name}
                  onPress={() => onCountry(country === c.name ? '' : c.name)}
                />
              ))}
            </View>
          </>
        )}
      </View>

      <View style={s.group}>
        <Text style={s.label}>{t('add.rarity')}</Text>
        <View style={[s.badge, { backgroundColor: rarityColor(d.rarity) }]}>
          <Text style={s.badgeTxt}>{rarity}</Text>
        </View>
        <Text style={s.hint}>{t('add.rarityAuto')}</Text>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  group: { gap: 8 },
  label: { color: C.text, fontSize: 14, fontWeight: '700' },
  hint: { color: C.muted, fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fixed: {
    backgroundColor: C.card, borderRadius: RADIUS.field, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  fixedTxt: { color: C.text, fontSize: 16, fontWeight: '600' },
  warn: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12,
    backgroundColor: C.card, borderRadius: RADIUS.field, borderWidth: 1, borderColor: C.border,
  },
  warnTxt: { flex: 1, color: C.text, fontSize: 13, lineHeight: 18 },
  badge: { alignSelf: 'flex-start', borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 6 },
  badgeTxt: { color: C.onAccent, fontSize: 14, fontWeight: '800' },
});
