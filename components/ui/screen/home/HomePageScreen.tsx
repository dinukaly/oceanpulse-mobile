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
  const { fontScale } = useWindowDimensions();

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
    <FormScreen edges={['top', 'left', 'right']} contentStyle={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
      {/* 1. Compact Header & Greeting */}
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.compact }}>
          <Image
            source={require('../../../../assets/logo/logo.png')}
            style={{ width: 40, height: 40, borderRadius: theme.radius.sm }}
            resizeMode="contain"
            accessible={false}
          />
          <View style={{ flex: 1 }}>
            <AppText variant="section" style={{ color: theme.colors.primary }}>OceanPulse</AppText>
            <AppText variant="caption" style={{ color: theme.colors.muted }}>Coastal fishing telemetry</AppText>
          </View>
        </View>

        <View style={{ gap: 2, paddingTop: theme.spacing.xs }}>
          <AppText variant="title" accessibilityRole="header">Hello, {username}</AppText>
          <AppText style={{ color: theme.colors.muted }}>
            Marine telemetry and trip overview
          </AppText>
        </View>
      </View>

      {/* 2. Coastal Weather Summary */}
      <Card style={{ gap: theme.spacing.compact }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.accentSurface,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="partly-sunny-outline" size={20} color={theme.colors.primary} accessible={false} />
            </View>
            <AppText variant="label">Coastal Weather</AppText>
          </View>
          {weather?.location.name && (
            <View style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 2,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.accentSurface,
            }}>
              <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {weather.location.name}{weather.location.country ? `, ${weather.location.country}` : ''}
              </AppText>
            </View>
          )}
        </View>

        {weather ? (
          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm }}>
              <AppText variant="display" style={{ color: theme.colors.text }}>
                {weather.temperatureC === null ? '--' : `${Math.round(weather.temperatureC)}°C`}
              </AppText>
              <AppText variant="body" style={{ color: theme.colors.muted }}>
                {weather.description || 'Current conditions'}
              </AppText>
            </View>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderTopWidth: 1,
              borderTopColor: theme.colors.separator,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
                <Ionicons name="navigate-outline" size={16} color={theme.colors.primary} accessible={false} />
                <AppText variant="caption">Wind: {formatValue(weather.windSpeedMps, 'm/s')}</AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
                <Ionicons name="water-outline" size={16} color={theme.colors.primary} accessible={false} />
                <AppText variant="caption">Humidity: {formatValue(weather.humidityPercent, '%')}</AppText>
              </View>
            </View>

            <View style={{ gap: 2 }}>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 12 }}>
                Location: {weather.location.latitude.toFixed(2)}° N, {weather.location.longitude.toFixed(2)}° E
              </AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 12 }}>
                Data time: {weather.dataTime ? formatUtc(weather.dataTime) : 'Unavailable'}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View detailed weather forecast"
              onPress={() => navigation.navigate('Weather')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: theme.spacing.xs,
                borderTopWidth: 1,
                borderTopColor: theme.colors.separator,
                opacity: pressed ? 0.7 : 1,
              })}>
              <AppText variant="label" style={{ color: theme.colors.primary }}>View full weather forecast</AppText>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} accessible={false} />
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="body" style={{ color: theme.colors.muted }}>
              No city weather loaded yet. Search for a coastal city or harbor to view temperature, wind, and sky conditions.
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search coastal city weather"
              onPress={() => navigation.navigate('Weather')}
              style={({ pressed }) => ({
                minHeight: 44,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
              })}>
              <Ionicons name="search-outline" size={18} color={theme.colors.primary} accessible={false} />
              <AppText variant="label" style={{ color: theme.colors.primary }}>Search city weather</AppText>
            </Pressable>
          </View>
        )}
      </Card>

      {/* 3. Sea Wave Conditions Summary */}
      <Card style={{ gap: theme.spacing.compact }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.accentSurface,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="water-outline" size={20} color={theme.colors.primary} accessible={false} />
            </View>
            <AppText variant="label">Sea Conditions</AppText>
          </View>
          {marine?.location && (
            <View style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 2,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.accentSurface,
            }}>
              <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {marine.location.latitude.toFixed(2)}°N, {marine.location.longitude.toFixed(2)}°E
              </AppText>
            </View>
          )}
        </View>

        {marine && marine.hourly.length > 0 ? (
          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm }}>
              <AppText variant="display" style={{ color: theme.colors.text }}>
                {formatValue(marine.hourly[0]?.waveHeightM ?? null, 'm')}
              </AppText>
              <AppText variant="body" style={{ color: theme.colors.muted }}>
                Significant wave height
              </AppText>
            </View>

            <View style={{ gap: 2 }}>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 12 }}>
                Requested grid: {marine.requestedLocation.latitude.toFixed(4)}, {marine.requestedLocation.longitude.toFixed(4)}
              </AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 12 }}>
                Forecast hour: {marine.hourly[0]?.time ? formatUtc(marine.hourly[0].time) : 'Unavailable'}
              </AppText>
              <AppText variant="caption" style={{ color: theme.colors.warning, fontSize: 12, marginTop: 2 }}>
                Forecast estimate only. No safety verdict.
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View sea wave forecast and hourly progression"
              onPress={() => navigation.navigate('SeaWave')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: theme.spacing.xs,
                borderTopWidth: 1,
                borderTopColor: theme.colors.separator,
                opacity: pressed ? 0.7 : 1,
              })}>
              <AppText variant="label" style={{ color: theme.colors.primary }}>View hourly wave progression</AppText>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} accessible={false} />
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="body" style={{ color: theme.colors.muted }}>
              Marine wave telemetry requires coordinates or location permission. No GPS lookup is performed on home launch.
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open sea wave conditions"
              onPress={() => navigation.navigate('SeaWave')}
              style={({ pressed }) => ({
                minHeight: 44,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
              })}>
              <Ionicons name="boat-outline" size={18} color={theme.colors.primary} accessible={false} />
              <AppText variant="label" style={{ color: theme.colors.primary }}>Check sea wave forecast</AppText>
            </Pressable>
          </View>
        )}
      </Card>

      {/* 4. Restrained SOS Telemetry Record */}
      <Card style={{
        backgroundColor: theme.colors.dangerSurface,
        borderColor: theme.colors.danger,
        borderWidth: 1,
        gap: theme.spacing.sm,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Ionicons name="alert-circle" size={24} color={theme.colors.danger} accessible={false} />
          <AppText variant="label" style={{ color: theme.colors.danger }}>Emergency SOS Record</AppText>
        </View>

        <AppText variant="caption" style={{ color: theme.colors.danger, lineHeight: 20 }}>
          OceanPulse records vessel coordinates to the database only. Does NOT dispatch rescue teams or alert coast guard.
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Record emergency SOS. No rescue dispatch."
          onPress={() => navigation.navigate('SOSSCREEN')}
          style={({ pressed }) => ({
            minHeight: 44,
            borderRadius: theme.radius.sm,
            backgroundColor: pressed ? '#991B1B' : theme.colors.danger,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
          })}>
          <Ionicons name="warning-outline" size={18} color="#FFFFFF" accessible={false} />
          <AppText variant="label" style={{ color: '#FFFFFF' }}>Record SOS request</AppText>
        </Pressable>
      </Card>

      {/* 5. Direct Planning & Communication Tools */}
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="label" style={{ color: theme.colors.text }}>Trip Planning & Crew Tools</AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open direct route and fuel estimation"
          onPress={() => navigation.navigate('Route')}
          style={({ pressed }) => ({
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.separator,
            backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.compact,
          })}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.accentSurface,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="map-outline" size={22} color={theme.colors.primary} accessible={false} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label">Route & Fuel Estimate</AppText>
            <AppText variant="caption" style={{ color: theme.colors.muted }}>Direct distance and fuel consumption</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} accessible={false} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open crew messages"
          onPress={() => navigation.navigate('UserListScreen')}
          style={({ pressed }) => ({
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.separator,
            backgroundColor: pressed ? theme.colors.accentSurface : theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.compact,
          })}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.accentSurface,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="chatbubbles-outline" size={22} color={theme.colors.primary} accessible={false} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label">Crew Messages</AppText>
            <AppText variant="caption" style={{ color: theme.colors.muted }}>Contact registered crew members</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} accessible={false} />
        </Pressable>
      </View>
    </FormScreen>
  );
}