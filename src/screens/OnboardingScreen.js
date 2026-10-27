import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/AppText';
import { useSettings } from '../context/SettingsContext';
import { useGalleryToggle } from '../hooks/useGalleryToggle';
import { LANGUAGES, useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';
import { isRecognitionConfigured } from '../services/recognition';
import { hideSplash } from '../utils/splash';

// Cada idioma aparece sempre na sua própria língua
const LANG_LABELS = {
  pt: { flag: '🇵🇹', label: 'Português' },
  en: { flag: '🇬🇧', label: 'English' },
};

const Dots = ({ step, total }) => (
  <View style={s.dots}>
    {Array.from({ length: total }, (_, i) => (
      <View key={i} style={[s.dot, i === step && s.dotOn]} />
    ))}
  </View>
);

const Pref = ({ icon, title, hint, value, onChange }) => (
  <View style={s.pref}>
    <View style={s.prefIcon}>
      <Ionicons name={icon} size={20} color={C.text} />
    </View>
    <View style={s.prefText}>
      <Text style={s.prefTitle}>{title}</Text>
      <Text style={s.prefHint}>{hint}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: C.field, true: C.accent }}
      thumbColor={value ? C.onAccent : C.muted}
      ios_backgroundColor={C.field}
    />
  </View>
);

// Introdução: 1) boas-vindas e idioma  2) preferências (tudo desligado por defeito)
export default function OnboardingScreen({ onDone }) {
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();
  const { saveToGallery, autoRecognize, setSetting } = useSettings();
  const onToggleGallery = useGalleryToggle();
  const recognitionReady = isRecognitionConfigured();
  const [step, setStep] = useState(0);

  useEffect(() => { hideSplash(); }, []); // a introdução substitui a navegação, que é quem normalmente tira o ecrã de arranque

  return (
    <View style={s.root}>
      <LinearGradient colors={['#1B1B1F', C.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Dots step={step} total={2} />

        {step === 0 ? (
          <View style={s.body}>
            <View style={s.logo}>
              <Ionicons name="car-sport" size={44} color={C.text} />
            </View>
            <Text style={s.brand}>ParkLog</Text>
            <Text style={s.tagline}>{t('profile.tagline')}</Text>
            <Text style={s.intro}>{t('onb.intro')}</Text>

            <Text style={s.label}>{t('onb.chooseLang')}</Text>
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
        ) : (
          <View style={s.body}>
            <Text style={s.title}>{t('onb.prefsTitle')}</Text>
            <Text style={s.sub}>{t('onb.prefsSub')}</Text>

            <View style={s.prefs}>
              <Pref
                icon="images-outline"
                title={t('profile.saveGallery')}
                hint={t('profile.saveGalleryHint')}
                value={saveToGallery}
                onChange={onToggleGallery}
              />
              {recognitionReady ? (
                <Pref
                  icon="sparkles-outline"
                  title={t('profile.recognitionTitle')}
                  hint={t('profile.recognitionHint')}
                  value={autoRecognize}
                  onChange={(v) => setSetting('autoRecognize', v)}
                />
              ) : null}
            </View>
          </View>
        )}

        <View style={s.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={s.primary}
            onPress={() => (step === 0 ? setStep(1) : onDone())}
          >
            <Text style={s.primaryTxt}>{step === 0 ? t('onb.next') : t('onb.start')}</Text>
          </TouchableOpacity>
          {step === 1 ? (
            <TouchableOpacity activeOpacity={0.7} hitSlop={10} onPress={() => setStep(0)}>
              <Text style={s.back}>{t('onb.back')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.borderStrong },
  dotOn: { width: 24, backgroundColor: C.text },

  body: { flex: 1, justifyContent: 'center', paddingVertical: 32 },
  logo: {
    width: 88, height: 88, borderRadius: 26, alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderStrong,
  },
  brand: { fontFamily: 'display', color: C.text, fontSize: 44, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginTop: 20 },
  tagline: { color: C.text, fontSize: 17, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  intro: { color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  label: { color: C.muted, fontSize: 13, fontWeight: '700', marginTop: 36, marginBottom: 10, marginLeft: 4 },

  segment: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: RADIUS.field, backgroundColor: C.field,
    borderWidth: 1, borderColor: C.borderStrong,
  },
  segActive: { backgroundColor: C.accent, borderColor: C.accent },
  flag: { fontSize: 18 },
  segTxt: { color: C.text, fontSize: 15, fontWeight: '700' },
  segTxtActive: { color: C.onAccent },

  title: { fontFamily: 'display', color: C.text, fontSize: 32, fontWeight: '700', letterSpacing: 0.3 },
  sub: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  prefs: { gap: 12, marginTop: 28 },
  pref: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    backgroundColor: C.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: C.border,
  },
  prefIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.field },
  prefText: { flex: 1 },
  prefTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  prefHint: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },

  footer: { gap: 16, alignItems: 'center' },
  primary: { alignSelf: 'stretch', backgroundColor: C.accent, borderRadius: RADIUS.card, paddingVertical: 16, alignItems: 'center' },
  primaryTxt: { color: C.onAccent, fontSize: 17, fontWeight: '800' },
  back: { color: C.muted, fontSize: 15, fontWeight: '600' },
});
