/**
 * ParkLog — caderneta de cromos de carros.
 * Cola este ficheiro como App.js num projeto Expo (SDK 54 ou superior).
 */
import { useEffect, useState } from 'react';
import {
  Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = '@parklog/cars';

// Paleta de garagem: asfalto + amarelo de sinalização rodoviária
const C = {
  bg: '#14171C', card: '#1C2027', field: '#242932', border: '#2F3541',
  text: '#ECEFF4', muted: '#8F99A8', accent: '#FFC83D', onAccent: '#14171C',
};

const RARITIES = { Comum: '#8793A6', Raro: '#3DA5FF', Exótico: '#FF3D71' };

const COUNTRIES = [
  { name: 'Alemanha', flag: '🇩🇪' }, { name: 'Itália', flag: '🇮🇹' },
  { name: 'Japão', flag: '🇯🇵' }, { name: 'EUA', flag: '🇺🇸' },
  { name: 'Reino Unido', flag: '🇬🇧' }, { name: 'França', flag: '🇫🇷' },
  { name: 'Suécia', flag: '🇸🇪' }, { name: 'Coreia do Sul', flag: '🇰🇷' },
  { name: 'Portugal', flag: '🇵🇹' }, { name: 'Outro', flag: '🌍' },
];
const flagOf = (name) => COUNTRIES.find((c) => c.name === name)?.flag ?? '🌍';

const EMPTY = { photo: null, brand: '', model: '', year: '', country: '', rarity: 'Comum' };

// A foto da câmara fica na cache (o sistema pode apagá-la). Por isso copio-a para a
// pasta de documentos e guardo só o nome do ficheiro no AsyncStorage.
const isUri = (p) => /^(file|content|https?):/.test(p);
const persistPhoto = (uri) => {
  try {
    const ext = uri.split('?')[0].split('.').pop() || 'jpg';
    const name = `car_${Date.now()}.${ext}`;
    new File(uri).copy(new File(Paths.document, name));
    return name;
  } catch {
    return uri; // plano B: mantém a URI original
  }
};
const photoUri = (p) => (isUri(p) ? p : new File(Paths.document, p).uri);

/* ---------- Componentes pequenos ---------- */

function CarCard({ car, no, width, onLongPress }) {
  const color = RARITIES[car.rarity] ?? C.muted;
  return (
    <Pressable onLongPress={onLongPress} style={[s.card, { width, borderColor: color + '99' }]}>
      <Image source={{ uri: photoUri(car.photo) }} style={s.cardImg} />
      <View style={s.numTag}>
        <Text style={s.numTxt}>Nº {String(no).padStart(3, '0')}</Text>
      </View>
      <View style={[s.badge, { backgroundColor: color }]}>
        <Text style={s.badgeTxt}>{car.rarity}</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.brand} numberOfLines={1}>{car.brand}</Text>
        <Text style={s.model} numberOfLines={1}>{car.model}</Text>
        <View style={s.meta}>
          <Text style={s.metaTxt}>{car.year}</Text>
          <Text style={s.metaTxt} numberOfLines={1}>{flagOf(car.country)} {car.country}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const Chip = ({ label, active, color = C.accent, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[s.chip, active && { backgroundColor: color, borderColor: color }]}
  >
    <Text style={[s.chipTxt, active && { color: C.onAccent }]}>{label}</Text>
  </Pressable>
);

const Field = ({ label, ...props }) => (
  <View style={s.group}>
    <Text style={s.label}>{label}</Text>
    <TextInput style={s.input} placeholderTextColor={C.muted} {...props} />
  </View>
);

/* ---------- Ecrã principal ---------- */

function ParkLog() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = (width - 44) / 2;

  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Carrega a coleção ao abrir a app
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setCars(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Guarda sempre que a coleção muda (só depois de carregar, para não apagar dados)
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars)).catch(() => {});
  }, [cars, loaded]);

  const close = () => { setOpen(false); setF(EMPTY); };

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
    const maxYear = new Date().getFullYear() + 1;
    if (!f.photo) return Alert.alert('Falta a fotografia', 'Tira uma foto ao carro para criar o cromo.');
    if (!f.brand.trim() || !f.model.trim()) return Alert.alert('Campos em falta', 'Preenche a marca e o modelo.');
    if (!/^\d{4}$/.test(f.year) || +f.year < 1886 || +f.year > maxYear) {
      return Alert.alert('Ano inválido', `Escreve um ano com 4 dígitos entre 1886 e ${maxYear}.`);
    }
    if (!f.country) return Alert.alert('Falta o país', 'Escolhe o país de origem do carro.');

    const car = {
      id: String(Date.now()),
      photo: persistPhoto(f.photo),
      brand: f.brand.trim(),
      model: f.model.trim(),
      year: f.year,
      country: f.country,
      rarity: f.rarity,
    };
    setCars((prev) => [car, ...prev]);
    close();
  };

  const removeCar = (car) =>
    Alert.alert(`${car.brand} ${car.model}`, 'Remover este carro da garagem?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          try { if (!isUri(car.photo)) new File(Paths.document, car.photo).delete(); } catch {}
          setCars((prev) => prev.filter((c) => c.id !== car.id));
        },
      },
    ]);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Cabeçalho */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.title}>ParkLog</Text>
        <View style={s.counter}>
          <Text style={s.counterNum}>{cars.length}</Text>
          <Text style={s.counterLbl}>{cars.length === 1 ? 'carro' : 'carros'}</Text>
        </View>
      </View>

      {/* Grelha de cromos */}
      <FlatList
        data={cars}
        keyExtractor={(c) => c.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={cars.length ? s.list : s.listEmpty}
        renderItem={({ item, index }) => (
          <CarCard car={item} no={cars.length - index} width={cardW} onLongPress={() => removeCar(item)} />
        )}
        ListEmptyComponent={
          loaded ? (
            <View>
              <Text style={s.emptyIcon}>🚘</Text>
              <Text style={s.emptyTitle}>A tua garagem está vazia</Text>
              <Text style={s.emptyTxt}>
                Fotografa o primeiro carro que encontrares e começa a coleção. Toca no + para o registar.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Botão flutuante */}
      <Pressable
        accessibilityLabel="Adicionar carro"
        onPress={() => setOpen(true)}
        style={[s.fab, { bottom: insets.bottom + 24 }]}
      >
        <Text style={s.fabTxt}>+</Text>
      </Pressable>

      {/* Formulário de registo */}
      <Modal visible={open} animationType="slide" statusBarTranslucent onRequestClose={close}>
        <KeyboardAvoidingView style={s.modal} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.modalHead, { paddingTop: insets.top + 12 }]}>
            <Text style={s.modalTitle}>Novo carro</Text>
            <Pressable onPress={close} hitSlop={14} accessibilityLabel="Fechar">
              <Text style={s.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[s.form, { paddingBottom: insets.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
          >
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
            <Field label="Modelo" value={f.model} onChangeText={(v) => set('model', v)} placeholder="Ex.: 911 Carrera" autoCapitalize="words" />
            <Field label="Ano" value={f.year} onChangeText={(v) => set('year', v.replace(/\D/g, ''))} placeholder="Ex.: 1998" keyboardType="number-pad" maxLength={4} />

            <View style={s.group}>
              <Text style={s.label}>País de origem</Text>
              <View style={s.chips}>
                {COUNTRIES.map((c) => (
                  <Chip key={c.name} label={`${c.flag} ${c.name}`} active={f.country === c.name} onPress={() => set('country', c.name)} />
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
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ParkLog />
    </SafeAreaProvider>
  );
}

/* ---------- Estilos ---------- */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { color: C.text, fontSize: 36, fontWeight: '800', letterSpacing: -1.2 },
  counter: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    borderWidth: 1.5, borderColor: C.accent, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  counterNum: { color: C.accent, fontSize: 20, fontWeight: '800' },
  counterLbl: { color: C.muted, fontSize: 13, fontWeight: '600' },

  list: { padding: 16, paddingBottom: 130 },
  listEmpty: { flexGrow: 1, justifyContent: 'center', padding: 36 },
  row: { gap: 12, marginBottom: 12 },

  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1.5, overflow: 'hidden' },
  cardImg: { width: '100%', aspectRatio: 4 / 3, backgroundColor: C.field },
  numTag: {
    position: 'absolute', top: 8, left: 8, borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3, backgroundColor: 'rgba(20,23,28,0.78)',
  },
  numTxt: { color: C.text, fontSize: 11, fontWeight: '700' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  badgeTxt: { color: C.onAccent, fontSize: 11, fontWeight: '800' },
  cardBody: { padding: 11 },
  brand: { color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  model: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 1 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, gap: 6 },
  metaTxt: { color: C.muted, fontSize: 12, flexShrink: 1 },

  emptyIcon: { fontSize: 60, textAlign: 'center' },
  emptyTitle: { color: C.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyTxt: { color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },

  fab: {
    position: 'absolute', right: 22, width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: C.accent, shadowOpacity: 0.45, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fabTxt: { color: C.onAccent, fontSize: 36, lineHeight: 40, fontWeight: '400', includeFontPadding: false },

  modal: { flex: 1, backgroundColor: C.bg },
  modalHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalTitle: { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  close: { color: C.muted, fontSize: 22 },
  form: { padding: 20, gap: 18 },

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
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    backgroundColor: C.field, borderWidth: 1, borderColor: C.border,
  },
  chipTxt: { color: C.text, fontSize: 14, fontWeight: '600' },

  save: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveTxt: { color: C.onAccent, fontSize: 17, fontWeight: '800' },
});