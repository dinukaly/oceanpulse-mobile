import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from './AppText';

type Tone = 'info' | 'warning' | 'error' | 'success';
const tones = {
  info: { color: theme.colors.primary, surface: theme.colors.accentSurface, icon: 'information-circle-outline' },
  warning: { color: theme.colors.warning, surface: theme.colors.warningSurface, icon: 'warning-outline' },
  error: { color: theme.colors.danger, surface: theme.colors.dangerSurface, icon: 'alert-circle-outline' },
  success: { color: theme.colors.success, surface: theme.colors.successSurface, icon: 'checkmark-circle-outline' },
} as const;
export default function StatusBanner({ tone, title, message, style }: {
  tone: Tone; title: string; message: string; style?: StyleProp<ViewStyle>;
}) {
  const appearance = tones[tone];
  return <View accessible accessibilityLabel={`${title}. ${message}`}
    accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
    style={[style, { width: '100%', borderWidth: 1, borderRadius: theme.radius.md,
      padding: theme.spacing.md, backgroundColor: appearance.surface, borderColor: appearance.color,
      flexDirection: 'row', gap: theme.spacing.sm }]}>
    <Ionicons name={appearance.icon} size={24} color={appearance.color} accessible={false} />
    <View style={{ flex: 1, gap: theme.spacing.xs }}>
      <AppText variant="label" style={{ color: appearance.color }}>{title}</AppText>
      <AppText style={{ color: appearance.color }}>{message}</AppText>
    </View>
  </View>;
}
