import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import BrandHeader from '@/components/ui/BrandHeader';
import FormScreen from '@/components/ui/FormScreen';

export default function AuthLayout({ eyebrow, title, description, children, grouped = false, icon, centered = false }: {
  eyebrow: string; title: string; description: string; children: ReactNode; grouped?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name']; centered?: boolean;
}) {
  return <FormScreen contentStyle={{ gap: 24 }}>
    <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.separator }}><BrandHeader /></View>
    <View style={{ gap: 12, alignItems: centered ? 'center' : 'stretch' }}>
      {icon ? <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: theme.colors.accentSurface,
        alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} size={28} color={theme.colors.primary} accessible={false} /></View>
        : <AppText variant="caption" style={{ color: theme.colors.primary }}>{eyebrow}</AppText>}
      <AppText variant="title" accessibilityRole="header" style={{ textAlign: centered ? 'center' : 'left' }}>{title}</AppText>
      <AppText style={{ color: theme.colors.muted, textAlign: centered ? 'center' : 'left' }}>{description}</AppText>
    </View>
    {grouped ? children : <Card>{children}</Card>}
  </FormScreen>;
}
