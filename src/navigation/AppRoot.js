import { useEffect } from 'react';
import { useCars } from '../context/CarsContext';
import { useSettings } from '../context/SettingsContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import RootNavigator from './RootNavigator';

// Decide o que mostrar ao abrir: a introdução (só na primeira vez) ou a app.
// `onboarded` tem 3 estados: undefined = nunca decidido, false = ver outra vez (Perfil), true = já viu.
export default function AppRoot() {
  const { onboarded, loaded: settingsLoaded, setSetting } = useSettings();
  const { cars, loaded: carsLoaded } = useCars();
  const ready = settingsLoaded && carsLoaded;
  const existingUser = onboarded === undefined && cars.length > 0;

  // Quem já tinha carros antes desta versão não precisa da introdução
  useEffect(() => {
    if (ready && existingUser) setSetting('onboarded', true);
  }, [ready, existingUser, setSetting]);

  if (!ready || existingUser) return null; // o ecrã de arranque continua visível
  if (onboarded !== true) return <OnboardingScreen onDone={() => setSetting('onboarded', true)} />;
  return <RootNavigator />;
}
