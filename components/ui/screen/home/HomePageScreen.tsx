import { useEffect, useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import FormScreen from '@/components/ui/FormScreen';
import api from '@/utils/api';
import { logFailure } from '@/utils/logging';
import { formatUtc, formatValue, type WeatherConditions, type MarineConditions } from '@/utils/conditions';

type Props = {
  navigation: {
    navigate: (route: string, params?: any) => void;
  };
};

export default function HomePageScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('Crew member');
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [marine, setMarine] = useState<MarineConditions | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('firstName')
      .then(firstName => {
        if (active && firstName?.trim()) setDisplayName(firstName.trim());
      })
      .catch(error => logFailure('home.display_name', error));

    api.get('users/profile')
      .then(async response => {
        const firstName = response.data?.data?.user?.firstName;
        if (typeof firstName !== 'string' || !firstName.trim()) {
          throw new Error('Profile response did not include a first name');
        }
        const name = firstName.trim();
        await AsyncStorage.setItem('firstName', name);
        if (active) setDisplayName(name);
      })
      .catch(error => logFailure('home.profile_name', error));

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

  const waveHeight = marine?.hourly[0]?.waveHeightM ?? null;
  const isWaveSafe = waveHeight !== null && waveHeight < 1.5;
  const isWaveModerate = waveHeight !== null && waveHeight >= 1.5 && waveHeight <= 2.5;
  const isWaveRough = waveHeight !== null && waveHeight > 2.5;

  return (
    <FormScreen edges={['top', 'left', 'right']} contentStyle={{ gap: 16, paddingBottom: 24 }}>
      {/* 1. Header & Location Identity */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={require('../../../../assets/logo/logo.png')}
              style={{ width: 36, height: 36, borderRadius: theme.radius.sm }}
              resizeMode="contain"
              accessible={false}
            />
            <View>
              <AppText variant="section" style={{ color: '#075985', fontWeight: '800', lineHeight: 22 }}>
                OCEANPULSE
              </AppText>
              <AppText variant="caption" style={{ color: '#64748B', fontSize: 11, fontWeight: '600' }}>
                Fisherman Terminal
              </AppText>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 9999,
            backgroundColor: '#E0F2FE',
            borderWidth: 1,
            borderColor: '#BAE6FD',
          }}>
            <Ionicons name="location" size={13} color="#0284C7" accessible={false} />
            <AppText variant="caption" style={{ color: '#0369A1', fontWeight: '700', fontSize: 11 }}>
              {weather?.location.name || 'Sri Lanka Waters'}
            </AppText>
          </View>
        </View>

        <View>
          <AppText variant="title" accessibilityRole="header" style={{ fontSize: 26, fontWeight: '800', color: '#0F172A' }}>
            Hello, {displayName}!
          </AppText>
          <AppText variant="caption" style={{ color: '#475569', fontSize: 13, fontWeight: '500' }}>
            Tap color cards below for conditions, tools & emergency
          </AppText>
        </View>
      </View>

      {/* 2. HIGH PRIORITY: RED EMERGENCY SOS CARD */}
      <View style={{
        backgroundColor: '#DC2626',
        borderRadius: 18,
        padding: 16,
        gap: 12,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="alert-circle" size={24} color="#FFFFFF" accessible={false} />
            </View>
            <View>
              <AppText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
                EMERGENCY SOS
              </AppText>
              <AppText style={{ color: '#FEE2E2', fontSize: 11, fontWeight: '600' }}>
                VHF CHANNEL 16 • SAR RESCUE
              </AppText>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
            <AppText style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
              GPS READY
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Broadcast SOS Alert"
          onPress={() => navigation.navigate('SOSSCREEN')}
          style={({ pressed }) => ({
            minHeight: 48,
            borderRadius: 12,
            backgroundColor: pressed ? '#F1F5F9' : '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingHorizontal: 16,
          })}>
          <Ionicons name="radio" size={20} color="#DC2626" accessible={false} />
          <AppText style={{ color: '#DC2626', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 }}>
            BROADCAST SOS ALERT
          </AppText>
        </Pressable>
      </View>

      {/* 3. COLOR-CODED LIVE CONDITIONS: BLUE WEATHER & GREEN SEA WAVES */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="pulse" size={16} color="#0284C7" />
            <AppText style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Live Telemetry
            </AppText>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Conditions', { section: 'weather' })}
            accessibilityRole="button"
            accessibilityLabel="Open conditions">
            <AppText variant="caption" style={{ color: '#0284C7', fontWeight: '700' }}>
              Full Details →
            </AppText>
          </Pressable>
        </View>

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
          {/* Card 1: VIBRANT SKY BLUE WEATHER */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open weather details"
            onPress={() => navigation.navigate('Conditions', { section: 'weather' })}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? '#E0F2FE' : '#F0F9FF',
              borderColor: '#BAE6FD',
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 14,
              gap: 8,
              shadowColor: '#0284C7',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 2,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#0284C7', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sunny" size={20} color="#FFFFFF" accessible={false} />
              </View>
              <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <AppText style={{ color: '#0369A1', fontSize: 11, fontWeight: '700' }}>
                  WEATHER
                </AppText>
              </View>
            </View>

            {weather ? (
              <View style={{ gap: 4 }}>
                <AppText style={{ fontSize: 32, fontWeight: '800', color: '#0369A1', lineHeight: 36 }}>
                  {weather.temperatureC === null ? '--' : `${Math.round(weather.temperatureC)}°C`}
                </AppText>
                <AppText style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                  {weather.description || 'Clear conditions'}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#BAE6FD' }}>
                  <AppText style={{ fontSize: 11, color: '#0369A1', fontWeight: '700' }}>
                    💨 {formatValue(weather.windSpeedMps, 'm/s')}
                  </AppText>
                  <AppText style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                    💧 {formatValue(weather.humidityPercent, '%')}
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={{ gap: 6, paddingVertical: 4 }}>
                <AppText style={{ fontSize: 15, fontWeight: '700', color: '#0369A1' }}>
                  Live Weather
                </AppText>
                <AppText style={{ color: '#64748B', fontSize: 11 }}>
                  Tap to view temperature & wind
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 }}>
                  <Ionicons name="arrow-forward-circle" size={16} color="#0284C7" />
                  <AppText style={{ color: '#0284C7', fontSize: 12, fontWeight: '700' }}>
                    Open Weather
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>

          {/* Card 2: VIBRANT SEA GREEN MARINE WAVES */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open sea wave telemetry"
            onPress={() => navigation.navigate('Conditions', { section: 'sea' })}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? '#DCFCE7' : '#F0FDF4',
              borderColor: '#BBF7D0',
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 14,
              gap: 8,
              shadowColor: '#16A34A',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 2,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="waves" size={22} color="#FFFFFF" accessible={false} />
              </View>
              <View style={{
                backgroundColor: isWaveRough ? '#FEE2E2' : isWaveModerate ? '#FEF08A' : '#DCFCE7',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}>
                <AppText style={{
                  color: isWaveRough ? '#DC2626' : isWaveModerate ? '#854D0E' : '#166534',
                  fontSize: 10,
                  fontWeight: '800',
                }}>
                  {isWaveRough ? 'ROUGH SEA' : isWaveModerate ? 'MODERATE' : 'NORMAL SEA'}
                </AppText>
              </View>
            </View>

            {marine && marine.hourly.length > 0 ? (
              <View style={{ gap: 4 }}>
                <AppText style={{ fontSize: 32, fontWeight: '800', color: '#166534', lineHeight: 36 }}>
                  {formatValue(waveHeight, 'm')}
                </AppText>
                <AppText style={{ color: '#0F172A', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                  Wave Swell Height
                </AppText>
                <View style={{ flexDirection: 'row', gap: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#BBF7D0' }}>
                  <AppText style={{ fontSize: 11, color: '#166534', fontWeight: '700' }}>
                    ⏱ {marine.hourly[0]?.time ? formatUtc(marine.hourly[0].time).slice(11, 16) + ' UTC' : 'Live'}
                  </AppText>
                  <AppText style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                    📍 Sea Grid
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={{ gap: 6, paddingVertical: 4 }}>
                <AppText style={{ fontSize: 15, fontWeight: '700', color: '#166534' }}>
                  Sea & Waves
                </AppText>
                <AppText style={{ color: '#64748B', fontSize: 11 }}>
                  Tap to view wave height & swell
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 }}>
                  <Ionicons name="arrow-forward-circle" size={16} color="#16A34A" />
                  <AppText style={{ color: '#16A34A', fontSize: 12, fontWeight: '700' }}>
                    Open Sea Waves
                  </AppText>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* 4. COLOR-CODED TOOLS: AMBER ROUTE & VIOLET BOAT-TO-BOAT */}
      <View style={{ gap: 10 }}>
        <AppText style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tools & Crew
        </AppText>

        <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 12 }}>
          {/* Tool 1: VIBRANT AMBER ROUTE & FUEL */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open route and fuel calculation"
            onPress={() => navigation.navigate('Estimate')}
            style={({ pressed }) => ({
              flex: 1,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#FED7AA',
              backgroundColor: pressed ? '#FFEDD5' : '#FFF7ED',
              gap: 10,
              shadowColor: '#EA580C',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 2,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="compass" size={24} color="#FFFFFF" accessible={false} />
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EA580C" accessible={false} />
            </View>
            <View>
              <AppText style={{ fontSize: 16, fontWeight: '800', color: '#9A3412' }}>My Route & Fuel</AppText>
              <AppText style={{ color: '#C2410C', fontSize: 12, fontWeight: '500', marginTop: 2 }}>
                Distance & litres calculator
              </AppText>
            </View>
          </Pressable>

          {/* Tool 2: VIBRANT VIOLET BOAT TO BOAT */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open crew messaging"
            onPress={() => navigation.navigate('Messages')}
            style={({ pressed }) => ({
              flex: 1,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#DDD6FE',
              backgroundColor: pressed ? '#EDE9FE' : '#F5F3FF',
              gap: 10,
              shadowColor: '#7C3AED',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 2,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="boat" size={22} color="#FFFFFF" accessible={false} />
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7C3AED" accessible={false} />
            </View>
            <View>
              <AppText style={{ fontSize: 16, fontWeight: '800', color: '#5B21B6' }}>Boat to Boat</AppText>
              <AppText style={{ color: '#6D28D9', fontSize: 12, fontWeight: '500', marginTop: 2 }}>
                Chat with crew members
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
    </FormScreen>
  );
}
