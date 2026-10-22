import { useMemo } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useSettings } from '../context/SettingsContext';
import { LANGUAGES, useI18n } from '../i18n/I18nContext';
import { APP_INFO, C, RADIUS, RARITIES } from '../constants';
import { requestGalleryPermission } from '../utils/photos';
import { norm } from '../utils/text';

// Cada idioma aparece sempre na sua própria língua
const LANG_LABELS = {
  pt: { flag: '🇵🇹', label: 'Português' },
  en: { flag: '🇬🇧', label: 'English' },
};

const Stat = ({ icon, value, label }) => (
  <View style={s.tile}>
    <Ionicons name={icon} size={20} color={C.muted} />
    <Text style={s.tileValue}>{value}</Text>
    <Text style={s.tileLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

export default function ProfileScreen() {
  const { t, lang, setLang } = useI18n();
  const { cars } = useCars();
  const { saveToGallery, setSetting } = useSettings();

  // Ao ligar, pede logo a permissão; se for recusada, a opção fica desligada
  const onToggleGallery = async (next) => {
    if (!next) return setSetting('saveToGallery', false);
    try {
      const perm = await requestGalleryPermission();
      if (perm.granted) return setSetting('saveToGallery', true);
      Alert.alert(
        t('profile.galleryDeniedTitle'),
        t('profile.galleryDeniedMsg'),
        perm.canAskAgain
          ? undefined
          : [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('cam.openSettings'), onPress: () => Linking.openSettings() },
            ]
      );
    } catch (e) {
      console.warn('Permissão da galeria indisponível', e);
      Alert.alert(t('profile.galleryErrorTitle'), t('profile.galleryErrorMsg'));
    }
  };

  const stats = useMemo(() => {
    const brands = new Set();
    const byRarity = Object.fromEntries(Object.keys(RARITIES).map((r) => [r, 0]));
    for (const c of cars) {
      const brand = norm(c.brand);
      if (brand) brands.add(brand); // "porsche" e "Porsche" contam como uma só marca
      if (c.rarity in byRarity) byRarity[c.rarity] += 1;
    }
    return { total: cars.length, brands: brands.size, byRarity };
  }, [cars]);

  return (
    <View style={s.root}>
      <ScreenHeader title={t('profile.title')} />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.section}>{t('profile.language')}</Text>
        <View style={s.block}>
          <View style={s.segment}>
            {LANGUAGES.map((code) => {
              const active = lang === code;
              return (
                <TouchableOpacity
                  key={code}
                  activeOpacity={0.85}
                  onPress={() => setLang(code)}
                  style={[s.segBtn, active && s.segActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={s.flag}>{LANG_LABELS[code].flag}</Text>
                  <Text style={[s.segTxt, active && s.segTxtActive]}>{LANG_LABELS[code].label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={s.section}>{t('profile.photos')}</Text>
        <View style={s.block}>
          <View style={s.switchRow}>
            <View style={s.switchText}>
              <Text style={s.switchTitle}>{t('profile.saveGallery')}</Text>
              <Text style={s.switchHint}>{t('profile.saveGalleryHint')}</Text>
            </View>
            <Switch
              value={saveToGallery}
              onValueChange={onToggleGallery}
              trackColor={{ false: C.field, true: C.accent }}
              thumbColor={saveToGallery ? C.onAccent : C.muted}
              ios_backgroundColor={C.field}
            />
          </View>
        </View>

        <Text style={s.section}>{t('profile.stats')}</Text>
        <View style={s.block}>
          <View style={s.tiles}>
            <Stat icon="car-sport-outline" value={stats.total} label={t('profile.totalCars')} />
            <Stat icon="pricetags-outline" value={stats.brands} label={t('profile.brands')} />
          </View>
          <View style={s.divider} />
          <Text style={s.subLabel}>{t('profile.byRarity')}</Text>
          {Object.keys(RARITIES).map((name) => (
            <View key={name} style={s.rarityRow}>
              <View style={[s.dot, { backgroundColor: RARITIES[name] }]} />
              <Text style={s.rarityName}>{t(`rarity.${name}`)}</Text>
              <Text style={s.rarityCount}>{stats.byRarity[name]}</Text>
            </View>
          ))}
        </View>

        <Text style={s.section}>{t('profile.about')}</Text>
        <View style={s.block}>
          <Text style={s.appName}>ParkLog</Text>
          <Text style={s.tagline}>{t('profile.tagline')}</Text>
          <View style={s.divider} />
          <InfoRow label={t('profile.developer')} value={APP_INFO.developer} />
          <InfoRow label={t('profile.version')} value={APP_INFO.version} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  section: { color: C.muted, fontSize: 13, fontWeight: '700', marginTop: 12, marginLeft: 4 },
  block: { backgroundColor: C.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: C.border, padding: 16 },

  segment: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: RADIUS.field, backgroundColor: C.field,
    borderWidth: 1, borderColor: C.borderStrong,
  },
  segActive: { backgroundColor: C.accent, borderColor: C.accent },
  flag: { fontSize: 18 },
  segTxt: { color: C.text, fontSize: 15, fontWeight: '700' },
  segTxtActive: { color: C.onAccent },

  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  switchText: { flex: 1 },
  switchTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  switchHint: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },

  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, backgroundColor: C.field, borderRadius: RADIUS.field, padding: 14, gap: 4 },
  tileValue: { color: C.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 6 },
  tileLabel: { color: C.muted, fontSize: 13 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  subLabel: { color: C.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rarityName: { flex: 1, color: C.text, fontSize: 15 },
  rarityCount: { color: C.text, fontSize: 15, fontWeight: '700' },

  appName: { color: C.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  infoLabel: { color: C.muted, fontSize: 15 },
  infoValue: { color: C.text, fontSize: 15, fontWeight: '700' },
});
