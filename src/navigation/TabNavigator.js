import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import AddCarScreen from '../screens/AddCarScreen';
import CollectionScreen from '../screens/CollectionScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useI18n } from '../i18n/I18nContext';
import { C } from '../constants';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', AddCar: 'add-circle', Collection: 'albums', Achievements: 'trophy', Profile: 'person-circle' };

export default function TabNavigator() {
  const { t } = useI18n(); // os títulos das tabs mudam logo que o idioma muda

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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="AddCar" component={AddCarScreen} options={{ title: t('tabs.add') }} />
      <Tab.Screen name="Collection" component={CollectionScreen} options={{ title: t('tabs.collection') }} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} options={{ title: t('tabs.achievements') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
    </Tab.Navigator>
  );
}
