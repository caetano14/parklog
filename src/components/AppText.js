import { StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native';
import { FONTS } from '../constants';

// Escolhe a letra a partir do peso do estilo, por isso os estilos continuam a usar fontWeight:
//   fontFamily: 'display'  → Oswald (títulos, números, marcas)
//   sem fontFamily         → Inter (texto geral)
// Com letras personalizadas cada peso é uma família própria, daí o mapa em FONTS.
const withFont = (style) => {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily && flat.fontFamily !== 'display') return flat; // letra explícita: respeita
  const display = flat.fontFamily === 'display';
  const set = display ? FONTS.display : FONTS.body;
  const out = { ...flat, fontFamily: set[String(flat.fontWeight ?? '400')] ?? set['400'], fontWeight: 'normal' };
  if (display && (flat.letterSpacing ?? 0) < 0) out.letterSpacing = 0.3; // o Oswald já é condensado
  return out;
};

export function Text({ style, ...props }) {
  return <RNText {...props} style={withFont(style)} />;
}

export function TextInput({ style, ...props }) {
  return <RNTextInput {...props} style={withFont(style)} />;
}
