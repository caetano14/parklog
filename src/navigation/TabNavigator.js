import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import AddCarScreen from '../screens/AddCarScreen';
import CollectionScreen from '../screens/CollectionScreen';
import { C } from '../constants';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', AddCar: 'add-circle', Collection: 'albums' };

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // cada ecrã tem o seu próprio cabeçalho (ScreenHeader)
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: C.accent,
                tabBarInactiveTintColor: C.muted,
                tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border },
                tabBarLabelStyle: { fontWeight: '600' },
                tabBarIcon: ({ color, size, focused }) => (
                    <Ionicons
                        name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
                        size={size}
                        color={color}
                    />
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
            <Tab.Screen name="AddCar" component={AddCarScreen} options={{ title: 'Adicionar' }} />
            <Tab.Screen name="Collection" component={CollectionScreen} options={{ title: 'Caderneta' }} />
        </Tab.Navigator>
    );
}