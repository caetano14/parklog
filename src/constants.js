// Paleta de garagem: asfalto + amarelo de sinalização rodoviária
export const C = {
    bg: '#14171C', card: '#1C2027', field: '#242932', border: '#2F3541',
    text: '#ECEFF4', muted: '#8F99A8', accent: '#FFC83D', onAccent: '#14171C',
    danger: '#FF5D5D',
};

export const RARITIES = { Comum: '#8793A6', Raro: '#3DA5FF', Exótico: '#FF3D71' };

export const COUNTRIES = [
    { name: 'Alemanha', flag: '🇩🇪' }, { name: 'Itália', flag: '🇮🇹' },
    { name: 'Japão', flag: '🇯🇵' }, { name: 'EUA', flag: '🇺🇸' },
    { name: 'Reino Unido', flag: '🇬🇧' }, { name: 'França', flag: '🇫🇷' },
    { name: 'Suécia', flag: '🇸🇪' }, { name: 'Coreia do Sul', flag: '🇰🇷' },
    { name: 'Portugal', flag: '🇵🇹' }, { name: 'Outro', flag: '🌍' },
];

export const flagOf = (name) => COUNTRIES.find((c) => c.name === name)?.flag ?? '🌍';