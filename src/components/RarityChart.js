import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useI18n } from '../i18n/I18nContext';
import { C, RARITIES } from '../constants';

const CHART_CONFIG = { color: () => C.text, labelColor: () => C.text };

// Gráfico circular da distribuição por raridade (fundo transparente, texto branco)
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

  return (
    <PieChart
      data={data}
      width={width - 64} // 16 de margem do ecrã + 16 de padding do cartão, de cada lado
      height={170}
      chartConfig={CHART_CONFIG}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="12"
      absolute
    />
  );
}

const s = StyleSheet.create({
  empty: { color: C.muted, fontSize: 14, paddingVertical: 8 },
});
