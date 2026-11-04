import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import useKeyboardHeight from '@/hooks/useKeyboardHeight';

export default function FormScreen({ children, footer, edges = ['top', 'right', 'bottom', 'left'],
  keyboardVerticalOffset = 0, contentStyle }: { children: ReactNode; footer?: ReactNode;
  edges?: Edge[]; keyboardVerticalOffset?: number; contentStyle?: StyleProp<ViewStyle> }) {
  const keyboardHeight = useKeyboardHeight();

  return <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <KeyboardAvoidingView
      style={[{ flex: 1 }, Platform.OS === 'android' && keyboardHeight > 0 && { paddingBottom: keyboardHeight }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[{ width: '100%', maxWidth: theme.layout.webMaxWidth, alignSelf: 'center',
          padding: theme.spacing.md, gap: theme.spacing.lg }, contentStyle]}>{children}</View>
      </ScrollView>
      {footer ? <View style={{ width: '100%', maxWidth: theme.layout.webMaxWidth, alignSelf: 'center',
        padding: theme.spacing.md }}>{footer}</View> : null}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
