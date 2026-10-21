import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CarCard, { useCardWidth } from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { C } from '../constants';

export default function HomeScreen({ navigation }) {
    const { cars, loaded, numberOf } = useCars();
    const width = useCardWidth();
    const recent = cars.slice(0, 9); // a lista já vem do mais recente para o mais antigo

    return (
        <View style={s.root}>
            <ScreenHeader title="ParkLog" count={cars.length} />
            <FlatList
                data={recent}
                keyExtractor={(c) => c.id}
                numColumns={2}
                columnWrapperStyle={s.row}
                contentContainerStyle={s.list}
                ListHeaderComponent={recent.length ? <Text style={s.section}>Adicionados recentemente</Text> : null}
                renderItem={({ item }) => (
                    <CarCard
                        car={item}
                        no={numberOf(item.id)}
                        width={width}
                        onPress={() => navigation.navigate('CarDetail', { id: item.id })}
                    />
                )}
                ListEmptyComponent={
                    loaded ? (
                        <EmptyState
                            icon="🚘"
                            title="A tua garagem está vazia"
                            text="Fotografa o primeiro carro que encontrares. Vai ao separador Adicionar para o registar."
                        />
                    ) : null
                }
                ListFooterComponent={
                    cars.length > 9 ? (
                        <Pressable style={s.more} onPress={() => navigation.navigate('Collection')}>
                            <Text style={s.moreTxt}>Ver os {cars.length} carros da caderneta</Text>
                        </Pressable>
                    ) : null
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    list: { padding: 16, paddingBottom: 32 },
    row: { gap: 12, marginBottom: 12 },
    section: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
    more: {
        alignSelf: 'center', marginTop: 4, paddingVertical: 12, paddingHorizontal: 18,
        borderRadius: 999, borderWidth: 1.5, borderColor: C.accent,
    },
    moreTxt: { color: C.accent, fontSize: 14, fontWeight: '700' },
});