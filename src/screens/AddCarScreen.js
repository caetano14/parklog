import { useState } from 'react';
import {
    Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Chip from '../components/Chip';
import ScreenHeader from '../components/ScreenHeader';
import { useCars } from '../context/CarsContext';
import { C, COUNTRIES, RARITIES } from '../constants';

const EMPTY = { photo: null, brand: '', model: '', year: '', country: '', rarity: 'Comum' };

const Field = ({ label, optional, ...props }) => (
    <View style={s.group}>
        <Text style={s.label}>{label}{optional ? ' (opcional)' : ''}</Text>
        <TextInput style={s.input} placeholderTextColor={C.muted} {...props} />
    </View>
);

export default function AddCarScreen({ navigation }) {
    const { addCar } = useCars();
    const [f, setF] = useState(EMPTY);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

    const pickPhoto = async (useCamera) => {
        try {
            if (useCamera) {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) {
                    return Alert.alert('Câmara bloqueada', 'Autoriza a câmara nas definições do telemóvel para fotografar o carro.');
                }
            }
            const options = { mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 };
            const res = useCamera
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);
            if (!res.canceled) set('photo', res.assets[0].uri);
        } catch {
            Alert.alert('Sem fotografia', 'Não foi possível abrir a câmara. Tenta escolher da galeria.');
        }
    };

    const save = () => {
        const brand = f.brand.trim();
        const year = f.year.trim();
        const maxYear = new Date().getFullYear() + 1;
        if (!f.photo) return Alert.alert('Falta a fotografia', 'Tira uma foto ao carro para criar o cromo.');
        if (!brand) return Alert.alert('Falta a marca', 'Escreve a marca do carro.');
        if (year && (!/^\d{4}$/.test(year) || +year < 1886 || +year > maxYear)) {
            return Alert.alert('Ano inválido', `Escreve um ano entre 1886 e ${maxYear}, ou deixa o campo vazio.`);
        }
        addCar({ photo: f.photo, brand, model: f.model.trim(), year, country: f.country, rarity: f.rarity });
        setF(EMPTY);
        navigation.navigate('Home');
    };

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScreenHeader title="Novo carro" />
            <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
                <Pressable style={s.photoBox} onPress={() => pickPhoto(true)}>
                    {f.photo ? (
                        <Image source={{ uri: f.photo }} style={s.photoImg} />
                    ) : (
                        <>
                            <Text style={s.photoIcon}>📷</Text>
                            <Text style={s.photoHint}>Tirar fotografia</Text>
                        </>
                    )}
                </Pressable>
                <Pressable onPress={() => pickPhoto(false)} hitSlop={8}>
                    <Text style={s.link}>ou escolher da galeria</Text>
                </Pressable>

                <Field label="Marca" value={f.brand} onChangeText={(v) => set('brand', v)} placeholder="Ex.: Porsche" autoCapitalize="words" />
                <Field optional label="Modelo" value={f.model} onChangeText={(v) => set('model', v)} placeholder="Ex.: 911 Carrera" autoCapitalize="words" />
                <Field optional label="Ano" value={f.year} onChangeText={(v) => set('year', v.replace(/\D/g, ''))} placeholder="Ex.: 1998" keyboardType="number-pad" maxLength={4} />

                <View style={s.group}>
                    <Text style={s.label}>País de origem (opcional)</Text>
                    <View style={s.chips}>
                        {COUNTRIES.map((c) => (
                            <Chip
                                key={c.name}
                                label={`${c.flag} ${c.name}`}
                                active={f.country === c.name}
                                onPress={() => set('country', f.country === c.name ? '' : c.name)}
                            />
                        ))}
                    </View>
                </View>

                <View style={s.group}>
                    <Text style={s.label}>Raridade</Text>
                    <View style={s.chips}>
                        {Object.entries(RARITIES).map(([name, color]) => (
                            <Chip key={name} label={name} color={color} active={f.rarity === name} onPress={() => set('rarity', name)} />
                        ))}
                    </View>
                </View>

                <Pressable style={s.save} onPress={save}>
                    <Text style={s.saveTxt}>Guardar carro</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    form: { padding: 20, gap: 18, paddingBottom: 40 },
    photoBox: {
        aspectRatio: 4 / 3, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed',
        borderColor: C.accent, backgroundColor: C.card,
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    photoImg: { width: '100%', height: '100%' },
    photoIcon: { fontSize: 38 },
    photoHint: { color: C.text, fontSize: 15, fontWeight: '600', marginTop: 8 },
    link: { color: C.accent, textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: -6 },
    group: { gap: 8 },
    label: { color: C.muted, fontSize: 14, fontWeight: '600' },
    input: {
        backgroundColor: C.field, borderWidth: 1, borderColor: C.border, borderRadius: 12,
        color: C.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    save: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    saveTxt: { color: C.onAccent, fontSize: 17, fontWeight: '800' },
});