import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import CarDetailScreen from '../screens/CarDetailScreen';
import EditCarScreen from '../screens/EditCarScreen';
import { useI18n } from '../i18n/I18nContext';
import { hideSplash } from '../utils/splash';
import { C } from '../constants';

const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.bg, card: C.bg, border: C.border, primary: C.accent, text: C.text },
};

export default function RootNavigator() {
  const { t } = useI18n();

  return (
    <NavigationContainer theme={theme} onReady={hideSplash}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerShadowVisible: false,
          headerBackTitle: t('common.back'),
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ title: t('detail.title'), headerShown: false }} />
        <Stack.Screen name="EditCar" component={EditCarScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
