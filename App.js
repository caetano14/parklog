import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarsProvider } from './src/context/CarsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <CarsProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </CarsProvider>
    </SafeAreaProvider>
  );
}