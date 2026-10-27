import { Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './AppText';
import SafeBoundary from './SafeBoundary';
import { DARK_MAP_STYLE } from '../data/darkMapStyle';
import { useI18n } from '../i18n/I18nContext';
import { C, RADIUS } from '../constants';

// O react-native-maps só é carregado quando o mapa é desenhado: se falhar (módulo nativo
// em falta ou incompatível), aparece o texto das coordenadas e um atalho para a app Mapas.
function Map({ latitude, longitude, color }) {
  const Maps = require('react-native-maps');
  const MapView = Maps.default;
  return (
    <>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        customMapStyle={DARK_MAP_STYLE} // só tem efeito com Google Maps / Android
        userInterfaceStyle="dark"
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsPointsOfInterest={false}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Maps.Marker coordinate={{ latitude, longitude }} pinColor={color} />
      </MapView>
      {/* Vinheta escura: as margens do mapa fundem-se com o preto da app, mesmo no Apple Maps */}
      <LinearGradient
        colors={['rgba(10,10,10,0.55)', 'transparent', 'rgba(10,10,10,0.7)']}
        style={s.vignette}
      />
    </>
  );
}

export default function LocationMap({ location, color, title }) {
  const { t } = useI18n();
  const { latitude, longitude } = location ?? {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  const fallback = (
    <View style={s.fallback}>
      <Text style={s.coords}>{latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
      <Text style={s.unavailable}>{t('detail.mapUnavailable')}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={s.btn}
        onPress={() => Linking.openURL(`http://maps.apple.com/?ll=${latitude},${longitude}&q=ParkLog`)}
      >
        <Text style={s.btnTxt}>{t('detail.openMaps')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      <View style={s.map}>
        <SafeBoundary fallback={fallback}>
          <Map latitude={latitude} longitude={longitude} color={color} />
        </SafeBoundary>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24 },
  title: { fontFamily: 'display', color: C.text, fontSize: 18, fontWeight: '600', marginBottom: 10 },
  map: { height: 190, borderRadius: RADIUS.card, overflow: 'hidden', backgroundColor: C.card },
  vignette: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  coords: { color: C.text, fontSize: 16, fontWeight: '700' },
  unavailable: { color: C.muted, fontSize: 13 },
  btn: { marginTop: 4, paddingHorizontal: 18, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: C.accent },
  btnTxt: { color: C.onAccent, fontSize: 14, fontWeight: '800' },
});
