import { forwardRef, useId, useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from './AppText';
import { useTypography } from './TypographyProvider';

type Props = TextInputProps & { label: string; error?: string; optional?: boolean; hint?: string };
const AppInput = forwardRef<TextInput, Props>(function AppInput({ label, error, optional = false, hint,
  style, onFocus, onBlur, ...props }, ref) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);
  const type = useTypography();
  return <View style={{ marginBottom: theme.spacing.md, gap: theme.spacing.sm }}>
    <AppText nativeID={`${id}-label`} variant="label">{label}{optional ? ' (optional)' : ''}</AppText>
    {!!hint && <AppText variant="caption" style={{ color: theme.colors.muted }}>{hint}</AppText>}
    <View style={{ position: 'relative' }}><TextInput {...props} secureTextEntry={props.secureTextEntry && !revealed} ref={ref} accessibilityLabel={props.accessibilityLabel || label}
      accessibilityLabelledBy={`${id}-label`} accessibilityHint={error || hint || props.accessibilityHint}
      aria-invalid={!!error} placeholderTextColor={theme.colors.muted}
      selectionColor={theme.colors.primary}
      onFocus={event => { setFocused(true); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }}
      style={[type, style, { minHeight: 48, minWidth: 48, borderWidth: focused || error ? 2 : 1,
        borderColor: error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.compact, paddingRight: props.secureTextEntry ? 56 : theme.spacing.compact, paddingVertical: theme.spacing.compact,
        backgroundColor: theme.colors.background, color: theme.colors.text, textAlignVertical: props.multiline ? 'top' : 'center' }]} />
    {props.secureTextEntry ? <Pressable accessibilityRole="button" accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
      disabled={props.editable === false} onPress={() => setRevealed(value => !value)}
      style={{ position: 'absolute', right: 2, top: 0, bottom: 0, minHeight: 48, width: 48, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.muted} accessible={false} />
    </Pressable> : null}</View>
    {!!error && <AppText variant="caption" accessibilityLiveRegion="polite" style={{ color: theme.colors.danger }}>{error}</AppText>}
  </View>;
});
export default AppInput;
