import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, RADIUS, SHADOW } from '../constants';

const AchievementToast = ({ text1, text2, props }) => (
  <View style={s.toast}>
    <View style={s.icon}>
      <Ionicons name={props?.icon ?? 'trophy'} size={22} color={C.onAccent} />
    </View>
    <View style={s.texts}>
      <Text style={s.label}>{props?.label}</Text>
      <Text style={s.title} numberOfLines={1}>{text1}</Text>
      <Text style={s.desc} numberOfLines={2}>{text2}</Text>
    </View>
  </View>
);

const config = { achievement: AchievementToast };

// Renderizar uma vez, depois da navegação, para os avisos ficarem por cima de tudo
export default function ToastHost() {
  const insets = useSafeAreaInsets();
  return <Toast config={config} topOffset={insets.top + 6} />;
}

const s = StyleSheet.create({
  toast: {
    width: '92%', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    backgroundColor: C.card, borderRadius: RADIUS.card, borderWidth: 1, borderColor: C.gold, ...SHADOW,
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.gold },
  texts: { flex: 1 },
  label: { color: C.gold, fontSize: 12, fontWeight: '800' },
  title: { color: C.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginTop: 1 },
  desc: { color: C.muted, fontSize: 13, marginTop: 2 },
});
