import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import CarCard, { useCardWidth } from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { C } from '../constants';

// Ignora maiúsculas e acentos na pesquisa e no agrupamento
const norm = (t) => (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Divide uma lista em linhas de 2 (a SectionList não tem colunas)
const chunk = (arr) => {
    const rows = [];
    for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
    return rows;
};

export default function CollectionScreen({ navigation }) {
    const { cars, loaded, numberOf } = useCars();
    const width = useCardWidth();
    const [query, setQuery] = useState('');

    const sections = useMemo(() => {
        const q = norm(query);
        const groups = {};
        cars
            .filter((c) => !q || norm(c.brand).includes(q) || norm(c.model).includes(q))
            .forEach((c) => {
                const key = norm(c.brand);
                groups[key] = groups[key] || { title: c.brand, cars: [] };
                groups[key].cars.push(c);
            });
        return Object.values(groups)
            .sort((a, b) => a.title.localeCompare(b.title, 'pt', { sensitivity: 'base' }))
            .map((g) => ({ title: g.title, count: g.cars.length, data: chunk(g.cars) }));
    }, [cars, query]);

    return (
        <View style={s.root}>
            <ScreenHeader title="Caderneta" count={cars.length} />
            <TextInput
                style={s.search}
                value={query}
                onChangeText={setQuery}
                placeholder="Pesquisar por marca ou modelo"
                placeholderTextColor={C.muted}
                clearButtonMode="while-editing"
                autoCorrect={false}
                autoCapitalize="none"
            />
            <SectionList
                sections={sections}
                keyExtractor={(row) => row[0].id}
                stickySectionHeadersEnabled
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={s.list}
                renderSectionHeader={({ section }) => (
                    <View style={s.sectionHead}>
                        <Text style={s.sectionTitle}>{section.title}</Text>
                        <Text style={s.sectionCount}>{section.count}</Text>
                    </View>
                )}
                renderItem={({ item: row }) => (
                    <View style={s.row}>
                        {row.map((car) => (
                            <CarCard
                                key={car.id}
                                car={car}
                                no={numberOf(car.id)}
                                width={width}
                                onPress={() => navigation.navigate('CarDetail', { id: car.id })}
                            />
                        ))}
                    </View>
                )}
                ListEmptyComponent={
                    loaded ? (
                        cars.length ? (
                            <EmptyState icon="🔍" title="Sem resultados" text={`Nenhum carro corresponde a "${query}".`} />
                        ) : (
                            <EmptyState icon="📖" title="Caderneta vazia" text="Os carros que registares aparecem aqui, agrupados por marca." />
                        )
                    ) : null
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    search: {
        margin: 16, marginBottom: 4, backgroundColor: C.field, borderWidth: 1, borderColor: C.border,
        borderRadius: 12, color: C.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12,
    },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    sectionHead: {
        flexDirection: 'row', alignItems: 'baseline', gap: 8,
        paddingTop: 16, paddingBottom: 10, backgroundColor: C.bg,
    },
    sectionTitle: { color: C.accent, fontSize: 20, fontWeight: '800' },
    sectionCount: { color: C.muted, fontSize: 14, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
});