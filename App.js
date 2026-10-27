import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import ToastHost from './src/components/ToastHost';
import { AchievementsProvider } from './src/context/AchievementsContext';
import { CarsProvider } from './src/context/CarsContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { I18nProvider } from './src/i18n/I18nContext';
import AppRoot from './src/navigation/AppRoot';
import { keepSplash } from './src/utils/splash';

keepSplash(); // o ecrã de arranque só sai quando a navegação (ou a introdução) estiver pronta (ver AppRoot)

export default function App() {
  // Inter = texto geral · Oswald = títulos, números e marcas (os nomes estão em FONTS, constants.js)
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
    Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold,
  });
  if (!fontsLoaded && !fontError) return null; // o splash continua visível enquanto as letras carregam

  // Ordem dos providers: cada um só usa os que estão por cima dele
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SettingsProvider>
          <CarsProvider>
            <AchievementsProvider>
              <StatusBar style="light" />
              <AppRoot />
              <ToastHost />
            </AchievementsProvider>
          </CarsProvider>
        </SettingsProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
