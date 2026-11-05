import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import HomePageScreen from '@/components/ui/screen/home/HomePageScreen';
import ConditionsScreen from '@/components/ui/screen/home/ConditionsScreen';
import RouteScreen from '@/components/ui/screen/home/RouteScreen';
import UserListScreen from '@/components/ui/screen/home/UserListScreen';
import ProfileScreen from '@/components/ui/screen/home/ProfileScreen';

export type HomeTabParamList = {
  Home: undefined;
  Conditions: { section?: 'weather' | 'sea'; latitude?: number; longitude?: number } | undefined;
  Estimate: undefined;
  Messages: undefined;
  Profile: undefined;
  // Legacy aliases
  Weather?: undefined;
  Route?: undefined;
  SeaWave?: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Conditions: { active: 'partly-sunny', inactive: 'partly-sunny-outline' },
  Estimate: { active: 'navigate-circle', inactive: 'navigate-circle-outline' },
  Messages: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

export default function HomeBottomTabNavigation() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconPair = icons[route.name] || icons.Home;
          return (
            <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
              <View style={{ width: 24, height: 2, backgroundColor: focused ? theme.colors.primary : 'transparent' }} />
              <Ionicons
                name={iconPair[focused ? 'active' : 'inactive']}
                size={theme.iconSize}
                color={color}
                accessible={false}
              />
            </View>
          );
        },
        tabBarLabel: ({ color }) => (
          <AppText variant="tab" style={{ color, textAlign: 'center', flexShrink: 1, maxWidth: '100%' }}>
            {route.name}
          </AppText>
        ),
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarItemStyle: { minHeight: theme.touchTarget, minWidth: theme.touchTarget },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.separator,
          height: 64 + Math.max(0, fontScale - 1) * 64 + insets.bottom,
          paddingTop: theme.spacing.xs,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xs),
          width: '100%',
          maxWidth: theme.layout.webMaxWidth,
          alignSelf: 'center',
          elevation: 0,
        },
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.surface },
      })}
    >
      <Tab.Screen name="Home" component={HomePageScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Conditions" component={ConditionsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Estimate" component={RouteScreen} options={{ title: 'Route & Fuel' }} />
      <Tab.Screen name="Messages" component={UserListScreen} options={{ title: 'Crew Directory' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
