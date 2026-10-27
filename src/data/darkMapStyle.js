// Estilo nocturno (preto profundo) no formato do Google Maps. Aplica-se com `customMapStyle`.
// Nota: no iOS com Apple Maps (o fornecedor por defeito) o customMapStyle é ignorado; só vale
// com Google Maps (provider="google") e no Android.
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0A0A0A' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6B73' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A0A' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1C1C1F' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0D0D0F' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#18181B' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0A0A0A' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#52525B' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#27272A' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3F3F46' }] },
];
