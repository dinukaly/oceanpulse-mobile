import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TypographyProvider from '@/components/ui/TypographyProvider';
import { theme } from '@/constants/theme';
import SplashScreen from '@/components/ui/screen/SplashScreen';
import AuthStackNavigator from '@/navigation/stack-navigation/AuthStackNavigator';
import AppStackNavigator from '@/navigation/stack-navigation/AppStackNavigator';
import store, { RootState } from '@/store';
import { setUserId, logout } from '@/store/authSlice';
import { clearSession, getToken } from '@/utils/session';
import api from '@/utils/api';
import getBaseUrl from '@/constants/BASEURL';
import { apiConfigurationMessage } from '@/utils/apiConfiguration';

function App() {
  const [isLoading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [splashElapsed, setSplashElapsed] = useState(false);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const checkAuthStatus = async () => {
    setLoading(true);
    setRestoreError(false);
    try {
      const token = await getToken();
      if (!token) {
        await clearSession();
        dispatch(logout());
        return;
      }
      const response = await api.get('users/profile');
      dispatch(setUserId(String(response.data.data.user.userId)));
    } catch (error: any) {
      if (error.response?.status === 401) {
        await clearSession();
        dispatch(logout());
      } else {
        setRestoreError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkAuthStatus(); }, []);

  useEffect(() => {
    // Concurrent with session restoration; never adds a delay after a slow request.
    const timer = setTimeout(() => setSplashElapsed(true), 850);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !splashElapsed) {
    return (
      <View style={styles.container}>
        <SplashScreen />
      </View>
    );
  }

  if (restoreError) {
    return <View style={styles.container}>
      <Text style={styles.restoreText}>Cannot verify your session. Check your connection and try again.</Text>
      <TouchableOpacity onPress={checkAuthStatus} accessibilityRole="button" style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>;
  }

  return (
    <NavigationContainer key={isAuthenticated ? 'signed-in' : 'public'} theme={{
      ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: theme.colors.primary,
        background: theme.colors.background, card: theme.colors.surface,
        text: theme.colors.text, border: theme.colors.separator, notification: theme.colors.danger },
    }}>
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

function ConfiguredEntry() {
  if (!getBaseUrl()) {
    return (
      <View style={styles.container}>
        <Text style={styles.restoreText}>
          {apiConfigurationMessage} Reload the app after updating it.
        </Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default function EntryPoint() {
  return <SafeAreaProvider><TypographyProvider><ConfiguredEntry /></TypographyProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restoreText: { margin: 24, marginTop: 80, fontSize: 18, color: '#222' },
  retryButton: { marginHorizontal: 24, padding: 16, backgroundColor: '#0456C7', borderRadius: 8 },
  retryText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
