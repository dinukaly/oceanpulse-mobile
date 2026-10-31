import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '@/store/authSlice';
import { clearSession } from '@/utils/session';
import { logFailure } from '@/utils/logging';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import FormScreen from '@/components/ui/FormScreen';

export default function HomePageScreen({ navigation }: any) {
  const [username, setUsername] = useState('User');
  const [loggingOut, setLoggingOut] = useState(false);
  const { fontScale } = useWindowDimensions();
  const dispatch = useDispatch();
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('username').then(name => { if (active) setUsername(name || 'User'); })
      .catch(error => logFailure('session.username', error));
    return () => { active = false; };
  }, []);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await clearSession(); dispatch(logout()); }
    catch (error) { logFailure('session.logout', error); Alert.alert('Error', 'Failed to log out. Please try again.'); }
    finally { setLoggingOut(false); }
  };
  const tiles = [
    { title: 'Weather', icon: 'partly-sunny-outline', hint: 'Search by city', route: 'Weather' },
    { title: 'Sea Conditions', icon: 'water-outline', hint: 'Use the Sea tab', route: null },
    { title: 'Route Estimate', icon: 'map-outline', hint: 'Direct distance', route: 'Route' },
    { title: 'Messages', icon: 'chatbubbles-outline', hint: 'Contact a crew member', route: 'UserListScreen' },
  ] as const;
  return <FormScreen edges={['top', 'left', 'right']}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Image source={require('../../../../assets/logo/logo.png')} style={{ width: 48, height: 48 }} resizeMode="contain" accessible={false} />
        <AppText variant="section">OceanPulse</AppText>
      </View>
      <Pressable onPress={handleLogout} disabled={loggingOut} accessibilityRole="button" accessibilityLabel="Log out"
        accessibilityState={{ busy: loggingOut, disabled: loggingOut }}
        style={({ pressed }) => ({ minWidth: 48, minHeight: 48, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: pressed ? theme.colors.accentSurface : 'transparent', borderRadius: 8 })}>
        <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} accessible={false} />
        <AppText variant="label" style={{ color: theme.colors.primary }}>{loggingOut ? 'Logging out…' : 'Log out'}</AppText>
      </Pressable>
      <AppText variant="title" accessibilityRole="header" style={{ width: '100%' }}>Hello, {username}</AppText>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {tiles.map(tile => {
        const content = <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Ionicons name={tile.icon} size={24} color={tile.route ? theme.colors.primary : theme.colors.muted} accessible={false} />
            {tile.route && <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} accessible={false} />}
          </View>
          <AppText variant="label">{tile.title}</AppText>
          <AppText variant="caption" style={{ color: theme.colors.muted }}>{tile.hint}</AppText>
        </>;
        const style = { flexBasis: fontScale > 1.3 ? '100%' as const : '45%' as const, flexGrow: 1, minHeight: 48,
          padding: 16, gap: 8, borderRadius: 12, borderWidth: 1, borderColor: tile.route ? theme.colors.border : theme.colors.separator,
          backgroundColor: theme.colors.surface };
        return tile.route ? <Pressable key={tile.title} accessibilityRole="button" accessibilityLabel={`Open ${tile.title}`}
          onPress={() => navigation.navigate(tile.route)} style={({ pressed }) => [style, pressed && { backgroundColor: theme.colors.accentSurface }]}>{content}</Pressable>
          : <View key={tile.title} style={style}>{content}</View>;
      })}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name="people-outline" size={24} color={theme.colors.muted} accessible={false} />
      <AppText style={{ color: theme.colors.muted }}>Community</AppText>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Open SOS request. No rescue dispatch."
      onPress={() => navigation.navigate('SOSSCREEN')}
      style={{ minHeight: 48, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.danger,
        backgroundColor: theme.colors.dangerSurface, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name="alert-circle-outline" size={24} color={theme.colors.danger} accessible={false} />
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="label" style={{ color: theme.colors.danger }}>SOS request</AppText>
        <AppText variant="caption" style={{ color: theme.colors.danger }}>No rescue dispatch</AppText>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.danger} accessible={false} />
    </Pressable>
  </FormScreen>;
}
