import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { C, RADIUS } from '../constants';

export default function EmptyState({ icon = 'car-sport-outline', title, text, actionLabel, onAction }) {
  return (
    <View style={s.wrap}>
      <View style={s.circle}>
        <Ionicons name={icon} size={34} color={C.muted} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.text}>{text}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity activeOpacity={0.85} style={s.btn} onPress={onAction}>
          <Text style={s.btnTxt}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 72, paddingBottom: 48 },
  circle: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  title: { fontFamily: 'display', color: C.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center', marginTop: 20 },
  text: { color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  btn: { marginTop: 22, backgroundColor: C.accent, borderRadius: RADIUS.pill, paddingHorizontal: 22, paddingVertical: 13 },
  btnTxt: { color: C.onAccent, fontSize: 15, fontWeight: '800' },
});
