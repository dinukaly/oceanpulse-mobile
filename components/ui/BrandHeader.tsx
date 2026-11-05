import { Image, View } from 'react-native';
import AppText from './AppText';
import { theme } from '@/constants/theme';
export default function BrandHeader() {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.compact }}>
    <Image source={require('../../assets/logo/logo.png')} resizeMode="contain" style={{ width: 48, height: 48, borderRadius: theme.radius.sm }} accessible={false} />
    <View style={{ flex: 1, gap: 2 }}>
      <AppText variant="section">OceanPulse</AppText>
      <AppText variant="caption" style={{ color: theme.colors.muted }}>Coastal fishing crews</AppText>
    </View>
  </View>;
}
