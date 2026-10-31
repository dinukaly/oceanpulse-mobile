import { useState } from 'react';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import AppText from './AppText';

type Props = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean; loading?: boolean; accessibilityHint?: string; style?: StyleProp<ViewStyle> };

export default function ActionButton({ label, onPress, variant = 'primary', disabled = false,
  loading = false, accessibilityHint, style }: Props) {
  const [focused, setFocused] = useState(false);
  const unavailable = disabled || loading;
  const color = disabled ? theme.colors.muted : variant === 'secondary' ? theme.colors.primary : theme.colors.onPrimary;
  const fill = disabled ? theme.colors.background : variant === 'secondary' ? theme.colors.surface
    : variant === 'danger' ? theme.colors.danger : theme.colors.primary;
  return <Pressable onPress={onPress} disabled={unavailable} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    accessibilityRole="button" accessibilityLabel={label} accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled: unavailable, busy: loading }}
    style={({ pressed }) => [style, { width: '100%', minHeight: 48, minWidth: 48,
      padding: theme.spacing.compact, borderWidth: 2, borderRadius: theme.radius.sm,
      borderColor: focused ? theme.colors.primary : disabled ? theme.colors.border : variant === 'danger' ? theme.colors.danger : theme.colors.primary,
      backgroundColor: pressed && variant === 'secondary' ? theme.colors.accentSurface : fill,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm,
      transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
    {focused && <View pointerEvents="none" style={{ position: 'absolute', top: -6, bottom: -6, left: -6, right: -6,
      borderWidth: 2, borderColor: theme.colors.primary, borderRadius: theme.radius.sm + 4 }} />}
    {loading && <ActivityIndicator color={color} />}
    <AppText variant="label" style={{ color, flexShrink: 1, textAlign: 'center' }}>{label}</AppText>
  </Pressable>;
}
