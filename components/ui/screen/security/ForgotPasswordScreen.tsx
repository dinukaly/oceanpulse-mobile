import { useRef, useState } from 'react';
import { View } from 'react-native';
import AuthLayout from './AuthLayout';
import AuthField from './AuthField';
import ActionButton from '@/components/ui/ActionButton';
import StatusBanner from '@/components/ui/StatusBanner';
import api from '@/utils/api';
import { validateEmail } from '@/utils/validation';
import { theme } from '@/constants/theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const busy = useRef(false);
  const submit = async () => {
    if (busy.current) return;
    const validation = validateEmail(email.trim());
    setError(validation.error);
    if (!validation.isValid) return;
    busy.current = true; setLoading(true); setRequestError('');
    try {
      await api.post('users/forgot-password', { email: email.trim() });
      navigation.navigate('ResetPasswordOtpVefication', { email: email.trim() });
    } catch (failure: any) {
      setRequestError(failure.response?.data?.message || 'Could not send a reset code. Please try again.');
    } finally { busy.current = false; setLoading(false); }
  };
  return <AuthLayout icon="lock-closed-outline" eyebrow="Account recovery" title="Forgot password" description="Request a code to reset your password.">
    <View style={{ gap: theme.spacing.md }}>
      {requestError ? <StatusBanner tone="error" title="Could not send code" message={requestError} /> : null}
      <AuthField label="Email address" value={email} editable={!loading} onChangeText={value => { setEmail(value); setError(''); }}
        error={error} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <ActionButton label="Send reset code" loading={loading} onPress={submit} />
      <ActionButton label="Back to sign in" variant="secondary" disabled={loading} onPress={() => navigation.navigate('Login')} />
    </View>
  </AuthLayout>;
}
