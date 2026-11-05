import { Text, type TextProps } from 'react-native';
import { theme, typography } from '@/constants/theme';
import { useTypography } from './TypographyProvider';

export default function AppText({ variant = 'body', style, ...props }: TextProps & {
  variant?: keyof typeof typography;
}) {
  const type = useTypography(variant);
  return <Text {...props} style={[{ color: theme.colors.text }, type, style]} />;
}
