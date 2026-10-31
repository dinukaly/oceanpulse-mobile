import { useRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { theme } from '@/constants/theme';
import AppText from './AppText';

/** One logical editable value: paste/autofill and deletion work across both groups. */
export default function CodeEntry({ value, onChangeText, error, label = '6-digit code',
  editable = true, ...props }: Omit<TextInputProps, 'value' | 'onChangeText'> & {
    value: string; onChangeText: (code: string) => void; error?: string; label?: string;
  }) {
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);
  const code = value.replace(/\D/g, '').slice(0, 6);
  return <View style={{ gap: theme.spacing.sm }}>
    <AppText variant="label">{label}</AppText>
    <View style={{ position: 'relative', alignSelf: 'stretch' }}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.md }}>
        {[0, 3].map(start => <View key={start} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {[start, start + 1, start + 2].map(index => <View key={index} style={{ minWidth: 48, minHeight: 48,
            paddingVertical: theme.spacing.sm, alignItems: 'center', justifyContent: 'center',
            borderWidth: focused && index === Math.min(code.length, 5) ? 2 : 1,
            borderColor: error ? theme.colors.danger : focused && index === Math.min(code.length, 5) ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.sm, backgroundColor: theme.colors.surface }}>
            <AppText variant="title" style={theme.numericText}>{code[index] || ' '}</AppText>
          </View>)}
        </View>)}
      </View>
      <TextInput {...props} ref={input} value={code} editable={editable}
        onChangeText={text => onChangeText(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
        autoCorrect={false} caretHidden selection={{ start: code.length, end: code.length }}
        accessibilityLabel={label} accessibilityHint={error || 'Enter all six digits. You can paste the complete code.'}
        aria-invalid={!!error}
        onFocus={event => { setFocused(true); props.onFocus?.(event); }}
        onBlur={event => { setFocused(false); props.onBlur?.(event); }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', minHeight: 48,
          opacity: 0, fontSize: 16 }} />
    </View>
    {error && <AppText variant="caption" accessibilityLiveRegion="polite" style={{ color: theme.colors.danger }}>{error}</AppText>}
  </View>;
}
