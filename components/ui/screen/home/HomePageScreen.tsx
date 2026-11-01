import { useEffect, useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import FormScreen from '@/components/ui/FormScreen';
import { logFailure } from '@/utils/logging';
import { formatUtc, formatValue, type WeatherConditions, type MarineConditions } from '@/utils/conditions';

type Props = {
  navigation: {
    navigate: (route: string, params?: any) => void;
  };
};

export default function HomePageScreen({ navigation }: Props) {
  const [username, setUsername] = useState('Crew member');
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [marine, setMarine] = useState<MarineConditions | null>(null);
  const { fontScale, width } = useWindowDimensions();
  const isCompact = width < 360;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('username')
      .then(name => {
        if (active && name) setUsername(name);
      })
      .catch(error => logFailure('home.username', error));

    AsyncStorage.getItem('cached_weather')
      .then(raw => {
        if (active && raw) {
          try { setWeather(JSON.parse(raw)); } catch {}
        }
      })
      .catch(error => logFailure('home.cached_weather', error));

    AsyncStorage.getItem('cached_marine')
      .then(raw => {
        if (active && raw) {
          try { setMarine(JSON.parse(raw)); } catch {}
        }
      })
      .catch(error => logFailure('home.cached_marine', error));

    return () => { active = false; };
  }, []);

  return (
    <FormScreen edges={['top', 'left', 'right']} contentStyle={{ gap: 16, paddingBottom: 24 }}>
      {/* 1. Header & Location Identity */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={require('../../../../assets/logo/logo.png')}
              style={{ width: 36, height: 36, borderRadius: theme.radius.sm }}
              resizeMode="contain"
              accessible={false}
            />
            <View>
              <AppText variant="section" style={{ color: theme.colors.primary, lineHeight: 22 }}>OceanPulse</AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Vessel Marine Terminal</AppText>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accentSurface,
          }}>
            <Ionicons name="location-sharp" size={12} color={theme.colors.primary} accessible={false} />
            <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 11 }}>
              {weather?.location.name || 'Sri Lanka Waters'}
            </AppText>
          </View>
        </View>

        <View>
          <AppText variant="title" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30 }}>
            Hello, {username}
          </AppText>
          <AppText variant="caption" style={{ color: theme.colors.muted }}>
            Coastal telemetry and voyage planning
          </AppText>
        </View>
      </View>

      {/* 2. Authentic Emergency SOS Distress Beacon */}
      <Card style={{
        backgroundColor: theme.colors.dangerSurface,
        borderColor: theme.colors.danger,
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        gap: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="warning" size={20} color={theme.colors.danger} accessible={false} />
            <AppText variant="label" style={{ color: theme.colors.danger, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Emergency Distress (SOS)
            </AppText>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#FEE2E2',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: theme.radius.full,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.danger }} />
            <AppText variant="caption" style={{ color: theme.colors.danger, fontSize: 10, fontWeight: '700' }}>
              GPS READY
            </AppText>
          </View>
        </View>

        <AppText variant="caption" style={{ color: '#7F1D1D', fontSize: 12, lineHeight: 17 }}>
          Instantly transmit distress beacon and lock vessel coordinates for emergency assistance.
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Broadcast SOS Alert"
          onPress={() => navigation.navigate('SOSSCREEN')}
          style={({ pressed }) => ({
            minHeight: 46,
            borderRadius: 10,
            backgroundColor: pressed ? '#991B1B' : theme.colors.danger,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 16,
            shadowColor: theme.colors.danger,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          })}>
          <Ionicons name="radio" size={18} color="#FFFFFF" accessible={false} />
          <AppText variant="label" style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 }}>
            BROADCAST SOS ALERT
          </AppText>
        </Pressable>
      </Card>

      {/* 3. Marine Telemetry (Weather & Sea Conditions Hub) */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="label" style={{ fontSize: 15, color: theme.colors.text }}>Live Telemetry</AppText>
          <Pressable
            onPress={() => navigation.navigate('Conditions', { section: 'weather' })}
            accessibilityRole="button"
            accessibilityLabel="Open conditions">
            <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Full Forecast →
            </AppText>
          </Pressable>
        </View>

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
          {/* Weather Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open weather details"
            onPress={() => navigation.navigate('Conditions', { section: 'weather' })}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
              borderColor: theme.colors.separator,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 8,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="partly-sunny" size={18} color={theme.colors.primary} accessible={false} />
              </View>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                {weather?.location.name || 'Weather'}
              </AppText>
            </View>

            {weather ? (
              <View style={{ gap: 4 }}>
                <AppText variant="display" style={{ fontSize: 28, lineHeight: 32, color: theme.colors.text }}>
                  {weather.temperatureC === null ? '--' : `${Math.round(weather.temperatureC)}°C`}
                </AppText>
                <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }} numberOfLines={1}>
                  {weather.description || 'Clear sky'}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.separator }}>
                  <AppText variant="caption" style={{ fontSize: 10, color: theme.colors.primary, fontWeight: '600' }}>
                    💨 {formatValue(weather.windSpeedMps, 'm/s')}
                  </AppText>
                  <AppText variant="caption" style={{ fontSize: 10, color: theme.colors.muted }}>
                    💧 {formatValue(weather.humidityPercent, '%')}
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={{ gap: 6, paddingVertical: 4 }}>
                <AppText variant="body" style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>
                  Check Weather
                </AppText>
                <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>
                  Tap to search city
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 }}>
                  <Ionicons name="search" size={12} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '600' }}>
                    Select Location
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>

          {/* Sea Conditions Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open sea wave telemetry"
            onPress={() => navigation.navigate('Conditions', { section: 'sea' })}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
              borderColor: theme.colors.separator,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 8,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="water" size={18} color={theme.colors.primary} accessible={false} />
              </View>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                Wave Height
              </AppText>
            </View>

            {marine && marine.hourly.length > 0 ? (
              <View style={{ gap: 4 }}>
                <AppText variant="display" style={{ fontSize: 28, lineHeight: 32, color: theme.colors.text }}>
                  {formatValue(marine.hourly[0]?.waveHeightM ?? null, 'm')}
                </AppText>
                <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }} numberOfLines={1}>
                  Significant Swell
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.separator }}>
                  <AppText variant="caption" style={{ fontSize: 10, color: theme.colors.primary, fontWeight: '600' }}>
                    ⏱ {marine.hourly[0]?.time ? formatUtc(marine.hourly[0].time).slice(11, 16) + ' UTC' : 'Live'}
                  </AppText>
                  <AppText variant="caption" style={{ fontSize: 10, color: theme.colors.muted }}>
                    📍 {marine.location.latitude.toFixed(1)}°N
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={{ gap: 6, paddingVertical: 4 }}>
                <AppText variant="body" style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>
                  Sea Telemetry
                </AppText>
                <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>
                  Wave height & swell
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 }}>
                  <Ionicons name="boat" size={12} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '600' }}>
                    Load Marine Data
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* 4. Voyage Planning & Crew Communication */}
      <View style={{ gap: 10 }}>
        <AppText variant="label" style={{ fontSize: 15, color: theme.colors.text }}>Voyage & Crew</AppText>

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
          {/* Route & Fuel Estimate */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open route and fuel calculation"
            onPress={() => navigation.navigate('Estimate')}
            style={({ pressed }) => ({
              flex: 1,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.separator,
              backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
              gap: 8,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="navigate-circle-outline" size={22} color={theme.colors.primary} accessible={false} />
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} accessible={false} />
            </View>
            <View>
              <AppText variant="label" style={{ fontSize: 14 }}>Distance & Fuel</AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>
                Nautical miles & rate calculator
              </AppText>
            </View>
          </Pressable>

          {/* Crew Messages */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open crew messaging"
            onPress={() => navigation.navigate('Messages')}
            style={({ pressed }) => ({
              flex: 1,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.separator,
              backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
              gap: 8,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} accessible={false} />
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} accessible={false} />
            </View>
            <View>
              <AppText variant="label" style={{ fontSize: 14 }}>Crew Messages</AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>
                Radio & crew direct messaging
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
    </FormScreen>
  );
}
