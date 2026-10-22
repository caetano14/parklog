import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarsProvider } from './src/context/CarsContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { I18nProvider } from './src/i18n/I18nContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SettingsProvider>
          <CarsProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </CarsProvider>
        </SettingsProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
