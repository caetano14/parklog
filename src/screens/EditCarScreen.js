import { useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/AppText';
import BrandPicker from '../components/BrandPicker';
import CarPhoto from '../components/CarPhoto';
import Chip from '../components/Chip';
import CountryRarity from '../components/CountryRarity';
import Field from '../components/Field';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';
import { modelSuggestions } from '../data/carModels';
import { deriveCar, validateCarFields } from '../utils/carForm';
import { countryOf } from '../utils/filters';

// Edita marca, modelo e ano. O país (marca desconhecida) e a raridade são recalculados ao guardar;
// a foto, a data e a localização do registo não mudam.
export default function EditCarScreen({ route, navigation }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { cars, updateCar } = useCars();
  const car = cars.find((c) => c.id === route.params.id);
  const [f, setF] = useState(() => ({
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year ? String(car.year) : '',
    country: countryOf(car ?? {}) ?? '',
  }));
  const [errors, setErrors] = useState({});
  const yearRef = useRef(null);
  const suggestions = useMemo(() => modelSuggestions(f.brand, f.model), [f.brand, f.model]);
  if (!car) return null; // foi removido

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = () => {
    const e = validateCarFields(f, t);
    if (Object.keys(e).length) return setErrors(e);
    const { country, rarity } = deriveCar(f);
    updateCar(car.id, {
      brand: f.brand.trim(),
      model: f.model.trim(),
      year: f.year.trim(),
      country,
      rarity,
    });
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={s.back}
        >
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t('edit.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={[s.form, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
        <View style={s.photo}>
          <CarPhoto photo={car.photo} id={car.id} style={StyleSheet.absoluteFill} />
        </View>

        <BrandPicker value={f.brand} onChange={(v) => set('brand', v)} error={errors.brand} />
        <Field
          optional
          label={t('add.model')}
          value={f.model}
          onChangeText={(v) => set('model', v)}
          placeholder={t('add.modelPh')}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => yearRef.current?.focus()}
        />
        {suggestions.length ? (
          <View style={[s.chips, s.suggest]}>
            {suggestions.map((m) => (
              <Chip key={m} label={m} onPress={() => set('model', m)} />
            ))}
          </View>
        ) : null}
        <Field
          optional
          label={t('add.year')}
          inputRef={yearRef}
          value={f.year}
          onChangeText={(v) => set('year', v.replace(/\D/g, ''))}
          error={errors.year}
          placeholder={t('add.yearPh')}
          keyboardType="number-pad"
          maxLength={4}
        />

        <CountryRarity brand={f.brand} model={f.model} country={f.country} onCountry={(v) => set('country', v)} />

        <TouchableOpacity activeOpacity={0.85} style={s.save} onPress={save}>
          <Text style={s.saveTxt}>{t('edit.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  back: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  title: { fontFamily: 'display', color: C.text, fontSize: 28, fontWeight: '700', letterSpacing: 0.3 },
  form: { padding: 20, gap: 18 },
  photo: { aspectRatio: 4 / 3, borderRadius: RADIUS.card, overflow: 'hidden', backgroundColor: C.card },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggest: { marginTop: -8 },
  save: { backgroundColor: C.accent, borderRadius: RADIUS.card, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveTxt: { color: C.onAccent, fontSize: 17, fontWeight: '800' },
});
