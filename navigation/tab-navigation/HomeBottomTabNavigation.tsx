import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import WeatherScreen from '@/components/ui/screen/home/WeatherScreen';
import RouteScreen from '@/components/ui/screen/home/RouteScreen';
import HomePageScreen from '@/components/ui/screen/home/HomePageScreen';
import SeaWaveConditionScreen from '@/components/ui/screen/home/SeaWaveConditionScreen';
import ProfileScreen from '@/components/ui/screen/home/ProfileScreen';

export type HomeTabParamList = {
  Weather: undefined;
  Route: undefined;
  Home: undefined;
  SeaWave: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();
const icons = {
  Weather: { active: 'thunderstorm', inactive: 'thunderstorm-outline' },
  Route: { active: 'map', inactive: 'map-outline' },
  Home: { active: 'home', inactive: 'home-outline' },
  SeaWave: { active: 'boat', inactive: 'boat-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
} as const;

function SeaWaveTab() {
  return (
    <SeaWaveConditionScreen />
  );
}

export default function HomeBottomTabNavigation() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <View style={{ width: 24, height: 2, backgroundColor: focused ? theme.colors.primary : 'transparent' }} />
          <Ionicons
            name={icons[route.name][focused ? 'active' : 'inactive']}
            size={theme.iconSize}
            color={color}
            accessible={false}
          />
          </View>
        ),
        tabBarLabel: ({ color }) => <AppText variant="tab" style={{ color, textAlign: 'center', flexShrink: 1, maxWidth: '100%' }}>{route.name}</AppText>,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarItemStyle: { minHeight: theme.touchTarget, minWidth: theme.touchTarget },
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.separator,
          height: 64 + Math.max(0, fontScale - 1) * 64 + insets.bottom,
          paddingTop: theme.spacing.xs, paddingBottom: Math.max(insets.bottom, theme.spacing.xs),
          width: '100%', maxWidth: theme.layout.webMaxWidth, alignSelf: 'center', elevation: 0 },
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.surface },
      })}
    >
      <Tab.Screen name="Weather" component={WeatherScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Route" component={RouteScreen} />
      <Tab.Screen name="Home" component={HomePageScreen} options={{ headerShown: false }} />
      <Tab.Screen name="SeaWave" component={SeaWaveTab} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
