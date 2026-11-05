import { View } from 'react-native';
import AppText from './AppText';
import { theme } from '@/constants/theme';

export default function SectionHeader({ title, description }: { title: string; description?: string }) {
  return <View style={{ gap: theme.spacing.sm }}>
    <AppText variant="section" accessibilityRole="header">{title}</AppText>
    {description ? <AppText style={{ color: theme.colors.muted }}>{description}</AppText> : null}
  </View>;
}
