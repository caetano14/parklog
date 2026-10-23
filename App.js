import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastHost from './src/components/ToastHost';
import { AchievementsProvider } from './src/context/AchievementsContext';
import { CarsProvider } from './src/context/CarsContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { I18nProvider } from './src/i18n/I18nContext';
import RootNavigator from './src/navigation/RootNavigator';
import { keepSplash } from './src/utils/splash';

keepSplash(); // o ecrã de arranque só sai quando a navegação estiver pronta (ver RootNavigator)

// Ordem dos providers: cada um só usa os que estão por cima dele
export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SettingsProvider>
          <CarsProvider>
            <AchievementsProvider>
              <StatusBar style="light" />
              <RootNavigator />
              <ToastHost />
            </AchievementsProvider>
          </CarsProvider>
        </SettingsProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
