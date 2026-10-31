import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '@/components/ui/ActionButton';
import AppText from '@/components/ui/AppText';
import FormScreen from '@/components/ui/FormScreen';
import BrandHeader from '@/components/ui/BrandHeader';
import Card from '@/components/ui/Card';
import { theme } from '@/constants/theme';

const features = [
  { icon: 'partly-sunny-outline', title: 'Marine & coastal weather', description: 'City weather and wave forecasts.' },
  { icon: 'compass-outline', title: 'Direct route estimates', description: 'Point-to-point distance and fuel estimates.' },
  { icon: 'chatbubble-outline', title: 'Crew messaging', description: 'Stay in touch with other crew members.' },
] as const;
export default function WelcomePageScreen({ navigation }: any) {
  return <FormScreen contentStyle={{ flexGrow: 1, paddingTop: 24, gap: 24 }}>
    <BrandHeader />
    <View style={{ gap: 12, paddingTop: 16 }}>
      <AppText variant="title" accessibilityRole="header">Weather and sea conditions for your next trip</AppText>
      <AppText style={{ color: theme.colors.muted }}>Check conditions, estimate distance, and stay in touch.</AppText>
    </View>
    <Card style={{ paddingVertical: 4 }}>
      {features.map((feature, index) => <View key={feature.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16,
        borderBottomWidth: index < features.length - 1 ? 1 : 0, borderBottomColor: theme.colors.separator }}>
        <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={feature.icon} size={24} color={theme.colors.primary} accessible={false} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label">{feature.title}</AppText>
          <AppText variant="caption" style={{ color: theme.colors.muted }}>{feature.description}</AppText>
        </View>
      </View>)}
    </Card>
    <View style={{ gap: 12, marginTop: 'auto' }}>
      <ActionButton label="Sign in" onPress={() => navigation.navigate('Login')} />
      <ActionButton label="Create account" variant="secondary" onPress={() => navigation.navigate('Signup')} />
    </View>
    <AppText variant="caption" style={{ color: theme.colors.muted, textAlign: 'center' }}>For coastal crews in Sri Lanka</AppText>
  </FormScreen>;
}
