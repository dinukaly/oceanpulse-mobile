import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import AppText from './AppText';
import ActionButton from './ActionButton';

export default function BottomSheet({ visible, title, children, footer, onClose, busy = false }: {
  visible: boolean; title: string; children: ReactNode; footer?: ReactNode; onClose: () => void; busy?: boolean;
}) {
  const dismiss = () => { if (!busy) onClose(); };
  return <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
    <View style={{ flex: 1 }} accessibilityViewIsModal>
      <Pressable accessible={false} focusable={false} importantForAccessibility="no" onPress={dismiss} disabled={busy}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: theme.effects.scrimColor, opacity: theme.effects.scrimOpacity }} />
      <SafeAreaView edges={['top', 'left', 'right']} pointerEvents="box-none" style={{ flex: 1 }}>
        <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <SafeAreaView edges={['bottom']} style={{ width: '100%', maxWidth: theme.layout.webMaxWidth,
            maxHeight: '95%', alignSelf: 'center', backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
            borderWidth: 1, borderColor: theme.colors.separator, ...theme.effects.modalShadow }}>
            <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
              contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
              <AppText variant="section" accessibilityRole="header">{title}</AppText>
              {children}
              {footer}
              <ActionButton label="Close" variant="secondary" onPress={dismiss} disabled={busy} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  </Modal>;
}
