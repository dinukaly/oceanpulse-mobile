import { useRef, useState } from 'react';
import { View } from 'react-native';
import AuthLayout from './AuthLayout';
import AuthField from './AuthField';
import ActionButton from '@/components/ui/ActionButton';
import StatusBanner from '@/components/ui/StatusBanner';
import api from '@/utils/api';
import { validatePassword, validateConfirmPassword } from '@/utils/validation';
import { theme } from '@/constants/theme';

export default function SetNewPasswordScreen({ route, navigation }: any) {
  const { email, resetToken } = route.params;
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const submit = async () => {
    if (busy.current) return;
    const pass = validatePassword(password), confirm = validateConfirmPassword(password, confirmation);
    setErrors({ password: pass.error, confirmation: confirm.error });
    if (!pass.isValid || !confirm.isValid) return;
    if (!resetToken) { setError('Your reset session is unavailable. Request a new reset code.'); return; }
    busy.current = true; setLoading(true); setError('');
    try {
      const response = await api.post('users/reset-password', { email, password, resetToken });
      if (!response.data.success) throw new Error('Unconfirmed reset');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (failure: any) {
      busy.current = false;
      setError(failure.response?.data?.message || 'Could not save your password. Please try again.');
    } finally { setLoading(false); }
  };
  return <AuthLayout icon="shield-checkmark-outline" eyebrow="Account recovery" title="Set new password" description="At least 8 characters, with letters and numbers">
    <View style={{ gap: theme.spacing.md }}>
      {error ? <StatusBanner tone="error" title="Could not save password" message={error} /> : null}
      <AuthField label="New password" value={password} editable={!loading} secureTextEntry autoCapitalize="none" autoCorrect={false}
        autoComplete="new-password" textContentType="newPassword" error={errors.password} onChangeText={setPassword} />
      <AuthField label="Confirm password" value={confirmation} editable={!loading} secureTextEntry autoCapitalize="none" autoCorrect={false}
        autoComplete="new-password" textContentType="newPassword" error={errors.confirmation} onChangeText={setConfirmation} />
      <ActionButton label="Save password" onPress={submit} loading={loading} />
      <ActionButton label="Back to sign in" variant="secondary" disabled={loading} onPress={() => navigation.navigate('Login')} />
    </View>
  </AuthLayout>;
}
