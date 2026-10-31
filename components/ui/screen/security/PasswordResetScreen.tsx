import CodeVerificationScreen from './CodeVerificationScreen';
export default function PasswordResetScreen(props: any) {
  return <CodeVerificationScreen {...props} purpose="reset" />;
}
