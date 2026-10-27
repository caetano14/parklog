import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

const Action = ({ label, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} style={s.action} onPress={onPress}>
    <Text style={s.actionTxt}>{label}</Text>
  </TouchableOpacity>
);

// Estado do reconhecimento automático por baixo da foto
export default function RecognitionBanner({ rec, onApply, onUndo, onRetry }) {
  const { t } = useI18n();
  const { status, data, applied } = rec;
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <View style={s.box}>
        <ActivityIndicator color={C.text} />
        <Text style={s.title}>{t('rec.loading')}</Text>
      </View>
    );
  }
  if (status === 'notcar' || status === 'error') {
    return (
      <View style={s.box}>
        <Ionicons name={status === 'error' ? 'cloud-offline-outline' : 'help-circle-outline'} size={22} color={C.muted} />
        <Text style={[s.title, s.muted]}>{status === 'error' ? t('rec.error') : t('rec.notCar')}</Text>
        {status === 'error' ? <Action label={t('rec.retry')} onPress={onRetry} /> : null}
      </View>
    );
  }

  const years = data.yearFrom ? (data.yearFrom === data.yearTo ? `${data.yearFrom}` : `${data.yearFrom}–${data.yearTo}`) : '';
  const name = `${data.brand ?? data.brandText} ${data.model}`.trim();
  const detail = [years, t(`rec.conf.${data.confidence}`)].filter(Boolean).join(' · ');

  return (
    <View style={s.box}>
      <Ionicons name="sparkles-outline" size={22} color={C.gold} />
      <View style={s.texts}>
        <Text style={s.caption}>{applied ? t('rec.applied') : t('rec.suggestion')}</Text>
        <Text style={s.title} numberOfLines={1}>{name}</Text>
        <Text style={s.detail}>{data.brand ? detail : t('rec.unsupportedBrand', { brand: data.brandText })}</Text>
      </View>
      {applied ? <Action label={t('rec.undo')} onPress={onUndo} /> : data.brand || data.brandText ? <Action label={t('rec.apply')} onPress={onApply} /> : null}
    </View>
  );
};

const s = StyleSheet.create({
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: C.card, borderRadius: RADIUS.card,
  },
  texts: { flex: 1 },
  caption: { color: C.gold, fontSize: 12, fontWeight: '700' },
  title: { flex: 1, color: C.text, fontSize: 16, fontWeight: '700' },
  muted: { color: C.muted, fontWeight: '500', fontSize: 14 },
  detail: { color: C.muted, fontSize: 13, marginTop: 1 },
  action: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill, backgroundColor: C.field },
  actionTxt: { color: C.text, fontSize: 13, fontWeight: '700' },
});
