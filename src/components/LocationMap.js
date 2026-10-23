import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { C, RADIUS } from '../constants';

export default function LocationMap({ location, color, title }) {
  const { latitude, longitude } = location ?? {};
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      <View style={s.map}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          userInterfaceStyle="dark"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker coordinate={{ latitude, longitude }} pinColor={color} />
        </MapView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24 },
  title: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  map: { height: 180, borderRadius: RADIUS.card, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
});
