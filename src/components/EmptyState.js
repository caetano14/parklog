import { StyleSheet, Text, View } from 'react-native';
import { C } from '../constants';

export default function EmptyState({ icon, title, text }) {
    return (
        <View style={s.wrap}>
            <Text style={s.icon}>{icon}</Text>
            <Text style={s.title}>{title}</Text>
            <Text style={s.text}>{text}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { paddingTop: 70, paddingHorizontal: 32 },
    icon: { fontSize: 60, textAlign: 'center' },
    title: { color: C.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 14 },
    text: { color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
});