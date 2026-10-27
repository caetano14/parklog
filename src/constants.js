import { Platform } from 'react-native';

// Design system "Garagem Exótica": preto profundo + cinzentos metálicos (zinc)
export const C = {
  bg: '#0A0A0A',
  card: '#18181B',
  field: '#27272A',
  border: '#2E2E33',
  borderStrong: '#3F3F46',
  text: '#FAFAFA',
  muted: '#A1A1AA',
  accent: '#FAFAFA',   // botões e destaques a branco: as cores ficam reservadas à raridade
  onAccent: '#0A0A0A', // texto sobre o accent e sobre as cores de raridade (contraste ≥ 4.7:1)
  danger: '#F87171',
  gold: '#F5C451', // conquistas desbloqueadas
};

// Cada peso é uma família própria (é assim que as letras do Google Fonts funcionam no React Native)
export const FONTS = {
  body: { 400: 'Inter_400Regular', 500: 'Inter_500Medium', 600: 'Inter_600SemiBold', 700: 'Inter_700Bold', 800: 'Inter_800ExtraBold' },
  display: { 400: 'Oswald_500Medium', 500: 'Oswald_500Medium', 600: 'Oswald_600SemiBold', 700: 'Oswald_700Bold', 800: 'Oswald_700Bold' },
};

export const RARITIES = { Comum: '#3B82F6', Raro: '#EF4444', Exótico: '#8B5CF6' };
export const rarityColor = (name) => RARITIES[name] ?? C.muted;

export const RADIUS = { card: 16, field: 12, pill: 999 };

// Sombra subtil: iOS usa shadow*, Android usa elevation
export const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  default: { elevation: 6 },
});

export const COUNTRIES = [
  { name: 'Alemanha', flag: '🇩🇪' }, { name: 'Itália', flag: '🇮🇹' },
  { name: 'Japão', flag: '🇯🇵' }, { name: 'EUA', flag: '🇺🇸' },
  { name: 'Reino Unido', flag: '🇬🇧' }, { name: 'França', flag: '🇫🇷' },
  { name: 'Suécia', flag: '🇸🇪' }, { name: 'Coreia do Sul', flag: '🇰🇷' },
  { name: 'Espanha', flag: '🇪🇸' }, { name: 'Chéquia', flag: '🇨🇿' },
  { name: 'Portugal', flag: '🇵🇹' }, { name: 'China', flag: '🇨🇳' },
  { name: 'Índia', flag: '🇮🇳' }, { name: 'Países Baixos', flag: '🇳🇱' },
  { name: 'Croácia', flag: '🇭🇷' }, { name: 'Roménia', flag: '🇷🇴' },
  { name: 'Dinamarca', flag: '🇩🇰' }, { name: 'Austrália', flag: '🇦🇺' },
  { name: 'Rússia', flag: '🇷🇺' }, { name: 'Outro', flag: '🌍' },
];

export const flagOf = (name) => COUNTRIES.find((c) => c.name === name)?.flag ?? '🌍';

// Informação da secção "Sobre" do Perfil: substitui pelo teu nome
export const APP_INFO = { developer: 'O teu nome', version: '1.0.0' };
