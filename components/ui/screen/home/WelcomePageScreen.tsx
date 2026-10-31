import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '@/components/ui/ActionButton';
import AppText from '@/components/ui/AppText';
import FormScreen from '@/components/ui/FormScreen';
import { theme } from '@/constants/theme';

const features = [
  { icon: 'partly-sunny-outline', title: 'Conditions', description: 'Search city weather and check wave forecasts.' },
  { icon: 'map-outline', title: 'Distance estimates', description: 'Measure direct distance and estimate fuel using your boat’s rate.' },
  { icon: 'chatbubbles-outline', title: 'Messages', description: 'Exchange text messages with other crew members.' },
] as const;

export default function WelcomePageScreen({ navigation }: any) {
  return <FormScreen>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Image source={require('../../../../assets/logo/logo.png')} style={{ width: 48, height: 48 }} resizeMode="contain" accessible={false} />
      <AppText variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>OceanPulse</AppText>
    </View>
    <AppText variant="section">Check conditions, estimate distance, and stay in touch.</AppText>
    <View style={{ gap: 12 }}>
      <ActionButton label="Sign in" onPress={() => navigation.navigate('Login')} />
      <ActionButton label="Create account" variant="secondary" onPress={() => navigation.navigate('Signup')} />
    </View>
    <View style={{ gap: 24, paddingTop: 8 }}>
      {features.map(feature => <View key={feature.title} style={{ flexDirection: 'row', gap: 12 }}>
        <Ionicons name={feature.icon} size={24} color={theme.colors.primary} accessible={false} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label">{feature.title}</AppText>
          <AppText variant="caption" style={{ color: theme.colors.muted }}>{feature.description}</AppText>
        </View>
      </View>)}
    </View>
  </FormScreen>;
}
