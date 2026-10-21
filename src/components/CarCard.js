import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { C, RARITIES, flagOf } from '../constants';
import { photoUri } from '../utils/photos';

// Largura de um cartão numa grelha de 2 colunas (margens de 16 + espaço de 12)
export const useCardWidth = () => (useWindowDimensions().width - 44) / 2;

export default function CarCard({ car, no, width, onPress }) {
    const color = RARITIES[car.rarity] ?? C.muted;
    return (
        <Pressable onPress={onPress} style={[s.card, { width, borderColor: color + '99' }]}>
            <Image source={{ uri: photoUri(car.photo) }} style={s.img} />
            <View style={s.numTag}>
                <Text style={s.numTxt}>Nº {String(no).padStart(3, '0')}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: color }]}>
                <Text style={s.badgeTxt}>{car.rarity}</Text>
            </View>
            <View style={s.body}>
                {car.model ? <Text style={s.brand} numberOfLines={1}>{car.brand}</Text> : null}
                <Text style={s.title} numberOfLines={1}>{car.model || car.brand}</Text>
                {car.year || car.country ? (
                    <View style={s.meta}>
                        <Text style={s.metaTxt}>{car.year}</Text>
                        {car.country ? (
                            <Text style={s.metaTxt} numberOfLines={1}>{flagOf(car.country)} {car.country}</Text>
                        ) : null}
                    </View>
                ) : null}
            </View>
        </Pressable>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1.5, overflow: 'hidden' },
    img: { width: '100%', aspectRatio: 4 / 3, backgroundColor: C.field },
    numTag: {
        position: 'absolute', top: 8, left: 8, borderRadius: 8,
        paddingHorizontal: 7, paddingVertical: 3, backgroundColor: 'rgba(20,23,28,0.78)',
    },
    numTxt: { color: C.text, fontSize: 11, fontWeight: '700' },
    badge: { position: 'absolute', top: 8, right: 8, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    badgeTxt: { color: C.onAccent, fontSize: 11, fontWeight: '800' },
    body: { padding: 11 },
    brand: { color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    title: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 1 },
    meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, gap: 6 },
    metaTxt: { color: C.muted, fontSize: 12, flexShrink: 1 },
});