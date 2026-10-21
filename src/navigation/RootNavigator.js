import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import CarDetailScreen from '../screens/CarDetailScreen';
import { C } from '../constants';

const Stack = createNativeStackNavigator();

const theme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: C.bg, card: C.bg, border: C.border, primary: C.accent, text: C.text },
};

export default function RootNavigator() {
    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: C.bg },
                    headerTintColor: C.text,
                    headerShadowVisible: false,
                    headerBackTitle: 'Voltar',
                }}
            >
                <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="CarDetail" component={CarDetailScreen} options={{ title: 'Detalhes' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}