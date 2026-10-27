import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants';
import { photoUri } from '../utils/photos';

// Fotografia com expo-image: cache em disco, fade ao aparecer e `recyclingKey` para a FlashList
// não mostrar a foto de outro carro enquanto recicla a célula. Se falhar, mostra um ícone.
function CarPhoto({ photo, id, style, transition = 250 }) {
  const uri = photoUri(photo);
  const [failedUri, setFailedUri] = useState(null); // por URI: não "colar" o erro quando a célula é reciclada

  if (!uri || failedUri === uri) {
    return (
      <View style={[style, s.placeholder]}>
        <Ionicons name="car-sport-outline" size={34} color={C.muted} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={transition}
      cachePolicy="disk"
      recyclingKey={id}
      onError={() => setFailedUri(uri)}
    />
  );
}

export default memo(CarPhoto);

const s = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.field },
});
