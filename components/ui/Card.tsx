import { View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

export default function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[{ backgroundColor: theme.colors.surface,
    borderColor: theme.colors.separator, borderWidth: 1, borderRadius: theme.radius.md,
    padding: theme.spacing.md }, style]} />;
}
