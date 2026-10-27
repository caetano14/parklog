import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from './AppText';
import SafeBoundary from './SafeBoundary';
import { useI18n } from '../i18n/I18nContext';
import { C, RARITIES } from '../constants';

const CHART_CONFIG = { color: () => C.text, labelColor: () => C.text };

// O react-native-chart-kit (que usa o react-native-svg) só é carregado quando o gráfico é desenhado
function Pie({ data, width }) {
  const { PieChart } = require('react-native-chart-kit');
  return (
    <PieChart
      data={data}
      width={width}
      height={170}
      chartConfig={CHART_CONFIG}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="12"
      absolute
    />
  );
}

// Gráfico circular da distribuição por raridade (fundo transparente, texto branco).
// Se o gráfico falhar, mostra a lista simples com as contagens.
export default function RarityChart({ counts }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();

  const data = Object.keys(RARITIES)
    .filter((name) => counts[name] > 0) // fatias a zero só estragam o gráfico
    .map((name) => ({
      name: t(`rarity.${name}`),
      population: counts[name],
      color: RARITIES[name],
      legendFontColor: C.text,
      legendFontSize: 14,
    }));

  if (!data.length) return <Text style={s.empty}>{t('profile.noData')}</Text>;

  const fallback = (
    <View>
      {data.map((d) => (
        <View key={d.name} style={s.row}>
          <View style={[s.dot, { backgroundColor: d.color }]} />
          <Text style={s.name}>{d.name}</Text>
          <Text style={s.count}>{d.population}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeBoundary fallback={fallback}>
      <Pie data={data} width={width - 64} />
    </SafeBoundary>
  );
}

const s = StyleSheet.create({
  empty: { color: C.muted, fontSize: 14, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, color: C.text, fontSize: 15 },
  count: { color: C.text, fontSize: 15, fontWeight: '700' },
});
