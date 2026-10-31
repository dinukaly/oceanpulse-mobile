import { forwardRef, useId, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '@/constants/theme';
import AppText from './AppText';
import { useTypography } from './TypographyProvider';

type Props = TextInputProps & { label: string; error?: string; optional?: boolean; hint?: string };
const AppInput = forwardRef<TextInput, Props>(function AppInput({ label, error, optional = false, hint,
  style, onFocus, onBlur, ...props }, ref) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const type = useTypography();
  return <View style={{ marginBottom: theme.spacing.md, gap: theme.spacing.sm }}>
    <AppText nativeID={`${id}-label`} variant="label">{label}{optional ? ' (optional)' : ''}</AppText>
    {hint && <AppText variant="caption" style={{ color: theme.colors.muted }}>{hint}</AppText>}
    <TextInput {...props} ref={ref} accessibilityLabel={props.accessibilityLabel || label}
      accessibilityLabelledBy={`${id}-label`} accessibilityHint={error || hint || props.accessibilityHint}
      aria-invalid={!!error} placeholderTextColor={theme.colors.muted}
      selectionColor={theme.colors.primary}
      onFocus={event => { setFocused(true); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }}
      style={[type, style, { minHeight: 48, minWidth: 48, borderWidth: focused || error ? 2 : 1,
        borderColor: error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.compact, paddingVertical: theme.spacing.compact,
        backgroundColor: theme.colors.surface, color: theme.colors.text, textAlignVertical: props.multiline ? 'top' : 'center' }]} />
    {error && <AppText variant="caption" accessibilityLiveRegion="polite" style={{ color: theme.colors.danger }}>{error}</AppText>}
  </View>;
});
export default AppInput;
