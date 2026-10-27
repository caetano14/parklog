import { Pressable, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { C } from '../constants';

export default function Chip({ label, active, color = C.accent, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[s.txt, active && { color: C.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    backgroundColor: C.field, borderWidth: 1, borderColor: C.border,
  },
  txt: { color: C.text, fontSize: 14, fontWeight: '600' },
});
