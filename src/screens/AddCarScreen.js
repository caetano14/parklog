import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import BrandPicker from '../components/BrandPicker';
import Chip from '../components/Chip';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { useSettings } from '../context/SettingsContext';
import { useI18n } from '../i18n/I18nContext';
import { C, COUNTRIES, RADIUS, RARITIES } from '../constants';
import { getPhotoLocation } from '../utils/location';
import { compressPhoto, discardTemp, saveCopyToGallery } from '../utils/photos';
import { countryOfBrand } from '../data/carBrands';
import { modelSuggestions } from '../data/carModels';
import { calculateRarity } from '../utils/rarityEngine';
import RecognitionBanner from '../components/RecognitionBanner';
import RecognitionOffer from '../components/RecognitionOffer';
import { isRecognitionConfigured, recognizeCar } from '../services/recognition';
import { yearOptions } from '../services/recognitionFormat';

const EMPTY = { photo: null, brand: '', model: '', year: '', country: '', rarity: 'Comum' };
const MIN_YEAR = 1886;
const PICKER_OPTIONS = {
  mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8, exif: false,
};

const Field = ({ label, optional, error, inputRef, ...props }) => {
  const { t } = useI18n();
  return (
    <View style={s.group}>
      <Text style={s.label}>
        {label}
        {optional ? <Text style={s.optional}> ({t('common.optional')})</Text> : null}
      </Text>
      <TextInput
        ref={inputRef}
        style={[s.input, error && s.inputError]}
        placeholderTextColor={C.muted}
        selectionColor={C.text}
        {...props}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
};

export default function AddCarScreen({ navigation }) {
  const { t } = useI18n();
  const tabH = useBottomTabBarHeight();
  const { addCar } = useCars();
  const { saveToGallery, autoRecognize, recPromptDismissed, setSetting } = useSettings();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [countryManual, setCountryManual] = useState(false); // true depois de o utilizador escolher o país
  const [rarityManual, setRarityManual] = useState(false); // true depois de o utilizador escolher a raridade
  const scrollRef = useRef(null);
  const modelRef = useRef(null);
  const yearRef = useRef(null);
  const [rec, setRec] = useState({ status: 'idle' }); // reconhecimento: idle | loading | done | notcar | error
  const recId = useRef(0); // identifica o pedido em curso: respostas de fotos antigas são ignoradas
  const fRef = useRef(null); // valores atuais do formulário, para as respostas assíncronas
  const locationRef = useRef(null); // Promise com as coordenadas da foto tirada com a câmara
  const rarity = rarityManual ? f.rarity : calculateRarity(f.brand, f.model);
  const country = countryManual ? f.country : (countryOfBrand(f.brand) ?? ''); // país sugerido pela marca
  const suggestions = useMemo(() => modelSuggestions(f.brand, f.model), [f.brand, f.model]); // modelos da marca
  fRef.current = f;

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const canRecognize = autoRecognize && isRecognitionConfigured();
  // Convite a ativar o reconhecimento: já há foto, a opção está desligada e ainda não disse "Agora não"
  const offerRecognition = Boolean(f.photo) && !busy && !autoRecognize && !recPromptDismissed
    && isRecognitionConfigured() && rec.status === 'idle';

  // Reconhecimento automático: corre em segundo plano depois de a foto estar pronta
  const runRecognition = async (uri) => {
    const id = ++recId.current;
    setRec({ status: 'loading' });
    try {
      const data = await recognizeCar(uri);
      if (id !== recId.current) return; // entretanto escolheu outra foto (ou guardou)
      if (!data.isCar) return setRec({ status: 'notcar' });
      // Só preenche o que está vazio, com marca da lista e confiança alta ou média; dá para desfazer
      const cur = fRef.current;
      const trust = Boolean(data.brand) && data.confidence !== 'low';
      const fillBrand = trust && !cur.brand;
      const fillModel = trust && !cur.model && Boolean(data.model);
      if (fillBrand || fillModel) {
        setF((p) => ({ ...p, brand: fillBrand ? data.brand : p.brand, model: fillModel ? data.model : p.model }));
      }
      setRec({ status: 'done', data, applied: fillBrand || fillModel, prev: { brand: cur.brand, model: cur.model } });
    } catch (e) {
      if (id === recId.current) setRec({ status: 'error', code: e?.code });
    }
  };

  const applyRec = () => {
    const d = rec.data;
    setRec((r) => ({ ...r, applied: true, prev: { brand: f.brand, model: f.model } }));
    // Marca fora da lista: só se aplica quando o utilizador toca em "Aplicar" (nunca sozinha)
    setF((p) => ({ ...p, brand: d.brand ?? (d.brandText || p.brand), model: d.model || p.model }));
  };

  const undoRec = () => {
    setF((p) => ({ ...p, brand: rec.prev.brand, model: rec.prev.model }));
    setRec((r) => ({ ...r, applied: false }));
  };

  const pickPhoto = async (useCamera) => {
    if (busy) return;
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          return Alert.alert(
            t('cam.blockedTitle'),
            t('cam.blockedMsg'),
            perm.canAskAgain
              ? undefined
              : [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('cam.openSettings'), onPress: () => Linking.openSettings() },
                ]
          );
        }
      }
      const res = useCamera
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      const asset = res.canceled ? null : res.assets?.[0];
      if (!asset?.uri) return;
      // Só a câmara captura a localização (em paralelo); a galeria deixa-a a null
      locationRef.current = useCamera ? getPhotoLocation() : null;

      setBusy(true);
      // Só fotos tiradas com a câmara. A cópia é feita antes de comprimir, para a galeria
      // ficar com a qualidade original.
      if (useCamera && saveToGallery) {
        try {
          await saveCopyToGallery(asset.uri);
        } catch (e) {
          console.warn('Não foi possível guardar na galeria', e);
          Alert.alert(t('add.galleryFailTitle'), t('add.galleryFailMsg'));
        }
      }
      let uri = asset.uri;
      try {
        uri = await compressPhoto(asset.uri, asset.width); // reduz a foto antes de a mostrar e guardar
      } catch (e) {
        console.warn('Compressão falhou; uso a foto original', e);
      }
      if (f.photo && f.photo !== uri) discardTemp(f.photo); // liberta a foto anterior, se houver
      set('photo', uri);
      if (canRecognize) runRecognition(uri);
      else { recId.current += 1; setRec({ status: 'idle' }); }
    } catch (e) {
      console.warn('Falha ao obter a fotografia', e);
      Alert.alert(t('add.noPhotoTitle'), t('add.noPhotoMsg'));
    } finally {
      setBusy(false);
    }
  };

  const validate = () => {
    const e = {};
    const year = f.year.trim();
    const maxYear = new Date().getFullYear() + 1;
    if (!f.photo) e.photo = t('err.photo');
    if (!f.brand.trim()) e.brand = t('err.brand');
    if (year && (!/^\d{4}$/.test(year) || +year < MIN_YEAR || +year > maxYear)) {
      e.year = t('err.year', { min: MIN_YEAR, max: maxYear });
    }
    return e;
  };

  const save = async () => {
    if (busy) return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setBusy(true);
    try {
      // A localização começou a ser pedida quando a foto foi tirada; aqui só se espera pelo resultado
      const location = locationRef.current ? await locationRef.current : null;
      addCar({
        photo: f.photo,
        brand: f.brand.trim(),
        model: f.model.trim(),
        year: f.year.trim(),
        country,
        rarity,
        location, // null se a foto veio da galeria
      });
      locationRef.current = null;
      setRarityManual(false);
      recId.current += 1;
      setRec({ status: 'idle' });
      setCountryManual(false);
      setF(EMPTY);
      setErrors({});
      Keyboard.dismiss();
      scrollRef.current?.scrollTo({ y: 0, animated: false }); // o formulário volta ao topo para o próximo carro
      navigation.navigate('Home');
    } catch (err) {
      console.warn('Falha ao guardar o carro', err);
      Alert.alert(t('add.saveFailTitle'), t('add.saveFailMsg'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenHeader title={t('add.title')} />
      <ScrollView ref={scrollRef} contentContainerStyle={[s.form, { paddingBottom: tabH + 24 }]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={busy}
          onPress={() => pickPhoto(true)}
          style={[s.photoBox, errors.photo && s.inputError]}
        >
          {f.photo ? (
            <Image source={{ uri: f.photo }} style={s.photoImg} contentFit="cover" transition={200} cachePolicy="none" />
          ) : (
            <View style={s.photoEmpty}>
              <View style={s.iconCircle}>
                <Ionicons name="camera-outline" size={28} color={C.text} />
              </View>
              <Text style={s.photoTitle}>{t('add.photo')}</Text>
            </View>
          )}
          {f.photo && !busy ? (
            <View style={s.retake}>
              <Ionicons name="camera-reverse-outline" size={16} color={C.text} />
              <Text style={s.retakeTxt}>{t('add.retake')}</Text>
            </View>
          ) : null}
          {busy ? (
            <View style={s.busy}>
              <ActivityIndicator color={C.text} />
              <Text style={s.busyTxt}>{t('add.processing')}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        {errors.photo ? <Text style={[s.error, s.photoErr]}>{errors.photo}</Text> : null}
        <TouchableOpacity onPress={() => pickPhoto(false)} disabled={busy} hitSlop={8}>
          <Text style={s.link}>{t('add.gallery')}</Text>
        </TouchableOpacity>

        {offerRecognition ? (
          <RecognitionOffer
            onEnable={() => { setSetting('autoRecognize', true); runRecognition(f.photo); }}
            onDismiss={() => setSetting('recPromptDismissed', true)}
          />
        ) : null}
        <RecognitionBanner rec={rec} onApply={applyRec} onUndo={undoRec} onRetry={() => runRecognition(f.photo)} />

        <BrandPicker value={f.brand} onChange={(v) => set('brand', v)} error={errors.brand} />
        <Field
          optional
          label={t('add.model')}
          inputRef={modelRef}
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

        {rec.status === 'done' && yearOptions(rec.data).length ? (
          <View style={s.recYears}>
            <Text style={s.hint}>{t('rec.years')}</Text>
            <View style={s.chips}>
              {yearOptions(rec.data).map((y) => (
                <Chip key={y} label={String(y)} active={f.year === String(y)} onPress={() => set('year', f.year === String(y) ? '' : String(y))} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={s.group}>
          <Text style={s.label}>
            {t('add.country')}
            <Text style={s.optional}> ({t('common.optional')})</Text>
          </Text>
          <View style={s.chips}>
            {COUNTRIES.map((c) => (
              <Chip
                key={c.name}
                label={`${c.flag} ${t(`country.${c.name}`, { defaultValue: c.name })}`}
                active={country === c.name}
                onPress={() => { setCountryManual(true); set('country', country === c.name ? '' : c.name); }}
              />
            ))}
          </View>
        </View>

        <View style={s.group}>
          <Text style={s.label}>{t('add.rarity')}</Text>
          {!rarityManual && f.brand.trim() ? <Text style={s.hint}>{t('add.rarityAuto')}</Text> : null}
          <View style={s.chips}>
            {Object.entries(RARITIES).map(([name, color]) => (
              <Chip
                key={name}
                label={t(`rarity.${name}`, { defaultValue: name })}
                color={color}
                active={rarity === name}
                onPress={() => { set('rarity', name); setRarityManual(true); }}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} disabled={busy} style={[s.save, busy && s.saveOff]} onPress={save}>
          <Text style={s.saveTxt}>{t('add.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  form: { padding: 20, gap: 18, paddingBottom: 40 },

  photoBox: {
    aspectRatio: 4 / 3, borderRadius: RADIUS.card, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: C.borderStrong, backgroundColor: C.card, overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.field,
  },
  photoTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  retake: {
    position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: 'rgba(10,10,10,0.78)',
  },
  retakeTxt: { color: C.text, fontSize: 13, fontWeight: '700' },
  busy: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'rgba(10,10,10,0.75)',
  },
  busyTxt: { color: C.text, fontSize: 14, fontWeight: '600' },
  photoErr: { marginTop: -10 },
  link: { color: C.text, textAlign: 'center', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', marginTop: -6 },

  group: { gap: 8 },
  label: { color: C.text, fontSize: 14, fontWeight: '700' },
  optional: { color: C.muted, fontWeight: '500' },
  input: {
    backgroundColor: C.field, borderWidth: 1, borderColor: C.borderStrong, borderRadius: RADIUS.field,
    color: C.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13,
  },
  inputError: { borderColor: C.danger },
  error: { color: C.danger, fontSize: 13 },
  hint: { color: C.muted, fontSize: 12 },
  recYears: { gap: 8, marginTop: -6 },
  suggest: { marginTop: -8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  save: { backgroundColor: C.accent, borderRadius: RADIUS.card, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveOff: { opacity: 0.5 },
  saveTxt: { color: C.onAccent, fontSize: 17, fontWeight: '800' },
});
