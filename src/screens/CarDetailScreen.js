import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCars } from '../context/CarsContext';
import { C, RARITIES, flagOf } from '../constants';
import { photoUri } from '../utils/photos';

export default function CarDetailScreen({ route, navigation }) {
    const { cars, removeCar, numberOf } = useCars();
    const car = cars.find((c) => c.id === route.params.id);
    if (!car) return null; // já foi removido

    const color = RARITIES[car.rarity] ?? C.muted;
    const rows = [
        ['Ano', car.year || '—'],
        ['País de origem', car.country ? `${flagOf(car.country)} ${car.country}` : '—'],
        ['Nº de registo', String(numberOf(car.id)).padStart(3, '0')],
    ];

    const confirmRemove = () =>
        Alert.alert(`${car.brand} ${car.model || ''}`.trim(), 'Remover este carro da caderneta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => { navigation.goBack(); removeCar(car); } },
        ]);

    return (
        <ScrollView style={s.root}>
            <Image source={{ uri: photoUri(car.photo) }} style={[s.photo, { borderBottomColor: color }]} />
            <View style={s.info}>
                <View style={[s.badge, { backgroundColor: color }]}>
                    <Text style={s.badgeTxt}>{car.rarity}</Text>
                </View>
                {car.model ? <Text style={s.brand}>{car.brand}</Text> : null}
                <Text style={s.title}>{car.model || car.brand}</Text>

                <View style={s.table}>
                    {rows.map(([label, value]) => (
                        <View key={label} style={s.line}>
                            <Text style={s.label}>{label}</Text>
                            <Text style={s.value}>{value}</Text>
                        </View>
                    ))}
                </View>

                <Pressable style={s.remove} onPress={confirmRemove}>
                    <Text style={s.removeTxt}>Remover carro</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    photo: { width: '100%', aspectRatio: 4 / 3, backgroundColor: C.field, borderBottomWidth: 3 },
    info: { padding: 20, paddingBottom: 48 },
    badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
    badgeTxt: { color: C.onAccent, fontSize: 13, fontWeight: '800' },
    brand: { color: C.muted, fontSize: 16, fontWeight: '600', marginTop: 14 },
    title: { color: C.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
    table: { marginTop: 22, borderTopWidth: 1, borderTopColor: C.border },
    line: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    label: { color: C.muted, fontSize: 15 },
    value: { color: C.text, fontSize: 15, fontWeight: '700' },
    remove: {
        marginTop: 32, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
        borderWidth: 1.5, borderColor: C.danger,
    },
    removeTxt: { color: C.danger, fontSize: 16, fontWeight: '700' },
});