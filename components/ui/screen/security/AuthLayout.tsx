import type { ReactNode } from 'react';
import { View } from 'react-native';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import FormScreen from '@/components/ui/FormScreen';

export default function AuthLayout({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children: ReactNode;
}) {
  return <FormScreen>
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="label" style={{ color: theme.colors.primary }}>OceanPulse</AppText>
      {!!eyebrow && <AppText variant="caption" style={{ color: theme.colors.muted }}>{eyebrow}</AppText>}
      <AppText variant="title" accessibilityRole="header">{title}</AppText>
      <AppText style={{ color: theme.colors.muted }}>{description}</AppText>
    </View>
    <Card>{children}</Card>
  </FormScreen>;
}
