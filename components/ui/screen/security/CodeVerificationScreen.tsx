import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AuthLayout from './AuthLayout';
import CodeEntry from '@/components/ui/CodeEntry';
import AppText from '@/components/ui/AppText';
import ActionButton from '@/components/ui/ActionButton';
import StatusBanner from '@/components/ui/StatusBanner';
import { theme } from '@/constants/theme';
import api from '@/utils/api';
import { saveSession } from '@/utils/session';
import { setUserId } from '@/store/authSlice';

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return domain ? `${local.slice(0, 1)}***@${domain}` : 'your email address';
}

/** Shared presentation; reset and activation keep their distinct endpoints and success flows. */
export default function CodeVerificationScreen({ navigation, route, purpose }: any) {
  const { email, username } = route.params;
  const reset = purpose === 'reset';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [notice, setNotice] = useState(reset ? 'If an account matches this email, a reset code has been sent.' : '');
  const [pending, setPending] = useState<'verify' | 'resend' | null>(null);
  const [seconds, setSeconds] = useState(60);
  const deadline = useRef(Date.now() + 60_000);
  const busy = useRef(false);
  const active = useRef(true);
  const dispatch = useDispatch();
  useEffect(() => {
    active.current = true;
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    const timer = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    return () => { active.current = false; clearInterval(timer); subscription.remove(); };
  }, []);
  const verify = async () => {
    if (busy.current) return;
    if (!/^\d{6}$/.test(code)) { setCodeError('Enter all six digits.'); return; }
    busy.current = true; setPending('verify'); setError(''); setCodeError('');
    try {
      const response = await api.post(reset ? 'users/verify-reset-otp' : 'users/verify-otp', reset ? { email, otp: code } : { username, otp: code });
      if (!response.data.success) throw new Error('Unconfirmed verification');
      if (!active.current) return;
      if (reset) {
        const resetToken = response.data.data?.resetToken;
        if (typeof resetToken !== 'string' || !resetToken) throw new Error('Missing reset token');
        // Replace the consumed code screen; token is passed only as a navigation parameter.
        navigation.replace('SetNewPassword', { email, resetToken });
      } else {
        const { token, user } = response.data.data;
        if (!token || !user?.userId) throw new Error('Missing session');
        await saveSession(token, user);
        if (active.current) dispatch(setUserId(user.userId.toString()));
      }
      // A consumed code cannot be submitted again, even before navigation finishes.
    } catch (failure: any) {
      busy.current = false;
      if (active.current) setError(failure.response?.data?.message || 'Could not verify the code. Check it or request a new code.');
    } finally { if (active.current) setPending(null); }
  };
  const resend = async () => {
    if (busy.current || Date.now() < deadline.current) return;
    busy.current = true; setPending('resend'); setError(''); setNotice('');
    try {
      const response = await api.post(reset ? 'users/forgot-password' : 'users/resend-verification-otp', reset ? { email } : { username, email });
      if (!response.data.success) throw new Error('Unconfirmed resend');
      deadline.current = Date.now() + 60_000;
      if (active.current) {
        setSeconds(60); setCode(''); setCodeError('');
        setNotice(reset ? 'If an account matches this email, a reset code has been sent.' : 'A new verification code has been sent.');
      }
    } catch (failure: any) {
      if (active.current) setError(failure.response?.data?.message || 'Could not resend the code. Please try again.');
    } finally { busy.current = false; if (active.current) setPending(null); }
  };
  return <AuthLayout centered icon="mail-outline" eyebrow="Account verification" title={reset ? 'Enter reset code' : 'Verify your email'}
    description={`Enter the six-digit code for ${maskEmail(email)}.`}>
    <View style={{ gap: theme.spacing.md }}>
      {notice ? <StatusBanner tone="info" title="Check your email" message={notice} /> : null}
      {error ? <StatusBanner tone="error" title="Code not confirmed" message={error} /> : null}
      <CodeEntry value={code} onChangeText={value => { setCode(value); setCodeError(''); }} error={codeError} editable={!pending} />
      <ActionButton label={reset ? 'Verify code' : 'Verify email'} onPress={verify} loading={pending === 'verify'} disabled={pending === 'resend'} />
      {seconds > 0 ? <AppText variant="caption" style={[theme.numericText, { color: theme.colors.muted }]}>Resend code in {seconds}s</AppText> : null}
      <ActionButton label="Resend code" variant="secondary" onPress={resend} disabled={seconds > 0 || pending === 'verify'} loading={pending === 'resend'} />
      <AppText variant="caption" style={{ color: theme.colors.muted }}>No code yet? Check your spam or junk folder, then request a new code.</AppText>
      <ActionButton label="Back to sign in" variant="secondary" disabled={!!pending} onPress={() => navigation.navigate('Login')} />
    </View>
  </AuthLayout>;
}
