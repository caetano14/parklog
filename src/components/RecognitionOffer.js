import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

// Convite a ativar o reconhecimento automático, no momento em que faz sentido: já há uma foto
// e a opção está desligada. "Agora não" não volta a perguntar (a opção continua no Perfil).
export default function RecognitionOffer({ onEnable, onDismiss }) {
  const { t } = useI18n();
  return (
    <View style={s.box}>
      <Ionicons name="sparkles-outline" size={22} color={C.gold} style={s.icon} />
      <View style={s.texts}>
        <Text style={s.title}>{t('rec.offerTitle')}</Text>
        <Text style={s.hint}>{t('rec.offerHint')}</Text>
        <View style={s.actions}>
          <TouchableOpacity activeOpacity={0.85} style={s.primary} onPress={onEnable}>
            <Text style={s.primaryTxt}>{t('rec.offerEnable')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={s.secondary} onPress={onDismiss}>
            <Text style={s.secondaryTxt}>{t('rec.offerNo')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: 'row', gap: 12, padding: 14, backgroundColor: C.card, borderRadius: RADIUS.card,
    borderWidth: 1, borderColor: C.border,
  },
  icon: { marginTop: 1 },
  texts: { flex: 1 },
  title: { color: C.text, fontSize: 15, fontWeight: '700' },
  hint: { color: C.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  primary: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill, backgroundColor: C.accent },
  primaryTxt: { color: C.onAccent, fontSize: 13, fontWeight: '800' },
  secondary: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill, backgroundColor: C.field },
  secondaryTxt: { color: C.text, fontSize: 13, fontWeight: '700' },
});
